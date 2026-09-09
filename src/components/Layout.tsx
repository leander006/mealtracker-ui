import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Camera, History, LogOut, Salad, Target } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scan Meal', icon: Camera },
  { to: '/history', label: 'History', icon: History },
  { to: '/goals', label: 'Goals', icon: Target },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-noise relative">
      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-ink-800 min-h-screen flex flex-col p-5">
          <div className="flex items-center gap-2 px-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <Salad className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">MealTracker</span>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent-500/10 text-accent-400 shadow-glow'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-ink-800'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-ink-800 pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-sm font-semibold text-accent-400">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm text-neutral-300 truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-500 hover:text-neutral-200 hover:bg-ink-800 transition-all w-full"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
              Log out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto px-8 py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
