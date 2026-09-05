export interface Macros {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
}

export interface LogMealRequest {
  foodLabel: string
  portionGrams: number
  macros: Macros
  imageUrl?: string
  loggedAt?: string
}

export interface MealResponse {
  mealId: string
  foodLabel: string
  portionGrams: number
  macros: Macros
  imageUrl: string | null
  loggedAt: string
}

export interface WeeklySummaryResponse {
  avgCaloriesPerDay: number
  avgProteinG: number
  avgCarbsG: number
  avgFatG: number
  avgFiberG: number
  mealsLogged: number
}
