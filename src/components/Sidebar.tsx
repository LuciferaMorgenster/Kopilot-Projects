import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Kanban,
  CalendarRange,
  ListTodo,
  Clock,
  BarChart3,
  PlugZap,
  ShieldCheck,
  ChevronRight,
  FolderOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { t, activeTab, setActiveTab, currentUser, tasks, timeEntries, boekhoudgemakConfig } = useApp();

  const unbilledCount = timeEntries.filter((te) => te.billable && !te.syncedToBoekhoudgemak).length;
  const inProgressTaskCount = tasks.filter((t) => t.status === 'in_progress').length;

  const navItems = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'kanban',
      label: t.nav.kanban,
      icon: Kanban,
      badge: inProgressTaskCount > 0 ? inProgressTaskCount : undefined,
    },
    {
      id: 'gantt',
      label: t.nav.gantt,
      icon: CalendarRange,
    },
    {
      id: 'taskList',
      label: t.nav.taskList,
      icon: ListTodo,
      badge: tasks.length,
    },
    {
      id: 'timeTracking',
      label: t.nav.timeTracking,
      icon: Clock,
    },
    {
      id: 'reports',
      label: t.nav.reports,
      icon: BarChart3,
    },
    {
      id: 'integrations',
      label: t.nav.integrations,
      icon: PlugZap,
      highlightBadge: unbilledCount > 0 ? `${unbilledCount} unbilled` : undefined,
    },
    {
      id: 'gdpr',
      label: t.nav.gdpr,
      icon: ShieldCheck,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-50/70 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {/* Mobile close button header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <span className="font-bold text-sm text-slate-900 dark:text-white">{t.brand}</span>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded tabular-nums ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.highlightBadge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {item.highlightBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Integration Status Footer Strip */}
      <div className="p-3 mx-3 mb-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            BoekhoudGemak App
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Gekoppeld</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-mono text-[10px] truncate max-w-[110px]">{boekhoudgemakConfig.administrationCode}</span>
          <button
            onClick={() => handleSelectTab('integrations')}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 text-[11px]"
          >
            Koppeling <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* User info footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
            {currentUser.name}
          </div>
          <div className="text-[11px] text-slate-400 truncate">{currentUser.role}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:block shrink-0">{content}</aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
