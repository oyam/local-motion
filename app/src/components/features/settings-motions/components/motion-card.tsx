import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useMotionSettings } from '@/providers/motion-settings-provider'

type MotionCardProps = {
  motionId: string
}

export function MotionCard({ motionId }: MotionCardProps) {
  const { motionSettingsList } = useMotionSettings()
  const motionSettings = motionSettingsList.filter(
    (motionSettings) => motionSettings.id === motionId
  )[0]
  const editMotionLink = `/motions/${motionId}`
  return (
    <Link to={editMotionLink}>
      <Card className="w-[800px]">
        <CardContent className="grid gap-4 py-3 w-[800px]">
          <div className="flex items-center">
            <div className="flex-1 space-y-1">
              <p className="font-medium leading-none">
                <span className="text-base">{motionSettings.name}</span>
                <span className="px-10 text-sm text-muted-foreground">
                  {motionSettings.globalShortcutKey}
                </span>
              </p>
              <div className="px-2">
                <p className="text-sm text-muted-foreground">
                  {motionSettings.description}
                </p>
              </div>
            </div>
            <ChevronRight />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
