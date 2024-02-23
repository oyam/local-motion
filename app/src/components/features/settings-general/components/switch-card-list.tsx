import { Power } from 'lucide-react'
import { SwitchCard } from '@/components/features/settings-general/components/switch-card'
import { useBooleanSetting } from '@/components/features/settings-general/hooks/use-boolean-setting'

export function SwitchCardList() {
  const [autoStart, setAutoStart] = useBooleanSetting('autoStart')
  // const [autoUpdateCheck, setAutoUpdateCheck] =
  //   useBooleanSetting('autoUpdateCheck')

  return (
    <>
      <div className="flex items-center pt-2">
        <SwitchCard
          checked={autoStart}
          onCheckedChange={setAutoStart}
          Icon={Power}
          title="Auto Start"
          description="Start Local Motion when you log in (Default: off)"
        />
      </div>
      {/* <div className="flex items-center pt-2">
        <SwitchCard
          checked={autoUpdateCheck}
          onCheckedChange={setAutoUpdateCheck}
          Icon={RefreshCcw}
          title="Auto Update Check"
          description="Automatically check for updates on startup (Default: on)"
        />
      </div> */}
    </>
  )
}
