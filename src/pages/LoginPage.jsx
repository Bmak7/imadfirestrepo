import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../lib/db'

export function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: ROLES.admin,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    if (!form.email.trim() || !form.password.trim()) {
      setError("Veuillez saisir l'email et le mot de passe.")
      setSubmitting(false)
      return
    }

    try {
      const user = await onLogin(form)
      navigate(user.role === ROLES.admin ? '/admin' : '/chef')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <div className="surface-card p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Secure Access</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Connexion a la plateforme</h1>
        <p className="mt-2 text-sm text-slate-600">
          Interface reservee aux roles Admin et Chef de Service.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block font-medium">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className="select-enterprise"
            >
              <option value={ROLES.admin}>Admin</option>
              <option value={ROLES.chef}>Chef de Service</option>
            </select>
          </label>

          <label className="block text-sm text-slate-700">
            <span className="mb-1 block font-medium">Email professionnel</span>
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className={`input-enterprise ${error && !form.email.trim() ? 'input-error' : ''}`}
              placeholder="admin1@gmail.com"
              autoComplete="username"
            />
          </label>

          <label className="block text-sm text-slate-700">
            <span className="mb-1 block font-medium">Mot de passe</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className={`input-enterprise ${error && !form.password.trim() ? 'input-error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <p className="hint">
            Conseil: utilisez Tab/Shift+Tab pour naviguer rapidement entre les champs.
          </p>

          <button type="submit" disabled={submitting} className="btn-primary interactive w-full px-4 py-2 text-sm">
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="surface-soft mt-4 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Compte Admin par defaut</p>
        <p>Email: admin1@gmail.com</p>
        <p>Mot de passe: admin@123</p>
      </div>
    </section>
  )
}
