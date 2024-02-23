import { useEffect, useState } from 'react'
import { LucideIcon } from 'lucide-react'
import { Platform, platform } from '@tauri-apps/api/os'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@/components/ui/hover-card'

type SwitchCardProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  Icon: LucideIcon
  title: string
  description: string
}

export function SwitchCard({
  checked,
  onCheckedChange,
  Icon,
  title,
  description
}: SwitchCardProps) {
  const [platformName, setPlatformName] = useState<Platform>('win32')
  useEffect(() => {
    ;(async () => {
      let pf = await platform()
      setPlatformName(pf)
    })()
  }, [])

  return (
    <Card className="w-[800px]">
      <CardContent className="grid gap-4 w-[800px]">
        <div className=" flex items-center space-x-4 pt-6">
          <Icon />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {platformName === 'darwin' ? (
            <HoverCard openDelay={100}>
              <HoverCardTrigger>
                <Switch disabled={true} />
              </HoverCardTrigger>
              <HoverCardContent>
                <span>
                  On macOS, please set this in System Preferences. Please refer
                  to{' '}
                </span>
                <a
                  href="https://support.apple.com/guide/mac-help/open-items-automatically-when-you-log-in-mh15189/mac"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  official user guide
                </a>
                <span>.</span>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
