export interface Settings {
  general: GeneralSettings
  motions: MotionSettings[]
}

export interface GeneralSettings {
  autoStart: boolean
}

export type MotionBoxPosition =
  | 'center'
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-middle'
  | 'bottom-right'

export type PostAction =
  | 'none'
  | 'left-click'
  | 'right-click'
  | 'middle-click'
  | 'double-left-click'

export interface MotionSettings {
  id: string
  name: string
  description: string
  globalShortcutKey: string
  detectorType: 'default' | 'custom'
  detectorUrl: string
  windowWidth: number
  windowHeight: number
  windowBackgroundColor: string
  fontSize: number
  textColor: string
  textBoxColor: string
  postAction: PostAction
  motionBoxPositions: MotionBoxPosition[]
}

export type GeneralSettingsKey = keyof GeneralSettings
