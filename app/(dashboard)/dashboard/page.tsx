export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Total Developers</h3>
          <p className="text-3xl font-bold text-neutral-900">0</p>
        </div>
        <div className="p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-neutral-900">0</p>
        </div>
        <div className="p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Generated Proposals</h3>
          <p className="text-3xl font-bold text-neutral-900">0</p>
        </div>
      </div>
    </div>
  )
}
