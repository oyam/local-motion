import { SwitchCardList } from '@/components/features/settings-general/components/switch-card-list'

export default function General() {
  return (
    <>
      <h3 className="text-lg font-medium pb-3">General</h3>
      <div className="px-2">
        <SwitchCardList />
      </div>
    </>
  )
}
