import { useEffect, useState } from 'react';
import { SECTORS } from '../../lib/mockup-data';
import { useProjectStore, type ProjectListItem } from '../../store/projectStore';

interface Props {
  onOpenProject?: () => void;
}

export function ProjetsView({ onOpenProject }: Props) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listProjects = useProjectStore((s) => s.listProjects);
  const loadProjectById = useProjectStore((s) => s.loadProjectById);
  const deleteProjectById = useProjectStore((s) => s.deleteProjectById);
  const reset = useProjectStore((s) => s.reset);
  const currentProjectId = useProjectStore((s) => s.currentProjectId);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await listProjects());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleOpen = async (id: string) => {
    try {
      await loadProjectById(id);
      if (onOpenProject) onOpenProject();
    } catch (e) {
      alert('Erreur ouverture : ' + (e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement ce projet ?')) return;
    try {
      await deleteProjectById(id);
      await load();
    } catch (e) {
      alert('Erreur suppression : ' + (e as Error).message);
    }
  };

  const handleNew = () => {
    if (!confirm('Créer un nouveau projet vierge ? Le projet actuel restera sauvegardé dans la liste.')) return;
    reset();
    if (onOpenProject) onOpenProject();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">📁 Mes projets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading ? 'Chargement…' : `${projects.length} projet${projects.length > 1 ? 's' : ''} sauvegardé${projects.length > 1 ? 's' : ''}`}
            {import.meta.env.DEV && ' (localStorage en dev)'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNew}
            className="px-2.5 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:bg-emerald-600"
          >
            ➕ Nouveau projet
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          ⚠️ {error}
        </div>
      )}

      {loading && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          ⏳ Chargement des projets…
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-slate-500">Aucun projet sauvegardé.</p>
          <p className="text-xs text-slate-400 mt-1">
            Va sur "Assistant Business Plan" puis clique sur 💾 Sauvegarder.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Nom</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-36">Secteur</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-28">Créé</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-28">Modifié</th>
                <th className="w-44"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const sector = SECTORS.find((s) => s.code === p.sector);
                const isCurrent = p.id === currentProjectId;
                return (
                  <tr key={p.id} className={`border-t border-slate-100 hover:bg-slate-50 ${isCurrent ? 'bg-emerald-50/50' : ''}`}>
                    <td className="px-3 py-2 text-slate-800 font-medium">
                      {p.name}
                      {isCurrent && <span className="ml-2 text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">actif</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-xs">
                      {sector ? <>{sector.icon} {sector.name}</> : (p.sector || '—')}
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs">
                      {new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs">
                      {p.updated_at ? new Date(p.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleOpen(p.id)}
                        className="text-xs px-2 py-1 rounded-md bg-[#0F172A] text-white font-medium hover:bg-black mr-1"
                      >
                        Ouvrir
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 font-medium hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
