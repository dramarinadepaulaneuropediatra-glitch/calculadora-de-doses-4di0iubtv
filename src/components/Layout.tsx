import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AlertTriangle } from 'lucide-react'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-950 px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="w-full flex justify-between items-center">
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Conversor de Opioides SAN
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-background">
          <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
        <footer className="border-t bg-slate-50 dark:bg-slate-900/50 p-6 text-center">
          <div className="mx-auto max-w-4xl flex flex-col items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 rounded-md border border-amber-200 dark:border-amber-900/50">
              <AlertTriangle className="h-4 w-4" />
              <p>
                <strong>Atenção:</strong> Os resultados devem ser validados conforme o protocolo
                clínico da sua instituição.
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Unidade Neonatal - Hospital Júlia Kubitschek - FHEMIG
              </p>
              <p>Elaborador: [Nome do Elaborador]</p>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
