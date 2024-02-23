import { useMotionSettings } from '@/providers/motion-settings-provider'
import { MotionCard } from '@/components/features/settings-motions/components/motion-card'

export function MotionCardList() {
  const { motionSettingsList } = useMotionSettings()

  return (
    <>
      {motionSettingsList.map((motionSettings) => (
        <div key={motionSettings.id} className="flex items-center pt-2">
          <MotionCard motionId={motionSettings.id} />
        </div>
      ))}
    </>
  )
}
