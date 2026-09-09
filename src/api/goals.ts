import type { GoalProfile, GoalsState, WeightEntry } from '@/types/goals'

// Persisted client-side for now. Every function here is async and returns
// plain data, matching the shape of api/meals.ts, so swapping the bodies
// for real apiClient calls later (e.g. GET/PUT /api/goals) is a drop-in
// change - no caller needs to change.
const STORAGE_KEY = 'goalsState'

function readState(): GoalsState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { profile: null, weightLog: [] }
  try {
    const parsed = JSON.parse(raw) as GoalsState
    return { profile: parsed.profile ?? null, weightLog: parsed.weightLog ?? [] }
  } catch {
    return { profile: null, weightLog: [] }
  }
}

function writeState(state: GoalsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Small artificial delay so loading states behave the same way they will
// once this is backed by a real network call.
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 120))
}

export async function getGoalsState(): Promise<GoalsState> {
  await tick()
  return readState()
}

export async function saveGoalProfile(profile: GoalProfile): Promise<GoalProfile> {
  await tick()
  const state = readState()
  state.profile = profile

  // Keep the weight log in sync with the profile's current weight so the
  // progress chart has a starting point even before the user logs anything.
  const today = new Date().toISOString()
  const hasToday = state.weightLog.some((e) => e.loggedAt.slice(0, 10) === today.slice(0, 10))
  if (!hasToday) {
    state.weightLog.push({ entryId: crypto.randomUUID(), weightKg: profile.weightKg, loggedAt: today })
  }

  writeState(state)
  return profile
}

export async function logWeight(weightKg: number): Promise<WeightEntry> {
  await tick()
  const state = readState()
  const today = new Date().toISOString()
  const existingIndex = state.weightLog.findIndex((e) => e.loggedAt.slice(0, 10) === today.slice(0, 10))
  const entry: WeightEntry = { entryId: crypto.randomUUID(), weightKg, loggedAt: today }

  if (existingIndex >= 0) {
    state.weightLog[existingIndex] = entry
  } else {
    state.weightLog.push(entry)
  }
  state.weightLog.sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))

  writeState(state)
  return entry
}

export async function deleteWeightEntry(entryId: string): Promise<void> {
  await tick()
  const state = readState()
  state.weightLog = state.weightLog.filter((e) => e.entryId !== entryId)
  writeState(state)
}
