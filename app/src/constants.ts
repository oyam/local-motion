import type {
  GeneralSettings,
  MotionBoxPosition,
  MotionSettings
} from './types/settings'

export const SETTINGS_ROOT_URL = '/src/windows/settings/'

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  autoStart: false
}

export const MOTION_BOX_POSITION_CANDIDATES: MotionBoxPosition[] = [
  'center',
  'top-left',
  'top-middle',
  'top-right',
  'middle-left',
  'middle-right',
  'bottom-left',
  'bottom-middle',
  'bottom-right'
]

export const DEFAULT_MOTION_SETTINGS: MotionSettings = {
  id: '',
  name: 'Icon-String Motion',
  description:
    'Move cursor to one of the icons or strings, and click it. String means sequential letters without space. For example, abc.def is one string.',
  globalShortcutKey: '',
  detectorType: 'default',
  detectorUrl: '',
  windowWidth: 200,
  windowHeight: 200,
  windowBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  fontSize: 15,
  textColor: 'rgba(0, 0, 0, 1)',
  textBoxColor: 'rgba(255, 197, 66, 1)',
  postAction: 'left-click',
  motionBoxPositions: ['center']
}
