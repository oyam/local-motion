import { Link, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useMotionSettings } from '@/providers/motion-settings-provider'

export function DeleteDialog() {
  const { removeMotionSettings } = useMotionSettings()
  const params = useParams()
  const motionId = params.motionId

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="stroke-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Motion</DialogTitle>
          <DialogDescription>
            {'Are you sure to delete this motion?'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Link to="/motions">
            <Button
              variant="destructive"
              onClick={() => {
                motionId && removeMotionSettings(motionId)
              }}
            >
              Delete
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
