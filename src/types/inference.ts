import type { Macros } from './meal'

export interface ScanResponse {
  foodLabel: string
  confidence: number
  estimatedPortionGrams: number
  macros: Macros
  imageUrl: string | null
}
