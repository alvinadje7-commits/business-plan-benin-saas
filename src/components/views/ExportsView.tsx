import { useState, useMemo } from 'react';
import { computeFinancialResult, fmtFCFA } from '../../lib/financial-statements-engine';
import { useProjectStore } from '../../store/projectStore';

export function ExportsView() {
  const [busy, setBusy] = useState<string | null>(null);
  const hypotheses = useProjectStore((s) => s.hypotheses);
  const investments = useProjectStore((s) => s.investments);
  const financement = useProjectStore((s) => s.financement);

  const result = useMemo(
    () => computeFinancialResult(hypotheses, investments, financement),
    [hypotheses, investments, financement],
  );

  const exportCSV = () => {
    setBusy('csv');
    try {
      const lines: string[] = [];
      lines.push('Business Plan Bénin - Compte de résultat prévisionnel');
      lines.push('Poste;Année 1;Année 2;Année 3');
      const rows: [string, keyof typeof result.cr[0]][] = [
        ["Chiffre d'affaires", 'ca'],
        ['Achats consommés', 'achats'],
        ['Marge commerciale', 'marge'],
        ['Charges externes', 'chargesExt'],
        ['Valeur ajoutée', 'va'],
        ['Charges de personnel', 'personnel'],
        ['EBE', 'ebe'],
        ['Dotations amortissements', 'dotations'],
        ["Résultat d'exploitation", 're'],
        ['Charges financières', 'chargesFin'],
        ['Résultat avant impôt', 'rai'],
        ['Impôt (30%)', 'is'],
        ['Résultat net', 'rn'],
      ];
      for (const [label, key] of rows) {
        lines.push([label, ...result.cr.map((y) => Math.round(y[key] as number))].join(';'));
      }
      lines.push('');
      lines.push('KPIs bancaires');
      lines.push(`VAN (12%);${Math.round(result.kpis.van)}`);
      lines.push(`TRI (%);${result.kpis.tri.toFixed(2)}`);
      lines.push(`Délai récupération (mois);${result.kpis.delaiRecupMois}`);
      lines.push(`DSCR A1;${result.kpis.dscr.toFixed(2)}`);
      lines.push(`Marge nette (%);${result.kpis.margeNette.toFixed(2)}`);

      const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-plan-benin.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  };

  const exportExcel = async () => {
    setBusy('excel');
    try {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Business Plan Bénin SaaS';

      const ws = wb.addWorksheet('Compte de résultat');
      ws.addRow(["Compte de résultat prévisionnel (SYSCOHADA)"]);
      ws.addRow(['Poste', 'Année 1', 'Année 2', 'Année 3']);
      const rows: [string, keyof typeof result.cr[0]][] = [
        ["Chiffre d'affaires", 'ca'],
        ['Achats consommés', 'achats'],
        ['Marge commerciale', 'marge'],
        ['Charges externes', 'chargesExt'],
        ['Valeur ajoutée', 'va'],
        ['Charges de personnel', 'personnel'],
        ['EBE', 'ebe'],
        ['Dotations amortissements', 'dotations'],
        ["Résultat d'exploitation", 're'],
        ['Charges financières', 'chargesFin'],
        ['Résultat avant impôt', 'rai'],
        ['Impôt (30%)', 'is'],
        ['Résultat net', 'rn'],
      ];
      for (const [label, key] of rows) {
        ws.addRow([label, ...result.cr.map((y) => Math.round(y[key] as number))]);
      }
      ws.getRow(2).font = { bold: true };

      const wsKpi = wb.addWorksheet('KPIs');
      wsKpi.addRow(['KPI', 'Valeur']);
      wsKpi.addRow(['VAN (12%) FCFA', Math.round(result.kpis.van)]);
      wsKpi.addRow(['TRI %', Number(result.kpis.tri.toFixed(2))]);
      wsKpi.addRow(['Délai récupération (mois)', result.kpis.delaiRecupMois]);
      wsKpi.addRow(['DSCR A1', Number(result.kpis.dscr.toFixed(2))]);
      wsKpi.addRow(['Marge nette %', Number(result.kpis.margeNette.toFixed(2))]);
      wsKpi.getRow(1).font = { bold: true };

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-plan-benin.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erreur Excel : ' + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const exportPDF = async () => {
    setBusy('pdf');
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text('Business Plan — Bénin', 14, 18);
      doc.setFontSize(10);
      doc.text('Compte de résultat prévisionnel (SYSCOHADA)', 14, 25);
      doc.text('Devise : FCFA — Fiscalité 30 % IS', 14, 30);

      const body = [
        ["Chiffre d'affaires", ...result.cr.map((y) => fmtFCFA(y.ca))],
        ['Achats consommés', ...result.cr.map((y) => fmtFCFA(y.achats))],
        ['Marge commerciale', ...result.cr.map((y) => fmtFCFA(y.marge))],
        ['Charges externes', ...result.cr.map((y) => fmtFCFA(y.chargesExt))],
        ['Valeur ajoutée', ...result.cr.map((y) => fmtFCFA(y.va))],
        ['Charges de personnel', ...result.cr.map((y) => fmtFCFA(y.personnel))],
        ['EBE', ...result.cr.map((y) => fmtFCFA(y.ebe))],
        ['Dotations amortissements', ...result.cr.map((y) => fmtFCFA(y.dotations))],
        ["Résultat d'exploitation", ...result.cr.map((y) => fmtFCFA(y.re))],
        ['Charges financières', ...result.cr.map((y) => fmtFCFA(y.chargesFin))],
        ['Résultat avant impôt', ...result.cr.map((y) => fmtFCFA(y.rai))],
        ['Impôt (30%)', ...result.cr.map((y) => fmtFCFA(y.is))],
        ['Résultat net', ...result.cr.map((y) => fmtFCFA(y.rn))],
      ];
      autoTable(doc, {
        head: [['Poste', 'Année 1', 'Année 2', 'Année 3']],
        body,
        startY: 36,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42] },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 200;
      doc.setFontSize(12);
      doc.text('Indicateurs de rentabilité', 14, finalY + 10);
      autoTable(doc, {
        head: [['KPI', 'Valeur']],
        body: [
          ['VAN (12%)', fmtFCFA(result.kpis.van) + ' FCFA'],
          ['TRI', result.kpis.tri.toFixed(2) + ' %'],
          ['Délai de récupération', result.kpis.delaiRecupMois + ' mois'],
          ['DSCR A1', result.kpis.dscr.toFixed(2)],
          ['Marge nette', result.kpis.margeNette.toFixed(2) + ' %'],
        ],
        startY: finalY + 15,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] },
      });

      doc.save('business-plan-benin.pdf');
    } catch (e) {
      alert('Erreur PDF : ' + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const cards = [
    { id: 'pdf', icon: '📄', title: 'Export PDF', desc: 'Compte de résultat + KPIs, prêt à imprimer', action: exportPDF, color: 'bg-red-50 border-red-200 text-red-800' },
    { id: 'excel', icon: '📊', title: 'Export Excel', desc: 'Classeur .xlsx avec 2 feuilles', action: exportExcel, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { id: 'csv', icon: '📋', title: 'Export CSV', desc: 'Format universel', action: exportCSV, color: 'bg-blue-50 border-blue-200 text-blue-800' },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">📤 Exports</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Données du scénario <b>Normal</b> (celui édité dans la Carte 3)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.id} className={`rounded-xl border-2 ${c.color} p-4`}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <h3 className="font-semibold text-sm">{c.title}</h3>
            <p className="text-xs mt-1 opacity-80">{c.desc}</p>
            <button onClick={c.action} disabled={busy !== null}
              className="mt-3 w-full py-1.5 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 disabled:opacity-50">
              {busy === c.id ? '⏳ Génération...' : 'Télécharger'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
