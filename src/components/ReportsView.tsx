import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Users,
  PieChart,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { t, projects, tasks, timeEntries, users } = useApp();

  const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);
  const billableHours = timeEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
  const nonBillableHours = totalHours - billableHours;
  const billableRatio = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 100;
  const totalRevenue = timeEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours * e.hourlyRate, 0);

  // User breakdown
  const memberStats = users.map((u) => {
    const userEntries = timeEntries.filter((e) => e.userId === u.id);
    const uTotal = userEntries.reduce((s, e) => s + e.hours, 0);
    const uBillable = userEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const uYield = userEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours * e.hourlyRate, 0);
    return {
      user: u,
      totalHours: uTotal,
      billableHours: uBillable,
      yield: uYield,
      ratio: uTotal > 0 ? Math.round((uBillable / uTotal) * 100) : 0,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDataset = () => {
    const headers = ['Entry ID', 'Date', 'Project', 'Debtor Code', 'Task', 'Member', 'Hours', 'Rate', 'Total EUR', 'Billable', 'Boekhoudgemak Invoiced'];
    const rows = timeEntries.map((e) => {
      const p = projects.find((proj) => proj.id === e.projectId);
      return [
        e.id,
        e.date,
        `"${e.projectName}"`,
        p?.debtorCode || 'N/A',
        `"${e.taskTitle.replace(/"/g, '""')}"`,
        `"${e.userName}"`,
        e.hours,
        e.hourlyRate,
        (e.hours * e.hourlyRate).toFixed(2),
        e.billable ? 'YES' : 'NO',
        e.syncedToBoekhoudgemak ? e.boekhoudgemakInvoiceId : 'PENDING',
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kopilot-financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.reports.title}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {t.reports.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.reports.exportReport}</span>
          </button>

          <button
            onClick={handleDownloadDataset}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.reports.downloadRawData}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Gross Tracked Time</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-400">Recorded</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span>{billableHours.toFixed(1)}h Billable</span>
            <span aria-hidden="true">·</span>
            <span>{nonBillableHours.toFixed(1)}h Internal</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Billable Efficiency Ratio</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {billableRatio}%
            </span>
            <span className="text-xs text-slate-400">Target &gt; 80%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${billableRatio}%` }} />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Recognized Yield (EUR)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              €{totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Boekhoudgemak integration active
          </div>
        </div>
      </div>

      {/* Team Member Utilization Table */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t.reports.teamUtilization}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-right">Total Hours</th>
                <th className="py-2.5 px-3 text-right">Billable Hours</th>
                <th className="py-2.5 px-3 text-right">Billable %</th>
                <th className="py-2.5 px-3 text-right">Financial Yield (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {memberStats.map((item) => (
                <tr key={item.user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img src={item.user.avatar} alt={item.user.name} className="w-6 h-6 rounded-full object-cover" />
                      <span>{item.user.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.user.role}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {item.totalHours.toFixed(1)}h
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {item.billableHours.toFixed(1)}h
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.ratio}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                    €{item.yield.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Allocation Breakdown */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t.reports.hoursByProject}
        </h2>

        <div className="space-y-3">
          {projects.map((p) => {
            const pHours = timeEntries.filter((e) => e.projectId === p.id).reduce((s, e) => s + e.hours, 0);
            const pYield = timeEntries.filter((e) => e.projectId === p.id && e.billable).reduce((s, e) => s + e.hours * e.hourlyRate, 0);
            const pctOfTotal = totalHours > 0 ? Math.round((pHours / totalHours) * 100) : 0;

            return (
              <div key={p.id} className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                    <span className="text-slate-400">({p.clientName})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {pHours.toFixed(1)}h ({pctOfTotal}%)
                    </span>
                    <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                      €{pYield.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pctOfTotal}%`, backgroundColor: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
