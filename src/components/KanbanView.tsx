import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import {
  Plus,
  Search,
  Filter,
  Clock,
  Play,
  FileText,
  Paperclip,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface KanbanViewProps {
  onOpenNewTaskModal: (status?: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
}

const columnDefinitions: { id: TaskStatus; labelKey: keyof typeof import('../i18n/translations').translations.en.kanban.columns; color: string }[] = [
  { id: 'backlog', labelKey: 'backlog', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'todo', labelKey: 'todo', color: 'border-blue-400 dark:border-blue-600' },
  { id: 'in_progress', labelKey: 'in_progress', color: 'border-amber-400 dark:border-amber-600' },
  { id: 'review', labelKey: 'review', color: 'border-purple-400 dark:border-purple-600' },
  { id: 'done', labelKey: 'done', color: 'border-emerald-400 dark:border-emerald-600' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({ onOpenNewTaskModal, onSelectTask }) => {
  const {
    t,
    tasks,
    projects,
    users,
    selectedProjectId,
    setSelectedProjectId,
    updateTaskStatus,
    startTimer,
    activeTimer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700 dark:text-red-400 font-semibold';
      case 'high':
        return 'text-amber-700 dark:text-amber-400 font-medium';
      case 'medium':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'low':
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.kanban.filterPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
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

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">{t.kanban.allPriorities}</option>
            <option value="urgent">{t.priorities.urgent}</option>
            <option value="high">{t.priorities.high}</option>
            <option value="medium">{t.priorities.medium}</option>
            <option value="low">{t.priorities.low}</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">{t.kanban.allAssignees}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* New Task Button */}
          <button
            onClick={() => onOpenNewTaskModal('todo')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.kanban.addTask}</span>
          </button>
        </div>
      </div>

      {/* Kanban 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
        {columnDefinitions.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const colTitle = t.kanban.columns[col.labelKey];

          return (
            <div
              key={col.id}
              className="flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-2.5 min-w-[260px] max-h-[calc(100vh-210px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 py-1 mb-2 border-b-2 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {colTitle}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    ({colTasks.length})
                  </span>
                </div>

                <button
                  onClick={() => onOpenNewTaskModal(col.id)}
                  title={`Add task to ${colTitle}`}
                  className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const isTaskTimerActive = activeTimer.isRunning && activeTimer.taskId === task.id;
                    const nextSt = getNextStatus(task.status);
                    const prevSt = getPrevStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs transition-all group cursor-pointer"
                        onClick={() => onSelectTask(task)}
                      >
                        {/* Card Top: Project indicator & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: project?.color || '#6366F1' }}
                            />
                            <span className="font-medium text-slate-500 dark:text-slate-400 truncate">
                              {project?.code || 'PRJ'}
                            </span>
                          </div>

                          <span className={`text-[11px] uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {/* Unboxed Metadata (Tags & Due Date) */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {task.tags.map((tag, i) => (
                            <React.Fragment key={tag}>
                              {i > 0 && <span aria-hidden="true">·</span>}
                              <span>#{tag}</span>
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Hours & Drive attachments indicator */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-500">
                            <span title="Logged / Estimated hours">
                              {task.loggedHours.toFixed(1)} / {task.estimatedHours}h
                            </span>

                            {task.billable && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold" title="Billable to client">
                                €
                              </span>
                            )}

                            {task.attachments.length > 0 && (
                              <span className="flex items-center gap-0.5 text-blue-500" title="Google Drive attachments">
                                <Paperclip className="w-3 h-3" />
                                {task.attachments.length}
                              </span>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            title={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        </div>

                        {/* Quick Action Bar on Card */}
                        <div
                          className="mt-2 pt-1.5 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between text-xs opacity-75 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Timer Button */}
                          <button
                            onClick={() => startTimer(task.id, task.projectId, task.title, task.billable)}
                            className={`p-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                              isTaskTimerActive
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            title={isTaskTimerActive ? 'Active in stopwatch' : 'Start stopwatch for this task'}
                          >
                            <Play className={`w-3 h-3 ${isTaskTimerActive ? 'fill-current animate-pulse' : ''}`} />
                            <span>{isTaskTimerActive ? 'Active' : 'Timer'}</span>
                          </button>

                          {/* Quick move controls */}
                          <div className="flex items-center gap-0.5">
                            {prevSt && (
                              <button
                                onClick={() => updateTaskStatus(task.id, prevSt)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                title={`Move to ${prevSt}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {nextSt && (
                              <button
                                onClick={() => updateTaskStatus(task.id, nextSt)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                title={`Move to ${nextSt}`}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
