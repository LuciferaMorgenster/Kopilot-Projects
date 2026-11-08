import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Flag,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface GanttViewProps {
  onSelectTask: (task: Task) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ onSelectTask }) => {
  const { t, tasks, projects, selectedProjectId, setSelectedProjectId, updateTask } = useApp();
  const [scale, setScale] = useState<'weeks' | 'months'>('weeks');

  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter((t) => t.projectId === selectedProjectId);

  // Time periods configuration (sample 8-week horizon)
  const weeks = [
    { label: 'Oct W1', start: '2026-10-01', end: '2026-10-07' },
    { label: 'Oct W2', start: '2026-10-08', end: '2026-10-14' },
    { label: 'Oct W3', start: '2026-10-15', end: '2026-10-21' },
    { label: 'Oct W4', start: '2026-10-22', end: '2026-10-28' },
    { label: 'Nov W1', start: '2026-10-29', end: '2026-11-04' },
    { label: 'Nov W2', start: '2026-11-05', end: '2026-11-11' },
    { label: 'Nov W3', start: '2026-11-12', end: '2026-11-18' },
    { label: 'Nov W4', start: '2026-11-19', end: '2026-11-25' },
    { label: 'Dec W1', start: '2026-11-26', end: '2026-12-02' },
    { label: 'Dec W2', start: '2026-12-03', end: '2026-12-09' },
  ];

  // Helper to calculate bar offset and width percentage
  const calculateBarPosition = (startDate?: string, dueDate?: string) => {
    // Default fallback offsets for visualization
    const baseOffset = 10;
    const baseWidth = 40;

    if (!startDate || !dueDate) {
      return { left: `${baseOffset}%`, width: `${baseWidth}%` };
    }

    const start = new Date(startDate).getTime();
    const end = new Date(dueDate).getTime();
    const minTime = new Date('2026-10-01').getTime();
    const maxTime = new Date('2026-12-10').getTime();
    const totalSpan = maxTime - minTime;

    const leftPct = Math.max(0, Math.min(90, ((start - minTime) / totalSpan) * 100));
    const widthPct = Math.max(10, Math.min(100 - leftPct, ((end - start) / totalSpan) * 100));

    return { left: `${leftPct}%`, width: `${widthPct}%` };
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-500';
      case 'review':
        return 'bg-purple-500';
      case 'in_progress':
        return 'bg-amber-500';
      case 'todo':
        return 'bg-blue-500';
      case 'backlog':
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.gantt.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.gantt.subtitle}
          </p>
        </div>

        {/* Zoom & Project Filter Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">{t.kanban.allProjects}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Scale Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setScale('weeks')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                scale === 'weeks'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.gantt.weeks}
            </button>
            <button
              onClick={() => setScale('months')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                scale === 'months'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.gantt.months}
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Matrix Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Timeline Header Row */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="w-72 lg:w-80 shrink-0 p-3 border-r border-slate-200 dark:border-slate-800">
            Task & Assignee
          </div>
          <div className="flex-1 grid grid-cols-10 divide-x divide-slate-200/60 dark:divide-slate-800/60 text-center">
            {weeks.map((w, idx) => (
              <div
                key={w.label}
                className={`py-3 text-[11px] truncate font-mono ${idx === 5 ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
              >
                {w.label}
                {idx === 5 && <span className="block text-[9px] uppercase tracking-wider">Today</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const { left, width } = calculateBarPosition(task.startDate, task.dueDate);
            const completionPct = task.status === 'done' ? 100 : task.status === 'review' ? 85 : task.status === 'in_progress' ? 50 : 10;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="flex items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group"
              >
                {/* Left Task Label Cell */}
                <div className="w-72 lg:w-80 shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: project?.color || '#6366F1' }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {project?.name} · {task.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    title={task.assignee.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                </div>

                {/* Right Timeline Canvas */}
                <div className="flex-1 relative h-12 flex items-center px-2">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-10 divide-x divide-slate-100 dark:divide-slate-800/40 pointer-events-none" />

                  {/* Gantt Bar */}
                  <div
                    className={`absolute h-7 rounded-md shadow-xs flex items-center px-2 text-white text-[11px] font-medium transition-all ${getStatusColor(
                      task.status
                    )}`}
                    style={{ left, width }}
                  >
                    <span className="truncate pr-1 drop-shadow-xs">{task.title}</span>
                    <span className="ml-auto font-mono text-[10px] tabular-nums shrink-0 opacity-90">
                      {completionPct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Milestones */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Phase Statuses:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Backlog</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>In Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Done</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
          <Flag className="w-3.5 h-3.5" />
          <span>Sprint Milestone: Nov 15 – Cloud Migration Phase 1</span>
        </div>
      </div>
    </div>
  );
};
