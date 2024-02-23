import React, { createContext, useState, useContext, useEffect } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import type { GeneralSettings } from '@/types/settings'
import { DEFAULT_GENERAL_SETTINGS } from '@/constants'
import { enable, isEnabled, disable } from 'tauri-plugin-autostart-api'
import { readGeneralSettings, writeGeneralSettings } from '@/utils/fs'

interface SettingsProviderProps {
  children: React.ReactNode
}

const GeneralSettingsContext = createContext(
  {} as {
    generalSettings: GeneralSettings
    setGeneralSettings: (generalSettings: GeneralSettings) => void
    initialized: boolean
  }
)

export const useGeneralSettings = () => useContext(GeneralSettingsContext)

export default function SettingsProvider({ children }: SettingsProviderProps) {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(
    DEFAULT_GENERAL_SETTINGS
  )
  const [initialized, setInitialized] = useState<boolean>(false)

  const updateAutostart = async (autoStart: boolean) => {
    if (autoStart) {
      if (!(await isEnabled())) {
        await enable()
      }
    } else {
      if (await isEnabled()) {
        await disable()
      }
    }
  }

  // load initial general settings
  useEffect(() => {
    ;(async () => {
      const initialGeneralSettings = await readGeneralSettings()
      setGeneralSettings(initialGeneralSettings)
      setInitialized(true)
    })()
  }, [])

  // emit event from settings window to backend
  useEffect(() => {
    if (initialized) {
      ;(async () => {
        if (appWindow.label === 'settings') {
          writeGeneralSettings(generalSettings)
          updateAutostart(generalSettings.autoStart)
        }
      })()
    }
  }, [generalSettings, initialized])

  return (
    <GeneralSettingsContext.Provider
      value={{
        generalSettings,
        setGeneralSettings,
        initialized
      }}
    >
      {children}
    </GeneralSettingsContext.Provider>
  )
}
