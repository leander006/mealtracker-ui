import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Target, Flame, Beef, Wheat, Droplet, Pencil, Check, TrendingUp, Scale, Trash2,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import * as goalsApi from '@/api/goals'
import { calculateGoalTargets, ACTIVITY_LABELS, GOAL_DIRECTION_LABELS } from '@/lib/goalsCalc'
import type {
  ActivityLevel, BiologicalSex, GoalDirection, GoalProfile, WeightEntry,
} from '@/types/goals'

const inputClass =
  'w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all'
const labelClass = 'block text-sm font-medium text-neutral-400 mb-1.5'

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame, color: 'text-peach-400', bg: 'bg-peach-500/10' },
  { key: 'proteinG', label: 'Protein', unit: 'g', icon: Beef, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { key: 'carbsG', label: 'Carbs', unit: 'g', icon: Wheat, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'fatG', label: 'Fat', unit: 'g', icon: Droplet, color: 'text-sky-400', bg: 'bg-sky-500/10' },
] as const

function emptyProfile(): GoalProfile {
  return {
    heightCm: 170,
    weightKg: 70,
    age: 30,
    biologicalSex: 'female',
    activityLevel: 'moderate',
    goalDirection: 'maintain',
  }
}

function GoalForm({
  initial, onSaved,
}: {
  initial: GoalProfile | null
  onSaved: (profile: GoalProfile) => void
}) {
  const [form, setForm] = useState<GoalProfile>(initial ?? emptyProfile())
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const saved = await goalsApi.saveGoalProfile(form)
      onSaved(saved)
    } finally {
      setIsSubmitting(false)
    }
  }

  function update<K extends keyof GoalProfile>(key: K, value: GoalProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className={labelClass} htmlFor="heightCm">Height (cm)</label>
          <input
            id="heightCm" type="number" required min={100} max={250} className={inputClass}
            value={form.heightCm}
            onChange={(e) => update('heightCm', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="weightKg">Weight (kg)</label>
          <input
            id="weightKg" type="number" required min={30} max={300} step={0.1} className={inputClass}
            value={form.weightKg}
            onChange={(e) => update('weightKg', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="age">Age</label>
          <input
            id="age" type="number" required min={13} max={100} className={inputClass}
            value={form.age}
            onChange={(e) => update('age', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="biologicalSex">Biological sex</label>
          <select
            id="biologicalSex" className={inputClass}
            value={form.biologicalSex}
            onChange={(e) => update('biologicalSex', e.target.value as BiologicalSex)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="activityLevel">Activity level</label>
          <select
            id="activityLevel" className={inputClass}
            value={form.activityLevel}
            onChange={(e) => update('activityLevel', e.target.value as ActivityLevel)}
          >
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="goalDirection">Goal</label>
          <select
            id="goalDirection" className={inputClass}
            value={form.goalDirection}
            onChange={(e) => update('goalDirection', e.target.value as GoalDirection)}
          >
            {Object.entries(GOAL_DIRECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto group bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-ink-950 rounded-xl px-5 py-2.5 font-semibold transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Saving...' : initial ? 'Update targets' : 'Calculate my targets'}
        {!isSubmitting && <Check className="w-4 h-4" />}
      </button>
    </form>
  )
}

function WeightLogForm({ onLogged }: { onLogged: (entry: WeightEntry) => void }) {
  const [weight, setWeight] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(weight)
    if (!value || value <= 0) return
    setIsSubmitting(true)
    try {
      const entry = await goalsApi.logWeight(value)
      onLogged(entry)
      setWeight('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number" step={0.1} min={0} placeholder="Today's weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className={`${inputClass} max-w-[180px]`}
      />
      <button
        type="submit"
        disabled={isSubmitting || !weight}
        className="shrink-0 bg-ink-800 hover:bg-ink-700 disabled:opacity-40 text-neutral-200 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
      >
        <Scale className="w-4 h-4" /> Log
      </button>
    </form>
  )
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-850 border border-ink-700 rounded-xl px-3 py-2 shadow-glow">
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-accent-400">{payload[0].value} kg</p>
    </div>
  )
}

function WeightProgressChart({ entries, onDeleteLatest }: { entries: WeightEntry[]; onDeleteLatest: () => void }) {
  const chartData = useMemo(
    () =>
      entries.map((e) => ({
        date: new Date(e.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: Math.round(e.weightKg * 10) / 10,
      })),
    [entries],
  )

  if (entries.length < 2) {
    return (
      <div className="border border-dashed border-ink-700 rounded-2xl p-8 text-center">
        <TrendingUp className="w-6 h-6 text-neutral-600 mx-auto mb-2" strokeWidth={2} />
        <p className="text-sm text-neutral-500">Log your weight a couple more times to see a trend.</p>
      </div>
    )
  }

  const first = entries[0].weightKg
  const last = entries[entries.length - 1].weightKg
  const delta = Math.round((last - first) * 10) / 10

  return (
    <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold tracking-tight">Weight progress</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {delta === 0 ? 'No change' : `${delta > 0 ? '+' : ''}${delta} kg`} since {new Date(entries[0].loggedAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onDeleteLatest}
          title="Remove latest entry"
          className="text-neutral-600 hover:text-red-400 transition-colors p-1.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="h-56 sm:h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8fd639" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8fd639" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#20241f" vertical={false} />
            <XAxis
              dataKey="date" tick={{ fill: '#5c6656', fontSize: 12 }} axisLine={{ stroke: '#20241f' }}
              tickLine={false} minTickGap={24}
            />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#5c6656', fontSize: 12 }}
              axisLine={false} tickLine={false} width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="weight" stroke="#8fd639" strokeWidth={2.5}
              fill="url(#weightFill)"
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              dot={{ r: 3, fill: '#8fd639', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#a6e35b', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function GoalsPage() {
  const [profile, setProfile] = useState<GoalProfile | null>(null)
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const state = await goalsApi.getGoalsState()
      if (!cancelled) {
        setProfile(state.profile)
        setWeightLog(state.weightLog)
        setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const targets = useMemo(() => (profile ? calculateGoalTargets(profile) : null), [profile])

  function handleSaved(saved: GoalProfile) {
    setProfile(saved)
    setIsEditing(false)
    goalsApi.getGoalsState().then((state) => setWeightLog(state.weightLog))
  }

  function handleWeightLogged(entry: WeightEntry) {
    setWeightLog((log) => {
      const withoutToday = log.filter((e) => e.loggedAt.slice(0, 10) !== entry.loggedAt.slice(0, 10))
      return [...withoutToday, entry].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
    })
  }

  async function handleDeleteLatest() {
    const latest = weightLog[weightLog.length - 1]
    if (!latest) return
    await goalsApi.deleteWeightEntry(latest.entryId)
    setWeightLog((log) => log.filter((e) => e.entryId !== latest.entryId))
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-ink-800 rounded" />
        <div className="h-40 bg-ink-900 rounded-2xl" />
        <div className="h-64 bg-ink-900 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Your daily calorie and macro targets</p>
        </div>
        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100 bg-ink-900 hover:bg-ink-800 border border-ink-800 rounded-xl px-3.5 py-2 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      {(!profile || isEditing) && (
        <GoalForm initial={profile} onSaved={handleSaved} />
      )}

      {profile && targets && !isEditing && (
        <>
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MACRO_CONFIG.map(({ key, label, unit, icon: Icon, color, bg }) => (
                <div
                  key={key}
                  className="bg-ink-900/60 border border-ink-800 rounded-2xl p-4 hover:border-ink-700 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-[18px] h-[18px] ${color}`} strokeWidth={2} />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{targets[key]}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{label} / day · {unit}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-500 mt-3 px-1">
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> BMR: {targets.bmr} kcal</span>
              <span>TDEE: {targets.tdee} kcal</span>
              <span className="capitalize">{GOAL_DIRECTION_LABELS[profile.goalDirection]}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-bold tracking-tight">Progress</h2>
              <WeightLogForm onLogged={handleWeightLogged} />
            </div>
            <WeightProgressChart entries={weightLog} onDeleteLatest={handleDeleteLatest} />
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Targets are estimated with the Mifflin-St Jeor equation and a standard activity multiplier.
            They're a reasonable starting point, not medical advice - adjust based on how your weight
            trends over a few weeks.
          </p>
        </>
      )}
    </div>
  )
}
