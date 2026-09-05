import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as inferenceApi from '@/api/inference'
import * as mealsApi from '@/api/meals'
import { extractErrorMessage } from '@/api/client'
import type { ScanResponse } from '@/types/inference'

// Below this confidence, don't present the classifier's guess as
// reliable - this is the confidence-gating behavior we designed earlier
// in the project specifically to handle out-of-distribution photos
// (e.g. raw/uncooked food, or anything not resembling a trained class)
// gracefully instead of silently showing a wrong label as if certain.
const LOW_CONFIDENCE_THRESHOLD = 0.5

type ScanState = 'idle' | 'scanning' | 'reviewing' | 'saving'

export function ScanPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null)
  const [editablePortion, setEditablePortion] = useState<number>(0)
  const [state, setState] = useState<ScanState>('idle')
  const [error, setError] = useState<string | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setScanResult(null)
    setError(null)
  }

  async function handleScan() {
    if (!selectedFile) return
    setState('scanning')
    setError(null)
    try {
      const result = await inferenceApi.scanMealImage(selectedFile)
      setScanResult(result)
      setEditablePortion(result.estimatedPortionGrams)
      setState('reviewing')
    } catch (err) {
      setError(extractErrorMessage(err))
      setState('idle')
    }
  }

  async function handleConfirmLog() {
    if (!scanResult) return
    setState('saving')
    setError(null)
    try {
      // Scale macros proportionally if the user adjusted the portion -
      // the scan result's macros were computed for the ORIGINAL estimated
      // portion, so an edited portion needs the same scaling.
      const scale = editablePortion / scanResult.estimatedPortionGrams
      await mealsApi.logMeal({
        foodLabel: scanResult.foodLabel,
        portionGrams: editablePortion,
        macros: {
          calories: scanResult.macros.calories * scale,
          proteinG: scanResult.macros.proteinG * scale,
          carbsG: scanResult.macros.carbsG * scale,
          fatG: scanResult.macros.fatG * scale,
          fiberG: scanResult.macros.fiberG * scale,
        },
        imageUrl: scanResult.imageUrl ?? undefined,
      })
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err))
      setState('reviewing')
    }
  }

  function handleRetry() {
    setSelectedFile(null)
    setPreviewUrl(null)
    setScanResult(null)
    setState('idle')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isLowConfidence = scanResult !== null && scanResult.confidence < LOW_CONFIDENCE_THRESHOLD

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Scan a Meal</h1>

      {!previewUrl && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 rounded-lg h-64 cursor-pointer hover:border-brand-500 transition-colors">
          <span className="text-neutral-400">Click to select a photo</span>
          <span className="text-neutral-600 text-sm mt-1">Center the plate, shoot from directly above</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {previewUrl && (
        <img src={previewUrl} alt="Selected meal" className="w-full rounded-lg border border-neutral-800" />
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {state === 'idle' && selectedFile && (
        <div className="flex gap-3">
          <button
            onClick={handleScan}
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2 font-medium transition-colors"
          >
            Analyze
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-md border border-neutral-700 hover:border-neutral-500 transition-colors"
          >
            Choose different photo
          </button>
        </div>
      )}

      {state === 'scanning' && (
        <div className="text-center py-4">
          <p className="text-neutral-400">Analyzing your meal...</p>
          <p className="text-neutral-600 text-sm mt-1">This may take a moment on first request</p>
        </div>
      )}

      {(state === 'reviewing' || state === 'saving') && scanResult && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
          {isLowConfidence ? (
            <div className="bg-yellow-950/50 border border-yellow-900 rounded-md px-3 py-2 text-sm text-yellow-400">
              We're not very confident about this one ({Math.round(scanResult.confidence * 100)}% confidence).
              Double-check the details below, or try a clearer photo from directly above.
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              {Math.round(scanResult.confidence * 100)}% confidence
            </p>
          )}

          <div>
            <p className="text-lg font-medium capitalize">{scanResult.foodLabel.replace(/_/g, ' ')}</p>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1" htmlFor="portion">
              Portion size (grams)
            </label>
            <input
              id="portion"
              type="number"
              min={1}
              value={editablePortion}
              onChange={(e) => setEditablePortion(Number(e.target.value))}
              className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:border-brand-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Adjust if this doesn't look right - macros scale automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-neutral-800 rounded-md px-3 py-2">
              <span className="text-neutral-500">Calories:</span>{' '}
              {Math.round(scanResult.macros.calories * (editablePortion / scanResult.estimatedPortionGrams))}
            </div>
            <div className="bg-neutral-800 rounded-md px-3 py-2">
              <span className="text-neutral-500">Protein:</span>{' '}
              {Math.round(scanResult.macros.proteinG * (editablePortion / scanResult.estimatedPortionGrams))}g
            </div>
            <div className="bg-neutral-800 rounded-md px-3 py-2">
              <span className="text-neutral-500">Carbs:</span>{' '}
              {Math.round(scanResult.macros.carbsG * (editablePortion / scanResult.estimatedPortionGrams))}g
            </div>
            <div className="bg-neutral-800 rounded-md px-3 py-2">
              <span className="text-neutral-500">Fat:</span>{' '}
              {Math.round(scanResult.macros.fatG * (editablePortion / scanResult.estimatedPortionGrams))}g
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleConfirmLog}
              disabled={state === 'saving'}
              className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-md py-2 font-medium transition-colors"
            >
              {state === 'saving' ? 'Logging...' : 'Log this meal'}
            </button>
            <button
              onClick={handleRetry}
              disabled={state === 'saving'}
              className="px-4 py-2 rounded-md border border-neutral-700 hover:border-neutral-500 disabled:opacity-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
