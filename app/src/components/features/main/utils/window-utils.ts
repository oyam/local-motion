import { invoke } from '@tauri-apps/api/tauri'
import { appWindow, LogicalPosition, LogicalSize } from '@tauri-apps/api/window'
import type { MotionSettings, MotionBoxPosition } from '@/types/settings'
import type { WindowInfo } from '@/types/window'

const BOX_PADDING = 1

export async function getLocalWindowInfo(
  motionSettings: MotionSettings
): Promise<WindowInfo> {
  const mouseDisplayInfo = await invoke<number[]>('get_mouse_position') // (x, y)
  document.documentElement.style.setProperty(
    'background-color',
    motionSettings.windowBackgroundColor
  )
  const windowWidth = motionSettings.windowWidth
  const windowHeight = motionSettings.windowHeight
  const windowX = Math.max(mouseDisplayInfo[0] - windowWidth / 2, 0)
  const windowY = Math.max(mouseDisplayInfo[1] - windowHeight / 2, 0)
  await appWindow.setIgnoreCursorEvents(true)
  await appWindow.setAlwaysOnTop(true)
  await appWindow.setSize(new LogicalSize(windowWidth, windowHeight))
  await appWindow.setPosition(new LogicalPosition(windowX, windowY))

  // Adjust window position if it is out of display
  const factor = await appWindow.scaleFactor()
  const position = await appWindow.innerPosition()
  const logicalPosition = position.toLogical(factor)
  const ly = logicalPosition.y
  const my = mouseDisplayInfo[1]
  const ry = my - ly
  const halfHeight = windowHeight / 2
  const resizedHeight = Math.round((halfHeight + ry) / 2) * 2 // round to even number
  const lx = logicalPosition.x
  const mx = mouseDisplayInfo[0]
  const rx = mx - lx
  const halfWidth = windowWidth / 2
  const resizedWidth = Math.round((halfWidth + rx) / 2) * 2 // round to even number
  await appWindow.setPosition(new LogicalPosition(windowX, windowY))
  await appWindow.setSize(
    new LogicalSize(
      Math.min(windowWidth, resizedWidth),
      Math.min(windowHeight, resizedHeight)
    )
  )
  const size = await appWindow.innerSize()
  const logicalSize = size.toLogical(factor)
  const windowInfo = {
    factor: factor,
    windowMinX: logicalPosition.x,
    windowMinY: logicalPosition.y,
    windowMaxX: logicalPosition.x + logicalSize.width,
    windowMaxY: logicalPosition.y + logicalSize.height,
    windowCenterX: logicalPosition.x + Math.round(logicalSize.width / 2),
    windowCenterY: logicalPosition.y + Math.round(logicalSize.height / 2),
    windowWidth: logicalSize.width,
    windowHeight: logicalSize.height
  }
  return windowInfo
}

export function calcTargetPos(
  motionBoxPosition: MotionBoxPosition,
  bbox: number[]
) {
  const bboxMinX = Math.round(bbox[0] + BOX_PADDING)
  const bboxMaxX = Math.round(bbox[2] - BOX_PADDING)
  const bboxMinY = Math.round(bbox[1] + BOX_PADDING)
  const bboxMaxY = Math.round(bbox[3] - BOX_PADDING)
  const bboxCenterX = Math.round(bboxMinX + (bboxMaxX - bboxMinX) / 2)
  const bboxCenterY = Math.round(bboxMinY + (bboxMaxY - bboxMinY) / 2)
  if (motionBoxPosition === 'center') {
    return { targetX: bboxCenterX, targetY: bboxCenterY }
  } else if (motionBoxPosition === 'top-left') {
    return { targetX: bboxMinX, targetY: bboxMinY }
  } else if (motionBoxPosition === 'top-middle') {
    return { targetX: bboxCenterX, targetY: bboxMinY }
  } else if (motionBoxPosition === 'top-right') {
    return { targetX: bboxMaxX, targetY: bboxMinY }
  } else if (motionBoxPosition === 'middle-left') {
    return { targetX: bboxMinX, targetY: bboxCenterY }
  } else if (motionBoxPosition === 'middle-right') {
    return { targetX: bboxMaxX, targetY: bboxCenterY }
  } else if (motionBoxPosition === 'bottom-left') {
    return { targetX: bboxMinX, targetY: bboxMaxY }
  } else if (motionBoxPosition === 'bottom-middle') {
    return { targetX: bboxCenterX, targetY: bboxMaxY }
  } else if (motionBoxPosition === 'bottom-right') {
    return { targetX: bboxMaxX, targetY: bboxMaxY }
  } else {
    // This block supposed to be unreachable
    return { targetX: bboxCenterX, targetY: bboxCenterY }
  }
}
