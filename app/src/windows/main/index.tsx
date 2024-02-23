import React from 'react'
import ReactDOM from 'react-dom/client'
import MotionSettingsProvider from '@/providers/motion-settings-provider'
import { LocalWindow } from '@/components/features/main/components/local-window'
import '@/styles/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionSettingsProvider>
      <LocalWindow />
    </MotionSettingsProvider>
  </React.StrictMode>
)
