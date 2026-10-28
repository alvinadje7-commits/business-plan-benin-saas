import { useEffect, useState } from 'react';
import { SECTORS } from '../../lib/mockup-data';

interface SavedProject {
  name: string;
  sector: string;
  created_at: string;
}

interface Props {
  onOpenProject?: (name: string, sector: string) => void;
}

export function ProjetsView({ onOpenProject }: Props) {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem('bpb-projects') || '[]');
      setProjects(Array.isArray(raw) ? raw : []);
    } catch {
      setProjects([]);
    }
  };

  useEffect(load, []);

  const handleDelete = (idx: number) => {
    if (!confirm('Supprimer ce projet ?')) return;
    const next = projects.filter((_, i) => i !== idx);
    localStorage.setItem('bpb-projects', JSON.stringify(next));
    setProjects(next);
  };

  const handleOpen = (p: SavedProject) => {
    if (onOpenProject) onOpenProject(p.name, p.sector);
    else alert(`Ouvrir "${p.name}" (secteur : ${p.sector})`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">📁 Mes projets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {projects.length} projet{projects.length > 1 ? 's' : ''} sauvegardé{projects.length > 1 ? 's' : ''}
            {import.meta.env.DEV && ' (localStorage — Neon en production)'}
          </p>
        </div>
        <button
          onClick={load}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white hover:bg-slate-50"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-slate-500">Aucun projet sauvegardé.</p>
          <p className="text-xs text-slate-400 mt-1">
            Va sur "Assistant Business Plan" puis clique sur 💾 Sauvegarder.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Nom</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-36">Secteur</th>
                <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-32">Créé le</th>
                <th className="w-40"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => {
                const sector = SECTORS.find((s) => s.code === p.sector);
                return (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-800 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {sector ? <>{sector.icon} {sector.name}</> : p.sector}
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs">
                      {new Date(p.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleOpen(p)}
                        className="text-xs px-2 py-1 rounded-md bg-[#0F172A] text-white font-medium hover:bg-black mr-1"
                      >
                        Ouvrir
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
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
