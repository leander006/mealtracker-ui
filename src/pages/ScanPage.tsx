import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, AlertTriangle, RefreshCw, Check, Loader2 } from 'lucide-react'
import * as inferenceApi from '@/api/inference'
import * as mealsApi from '@/api/meals'
import { extractErrorMessage } from '@/api/client'
import type { ScanResponse } from '@/types/inference'

const LOW_CONFIDENCE_THRESHOLD = 0.5

type ScanState = 'idle' | 'scanning' | 'reviewing' | 'saving'

const MACRO_ROWS = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'proteinG', label: 'Protein', unit: 'g' },
  { key: 'carbsG', label: 'Carbs', unit: 'g' },
  { key: 'fatG', label: 'Fat', unit: 'g' },
] as const

export function ScanPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null)
  const [editablePortion, setEditablePortion] = useState<number>(0)
  const [state, setState] = useState<ScanState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function selectFile(file: File) {
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setScanResult(null)
    setError(null)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) selectFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) selectFile(file)
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
  const scale = scanResult ? editablePortion / scanResult.estimatedPortionGrams : 1

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan a Meal</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Get instant macros from a photo</p>
      </div>

      {!previewUrl && (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-72 cursor-pointer transition-all ${
            isDragging ? 'border-accent-500 bg-accent-500/5' : 'border-ink-700 hover:border-ink-600'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-neutral-400" strokeWidth={2} />
          </div>
          <span className="font-medium text-neutral-200">Drop a photo, or click to select</span>
          <span className="text-neutral-500 text-sm mt-1.5">Center the plate, shoot from directly above</span>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      )}

      {previewUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-ink-800">
          <img src={previewUrl} alt="Selected meal" className="w-full aspect-video object-cover" />
          {state === 'scanning' && (
            <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent-400 animate-spin mb-3" />
              <p className="text-sm font-medium">Analyzing your meal...</p>
              <p className="text-xs text-neutral-500 mt-1">May take a moment on first request</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {state === 'idle' && selectedFile && (
        <div className="flex gap-3">
          <button
            onClick={handleScan}
            className="flex-1 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 text-ink-950 rounded-xl py-2.5 font-semibold transition-colors"
          >
            <Camera className="w-4 h-4" /> Analyze
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2.5 rounded-xl border border-ink-700 hover:border-ink-600 text-sm transition-colors"
          >
            Choose different photo
          </button>
        </div>
      )}

      {(state === 'reviewing' || state === 'saving') && scanResult && (
        <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-5 space-y-5">
          {isLowConfidence && (
            <div className="flex items-start gap-2.5 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                We're not very confident about this one ({Math.round(scanResult.confidence * 100)}%).
                Double-check the details below, or try a clearer photo.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold capitalize">{scanResult.foodLabel.replace(/_/g, ' ')}</p>
            {!isLowConfidence && (
              <span className="text-xs font-medium text-accent-400 bg-accent-500/10 rounded-full px-2.5 py-1">
                {Math.round(scanResult.confidence * 100)}% confident
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5" htmlFor="portion">
              Portion size (grams)
            </label>
            <input
              id="portion"
              type="number"
              min={1}
              value={editablePortion}
              onChange={(e) => setEditablePortion(Number(e.target.value))}
              className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MACRO_ROWS.map(({ key, label, unit }) => (
              <div key={key} className="bg-ink-800 rounded-xl px-3.5 py-2.5">
                <p className="text-xs text-neutral-500">{label}</p>
                <p className="font-semibold text-sm mt-0.5">
                  {Math.round(scanResult.macros[key] * scale)}{unit}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleConfirmLog}
              disabled={state === 'saving'}
              className="flex-1 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-ink-950 rounded-xl py-2.5 font-semibold transition-colors"
            >
              {state === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Logging...</>
              ) : (
                <><Check className="w-4 h-4" /> Log this meal</>
              )}
            </button>
            <button
              onClick={handleRetry}
              disabled={state === 'saving'}
              className="px-4 py-2.5 rounded-xl border border-ink-700 hover:border-ink-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
