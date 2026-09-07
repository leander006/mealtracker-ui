import { apiClient } from './client'
import type { LogMealRequest, MealResponse, WeeklySummaryResponse } from '@/types/meal'

export async function logMeal(request: LogMealRequest): Promise<MealResponse> {
  const { data } = await apiClient.post<MealResponse>('/api/meals', request)
  return data
}

export async function getRecentMeals(): Promise<MealResponse[]> {
  const { data } = await apiClient.get<MealResponse[]>('/api/meals/recent')
  return data
}

export async function getMeals(from: string, to: string): Promise<MealResponse[]> {
  const { data } = await apiClient.get<MealResponse[]>('/api/meals', { params: { from, to } })
  return data
}

export async function getWeeklySummary(): Promise<WeeklySummaryResponse> {
  const { data } = await apiClient.get<WeeklySummaryResponse>('/api/meals/summary')
  return data
}

export async function deleteMeal(mealId: string): Promise<void> {
  await apiClient.delete(`/api/meals/${mealId}`)
}
