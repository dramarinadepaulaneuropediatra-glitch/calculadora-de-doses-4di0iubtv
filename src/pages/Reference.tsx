import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export default function Reference() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Tabela de Conversão & Fatores
        </h2>
        <p className="text-muted-foreground">
          Fatores equianalgésicos utilizados pelo algoritmo da calculadora.
        </p>
      </div>

      <Alert className="bg-sky-50 border-sky-200">
        <Info className="h-4 w-4 text-sky-600" />
        <AlertTitle className="text-sky-800">Padrão de Referência</AlertTitle>
        <AlertDescription className="text-sky-700">
          Todas as conversões passam por uma base comum: <strong>Morfina IV (1 mg)</strong>. O
          sistema calcula a dose diária total, converte para o equivalente em Morfina IV e depois
          converte para o medicamento alvo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Fatores de Equivalência (Neonatologia)</CardTitle>
          <CardDescription>Valores em relação a 1mg de Morfina Venosa (IV)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Via</TableHead>
                <TableHead>Dose Equivalente</TableHead>
                <TableHead>Fator de Relação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-primary">Morfina</TableCell>
                <TableCell>IV</TableCell>
                <TableCell>1 mg</TableCell>
                <TableCell className="text-muted-foreground">Base (1:1)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">Morfina</TableCell>
                <TableCell>PO</TableCell>
                <TableCell>3 mg</TableCell>
                <TableCell className="text-muted-foreground">
                  1:3 (Bio-disponibilidade ~30%)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">Fentanil</TableCell>
                <TableCell>IV</TableCell>
                <TableCell>10 mcg</TableCell>
                <TableCell className="text-muted-foreground">
                  100x mais potente que Morfina
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">Metadona</TableCell>
                <TableCell>IV</TableCell>
                <TableCell>1 mg</TableCell>
                <TableCell className="text-muted-foreground">1:1 (Aproximado inicial)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">Metadona</TableCell>
                <TableCell>PO</TableCell>
                <TableCell>2 mg</TableCell>
                <TableCell className="text-muted-foreground">
                  1:2 (Conservador na transição)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-50 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base text-slate-800">
              Estratégias de Desmame (Tapering)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              O desmame da Síndrome de Abstinenência Neonatal (SAN) deve ser gradual, tipicamente
              reduzindo <strong>10% a 20% da dose de estabilização</strong> a cada 24 a 48 horas.
            </p>
            <p>
              Se houver piora nos escores de Finnegan (ex: &gt; 8 por 3 vezes consecutivas),
              considere pausar o desmame ou retornar à dose anterior.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base text-slate-800">Transição IV para PO</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              A transição para a via oral geralmente ocorre quando o recém-nascido tolera nutrição
              enteral plena e os escores de abstinência estão controlados sob infusão contínua.
            </p>
            <p>
              Ao converter de Morfina IV para Morfina PO, a dose total calculada para 24h deve ser
              fracionada de acordo com o protocolo institucional, frequentemente a cada 4 ou 6
              horas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
