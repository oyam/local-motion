import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { DeleteDialog } from '@/components/features/settings-motions/components/delete-dialog'
import { MotionForm } from '@/components/features/settings-motions/components/motion-form'

export default function EditMotion() {
  const params = useParams()
  const motionId = params.motionId

  return (
    <>
      <div className="flex items-center">
        <Link to="/motions">
          <ChevronLeft />
        </Link>
        <h3 className="text-lg font-medium px-3">Edit Motion</h3>
        <div className="ml-auto pr-5">
          <DeleteDialog />
        </div>
      </div>
      <div className="p-5">
        {!!motionId && <MotionForm motionId={motionId} />}
      </div>
    </>
  )
}
