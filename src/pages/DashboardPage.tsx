import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as mealsApi from '@/api/meals'
import { extractErrorMessage } from '@/api/client'
import type { WeeklySummaryResponse, MealResponse } from '@/types/meal'

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      <p className="text-neutral-400 text-sm">{label}</p>
      <p className="text-2xl font-semibold mt-1">
        {value.toFixed(0)} <span className="text-sm text-neutral-500">{unit}</span>
      </p>
    </div>
  )
}

export function DashboardPage() {
  const [summary, setSummary] = useState<WeeklySummaryResponse | null>(null)
  const [recentMeals, setRecentMeals] = useState<MealResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [summaryData, recentData] = await Promise.all([
          mealsApi.getWeeklySummary(),
          mealsApi.getRecentMeals(),
        ])
        if (!cancelled) {
          setSummary(summaryData)
          setRecentMeals(recentData)
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    // Cleanup guards against setting state after unmount (e.g. if the
    // user navigates away before the request finishes) - avoids a React
    // warning and a real, if minor, memory-leak-shaped bug.
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return <p className="text-neutral-400">Loading dashboard...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">This Week</h1>
        {summary && summary.mealsLogged === 0 ? (
          <p className="text-neutral-400">
            No meals logged yet this week.{' '}
            <Link to="/scan" className="text-brand-500 hover:underline">Scan your first meal</Link>
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <StatCard label="Avg Calories/day" value={summary!.avgCaloriesPerDay} unit="kcal" />
            <StatCard label="Avg Protein/day" value={summary!.avgProteinG} unit="g" />
            <StatCard label="Avg Carbs/day" value={summary!.avgCarbsG} unit="g" />
            <StatCard label="Avg Fat/day" value={summary!.avgFatG} unit="g" />
            <StatCard label="Avg Fiber/day" value={summary!.avgFiberG} unit="g" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Meals</h2>
          <Link to="/history" className="text-sm text-brand-500 hover:underline">View all</Link>
        </div>
        {recentMeals.length === 0 ? (
          <p className="text-neutral-500 text-sm">Nothing logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentMeals.slice(0, 5).map((meal) => (
              <div
                key={meal.mealId}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium capitalize">{meal.foodLabel.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-neutral-500">{meal.portionGrams}g</p>
                </div>
                <p className="text-sm text-neutral-400">{Math.round(meal.macros.calories)} kcal</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
