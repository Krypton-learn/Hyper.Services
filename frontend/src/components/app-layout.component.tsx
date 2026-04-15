import { type ReactNode } from 'react'
import { MainLayout } from './layout.component'

interface AppLayoutProps {
  children: ReactNode
  rightSidebar?: ReactNode
  rightSidebarTitle?: string
  rightSidebarOpen?: boolean
  onRightSidebarClose?: () => void
  hideRightSidebar?: boolean
}

export const AppLayout = ({
  children,
  rightSidebar,
  rightSidebarTitle,
  rightSidebarOpen = false,
  onRightSidebarClose,
  hideRightSidebar = false,
}: AppLayoutProps) => {
  if (hideRightSidebar) {
    return (
      <div className="min-h-screen bg-muted/5">
        <div className="flex">
          <main className="flex-1" style={{ marginLeft: '16rem' }}>
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <MainLayout
      rightSidebar={rightSidebar}
      rightSidebarTitle={rightSidebarTitle}
      rightSidebarOpen={rightSidebarOpen}
      onRightSidebarClose={onRightSidebarClose}
    >
      {children}
    </MainLayout>
  )
}