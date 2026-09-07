import { useEffect, useState } from 'react'
import { Flame, Trash2, Loader2, UtensilsCrossed } from 'lucide-react'
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

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-6 w-32 bg-ink-800 rounded mb-6" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-ink-900 rounded-xl" />)}
      </div>
    )
  }

  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Meal History</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Last 90 days</p>
      </div>

      {meals.length === 0 ? (
        <div className="border border-dashed border-ink-700 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-6 h-6 text-neutral-500" strokeWidth={2} />
          </div>
          <p className="font-medium mb-1">Nothing logged yet</p>
          <p className="text-sm text-neutral-500">Meals you scan and log will show up here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <div
              key={meal.mealId}
              className="flex items-center justify-between bg-ink-900/60 border border-ink-800 rounded-xl px-4 py-3 hover:border-ink-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-peach-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-medium capitalize text-sm">{meal.foodLabel.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-neutral-500">
                    {meal.portionGrams}g · {new Date(meal.loggedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-neutral-300">{Math.round(meal.macros.calories)} kcal</p>
                <button
                  onClick={() => handleDelete(meal.mealId)}
                  disabled={deletingId === meal.mealId}
                  className="text-neutral-600 hover:text-red-400 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {deletingId === meal.mealId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
