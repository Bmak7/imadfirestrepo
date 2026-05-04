import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { StatCard } from '../components/StatCard'
import { computeCampaignAnalytics, formatDateTime } from '../lib/analytics'
import { listCampaigns, listResponses } from '../lib/db'

function AxisBlock({ axis }) {
  const percentage = Math.round((axis.average / 5) * 100)
  return (
    <div className="surface-soft p-4">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-slate-800">{axis.title}</p>
        <span className="font-medium text-slate-700">{axis.average.toFixed(2)} / 5</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ResponseTable({ responses }) {
  if (responses.length === 0) {
    return (
      <div className="surface-soft p-4 text-sm text-slate-600">
        Aucune reponse employee pour cette campagne.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Employe</th>
            <th className="px-3 py-2 text-left font-semibold">Chantier</th>
            <th className="px-3 py-2 text-left font-semibold">Poste</th>
            <th className="px-3 py-2 text-left font-semibold">Anciennete</th>
            <th className="px-3 py-2 text-left font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {responses.map((response) => (
            <tr key={response.id}>
              <td className="px-3 py-2 text-slate-800">{response.employeeName}</td>
              <td className="px-3 py-2 text-slate-600">{response.generalData.chantier}</td>
              <td className="px-3 py-2 text-slate-600">{response.generalData.poste}</td>
              <td className="px-3 py-2 text-slate-600">{response.generalData.seniority}</td>
              <td className="px-3 py-2 text-slate-500">{formatDateTime(response.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QrAccessPanel({ campaign, user, shareBaseUrl }) {
  const normalizedBaseUrl = shareBaseUrl.trim().replace(/\/$/, '')
  const employeeLink = `${normalizedBaseUrl}/employee/${campaign.id}?chefId=${user.id}`

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-900">QR employes</p>
          <p className="mt-1 text-xs text-blue-700">
            Partagez ce QR pour que vos employes repondent depuis le reseau.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(employeeLink)}
          className="btn-secondary interactive px-3 py-1.5 text-xs"
        >
          Copier le lien
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <QRCodeSVG value={employeeLink} size={96} />
        </div>
        <p className="max-w-xl break-all text-xs text-blue-900">{employeeLink}</p>
      </div>
    </div>
  )
}

export function ChefDashboardPage({ user }) {
  const [campaigns, setCampaigns] = useState([])
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareBaseUrl, setShareBaseUrl] = useState(window.location.origin)

  useEffect(() => {
    let active = true
    Promise.all([listCampaigns(), listResponses()]).then(([loadedCampaigns, loadedResponses]) => {
      if (!active) {
        return
      }
      setCampaigns(loadedCampaigns)
      setResponses(loadedResponses)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const assignedCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) => campaign.isAssignedToAll || campaign.assignedChefIds.includes(user.id),
      ),
    [campaigns, user.id],
  )

  const myResponses = useMemo(
    () => responses.filter((response) => response.chefId === user.id),
    [responses, user.id],
  )

  if (loading) {
    return <p className="text-sm text-slate-600">Chargement du dashboard Chef de Service...</p>
  }

  return (
    <section className="space-y-6">
      <header className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Chef Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Dashboard Chef de Service</h1>
        <p className="mt-2 text-sm text-slate-600">
          Service: <span className="font-semibold">{user.department}</span>. Generez vos QR et suivez
          les retours terrain.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Campagnes assignees" value={assignedCampaigns.length} />
        <StatCard label="Reponses employees" value={myResponses.length} />
        <StatCard label="Taux moyen (indicatif)" value={`${assignedCampaigns.length ? Math.round((myResponses.length / assignedCampaigns.length) * 10) / 10 : 0}`} hint="Reponses / campagne" accent />
      </div>

      <section className="surface-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          URL reseau pour les QR codes
        </h2>
        <input
          value={shareBaseUrl}
          onChange={(event) => setShareBaseUrl(event.target.value)}
          className="input-enterprise mt-2"
          placeholder="http://192.168.1.10:5173"
          aria-label="Adresse reseau du serveur"
        />
        <p className="hint mt-2">
          Pour partager sur le reseau local: lancez <span className="font-semibold">npm run dev:network</span> puis utilisez votre IP locale.
        </p>
      </section>

      {assignedCampaigns.length === 0 && (
        <div className="surface-soft p-6 text-sm text-slate-600">
          Aucune campagne assignee pour le moment.
        </div>
      )}

      {assignedCampaigns.map((campaign) => {
        const campaignResponses = myResponses.filter(
          (response) => response.campaignId === campaign.id,
        )
        const analytics = computeCampaignAnalytics(campaign.id, campaignResponses)

        return (
          <article key={campaign.id} className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{campaign.title}</h2>
              <span className="text-xs text-slate-500">
                {analytics.totalResponses} reponse(s) • Cree le {formatDateTime(campaign.createdAt)}
              </span>
            </div>
            {campaign.description && (
              <p className="mt-2 text-sm text-slate-600">{campaign.description}</p>
            )}

            <div className="mt-4">
              <QrAccessPanel campaign={campaign} user={user} shareBaseUrl={shareBaseUrl} />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {analytics.byAxis.map((axis) => (
                <AxisBlock key={axis.axeId} axis={axis} />
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Reponses recues
              </h3>
              <ResponseTable responses={campaignResponses} />
            </div>
          </article>
        )
      })}
    </section>
  )
}
