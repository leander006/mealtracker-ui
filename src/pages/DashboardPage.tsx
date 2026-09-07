import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Beef, Wheat, Droplet, Leaf, Camera, ArrowRight } from 'lucide-react'
import * as mealsApi from '@/api/meals'
import { extractErrorMessage } from '@/api/client'
import type { WeeklySummaryResponse, MealResponse } from '@/types/meal'

const STAT_CONFIG = [
  { key: 'avgCaloriesPerDay', label: 'Calories', unit: 'kcal', icon: Flame, color: 'text-peach-400', bg: 'bg-peach-500/10' },
  { key: 'avgProteinG', label: 'Protein', unit: 'g', icon: Beef, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { key: 'avgCarbsG', label: 'Carbs', unit: 'g', icon: Wheat, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'avgFatG', label: 'Fat', unit: 'g', icon: Droplet, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { key: 'avgFiberG', label: 'Fiber', unit: 'g', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
] as const

function StatCard({ label, value, unit, icon: Icon, color, bg }: {
  label: string; value: number; unit: string
  icon: typeof Flame; color: string; bg: string
}) {
  return (
    <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-4 hover:border-ink-700 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-[18px] h-[18px] ${color}`} strokeWidth={2} />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value.toFixed(0)}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label} / day · {unit}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="border border-dashed border-ink-700 rounded-2xl p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
        <Camera className="w-6 h-6 text-accent-400" strokeWidth={2} />
      </div>
      <p className="font-medium mb-1">No meals logged this week</p>
      <p className="text-sm text-neutral-500 mb-5">Scan your first meal to see your macros here.</p>
      <Link
        to="/scan"
        className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-ink-950 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
      >
        Scan a meal <ArrowRight className="w-4 h-4" />
      </Link>
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
        if (!cancelled) { setSummary(summaryData); setRecentMeals(recentData) }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-ink-800 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-ink-900 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">This Week</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Your average daily macros</p>
        </div>

        {summary && summary.mealsLogged === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {STAT_CONFIG.map((stat) => (
              <StatCard key={stat.key} {...stat} value={summary![stat.key]} />
            ))}
          </div>
        )}
      </div>

      {recentMeals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight">Recent Meals</h2>
            <Link to="/history" className="text-sm text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentMeals.slice(0, 5).map((meal) => (
              <div
                key={meal.mealId}
                className="flex items-center justify-between bg-ink-900/60 border border-ink-800 rounded-xl px-4 py-3 hover:border-ink-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-peach-400" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium capitalize text-sm">{meal.foodLabel.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-neutral-500">{meal.portionGrams}g</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-300">{Math.round(meal.macros.calories)} kcal</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
