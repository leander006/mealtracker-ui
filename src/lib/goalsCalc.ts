import type { ActivityLevel, GoalDirection, GoalProfile, GoalTargets } from '@/types/goals'

// Multipliers are the standard Harris-Benedict/Mifflin activity bands.
// These are approximations, not clinical guidance - see the note rendered
// alongside the targets in GoalsPage.
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little to no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very active (physical job or 2x/day)',
}

export const GOAL_DIRECTION_LABELS: Record<GoalDirection, string> = {
  lose: 'Lose weight',
  maintain: 'Maintain weight',
  gain: 'Gain weight',
}

// Calorie adjustment relative to maintenance (TDEE). A 20% deficit/surplus
// is a moderate, sustainable rate rather than an aggressive one.
const GOAL_ADJUSTMENT: Record<GoalDirection, number> = {
  lose: -0.2,
  maintain: 0,
  gain: 0.15,
}

/**
 * Mifflin-St Jeor equation - the most accurate widely-used BMR formula
 * for the general population (more accurate than Harris-Benedict for
 * most body types).
 *
 * Male:   BMR = 10w + 6.25h - 5a + 5
 * Female: BMR = 10w + 6.25h - 5a - 161
 */
export function calculateBMR(profile: Pick<GoalProfile, 'weightKg' | 'heightCm' | 'age' | 'biologicalSex'>): number {
  const { weightKg, heightCm, age, biologicalSex } = profile
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return biologicalSex === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

/**
 * Full target derivation: BMR -> TDEE -> goal-adjusted calories -> macro
 * split. Protein and fat are anchored to bodyweight (evidence-based
 * ranges for general fitness goals), and carbs fill the remaining
 * calorie budget - this holds up better across body types than a flat
 * percentage split.
 */
export function calculateGoalTargets(profile: GoalProfile): GoalTargets {
  const bmr = calculateBMR(profile)
  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const calories = tdee * (1 + GOAL_ADJUSTMENT[profile.goalDirection])

  const proteinPerKg = profile.goalDirection === 'lose' ? 2.0 : 1.8
  const proteinG = profile.weightKg * proteinPerKg
  const fatG = profile.weightKg * 0.8

  const proteinCals = proteinG * 4
  const fatCals = fatG * 9
  const carbCals = Math.max(calories - proteinCals - fatCals, 0)
  const carbsG = carbCals / 4

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  }
}
