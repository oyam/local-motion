import { useEffect, useState } from 'react'
import { useGeneralSettings } from '@/providers/general-settings-provider'
import { type GeneralSettingsKey } from '@/types/settings'

export function useBooleanSetting(
  settingName: GeneralSettingsKey
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const { generalSettings, setGeneralSettings, initialized } =
    useGeneralSettings()
  const [checked, setChecked] = useState(generalSettings[settingName])

  useEffect(() => {
    if (initialized) {
      setChecked(generalSettings[settingName])
    }
  }, [initialized])

  useEffect(() => {
    const newGeneralSettings = { ...generalSettings, [settingName]: checked }
    setGeneralSettings(newGeneralSettings)
  }, [checked])

  return [checked, setChecked]
}
