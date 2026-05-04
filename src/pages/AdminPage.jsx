import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { computeCampaignAnalytics, formatDateTime } from '../lib/analytics'
import {
  createCampaign,
  createChefAccount,
  listCampaigns,
  listChefAccounts,
  listResponses,
} from '../lib/db'
import { staticQuestionnaire } from '../lib/questionnaire'

function AxisScore({ title, score }) {
  const percentage = Math.round((score / 5) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{title}</span>
        <span className="font-medium">{score.toFixed(2)} / 5</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function AdminChefCreationForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    department: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.name.trim() || !form.department.trim() || !form.email.trim() || !form.password) {
      setError('Tous les champs sont obligatoires.')
      return
    }

    setSaving(true)
    try {
      await createChefAccount(form)
      setForm({
        name: '',
        department: '',
        email: '',
        password: '',
      })
      await onCreated()
    } catch (creationError) {
      setError(creationError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6" noValidate>
      <h3 className="text-base font-semibold text-slate-900">Creer un compte Chef de Service</h3>
      <p className="mt-1 text-sm text-slate-600">
        Les comptes crees ici auront un acces direct au dashboard Chef.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className={`input-enterprise ${error && !form.name.trim() ? 'input-error' : ''}`}
          placeholder="Nom complet"
          aria-label="Nom complet"
        />
        <input
          value={form.department}
          onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
          className={`input-enterprise ${error && !form.department.trim() ? 'input-error' : ''}`}
          placeholder="Departement"
          aria-label="Departement"
        />
        <input
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className={`input-enterprise ${error && !form.email.trim() ? 'input-error' : ''}`}
          placeholder="email@entreprise.com"
          aria-label="Email chef de service"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className={`input-enterprise ${error && !form.password.trim() ? 'input-error' : ''}`}
          placeholder="Mot de passe"
          aria-label="Mot de passe chef de service"
        />
      </div>

      <p className="hint mt-2">
        Astuce: utilisez un mot de passe temporaire puis communiquez-le de maniere securisee.
      </p>

      <button type="submit" disabled={saving} className="btn-primary interactive mt-4 px-4 py-2 text-sm">
        {saving ? 'Creation...' : 'Creer le compte'}
      </button>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function AdminCampaignForm({ chefs, adminUser, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    isAssignedToAll: true,
    assignedChefIds: [],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleChef(chefId) {
    setForm((prev) => {
      const alreadyIncluded = prev.assignedChefIds.includes(chefId)
      return {
        ...prev,
        assignedChefIds: alreadyIncluded
          ? prev.assignedChefIds.filter((id) => id !== chefId)
          : [...prev.assignedChefIds, chefId],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Le titre de campagne est obligatoire.')
      return
    }
    if (!form.isAssignedToAll && form.assignedChefIds.length === 0) {
      setError('Selectionnez au moins un Chef de Service.')
      return
    }

    setSaving(true)
    try {
      await createCampaign({
        ...form,
        createdBy: adminUser.id,
      })
      setForm({
        title: '',
        description: '',
        isAssignedToAll: true,
        assignedChefIds: [],
      })
      await onCreated()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6" noValidate>
      <h3 className="text-base font-semibold text-slate-900">Lancer une campagne</h3>
      <p className="mt-1 text-sm text-slate-600">
        Questionnaire fixe ({staticQuestionnaire.axes.length} axes) avec assignation flexible.
      </p>

      <div className="mt-4 space-y-3">
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          className={`input-enterprise ${error && !form.title.trim() ? 'input-error' : ''}`}
          placeholder="Campagne Climat Social - S1"
          aria-label="Titre de campagne"
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="textarea-enterprise"
          placeholder="Objectif, perimetre, date de cloture..."
          aria-label="Description de campagne"
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isAssignedToAll}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              isAssignedToAll: event.target.checked,
              assignedChefIds: event.target.checked ? [] : prev.assignedChefIds,
            }))
          }
        />
        Assigner a tous les Chef de Service
      </label>

      {!form.isAssignedToAll && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {chefs.map((chef) => (
            <label key={chef.id} className="surface-soft flex items-center gap-2 p-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.assignedChefIds.includes(chef.id)}
                onChange={() => toggleChef(chef.id)}
              />
              <span>
                {chef.name} ({chef.department})
              </span>
            </label>
          ))}
        </div>
      )}

      <p className="hint mt-2">
        Le QR est genere par le Chef de Service pour ses employes.
      </p>

      <button type="submit" disabled={saving} className="btn-primary interactive mt-4 px-4 py-2 text-sm">
        {saving ? 'Publication...' : 'Publier la campagne'}
      </button>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function ChefAccountsTable({ chefs }) {
  if (chefs.length === 0) {
    return (
      <div className="surface-soft p-4 text-sm text-slate-600">
        Aucun compte Chef de Service cree.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Nom</th>
            <th className="px-3 py-2 text-left font-semibold">Departement</th>
            <th className="px-3 py-2 text-left font-semibold">Email</th>
            <th className="px-3 py-2 text-left font-semibold">Creation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {chefs.map((chef) => (
            <tr key={chef.id}>
              <td className="px-3 py-2 text-slate-800">{chef.name}</td>
              <td className="px-3 py-2 text-slate-600">{chef.department}</td>
              <td className="px-3 py-2 text-slate-600">{chef.email}</td>
              <td className="px-3 py-2 text-slate-500">{formatDateTime(chef.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CampaignReports({ campaigns, responses }) {
  if (campaigns.length === 0) {
    return (
      <div className="surface-soft p-6 text-sm text-slate-600">
        Aucune campagne pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const analytics = computeCampaignAnalytics(campaign.id, responses)
        return (
          <article key={campaign.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{campaign.title}</h3>
                <p className="text-xs text-slate-500">
                  Cree le {formatDateTime(campaign.createdAt)} • {analytics.totalResponses} reponse(s)
                </p>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {campaign.isAssignedToAll ? 'Tous les services' : 'Services selectionnes'}
              </span>
            </div>
            {campaign.description && <p className="mt-2 text-sm text-slate-600">{campaign.description}</p>}
            <div className="mt-4 space-y-3">
              {analytics.byAxis.map((axis) => (
                <AxisScore key={axis.axeId} title={axis.title} score={axis.average} />
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function AdminPage({ user }) {
  const [chefs, setChefs] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [responses, setResponses] = useState([])
  const [activeTab, setActiveTab] = useState('operations')
  const [loading, setLoading] = useState(true)

  async function refreshAll() {
    const [loadedChefs, loadedCampaigns, loadedResponses] = await Promise.all([
      listChefAccounts(),
      listCampaigns(),
      listResponses(),
    ])
    setChefs(loadedChefs)
    setCampaigns(loadedCampaigns)
    setResponses(loadedResponses)
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    Promise.all([listChefAccounts(), listCampaigns(), listResponses()]).then(
      ([loadedChefs, loadedCampaigns, loadedResponses]) => {
        if (!active) {
          return
        }
        setChefs(loadedChefs)
        setCampaigns(loadedCampaigns)
        setResponses(loadedResponses)
        setLoading(false)
      },
    )

    return () => {
      active = false
    }
  }, [])

  const totalAssignments = useMemo(
    () =>
      campaigns.reduce((sum, campaign) => {
        if (campaign.isAssignedToAll) {
          return sum + chefs.length
        }
        return sum + campaign.assignedChefIds.length
      }, 0),
    [campaigns, chefs.length],
  )

  if (loading) {
    return <p className="text-sm text-slate-600">Chargement du dashboard admin...</p>
  }

  return (
    <section className="space-y-6">
      <header className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Admin Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Pilotage central</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bienvenue {user.name}. Gerez les comptes, les campagnes et les analyses globales.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Comptes Chef" value={chefs.length} />
        <StatCard label="Campagnes publiees" value={campaigns.length} />
        <StatCard label="Reponses employees" value={responses.length} />
        <StatCard label="Affectations cumulees" value={totalAssignments} accent />
      </div>

      <nav aria-label="Sections admin" className="surface-soft flex flex-wrap gap-2 p-2">
        <button
          type="button"
          onClick={() => setActiveTab('operations')}
          className={`role-tab ${activeTab === 'operations' ? 'role-tab-active' : ''}`}
        >
          Operations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`role-tab ${activeTab === 'accounts' ? 'role-tab-active' : ''}`}
        >
          Comptes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`role-tab ${activeTab === 'reports' ? 'role-tab-active' : ''}`}
        >
          Rapports
        </button>
      </nav>

      {activeTab === 'operations' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminChefCreationForm onCreated={refreshAll} />
          <AdminCampaignForm chefs={chefs} adminUser={user} onCreated={refreshAll} />
        </div>
      )}

      {activeTab === 'accounts' && (
        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Annuaire Chef de Service</h2>
          <p className="mt-1 text-sm text-slate-600">
            Liste des comptes actifs avec informations de rattachement.
          </p>
          <div className="mt-4">
            <ChefAccountsTable chefs={chefs} />
          </div>
        </section>
      )}

      {activeTab === 'reports' && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Analyses par campagne</h2>
          <CampaignReports campaigns={campaigns} responses={responses} />
        </section>
      )}
    </section>
  )
}
