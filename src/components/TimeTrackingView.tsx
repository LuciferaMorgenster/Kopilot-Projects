import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Receipt,
  Download,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const TimeTrackingView: React.FC = () => {
  const {
    t,
    projects,
    tasks,
    timeEntries,
    addTimeEntry,
    deleteTimeEntry,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    syncToBoekhoudgemak,
    setActiveTab,
  } = useApp();

  // Stopwatch local inputs if idle
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Manual Entry Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualHours, setManualHours] = useState('2.5');
  const [manualDesc, setManualDesc] = useState('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Filter
  const [filterType, setFilterType] = useState<'all' | 'unbilled' | 'synced' | 'billable'>('all');

  const filteredEntries = timeEntries.filter((e) => {
    if (filterType === 'unbilled') return e.billable && !e.syncedToBoekhoudgemak;
    if (filterType === 'synced') return e.syncedToBoekhoudgemak;
    if (filterType === 'billable') return e.billable;
    return true;
  });

  const unbilledEntries = timeEntries.filter((e) => e.billable && !e.syncedToBoekhoudgemak);
  const unbilledTotalAmount = unbilledEntries.reduce((s, e) => s + e.hours * e.hourlyRate, 0);

  const formatSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartStopwatch = () => {
    if (!selectedProjectId) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    const project = projects.find((p) => p.id === selectedProjectId);
    startTimer(
      selectedTaskId,
      selectedProjectId,
      description || (task ? task.title : 'Project task session'),
      isBillable
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find((p) => p.id === selectedProjectId);
    const task = tasks.find((t) => t.id === selectedTaskId);
    const parsedHours = parseFloat(manualHours);
    if (!project || isNaN(parsedHours) || parsedHours <= 0) return;

    addTimeEntry({
      taskId: selectedTaskId || (task ? task.id : 'tsk_general'),
      taskTitle: task ? task.title : 'General Project Work',
      projectId: project.id,
      projectName: project.name,
      userId: 'usr_2',
      userName: 'Lucas van Dijk',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      description: manualDesc || 'Development and consulting session',
      date: manualDate,
      hours: parsedHours,
      billable: isBillable,
      hourlyRate: project.hourlyRate,
    });

    setShowManualModal(false);
    setManualDesc('');
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncToBoekhoudgemak();
      if (res.success) {
        setSyncResult(`Successfully pushed ${res.count} time entries to Boekhoudgemak (Invoice ${res.invoiceNumber}, €${res.totalAmount.toFixed(2)})!`);
        setTimeout(() => setSyncResult(null), 6000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId);

  // 7-day weekly matrix calculation
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekHours = [6.5, 7.0, 8.5, 7.5, 4.5, 0.0, 0.0];
  const totalWeeklyHours = weekHours.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.time.title}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {t.time.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.time.manualLogButton}</span>
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing || unbilledEntries.length === 0}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              unbilledEntries.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>
              {isSyncing ? 'Syncing...' : `${t.time.syncToBoekhoudgemak} (€${unbilledTotalAmount.toFixed(0)})`}
            </span>
          </button>
        </div>
      </div>

      {/* Sync Success Banner */}
      {syncResult && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncResult}</span>
          </div>
          <button
            onClick={() => setActiveTab('integrations')}
            className="text-emerald-700 dark:text-emerald-300 font-semibold underline"
          >
            Audit Log
          </button>
        </div>
      )}

      {/* Top Section: Live Stopwatch Console & Weekly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Precision Stopwatch Console */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              {t.time.stopwatchTitle}
            </span>

            {activeTimer.isRunning && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 animate-pulse">
                Recording Live
              </span>
            )}
          </div>

          {/* Stopwatch Digital Display */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <div className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-slate-900 dark:text-white tabular-nums">
                {formatSeconds(activeTimer.secondsElapsed)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {activeTimer.isRunning ? (
                  <span>
                    Working on: <strong className="text-slate-800 dark:text-slate-200">{activeTimer.taskTitle}</strong> ({activeTimer.projectName})
                  </span>
                ) : (
                  <span>Ready to track billable sessions</span>
                )}
              </div>
            </div>

            {/* Stopwatch Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {activeTimer.isRunning ? (
                <>
                  {activeTimer.isPaused ? (
                    <button
                      onClick={resumeTimer}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.time.resumeSession}</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{t.time.pauseSession}</span>
                    </button>
                  )}

                  <button
                    onClick={stopTimer}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{t.time.stopSession}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartStopwatch}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.time.startSession}</span>
                </button>
              )}
            </div>
          </div>

          {/* Configuration Inputs for Active / New Session */}
          {!activeTimer.isRunning && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t.time.projectSelect}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setSelectedTaskId('');
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (€{p.hourlyRate}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t.time.taskSelect}
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">-- General Project Task --</option>
                  {projectTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-1">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.time.descriptionPlaceholder}
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isBillable}
                    onChange={(e) => setIsBillable(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t.time.billableToggle}</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Weekly Timesheet Overview */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.time.weeklySummary}
              </span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalWeeklyHours.toFixed(1)}h
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Week (89% Billable)
            </p>

            {/* 7-Day Bar Grid */}
            <div className="grid grid-cols-7 gap-1.5 mt-4 text-center">
              {weekDays.map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-16 flex items-end justify-center p-0.5">
                    <div
                      className="w-full bg-indigo-600 rounded-t transition-all"
                      style={{ height: `${(weekHours[idx] / 8.5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{day}</span>
                  <span className="text-[10px] font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    {weekHours[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500">Unbilled Value:</span>
            <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
              €{unbilledTotalAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Detailed Time Entries Table */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Table Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Entries ({timeEntries.length})
            </button>
            <button
              onClick={() => setFilterType('unbilled')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'unbilled'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Unbilled ({unbilledEntries.length})
            </button>
            <button
              onClick={() => setFilterType('synced')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'synced'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Synced ({timeEntries.filter((e) => e.syncedToBoekhoudgemak).length})
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Total Displayed: <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{filteredEntries.reduce((s, e) => s + e.hours, 0).toFixed(1)}h</strong>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Task & Project</th>
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Hours</th>
                <th className="py-2.5 px-3 text-right">Rate (€)</th>
                <th className="py-2.5 px-3 text-right">Total (€)</th>
                <th className="py-2.5 px-3 text-center">Boekhoudgemak Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No time entries recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const total = entry.hours * entry.hourlyRate;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {entry.date}
                      </td>

                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 max-w-xs">
                        <div className="truncate">{entry.taskTitle}</div>
                        <div className="text-[11px] text-slate-400 truncate">{entry.projectName}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={entry.userAvatar}
                            alt={entry.userName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-slate-700 dark:text-slate-300">{entry.userName}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {entry.description}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {entry.hours.toFixed(1)}h
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        €{entry.hourlyRate}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        €{total.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {entry.syncedToBoekhoudgemak ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {entry.boekhoudgemakInvoiceId || 'Synced'}
                          </span>
                        ) : entry.billable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Ready to Sync
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Internal (Non-billable)</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Time Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-md animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              {t.time.manualLogButton}
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  <option value="">General Project Time</option>
                  {projectTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Summary of work completed..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="manualBillable"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="manualBillable" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                  {t.time.billableToggle}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
