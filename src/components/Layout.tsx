import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AlertTriangle } from 'lucide-react'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="w-full flex justify-between items-center">
            <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
              Conversor de Opioides
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-background">
          <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
        <footer className="border-t bg-muted/30 p-4 text-center">
          <div className="mx-auto max-w-4xl flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p>
              <strong>Atenção:</strong> Os resultados devem ser validados conforme o protocolo da
              sua instituição.
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
