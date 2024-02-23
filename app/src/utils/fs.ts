import {
  exists,
  BaseDirectory,
  readTextFile,
  writeTextFile
} from '@tauri-apps/api/fs'
import type {
  Settings,
  GeneralSettings,
  MotionSettings
} from '@/types/settings'
import { getDefaultSettings } from '@/utils/settings'

async function readSettings(): Promise<Settings> {
  const existsSettingFile = await exists('.local-motion/settings.json', {
    dir: BaseDirectory.Home
  })
  if (existsSettingFile) {
    const settingsText = await readTextFile('.local-motion/settings.json', {
      dir: BaseDirectory.Home
    })
    const settings = JSON.parse(settingsText) as Settings
    return settings
  } else {
    let settings = getDefaultSettings()
    await writeSettings(settings)
    return settings
  }
}

export async function readGeneralSettings(): Promise<GeneralSettings> {
  const settings = await readSettings()
  return settings.general
}

export async function readMotionSettingsList(): Promise<MotionSettings[]> {
  const settings = await readSettings()
  return settings.motions
}

async function writeSettings(settings: Settings): Promise<void> {
  await writeTextFile(
    '.local-motion/settings.json',
    JSON.stringify(settings, null, 2),
    { dir: BaseDirectory.Home }
  )
}

export async function writeGeneralSettings(
  generalSettings: GeneralSettings
): Promise<void> {
  const settings = await readSettings()
  await writeSettings({
    ...settings,
    general: generalSettings
  })
}

export async function writeMotionSettingsList(
  motionSettingsList: MotionSettings[]
): Promise<void> {
  const settings = await readSettings()
  await writeSettings({
    ...settings,
    motions: motionSettingsList
  })
}
