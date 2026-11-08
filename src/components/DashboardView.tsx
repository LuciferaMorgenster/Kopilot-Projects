import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Slack,
  FolderOpen,
  Plus,
  Play,
  Layers,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewTaskModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewTaskModal }) => {
  const {
    t,
    projects,
    tasks,
    timeEntries,
    selectedProjectId,
    setSelectedProjectId,
    setActiveTab,
    startTimer,
    syncToBoekhoudgemak,
    boekhoudgemakConfig,
    slackConfig,
    googleDriveConfig,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filter calculations based on selected project
  const filteredProjects = selectedProjectId === 'all'
    ? projects
    : projects.filter((p) => p.id === selectedProjectId);

  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter((t) => t.projectId === selectedProjectId);

  const filteredTimeEntries = selectedProjectId === 'all'
    ? timeEntries
    : timeEntries.filter((te) => te.projectId === selectedProjectId);

  const activeProjectsCount = filteredProjects.filter((p) => p.status === 'active').length;
  const openTasksCount = filteredTasks.filter((t) => t.status !== 'done').length;
  const completedTasksCount = filteredTasks.filter((t) => t.status === 'done').length;

  const totalBillableHours = filteredTimeEntries
    .filter((te) => te.billable)
    .reduce((sum, te) => sum + te.hours, 0);

  const totalAllHours = filteredTimeEntries.reduce((sum, te) => sum + te.hours, 0);
  const billableRatio = totalAllHours > 0 ? Math.round((totalBillableHours / totalAllHours) * 100) : 100;

  // Unbilled billables ready for Boekhoudgemak
  const unbilledEntries = filteredTimeEntries.filter((te) => te.billable && !te.syncedToBoekhoudgemak);
  const unbilledAmount = unbilledEntries.reduce((sum, te) => sum + te.hours * te.hourlyRate, 0);

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncToBoekhoudgemak();
      if (res.success) {
        setSyncFeedback(`Draft invoice ${res.invoiceNumber} created in Boekhoudgemak (€${res.totalAmount.toFixed(2)})!`);
        setTimeout(() => setSyncFeedback(null), 5000);
      } else {
        setSyncFeedback('No unbilled billable hours found.');
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.dashboard.welcome}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.topbar.quickNewTask}</span>
          </button>

          <button
            onClick={handleQuickSync}
            disabled={isSyncing || unbilledEntries.length === 0}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              unbilledEntries.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{isSyncing ? 'Syncing...' : t.dashboard.syncNow}</span>
          </button>
        </div>
      </div>

      {/* Sync confirmation alert banner */}
      {syncFeedback && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{syncFeedback}</span>
          </div>
          <button
            onClick={() => setActiveTab('integrations')}
            className="text-emerald-700 dark:text-emerald-300 font-semibold underline hover:no-underline"
          >
            View Audit Log
          </button>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Projects */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.dashboard.activeProjects}</span>
            <FolderKanban className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {activeProjectsCount}
            </span>
            <span className="text-xs text-slate-400">
              / {projects.length} Total
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{projects.reduce((s, p) => s + p.budgetHours, 0)}h Total Budgeted</span>
          </div>
        </div>

        {/* KPI 2: Open Tasks */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.dashboard.openTasks}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {openTasksCount}
            </span>
            <span className="text-xs text-slate-400">
              · {completedTasksCount} Done
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{filteredTasks.filter((t) => t.priority === 'urgent').length} Urgent</span>
            <span aria-hidden="true">·</span>
            <span>{filteredTasks.filter((t) => t.status === 'in_progress').length} In Progress</span>
          </div>
        </div>

        {/* KPI 3: Billable Hours */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.dashboard.billableHoursWeek}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {totalBillableHours.toFixed(1)}h
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {billableRatio}% Ratio
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Total Logged: {totalAllHours.toFixed(1)}h</span>
          </div>
        </div>

        {/* KPI 4: Boekhoudgemak Status */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.dashboard.accountingSyncStatus}</span>
            <Receipt className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              €{unbilledAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">{unbilledEntries.length} Staged Entries</span>
            <button
              onClick={() => setActiveTab('integrations')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
            >
              API v1 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Project Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Project Progress & Budget Consumed */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Project Delivery & Accounting Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Tracking budget consumption, client debtor codes, and completion rates.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('gantt')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {t.nav.gantt} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
              const progressPct = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

              const projectHours = timeEntries
                .filter((te) => te.projectId === project.id)
                .reduce((s, te) => s + te.hours, 0);

              const budgetPct = Math.min(100, Math.round((projectHours / project.budgetHours) * 100));

              return (
                <div
                  key={project.id}
                  className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {project.name}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{project.clientName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-400">Debtor: {project.debtorCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>€{project.hourlyRate}/h</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {projectHours.toFixed(1)} / {project.budgetHours}h
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {progressPct}% Done
                      </span>
                    </div>
                  </div>

                  {/* Dual progress bar: Delivery vs Budget */}
                  <div className="space-y-1.5 mt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow & Integrations Status */}
        <div className="space-y-6">
          {/* Quick Launch Panel */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {t.dashboard.quickActions}
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('kanban')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-indigo-500" />
                  <span>{t.nav.kanban}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('timeTracking')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>{t.nav.timeTracking}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('integrations')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  <span>Boekhoudgemak WebAPI Sync</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Cloud Tools Health */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              External Connections
            </h3>

            <div className="space-y-3">
              {/* Slack */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Slack className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Slack Webhook</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{slackConfig.defaultChannel}</span>
              </div>

              {/* Google Drive */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Google Drive</span>
                </div>
                <span className="text-[11px] text-slate-500">{googleDriveConfig.usedStorage}</span>
              </div>

              {/* Boekhoudgemak */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Boekhoudgemak v1</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
