import React, { createContext, useState, useContext, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'
import type { MotionSettings } from '@/types/settings'
import { getNewMotionName } from '@/components/features/settings-motions/utils/motion-utils'
import { getDefaultMotionSettings } from '@/utils/settings'
import { isRegistered, unregister } from '@tauri-apps/api/globalShortcut'
import { readMotionSettingsList, writeMotionSettingsList } from '@/utils/fs'

interface SettingsProviderProps {
  children: React.ReactNode
}

const MotionSettingsContext = createContext(
  {} as {
    motionSettingsList: MotionSettings[]
    setMotionSettings: (motionSettings: MotionSettings) => void
    addMotionSettings: () => void
    removeMotionSettings: (motionId: string) => void
    initialized: boolean
  }
)

export const useMotionSettings = () => useContext(MotionSettingsContext)

export default function SettingsProvider({ children }: SettingsProviderProps) {
  const [motionSettingsList, setMotionSettingsList] = useState([
    getDefaultMotionSettings(uuidv4())
  ])
  const [initialized, setInitialized] = useState(false)

  // load initial motion settings
  useEffect(() => {
    ;(async () => {
      const initialMotionSettingsList = await readMotionSettingsList()
      setMotionSettingsList(initialMotionSettingsList)
      setInitialized(true)
    })()
  }, [])

  // emit event from settings window to backend
  useEffect(() => {
    if (initialized) {
      ;(async () => {
        if (appWindow.label === 'settings') {
          await writeMotionSettingsList(motionSettingsList)
          await appWindow.emit('on_motion_settings_updated', {
            motionSettingsList: motionSettingsList
          })
        }
      })()
    }
  }, [motionSettingsList, initialized])

  // listen to event from backend in main window
  useEffect(() => {
    let already_unmounted = false
    let unlisten = () => {}

    ;(async () => {
      const unlsn = await listen<string>(
        'on_motion_settings_updated',
        async () => {
          if (appWindow.label === 'main') {
            const updatedMotionsSettingsList = await readMotionSettingsList()
            const updatedGlobalShortcutKeys = updatedMotionsSettingsList.map(
              (motionSettings: MotionSettings) =>
                motionSettings.globalShortcutKey
            )
            // unregister removed global shortcut keys
            motionSettingsList.forEach((motionSettings) => {
              const globalShortcutKey = motionSettings.globalShortcutKey
              if (!updatedGlobalShortcutKeys.includes(globalShortcutKey)) {
                isRegistered(globalShortcutKey).then(() => {
                  unregister(globalShortcutKey)
                })
              }
            })
            setMotionSettingsList(updatedMotionsSettingsList)
          }
        }
      )
      if (already_unmounted) {
        unlsn()
      } else {
        unlisten = unlsn
      }
    })()

    return () => {
      already_unmounted = true
      unlisten()
    }
  }, [motionSettingsList])

  const addMotionSettings = () => {
    const motionId = uuidv4()
    const newMotionSettings = getDefaultMotionSettings(motionId)
    newMotionSettings.name = getNewMotionName(
      motionSettingsList.map((motion) => motion.name)
    )
    const allMotionSettings: MotionSettings[] = [...motionSettingsList]
    allMotionSettings.push(newMotionSettings)
    setMotionSettingsList(allMotionSettings)
  }

  const setMotionSettings = (updatedMotionSettings: MotionSettings) => {
    setMotionSettingsList(
      motionSettingsList.map((motionSettings) => {
        if (motionSettings.id === updatedMotionSettings.id) {
          return updatedMotionSettings
        }
        return motionSettings
      })
    )
  }

  const removeMotionSettings = (motionId: string) => {
    setMotionSettingsList(
      motionSettingsList.filter(
        (motionSettings) => motionSettings.id !== motionId
      )
    )
  }

  return (
    <MotionSettingsContext.Provider
      value={{
        motionSettingsList,
        setMotionSettings,
        addMotionSettings,
        removeMotionSettings,
        initialized
      }}
    >
      {children}
    </MotionSettingsContext.Provider>
  )
}
