import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Clock, Trash2 } from 'lucide-react'

interface HistoryEntry {
  id: string
  date: string
  weight: string
  source: string
  target: string
  resultRelative: string
  resultAbsolute: string
}

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const data = localStorage.getItem('nas_calc_history')
    if (data) {
      setHistory(JSON.parse(data))
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('nas_calc_history')
    setHistory([])
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-primary">Histórico Local</h2>
          <p className="text-muted-foreground">
            Cálculos recentes salvos apenas neste dispositivo.
          </p>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            onClick={clearHistory}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Histórico
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Clock className="w-8 h-8 mb-4 opacity-20" />
            <p>Nenhum cálculo registrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4 border-b bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {format(new Date(entry.date), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                </CardTitle>
                <div className="text-sm font-semibold bg-white border px-3 py-1 rounded-full">
                  Peso: {entry.weight} kg
                </div>
              </CardHeader>
              <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1 bg-slate-50 rounded-md p-3 border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
                      De
                    </span>
                    <span className="font-medium text-slate-900">{entry.source}</span>
                  </div>
                  <ArrowRight className="text-muted-foreground shrink-0 w-5 h-5 hidden md:block" />
                  <div className="flex-1 bg-sky-50 rounded-md p-3 border border-sky-100">
                    <span className="text-xs text-sky-600 uppercase tracking-wide block mb-1">
                      Para
                    </span>
                    <span className="font-medium text-sky-900">{entry.target}</span>
                  </div>
                </div>

                <div className="md:w-48 shrink-0 flex flex-col justify-center items-end bg-emerald-50 rounded-md p-3 border border-emerald-100">
                  <span className="text-lg font-bold text-emerald-700 leading-none mb-1">
                    {entry.resultAbsolute}
                  </span>
                  <span className="text-xs font-medium text-emerald-600/70">
                    {entry.resultRelative}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
