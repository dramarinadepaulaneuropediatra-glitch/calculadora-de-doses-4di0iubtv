import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { calculateConversion, Drug, Route, formatDrugName } from '@/lib/math'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Copy, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()

  // Form State
  const [weight, setWeight] = useState(searchParams.get('w') || '')

  const [sDrug, setSDrug] = useState<Drug>((searchParams.get('sd') as Drug) || 'fentanyl')
  const [sRoute, setSRoute] = useState<Route>((searchParams.get('sr') as Route) || 'iv')
  const [sDose, setSDose] = useState(searchParams.get('sdo') || '')
  const [sInterval, setSInterval] = useState(searchParams.get('si') || '4')

  const [tDrug, setTDrug] = useState<Drug>((searchParams.get('td') as Drug) || 'morphine')
  const [tRoute, setTRoute] = useState<Route>((searchParams.get('tr') as Route) || 'po')
  const [tInterval, setTInterval] = useState(searchParams.get('ti') || '6')

  // Sync state to URL for sharing
  useEffect(() => {
    const params = new URLSearchParams()
    if (weight) params.set('w', weight)
    params.set('sd', sDrug)
    params.set('sr', sRoute)
    if (sDose) params.set('sdo', sDose)
    if (sRoute === 'po') params.set('si', sInterval)
    params.set('td', tDrug)
    params.set('tr', tRoute)
    if (tRoute === 'po') params.set('ti', tInterval)
    setSearchParams(params, { replace: true })
  }, [weight, sDrug, sRoute, sDose, sInterval, tDrug, tRoute, tInterval, setSearchParams])

  // Enforce Fentanyl IV only
  useEffect(() => {
    if (sDrug === 'fentanyl' && sRoute !== 'iv') setSRoute('iv')
    if (tDrug === 'fentanyl' && tRoute !== 'iv') setTRoute('iv')
  }, [sDrug, tDrug])

  const result = useMemo(() => {
    return calculateConversion(
      parseFloat(weight),
      sDrug,
      sRoute,
      parseFloat(sDose),
      parseInt(sInterval),
      tDrug,
      tRoute,
      parseInt(tInterval),
    )
  }, [weight, sDrug, sRoute, sDose, sInterval, tDrug, tRoute, tInterval])

  // Save to history automatically when a valid result exists
  useEffect(() => {
    if (result && weight && sDose) {
      const timeoutId = setTimeout(() => {
        const history = JSON.parse(localStorage.getItem('nas_calc_history') || '[]')
        const newEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          weight,
          source: `${formatDrugName(sDrug)} ${sRoute.toUpperCase()} ${sDose} ${sRoute === 'iv' ? 'mcg/kg/h' : 'mcg/kg/dose'}`,
          target: `${formatDrugName(tDrug)} ${tRoute.toUpperCase()}`,
          resultRelative: `${result.relativeMcg} mcg/kg/${tRoute === 'iv' ? 'h' : 'dose'}`,
          resultAbsolute: `${result.absoluteMg} mg/${tRoute === 'iv' ? 'h' : 'dose'}`,
        }

        // Avoid duplicate consecutive saves
        if (
          history.length === 0 ||
          history[0].source !== newEntry.source ||
          history[0].target !== newEntry.target
        ) {
          localStorage.setItem(
            'nas_calc_history',
            JSON.stringify([newEntry, ...history].slice(0, 50)),
          )
        }
      }, 1500)
      return () => clearTimeout(timeoutId)
    }
  }, [result, weight, sDose, sDrug, sRoute, tDrug, tRoute])

  const copyPrescription = () => {
    if (!result) return
    const sourceText = `${formatDrugName(sDrug)} ${sRoute.toUpperCase()} ${sDose} ${sRoute === 'iv' ? 'mcg/kg/h' : `mcg/kg/dose (${24 / parseInt(sInterval)}x/dia)`}`
    const targetText = `${formatDrugName(tDrug)} ${tRoute.toUpperCase()} ${result.absoluteMg} mg/${tRoute === 'iv' ? 'h' : `dose de ${tInterval}/${tInterval}h`} (${result.relativeMcg} mcg/kg/${tRoute === 'iv' ? 'h' : 'dose'})`

    const text = `Transição Opioide NAS\nPeso: ${weight} Kg\nDe: ${sourceText}\nPara: ${targetText}`

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado!',
        description: 'Prescrição copiada para a área de transferência.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    })
  }

  const sUnit = sRoute === 'iv' ? 'h' : 'dose'
  const tUnit = tRoute === 'iv' ? 'h' : 'dose'

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-primary">Calculadora de Doses</h2>
        <p className="text-muted-foreground">
          Converta doses de opioides para recém-nascidos em tratamento de SAN.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Inputs */}
        <div className="md:col-span-7 space-y-6">
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
              <CardTitle className="text-lg">Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <Label htmlFor="weight" className="font-semibold text-base">
                  Peso (Kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 3.2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="max-w-xs text-lg h-12"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                  1
                </div>
                Prescrição Atual (Origem)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medicamento</Label>
                  <Select value={sDrug} onValueChange={(v: Drug) => setSDrug(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fentanyl">Fentanil</SelectItem>
                      <SelectItem value="morphine">Morfina</SelectItem>
                      <SelectItem value="methadone">Metadona</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Via de Administração</Label>
                  <RadioGroup
                    value={sRoute}
                    onValueChange={(v: Route) => setSRoute(v)}
                    className="flex gap-4 h-10 items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="iv" id="s-iv" />
                      <Label htmlFor="s-iv">IV (Contínua)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="po" id="s-po" disabled={sDrug === 'fentanyl'} />
                      <Label htmlFor="s-po" className={sDrug === 'fentanyl' ? 'opacity-50' : ''}>
                        PO (Dose)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Dose <span className="text-muted-foreground font-normal">(mcg/kg/{sUnit})</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 2.5"
                    value={sDose}
                    onChange={(e) => setSDose(e.target.value)}
                  />
                  {sDose && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {sRoute === 'po' && sInterval
                        ? `${(parseFloat(sDose) * (24 / parseInt(sInterval))).toFixed(1)} mcg/kg/dia`
                        : ''}
                      {sRoute === 'iv' ? `${(parseFloat(sDose) * 24).toFixed(1)} mcg/kg/dia` : ''}
                    </p>
                  )}
                </div>
                {sRoute === 'po' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Intervalo</Label>
                    <Select value={sInterval} onValueChange={setSInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4/4 horas (6x/dia)</SelectItem>
                        <SelectItem value="6">6/6 horas (4x/dia)</SelectItem>
                        <SelectItem value="8">8/8 horas (3x/dia)</SelectItem>
                        <SelectItem value="12">12/12 horas (2x/dia)</SelectItem>
                        <SelectItem value="24">24/24 horas (1x/dia)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-dashed border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                  2
                </div>
                Alvo da Conversão (Destino)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medicamento</Label>
                  <Select value={tDrug} onValueChange={(v: Drug) => setTDrug(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fentanyl">Fentanil</SelectItem>
                      <SelectItem value="morphine">Morfina</SelectItem>
                      <SelectItem value="methadone">Metadona</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Via de Administração</Label>
                  <RadioGroup
                    value={tRoute}
                    onValueChange={(v: Route) => setTRoute(v)}
                    className="flex gap-4 h-10 items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="iv" id="t-iv" />
                      <Label htmlFor="t-iv">IV (Contínua)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="po" id="t-po" disabled={tDrug === 'fentanyl'} />
                      <Label htmlFor="t-po" className={tDrug === 'fentanyl' ? 'opacity-50' : ''}>
                        PO (Dose)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {tRoute === 'po' && (
                <div className="space-y-2 animate-fade-in w-1/2 pr-2">
                  <Label>Intervalo Alvo</Label>
                  <Select value={tInterval} onValueChange={setTInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4/4 horas (6x/dia)</SelectItem>
                      <SelectItem value="6">6/6 horas (4x/dia)</SelectItem>
                      <SelectItem value="8">8/8 horas (3x/dia)</SelectItem>
                      <SelectItem value="12">12/12 horas (2x/dia)</SelectItem>
                      <SelectItem value="24">24/24 horas (1x/dia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-5 relative">
          <div className="sticky top-6">
            <Card className="shadow-lg border-primary/30 overflow-hidden">
              <div className="bg-primary p-6 text-primary-foreground text-center">
                <h3 className="font-medium opacity-90 mb-1">Dose Convertida</h3>
                <div className="flex justify-center items-center gap-2 text-3xl font-bold tracking-tight mt-2 animate-slide-up">
                  {result ? (
                    <>
                      {result.relativeMcg}{' '}
                      <span className="text-lg opacity-80 font-normal">mcg/kg/{tUnit}</span>
                    </>
                  ) : (
                    <span className="opacity-50 text-2xl">--</span>
                  )}
                </div>
                {result && (
                  <div className="mt-2 text-sm opacity-80 animate-fade-in">
                    ({result.relativeMg} mg/kg/{tUnit})
                  </div>
                )}
              </div>

              <CardContent className="pt-6 pb-6 space-y-6">
                {!result ? (
                  <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-8">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Preencha o peso e a dose para visualizar a conversão.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                      <Label className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 block">
                        Dose Absoluta (Para Preparo)
                      </Label>
                      <div className="flex items-baseline gap-2 text-emerald-900">
                        <span className="text-2xl font-bold">{result.absoluteMg}</span>
                        <span className="text-sm font-medium">mg / {tUnit}</span>
                      </div>
                      <div className="text-emerald-700/70 text-xs mt-1">
                        Equivalente a {result.absoluteMcg} mcg / {tUnit}
                      </div>
                      {tRoute === 'po' && (
                        <div className="mt-3 inline-flex items-center bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                          Administrar de {tInterval} em {tInterval} horas
                        </div>
                      )}
                    </div>

                    <Separator />

                    <Button
                      onClick={copyPrescription}
                      className="w-full h-12 text-md"
                      variant="default"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Prescrição
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {sDrug === tDrug && sRoute === tRoute && (
              <Alert variant="warning" className="mt-4 border-amber-200 bg-amber-50 text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription className="text-amber-800/90">
                  Você está convertendo para a mesma medicação e via. O resultado refletirá a mesma
                  dose baseada nos intervalos fornecidos.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
