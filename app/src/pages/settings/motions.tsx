import { MotionCardList } from '@/components/features/settings-motions/components/motion-card-list'
import { Button } from '@/components/ui/button'
import { useMotionSettings } from '@/providers/motion-settings-provider'

export default function Motions() {
  const { addMotionSettings } = useMotionSettings()
  return (
    <>
      <h3 className="text-lg font-medium pb-3">Motions</h3>
      <div className="px-2">
        <MotionCardList />
        <div className="py-2" />
        <Button onClick={addMotionSettings}>Add Motion</Button>
      </div>
    </>
  )
}
