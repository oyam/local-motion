import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { SETTINGS_ROOT_URL } from '@/constants'
import GeneralSettingsProvider from '@/providers/general-settings-provider'
import MotionSettingsProvider from '@/providers/motion-settings-provider'
import Layout from '@/layouts/settings-layout'
import General from '@/pages/settings/general'
import Motions from '@/pages/settings/motions'
import EditMotion from '@/pages/settings/edit-motion'
import '@/styles/globals.css'

const sidebarNavItems = [
  {
    title: 'General',
    href: '/'
  },
  {
    title: 'Motions',
    href: '/motions'
  }
]

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeneralSettingsProvider>
      <MotionSettingsProvider>
        <BrowserRouter basename={SETTINGS_ROOT_URL}>
          <Routes>
            <Route path="/" element={<Layout navItems={sidebarNavItems} />}>
              <Route path="/" element={<General />} />
              <Route path="/motions" element={<Motions />} />
              <Route path="/motions/:motionId" element={<EditMotion />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionSettingsProvider>
    </GeneralSettingsProvider>
  </React.StrictMode>
)
