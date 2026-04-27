import { AppSidebar } from './app-sidebar'
import { Header } from './header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
