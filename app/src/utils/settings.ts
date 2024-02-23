import type { MotionSettings, Settings } from '@/types/settings'
import { DEFAULT_GENERAL_SETTINGS, DEFAULT_MOTION_SETTINGS } from '@/constants'
import { v4 as uuidv4 } from 'uuid'

export const getDefaultMotionSettings = (motionId: string): MotionSettings => ({
  ...DEFAULT_MOTION_SETTINGS,
  id: motionId
})

export const getDefaultSettings = (): Settings => {
  const defaultSettings = {
    general: { ...DEFAULT_GENERAL_SETTINGS },
    motions: [getDefaultMotionSettings(uuidv4())]
  }
  return defaultSettings
}
