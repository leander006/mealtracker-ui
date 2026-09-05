import { useEffect, useState } from 'react'
import * as mealsApi from '@/api/meals'
import { extractErrorMessage } from '@/api/client'
import type { MealResponse } from '@/types/meal'

export function HistoryPage() {
  const [meals, setMeals] = useState<MealResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Last 90 days, covers "history" for a project at this stage.
        // A production app would paginate this instead of loading
        // everything at once.
        const to = new Date().toISOString()
        const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        const data = await mealsApi.getMeals(from, to)
        if (!cancelled) setMeals(data)
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleDelete(mealId: string) {
    setDeletingId(mealId)
    try {
      await mealsApi.deleteMeal(mealId)
      setMeals((prev) => prev.filter((m) => m.mealId !== mealId))
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) return <p className="text-neutral-400">Loading history...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Meal History</h1>

      {meals.length === 0 ? (
        <p className="text-neutral-500 text-sm">No meals logged in the last 90 days.</p>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <div
              key={meal.mealId}
              className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium capitalize">{meal.foodLabel.replace(/_/g, ' ')}</p>
                <p className="text-sm text-neutral-500">
                  {meal.portionGrams}g - {new Date(meal.loggedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-neutral-400">{Math.round(meal.macros.calories)} kcal</p>
                <button
                  onClick={() => handleDelete(meal.mealId)}
                  disabled={deletingId === meal.mealId}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {deletingId === meal.mealId ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
