import { Outlet, Link } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-[#0F172A]">
          Business Plan Bénin
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-emerald-600">Dashboard</Link>
          <Link to="/projects" className="hover:text-emerald-600">Projets</Link>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
