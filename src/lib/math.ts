export type Drug = 'fentanyl' | 'morphine' | 'methadone'
export type Route = 'iv' | 'po'

export interface CalculationResult {
  relativeMcg: number
  relativeMg: number
  absoluteMcg: number
  absoluteMg: number
}

export function calculateConversion(
  weight: number,
  sourceDrug: Drug,
  sourceRoute: Route,
  sourceDoseMcg: number,
  sourceInterval: number,
  targetDrug: Drug,
  targetRoute: Route,
  targetInterval: number,
): CalculationResult | null {
  if (!weight || weight <= 0 || !sourceDoseMcg || sourceDoseMcg <= 0) return null

  // 1. Calculate Daily Source Dose in mcg per kg
  const sourceDailyMcg =
    sourceRoute === 'iv' ? sourceDoseMcg * 24 : sourceDoseMcg * (24 / sourceInterval)

  // 2. Convert to Daily Morphine IV Equivalent (mg per kg)
  let mIvDailyMg = 0
  const sourceDailyMg = sourceDailyMcg / 1000

  if (sourceDrug === 'fentanyl' && sourceRoute === 'iv') {
    mIvDailyMg = sourceDailyMcg / 10 // 10 mcg Fentanyl IV = 1 mg Morphine IV
  } else if (sourceDrug === 'morphine' && sourceRoute === 'iv') {
    mIvDailyMg = sourceDailyMg / 1
  } else if (sourceDrug === 'morphine' && sourceRoute === 'po') {
    mIvDailyMg = sourceDailyMg / 3 // 3 mg Morphine PO = 1 mg Morphine IV
  } else if (sourceDrug === 'methadone' && sourceRoute === 'iv') {
    mIvDailyMg = sourceDailyMg / 1
  } else if (sourceDrug === 'methadone' && sourceRoute === 'po') {
    mIvDailyMg = sourceDailyMg / 2 // 2 mg Methadone PO = 1 mg Morphine IV (using conservative 1:2 ratio)
  }

  // 3. Convert Daily Morphine IV (mg) to Target Daily Equivalent
  let targetDailyMg = 0
  let targetDailyMcgForFentanyl = 0

  if (targetDrug === 'fentanyl' && targetRoute === 'iv') {
    targetDailyMcgForFentanyl = mIvDailyMg * 10
  } else if (targetDrug === 'morphine' && targetRoute === 'iv') {
    targetDailyMg = mIvDailyMg * 1
  } else if (targetDrug === 'morphine' && targetRoute === 'po') {
    targetDailyMg = mIvDailyMg * 3
  } else if (targetDrug === 'methadone' && targetRoute === 'iv') {
    targetDailyMg = mIvDailyMg * 1
  } else if (targetDrug === 'methadone' && targetRoute === 'po') {
    targetDailyMg = mIvDailyMg * 2
  }

  // 4. Calculate final interval dose
  let finalDoseMg = 0
  if (targetDrug === 'fentanyl') {
    const finalDoseMcg =
      targetRoute === 'iv'
        ? targetDailyMcgForFentanyl / 24
        : targetDailyMcgForFentanyl / (24 / targetInterval)
    finalDoseMg = finalDoseMcg / 1000
  } else {
    finalDoseMg = targetRoute === 'iv' ? targetDailyMg / 24 : targetDailyMg / (24 / targetInterval)
  }

  const finalDoseMcg = finalDoseMg * 1000

  return {
    relativeMcg: Number(finalDoseMcg.toFixed(2)),
    relativeMg: Number(finalDoseMg.toFixed(4)),
    absoluteMcg: Number((finalDoseMcg * weight).toFixed(2)),
    absoluteMg: Number((finalDoseMg * weight).toFixed(4)),
  }
}

export function formatDrugName(drug: Drug): string {
  switch (drug) {
    case 'fentanyl':
      return 'Fentanil'
    case 'morphine':
      return 'Morfina'
    case 'methadone':
      return 'Metadona'
  }
}
