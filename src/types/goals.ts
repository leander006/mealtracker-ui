export type BiologicalSex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export type GoalDirection = 'lose' | 'maintain' | 'gain'

export interface GoalProfile {
  heightCm: number
  weightKg: number
  age: number
  biologicalSex: BiologicalSex
  activityLevel: ActivityLevel
  goalDirection: GoalDirection
}

export interface MacroTargets {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface GoalTargets extends MacroTargets {
  bmr: number
  tdee: number
}

export interface WeightEntry {
  entryId: string
  weightKg: number
  loggedAt: string
}

export interface GoalsState {
  profile: GoalProfile | null
  weightLog: WeightEntry[]
}
