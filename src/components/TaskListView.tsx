import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import {
  Search,
  Download,
  Filter,
  Paperclip,
  Play,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';

interface TaskListViewProps {
  onOpenNewTaskModal: () => void;
  onSelectTask: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ onOpenNewTaskModal, onSelectTask }) => {
  const {
    t,
    tasks,
    projects,
    users,
    selectedProjectId,
    setSelectedProjectId,
    updateTaskStatus,
    deleteTask,
    startTimer,
    activeTimer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'priority' | 'hours'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    if (sortBy === 'dueDate') {
      return sortOrder === 'asc'
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    if (sortBy === 'hours') {
      return sortOrder === 'asc' ? a.loggedHours - b.loggedHours : b.loggedHours - a.loggedHours;
    }
    return 0;
  });

  const toggleSort = (field: 'title' | 'dueDate' | 'priority' | 'hours') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Task ID', 'Title', 'Project', 'Status', 'Priority', 'Assignee', 'Logged Hours', 'Estimated Hours', 'Billable', 'Due Date'];
    const rows = filteredTasks.map((t) => {
      const p = projects.find((proj) => proj.id === t.projectId);
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${p ? p.name : 'Unknown'}"`,
        t.status,
        t.priority,
        `"${t.assignee.name}"`,
        t.loggedHours,
        t.estimatedHours,
        t.billable ? 'YES' : 'NO',
        t.dueDate,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kopilot-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.taskList.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.taskList.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Project */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.taskList.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 font-semibold select-none">
              <th
                onClick={() => toggleSort('title')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.taskList.colTask}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">{t.taskList.colProject}</th>
              <th className="py-3 px-4">{t.taskList.colAssignee}</th>
              <th className="py-3 px-4">{t.taskList.colPriority}</th>
              <th className="py-3 px-4">{t.taskList.colStatus}</th>
              <th
                onClick={() => toggleSort('hours')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.taskList.colHours}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('dueDate')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.taskList.colDueDate}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">{t.taskList.colDrive}</th>
              <th className="py-3 px-4 text-right">{t.taskList.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No tasks found matching current filter parameters.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isTimerActive = activeTimer.isRunning && activeTimer.taskId === task.id;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Task Title & Tags */}
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs">
                      <div className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {task.tags.join(' · ')}
                      </div>
                    </td>

                    {/* Project */}
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: project?.color || '#6366F1' }}
                        />
                        <span className="truncate max-w-[120px]">{project?.name}</span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{task.assignee.name}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-2.5 px-4 whitespace-nowrap uppercase tracking-wider text-[10px] font-semibold">
                      <span
                        className={
                          task.priority === 'urgent'
                            ? 'text-red-600 dark:text-red-400'
                            : task.priority === 'high'
                            ? 'text-amber-600 dark:text-amber-400'
                            : task.priority === 'medium'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400'
                        }
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="py-1 px-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>

                    {/* Hours */}
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <span>{task.loggedHours.toFixed(1)}</span>
                      <span className="text-slate-400"> / {task.estimatedHours}h</span>
                      {task.billable && (
                        <span className="ml-1 text-emerald-600 font-bold" title="Billable">
                          €
                        </span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap text-[11px]">
                      {task.dueDate}
                    </td>

                    {/* Drive Attachments */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {task.attachments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-blue-500 font-mono text-[11px]">
                          <Paperclip className="w-3 h-3" />
                          {task.attachments.length}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startTimer(task.id, task.projectId, task.title, task.billable)}
                          className={`p-1.5 rounded transition-colors ${
                            isTimerActive
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Start timer"
                        >
                          <Play className={`w-3.5 h-3.5 ${isTimerActive ? 'fill-current animate-pulse' : ''}`} />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
