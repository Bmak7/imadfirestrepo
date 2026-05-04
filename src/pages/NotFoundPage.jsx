import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Page introuvable</h1>
      <p className="mt-2 text-slate-600">La route demandee n'existe pas.</p>
      <Link to="/" className="mt-4 inline-flex text-blue-700 hover:underline">
        Retour a l'accueil
      </Link>
    </section>
  )
}
