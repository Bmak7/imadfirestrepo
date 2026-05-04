export function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className={`surface-card p-4 ${accent ? 'metric-accent' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  )
}
