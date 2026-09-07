import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Salad, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/api/client'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-noise flex">
      {/* Left panel - brand/hero, hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 items-center justify-center p-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{ background: 'radial-gradient(circle at 30% 20%, rgba(143,214,57,0.4), transparent 50%)' }} />
        <div className="relative z-10 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center mb-8">
            <Salad className="w-7 h-7 text-ink-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Know exactly what's on your plate.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Snap a photo, get instant macros. No manual logging, no guesswork -
            just point your camera and eat with confidence.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <Salad className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg">LogYourMeal</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-neutral-500 mb-8">Log in to continue tracking</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-ink-950 rounded-xl py-2.5 font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
              {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-400 hover:text-accent-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
