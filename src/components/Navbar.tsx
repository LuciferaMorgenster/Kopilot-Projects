import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Play,
  Pause,
  Square,
  Bell,
  Sun,
  Moon,
  Globe,
  Plus,
  CheckCircle2,
  FolderSync,
  ExternalLink,
  MessageSquare,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewTaskModal: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTaskModal, onOpenMobileMenu }) => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    activeTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    activeCollaborators,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    setActiveTab,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCollabMenu, setShowCollabMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimerTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-6 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Brand & Project Context */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          aria-label="Open menu"
        >
          <Layers className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            K
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {t.brand}
            </span>
          </div>
        </div>

        {/* Project Breadcrumb Selector */}
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 dark:text-slate-500">Workspace</span>
          <span className="text-slate-400">/</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer py-1 pr-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <option value="all" className="bg-white dark:bg-slate-900">
              {t.kanban.allProjects} ({projects.length})
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Running Stopwatch & Collaborators Presence */}
      <div className="flex items-center gap-3">
        {/* Global Stopwatch Widget */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
            activeTimer.isRunning
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 shadow-xs'
              : 'bg-slate-100/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${activeTimer.isRunning && !activeTimer.isPaused ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : ''}`} />

          <div className="flex items-center gap-1.5">
            <span className="font-mono tabular-nums font-semibold text-xs tracking-wider">
              {formatTimerTime(activeTimer.secondsElapsed)}
            </span>

            {activeTimer.isRunning ? (
              <span className="hidden xl:inline max-w-[140px] truncate text-slate-600 dark:text-slate-300">
                · {activeTimer.taskTitle}
              </span>
            ) : (
              <span className="hidden sm:inline text-slate-400 text-[11px]">
                {t.topbar.noActiveTimer}
              </span>
            )}
          </div>

          {activeTimer.isRunning ? (
            <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-emerald-200 dark:border-emerald-800/60">
              {activeTimer.isPaused ? (
                <button
                  onClick={resumeTimer}
                  title={t.topbar.resumeTimer}
                  className="p-1 hover:bg-emerald-200/60 dark:hover:bg-emerald-800/60 rounded text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  title={t.topbar.pauseTimer}
                  className="p-1 hover:bg-emerald-200/60 dark:hover:bg-emerald-800/60 rounded text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <Pause className="w-3 h-3 fill-current" />
                </button>
              )}
              <button
                onClick={stopTimer}
                title={t.topbar.stopTimer}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/60 rounded text-red-600 dark:text-red-400 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('timeTracking')}
              className="ml-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t.topbar.startTimer}
            </button>
          )}
        </div>

        {/* Live Collaborator Presence cluster */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowCollabMenu(!showCollabMenu)}
            className="flex items-center -space-x-1.5 hover:opacity-90 transition-opacity p-0.5"
            title={`${activeCollaborators.length} ${t.topbar.collaboratorsOnline}`}
          >
            {activeCollaborators.slice(0, 3).map((collab) => (
              <img
                key={collab.id}
                src={collab.avatar}
                alt={collab.name}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover"
              />
            ))}
            {activeCollaborators.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-medium text-slate-700 dark:text-slate-200">
                +{activeCollaborators.length - 3}
              </div>
            )}
          </button>

          {/* Collaborators Dropdown */}
          {showCollabMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {t.topbar.collaboratorsOnline} ({activeCollaborators.length})
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Real-Time</span>
              </div>
              <div className="space-y-2">
                {activeCollaborators.map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 text-xs">
                    <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-200 truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.status === 'editing' ? 'Editing in ' : 'Viewing '}
                        <span className="text-slate-600 dark:text-slate-300">{c.currentSection}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Actions, Language, Theme, Notifications & New Task */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick New Task CTA */}
        <button
          onClick={onOpenNewTaskModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.topbar.quickNewTask}</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950 text-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              language === 'en'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('nl')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              language === 'nl'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            NL
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.topbar.notifications}
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t.topbar.markAllRead}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {t.topbar.noNotifications}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500'
                          : 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/60 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
