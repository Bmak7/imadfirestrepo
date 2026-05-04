import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { login, logout, restoreUserFromSession } from './lib/auth'
import { AdminPage } from './pages/AdminPage'
import { ChefDashboardPage } from './pages/ChefDashboardPage'
import { EmployeePollPage } from './pages/EmployeePollPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

function ProtectedRoute({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }
  return children
}

function RoleNavigation({ user }) {
  return (
    <nav aria-label="Navigation role" className="mt-4">
      <div className="surface-soft flex flex-col gap-2 p-2">
        {user.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `role-tab ${isActive ? 'role-tab-active' : ''}`}>
            Dashboard Admin
          </NavLink>
        )}
        {user.role === 'chef' && (
          <NavLink to="/chef" className={({ isActive }) => `role-tab ${isActive ? 'role-tab-active' : ''}`}>
            Dashboard Chef de Service
          </NavLink>
        )}
        <NavLink to="/" className={({ isActive }) => `role-tab ${isActive ? 'role-tab-active' : ''}`}>
          Vue accueil
        </NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    restoreUserFromSession().then((restoredUser) => {
      if (!active) {
        return
      }
      setUser(restoredUser)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleLogin(credentials) {
    const authenticatedUser = await login(credentials)
    setUser(authenticatedUser)
    return authenticatedUser
  }

  function handleLogout() {
    logout()
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        Initialisation de la plateforme...
      </p>
    )
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8">
        <aside className="surface-card h-fit p-5 lg:sticky lg:top-6">
          <header className="interactive group inline-flex items-center gap-3">
            <span className="brand-mark" aria-hidden="true" />
            <Link to="/" className="block">
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Enterprise Suite
              </span>
              <span className="block text-lg font-semibold text-slate-900">
                Climat Social Platform
              </span>
            </Link>
          </header>

          {user ? (
            <>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {user.name} • {user.role}
              </div>
              <RoleNavigation user={user} />
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary interactive mt-4 w-full px-3 py-2 text-sm"
              >
                Deconnexion
              </button>
            </>
          ) : (
            <div className="mt-4">
              <Link to="/login" className="btn-primary interactive block w-full px-4 py-2 text-center text-sm">
                Connexion
              </Link>
              <div className="mt-3">
                <NavLink
                  to="/"
                  className={({ isActive }) => `role-tab block text-center ${isActive ? 'role-tab-active' : ''}`}
                >
                  Vue accueil
                </NavLink>
              </div>
            </div>
          )}
        </aside>

        <main id="main-content">
          <div className="surface-soft mb-4 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Espace de travail</p>
          </div>
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} role="admin">
                  <AdminPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chef"
              element={
                <ProtectedRoute user={user} role="chef">
                  <ChefDashboardPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route path="/employee/:campaignId" element={<EmployeePollPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
