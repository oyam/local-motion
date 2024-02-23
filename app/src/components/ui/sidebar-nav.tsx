import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<{
    href: string
    title: string
  }>
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation()
  const pathname = location.pathname
  const isChildPath = (pathname: string, itemhref: string) => {
    const splitPath = pathname.split('/')
    const hasParentPath = splitPath.length > 0
    if (hasParentPath) {
      const parentPath = splitPath.slice(0, -1).join('/')
      return itemhref === parentPath
    }
    return false
  }

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href || isChildPath(pathname, item.href)
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
