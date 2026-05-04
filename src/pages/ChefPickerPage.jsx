import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listChefs, listQcms } from '../lib/db'

export function ChefPickerPage() {
  const [chefs, setChefs] = useState([])
  const [qcms, setQcms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [loadedChefs, loadedQcms] = await Promise.all([listChefs(), listQcms()])
      setChefs(loadedChefs)
      setQcms(loadedQcms)
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <p className="text-slate-600">Chargement des services...</p>
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold text-slate-900">Chef de Service</h1>
      <p className="mt-2 text-slate-600">Choisissez un service pour acceder a son tableau de bord.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chefs.map((chef) => {
          const assignedCount = qcms.filter(
            (qcm) => qcm.isAssignedToAll || qcm.assignedChefIds.includes(chef.id),
          ).length

          return (
            <article
              key={chef.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-blue-700">{chef.department}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{chef.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{assignedCount} QCM assigne(s)</p>
              <Link
                to={`/chef/${chef.id}`}
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Ouvrir le tableau de bord
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
