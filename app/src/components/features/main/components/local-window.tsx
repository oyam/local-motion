import { useEffect, useRef } from 'react'
import { appWindow, LogicalSize } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'
import { error } from 'tauri-plugin-log-api'
import { useMotionSettings } from '@/providers/motion-settings-provider'
import type { MotionSettings, PostAction } from '@/types/settings'
import {
  isRegistered,
  unregister,
  register
} from '@tauri-apps/api/globalShortcut'
import { generateShortcuts } from '@/components/features/main/utils/shortcut-utils'
import {
  getLocalWindowInfo,
  calcTargetPos
} from '@/components/features/main/utils/window-utils'

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

export function LocalWindow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { motionSettingsList } = useMotionSettings()
  let pressedKey = ''
  let shortcutMap = new Map<string, () => void>()

  const registerAlphabet = (count: number) => {
    alphabet.slice(0, count).forEach((letter) => {
      register(letter, () => {
        pressedKey += letter
        if (shortcutMap.has(pressedKey)) {
          shortcutMap.get(pressedKey)?.()
        }
      })
    })
  }

  const unregisterAlphabet = () => {
    alphabet.forEach((letter) => {
      isRegistered(letter).then(() => {
        unregister(letter)
      })
    })
  }

  const closeLocalWindow = () => {
    appWindow.setSize(new LogicalSize(0, 0)) // set zero size instead of hiding the window to keep it always on top
    unregisterAlphabet()
    unregister('Esc')
    pressedKey = ''
    shortcutMap.clear()
  }

  const initialzeCanvas = (motionSettings: MotionSettings) => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = motionSettings.windowWidth
      canvas.height = motionSettings.windowHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const chooseMotion = async (
    postAction: PostAction,
    absoluteX: number,
    absoluteY: number
  ) => {
    closeLocalWindow()
    await invoke('move_mouse', { x: absoluteX, y: absoluteY })
    if (postAction === 'left-click') {
      await invoke('left_click')
    } else if (postAction === 'right-click') {
      await invoke('right_click')
    } else if (postAction === 'middle-click') {
      await invoke('middle_click')
    } else if (postAction === 'double-left-click') {
      await invoke('double_left_click')
    }
  }

  const drawEachMotionCandidate = (
    motionSettings: MotionSettings,
    ctx: CanvasRenderingContext2D,
    text: string,
    relativeX: number,
    relativeY: number
  ) => {
    const fontSize = motionSettings.fontSize
    const textX = relativeX - fontSize / 4
    const textY = relativeY + fontSize / 6
    const rectX = textX - fontSize / 8
    const rectY = textY - fontSize + fontSize / 6
    const textWidth = ctx.measureText(text).width
    const rectWidth = textWidth + fontSize / 4
    const rectHeight = fontSize
    ctx.fillStyle = motionSettings.textBoxColor
    ctx.beginPath()
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, fontSize / 8)
    ctx.fill()
    ctx.fillStyle = motionSettings.textColor
    ctx.fillText(text, textX, textY)
  }

  const drawMotionCandidates = (
    motionSettings: MotionSettings,
    bboxes: number[][],
    windowMinX: number,
    windowMinY: number
  ) => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.globalAlpha = 1
        ctx.font = `bold ${motionSettings.fontSize}px monospace`
        let index = 0
        const nCandidates =
          bboxes.length * motionSettings.motionBoxPositions.length
        const shortcuts = generateShortcuts(nCandidates, alphabet.join(''))
        bboxes.forEach((bbox) => {
          motionSettings.motionBoxPositions.forEach((motionBoxPosition) => {
            const { targetX, targetY } = calcTargetPos(motionBoxPosition, bbox)
            const targetAbsX = targetX + windowMinX
            const targetAbsY = targetY + windowMinY
            shortcutMap.set(shortcuts[index], () =>
              chooseMotion(motionSettings.postAction, targetAbsX, targetAbsY)
            )
            drawEachMotionCandidate(
              motionSettings,
              ctx,
              shortcuts[index],
              targetX,
              targetY
            )
            index += 1
          })
        })
        registerAlphabet(nCandidates)
      }
    }
  }

  const registerMotion = async (motionSettings: MotionSettings) => {
    const globalShortcutKey = motionSettings.globalShortcutKey
    const isShortcutRegistered = await isRegistered(globalShortcutKey)
    if (isShortcutRegistered) {
      // unregister shortcut if it has been already registered to reflect the change of motionSettings
      await unregister(globalShortcutKey)
    }
    register(motionSettings.globalShortcutKey, async () => {
      unregisterAlphabet()
      initialzeCanvas(motionSettings)
      register('Esc', closeLocalWindow)
      const {
        factor,
        windowMinX,
        windowMinY,
        windowCenterX,
        windowCenterY,
        windowWidth,
        windowHeight
      } = await getLocalWindowInfo(motionSettings)
      let bboxes: number[][] = []
      if (motionSettings.detectorType === 'default') {
        bboxes = await invoke<number[][]>('run_default_detector', {
          centerX: windowCenterX,
          centerY: windowCenterY,
          width: windowWidth,
          height: windowHeight,
          scaleFactor: factor
        }).catch((err) => {
          error(err)
          return []
        })
      } else {
        bboxes = await invoke<number[][]>('run_custom_detector', {
          url: motionSettings.detectorUrl,
          centerX: windowCenterX,
          centerY: windowCenterY,
          width: windowWidth,
          height: windowHeight,
          scaleFactor: factor
        }).catch((err) => {
          error(err)
          return []
        })
      }
      drawMotionCandidates(motionSettings, bboxes, windowMinX, windowMinY)
    })
  }

  useEffect(() => {
    motionSettingsList.forEach((motionSettings) => {
      registerMotion(motionSettings)
    })
  }, [motionSettingsList])

  return (
    <div className="container">
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  )
}
