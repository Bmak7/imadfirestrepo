import { Link } from 'react-router-dom'

const valueCards = [
  {
    title: 'Pilotage RH',
    text: 'Vision claire des tendances par service avec indicateurs exploitables.',
  },
  {
    title: 'Processus securise',
    text: 'Authentification role-based pour admin et chefs de service.',
  },
  {
    title: 'Experience fluide',
    text: 'Questionnaire mobile-first, QR partageable et interfaces accessibles.',
  },
]

export function HomePage({ user }) {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <article className="surface-card relative overflow-hidden p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute -bottom-24 right-10 h-52 w-52 rounded-full bg-orange-300/20 blur-3xl" />

          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Enterprise Analytics Hub
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-slate-900">
            Diagnostic du climat social, clair et actionnable.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-600">
            Une plateforme professionnelle pour lancer vos campagnes, collecter les reponses
            terrain et transformer les resultats en decisions managériales.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/chef') : '/login'} className="btn-primary interactive px-4 py-2 text-sm">
              {user ? 'Ouvrir le dashboard' : 'Se connecter'}
            </Link>
            <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600">
              Local-first • IndexedDB • React
            </span>
          </div>
        </article>

        <aside className="surface-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Acces & role</h2>
          {!user ? (
            <p className="mt-2 text-sm text-slate-600">
              Connectez-vous pour acceder aux espaces Admin ou Chef de Service.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              Session active: <span className="font-semibold text-slate-900">{user.name}</span>{' '}
              ({user.role})
            </p>
          )}

          <div className="mt-5 space-y-3">
            <div className="surface-soft p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
              <p className="mt-1 text-sm text-slate-700">
                Gere les comptes, les campagnes et le reporting global.
              </p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chef de Service</p>
              <p className="mt-1 text-sm text-slate-700">
                Genere ses QR codes et suit les resultats de son perimetre.
              </p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employe</p>
              <p className="mt-1 text-sm text-slate-700">
                Repond au questionnaire depuis mobile ou desktop.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {valueCards.map((card) => (
          <article key={card.title} className="surface-card p-5">
            <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
