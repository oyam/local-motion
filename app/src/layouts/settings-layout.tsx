import { Outlet } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { SidebarNav } from '@/components/ui/sidebar-nav'

interface NavItem {
  title: string
  href: string
}

interface SettingsLayoutProps {
  navItems: NavItem[]
}

function SettingsLayout({ navItems }: SettingsLayoutProps) {
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={navItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
