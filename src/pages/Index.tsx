import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { calculateConversion, Drug, Route, formatDrugName } from '@/lib/math'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, AlertCircle, Syringe, Pill } from 'lucide-react'
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
  const [sUnit, setSUnit] = useState(searchParams.get('su') || 'mcg/Kg/h')
  const [sInterval, setSInterval] = useState(searchParams.get('si') || '4')

  const [tDrug, setTDrug] = useState<Drug>((searchParams.get('td') as Drug) || 'morphine')
  const [tRoute, setTRoute] = useState<Route>((searchParams.get('tr') as Route) || 'po')
  const [tInterval, setTInterval] = useState(searchParams.get('ti') || '6')

  // Adjust sUnit based on route when route changes
  useEffect(() => {
    if (sRoute === 'po' && !sUnit.includes('dose')) {
      setSUnit('mg/Kg/dose')
    } else if (sRoute === 'iv' && sUnit === 'mcg/Kg/dose') {
      setSUnit('mcg/Kg/h')
    }
  }, [sRoute, sUnit])

  // Sync state to URL for sharing
  useEffect(() => {
    const params = new URLSearchParams()
    if (weight) params.set('w', weight)
    params.set('sd', sDrug)
    params.set('sr', sRoute)
    if (sDose) params.set('sdo', sDose)
    if (sUnit) params.set('su', sUnit)
    if (sUnit.includes('dose')) params.set('si', sInterval)
    params.set('td', tDrug)
    params.set('tr', tRoute)
    if (tRoute === 'po') params.set('ti', tInterval)
    setSearchParams(params, { replace: true })
  }, [weight, sDrug, sRoute, sDose, sUnit, sInterval, tDrug, tRoute, tInterval, setSearchParams])

  // Enforce Fentanyl IV only
  useEffect(() => {
    if (sDrug === 'fentanyl' && sRoute !== 'iv') setSRoute('iv')
    if (tDrug === 'fentanyl' && tRoute !== 'iv') setTRoute('iv')
  }, [sDrug, tDrug])

  const result = useMemo(() => {
    const parsedDose = parseFloat(sDose)
    const doseInMcg = sUnit.startsWith('mg') ? parsedDose * 1000 : parsedDose
    const isSourceContinuous = sUnit.includes('/h')

    return calculateConversion(
      parseFloat(weight),
      sDrug,
      sRoute,
      doseInMcg,
      parseInt(sInterval),
      tDrug,
      tRoute,
      parseInt(tInterval),
      isSourceContinuous,
    )
  }, [weight, sDrug, sRoute, sDose, sUnit, sInterval, tDrug, tRoute, tInterval])

  // Save to history automatically when a valid result exists
  useEffect(() => {
    if (result && weight && sDose) {
      const timeoutId = setTimeout(() => {
        const history = JSON.parse(localStorage.getItem('nas_calc_history') || '[]')
        const newEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          weight,
          source: `${formatDrugName(sDrug)} ${sRoute.toUpperCase()} ${sDose} ${sUnit}`,
          target: `${formatDrugName(tDrug)} ${tRoute.toUpperCase()}`,
          resultRelative: `${result.relativeMcg} mcg/Kg/${tRoute === 'iv' ? 'h' : 'dose'}`,
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
  }, [result, weight, sDose, sUnit, sDrug, sRoute, tDrug, tRoute])

  const copyPrescription = () => {
    if (!result) return
    const isSourceContinuous = sUnit.includes('/h')
    const sourceText = `${formatDrugName(sDrug)} ${sRoute.toUpperCase()} ${sDose} ${sUnit} ${!isSourceContinuous ? `(${24 / parseInt(sInterval)}x/dia)` : ''}`
    const targetText = `${formatDrugName(tDrug)} ${tRoute.toUpperCase()} ${result.absoluteMg} mg/${tRoute === 'iv' ? 'h' : `dose de ${tInterval}/${tInterval}h`} (${result.relativeMcg} mcg/Kg/${tRoute === 'iv' ? 'h' : 'dose'})`

    const text = `Transição Opioide SAN\nPeso: ${weight} Kg\nDe: ${sourceText}\nPara: ${targetText}`

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado!',
        description: 'Prescrição copiada para a área de transferência.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    })
  }

  const tUnitPrimary = tRoute === 'iv' ? 'mcg/Kg/h' : 'mcg/Kg/dose'
  const tUnitSecondary = tRoute === 'iv' ? 'mg/Kg/h' : 'mg/Kg/dose'
  const tUnitAbs = tRoute === 'iv' ? 'h' : 'dose'

  const isSourceContinuous = sUnit.includes('/h')

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Calculadora de Conversão
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Converta doses de opioides para recém-nascidos em tratamento de Síndrome de Abstinência
          Neonatal (SAN).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Inputs */}
        <div className="md:col-span-7 space-y-6">
          <Card className="shadow-sm border-blue-100 dark:border-blue-900 overflow-hidden">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 px-6 py-4 border-b border-blue-100 dark:border-blue-900">
              <Label htmlFor="weight" className="font-semibold text-blue-900 dark:text-blue-300">
                Peso do Paciente (Kg)
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 3.2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="max-w-[200px] text-lg h-12 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                Prescrição Atual (Origem)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Medicamento
                </Label>
                <Tabs value={sDrug} onValueChange={(v) => setSDrug(v as Drug)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fentanyl">Fentanil</TabsTrigger>
                    <TabsTrigger value="morphine">Morfina</TabsTrigger>
                    <TabsTrigger value="methadone">Metadona</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-600 dark:text-slate-400">Via de Administração</Label>
                  <RadioGroup
                    value={sRoute}
                    onValueChange={(v: Route) => setSRoute(v)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="iv" id="s-iv" />
                      <Label htmlFor="s-iv" className="flex items-center gap-1 cursor-pointer">
                        <Syringe className="w-4 h-4 text-slate-400" /> IV (Contínua/Int.)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="po" id="s-po" disabled={sDrug === 'fentanyl'} />
                      <Label
                        htmlFor="s-po"
                        className={`flex items-center gap-1 cursor-pointer ${sDrug === 'fentanyl' ? 'opacity-50' : ''}`}
                      >
                        <Pill className="w-4 h-4 text-slate-400" /> VO (Dose)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-slate-400">Dose</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 2.5"
                        value={sDose}
                        onChange={(e) => setSDose(e.target.value)}
                        className="font-medium flex-1 min-w-[80px]"
                      />
                      <Select value={sUnit} onValueChange={setSUnit}>
                        <SelectTrigger className="w-[140px] flex-shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sRoute === 'po' ? (
                            <>
                              <SelectItem value="mcg/Kg/dose">mcg/Kg/dose</SelectItem>
                              <SelectItem value="mg/Kg/dose">mg/Kg/dose</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="mcg/Kg/h">mcg/Kg/h</SelectItem>
                              <SelectItem value="mg/Kg/h">mg/Kg/h</SelectItem>
                              <SelectItem value="mcg/Kg/dose">mcg/Kg/dose</SelectItem>
                              <SelectItem value="mg/Kg/dose">mg/Kg/dose</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!isSourceContinuous && (
                    <div className="space-y-2 animate-fade-in">
                      <Label className="text-slate-600 dark:text-slate-400">Intervalo</Label>
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
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                Alvo da Conversão (Destino)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Medicamento
                </Label>
                <Tabs value={tDrug} onValueChange={(v) => setTDrug(v as Drug)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fentanyl">Fentanil</TabsTrigger>
                    <TabsTrigger value="morphine">Morfina</TabsTrigger>
                    <TabsTrigger value="methadone">Metadona</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-600 dark:text-slate-400">Via de Administração</Label>
                  <RadioGroup
                    value={tRoute}
                    onValueChange={(v: Route) => setTRoute(v)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="iv" id="t-iv" />
                      <Label htmlFor="t-iv" className="flex items-center gap-1 cursor-pointer">
                        <Syringe className="w-4 h-4 text-slate-400" /> IV (Contínua)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="po" id="t-po" disabled={tDrug === 'fentanyl'} />
                      <Label
                        htmlFor="t-po"
                        className={`flex items-center gap-1 cursor-pointer ${tDrug === 'fentanyl' ? 'opacity-50' : ''}`}
                      >
                        <Pill className="w-4 h-4 text-slate-400" /> VO (Dose)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {tRoute === 'po' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-slate-600 dark:text-slate-400">Intervalo Alvo</Label>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-5 relative">
          <div className="sticky top-6">
            <Card className="shadow-lg border-blue-200 dark:border-blue-900 overflow-hidden bg-white dark:bg-slate-950">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
                <h3 className="font-medium opacity-90 text-blue-50 uppercase tracking-wider text-sm mb-2">
                  Dose Convertida Calculada
                </h3>
                <div className="flex justify-center items-baseline gap-2 mt-2 min-h-[56px]">
                  {result ? (
                    <div className="animate-slide-up flex flex-col items-center w-full">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight">
                          {result.relativeMcg}
                        </span>
                        <span className="text-lg opacity-90 font-medium">{tUnitPrimary}</span>
                      </div>
                      <div className="mt-1.5 text-sm font-medium bg-blue-800/60 px-3.5 py-1 rounded-full">
                        ({result.relativeMg} {tUnitSecondary})
                      </div>
                    </div>
                  ) : (
                    <span className="opacity-50 text-4xl font-light">--</span>
                  )}
                </div>
              </div>

              <CardContent className="pt-8 pb-6 space-y-6">
                {!result ? (
                  <div className="text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3 py-10">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-2">
                      <AlertCircle className="w-6 h-6 opacity-50" />
                    </div>
                    <p className="text-sm px-4">
                      Preencha o peso e a dose de origem para visualizar o resultado da conversão.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <Label className="text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 block">
                        Dose Absoluta (Para Preparo)
                      </Label>
                      <div className="flex items-baseline gap-2 text-emerald-900 dark:text-emerald-100">
                        <span className="text-3xl font-bold">{result.absoluteMg}</span>
                        <span className="text-sm font-semibold">mg / {tUnitAbs}</span>
                      </div>
                      <div className="text-emerald-700/80 dark:text-emerald-500/80 text-xs mt-2 font-medium">
                        Equivalente a {result.absoluteMcg} mcg / {tUnitAbs}
                      </div>
                      {tRoute === 'po' && (
                        <div className="mt-4 inline-flex items-center bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm border border-emerald-200 dark:border-emerald-800">
                          Administrar a cada {tInterval} horas
                        </div>
                      )}
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <Button
                      onClick={copyPrescription}
                      className="w-full h-12 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Prescrição
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {sDrug === tDrug && sRoute === tRoute && (
              <Alert
                variant="warning"
                className="mt-6 border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-200 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">
                  Atenção
                </AlertTitle>
                <AlertDescription className="text-amber-700/90 dark:text-amber-400/90 text-sm mt-1">
                  Você está convertendo para a mesma medicação e via. O resultado reflete a mesma
                  dose proporcional baseada nos intervalos fornecidos.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
