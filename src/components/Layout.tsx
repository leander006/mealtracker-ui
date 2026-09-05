import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-brand-500">
          MealTracker
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-brand-500 transition-colors">Dashboard</Link>
          <Link to="/scan" className="hover:text-brand-500 transition-colors">Scan Meal</Link>
          <Link to="/history" className="hover:text-brand-500 transition-colors">History</Link>
          <span className="text-neutral-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md border border-neutral-700 hover:border-neutral-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
