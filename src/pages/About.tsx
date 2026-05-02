import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function About() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-12 pt-8">
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Sobre o Conversor NAS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            O <strong>Conversor NAS (Neonatal Abstinence Syndrome)</strong> é uma ferramenta de
            suporte à decisão clínica desenvolvida para pediatras e neonatologistas.
          </p>
          <p>
            Seu objetivo principal é simplificar e conferir segurança matemática à transição de
            opioides venosos para orais em recém-nascidos internados com Síndrome de Abstinenência
            Neonatal, minimizando erros de cálculo que podem prolongar a internação ou agravar os
            sintomas da criança.
          </p>

          <Separator className="my-6" />

          <h3 className="font-semibold text-lg text-slate-900">Aviso Legal Importante</h3>
          <p className="text-sm">
            Este aplicativo destina-se{' '}
            <strong>exclusivamente a profissionais de saúde qualificados</strong>. Ele não substitui
            o julgamento clínico. Os fatores de conversão utilizados representam aproximações
            farmacológicas amplamente aceitas na literatura neonatal, mas a biodisponibilidade e a
            meia-vida variam individualmente em recém-nascidos (especialmente prematuros ou com
            disfunção hepática/renal).
          </p>
          <p className="text-sm font-semibold bg-amber-50 text-amber-900 p-3 rounded-md border border-amber-200 mt-2">
            Sempre verifique as diretrizes específicas do seu hospital ou unidade neonatal antes de
            prescrever a medicação.
          </p>

          <div className="mt-8 text-xs text-muted-foreground text-center">
            Versão 1.0.0 &copy; 2026. Feito para uso interno ou profissional guiado.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
