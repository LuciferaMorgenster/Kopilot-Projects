import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus, DriveAttachment } from '../types';
import {
  X,
  Plus,
  Paperclip,
  Trash2,
  Play,
  Send,
  MessageSquare,
  Clock,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { mockDriveAttachments } from '../data/mockData';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultStatus = 'todo',
}) => {
  const {
    t,
    projects,
    users,
    addTask,
    updateTask,
    deleteTask,
    addCommentToTask,
    attachDriveFileToTask,
    startTimer,
    activeTimer,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [estimatedHours, setEstimatedHours] = useState('8');
  const [billable, setBillable] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Comment input
  const [newComment, setNewComment] = useState('');

  // Drive picker modal
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setProjectId(taskToEdit.projectId);
      setAssigneeId(taskToEdit.assigneeId);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setEstimatedHours(taskToEdit.estimatedHours.toString());
      setBillable(taskToEdit.billable);
      setDueDate(taskToEdit.dueDate);
      setTagsInput(taskToEdit.tags.join(', '));
    } else {
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setAssigneeId(users[0]?.id || '');
      setPriority('medium');
      setStatus(defaultStatus);
      setEstimatedHours('8');
      setBillable(true);
      // default due date: 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(d.toISOString().split('T')[0]);
      setTagsInput('Sprint, Feature');
    }
  }, [taskToEdit, defaultStatus, projects, users]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = users.find((u) => u.id === assigneeId) || users[0];
    const parsedHours = parseFloat(estimatedHours) || 8;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title,
        description,
        projectId,
        assigneeId,
        assignee,
        priority,
        status,
        estimatedHours: parsedHours,
        billable,
        dueDate,
        tags,
      });
    } else {
      addTask({
        title,
        description,
        projectId,
        assigneeId,
        assignee,
        priority,
        status,
        estimatedHours: parsedHours,
        billable,
        dueDate,
        tags,
      });
    }

    onClose();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit || !newComment.trim()) return;
    addCommentToTask(taskToEdit.id, newComment.trim());
    setNewComment('');
  };

  const handleSelectDriveFile = (file: DriveAttachment) => {
    if (taskToEdit) {
      attachDriveFileToTask(taskToEdit.id, file);
    }
    setShowDrivePicker(false);
  };

  const isTimerActive = activeTimer.isRunning && taskToEdit && activeTimer.taskId === taskToEdit.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {taskToEdit ? t.modal.editTask : t.modal.createTask}
            </h2>
            {taskToEdit && (
              <span className="text-xs text-slate-400 font-mono">#{taskToEdit.id}</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                {t.modal.taskTitle} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Boekhoudgemak Debtor WebAPI Call"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                {t.modal.taskDesc}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Technical details, acceptance criteria, dependencies..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* 2-Column Row: Project & Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.modal.project}
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.modal.assignee}
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3-Column Row: Status, Priority, Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.modal.status}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.modal.priority}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  <option value="low">{t.priorities.low}</option>
                  <option value="medium">{t.priorities.medium}</option>
                  <option value="high">{t.priorities.high}</option>
                  <option value="urgent">{t.priorities.urgent}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.modal.dueDate}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Hours, Billable, and Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.modal.estimatedHours}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={billable}
                    onChange={(e) => setBillable(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {t.modal.billable} (Boekhoudgemak sync)
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                {t.modal.tags}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="API, Backend, Boekhoudgemak"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
              />
            </div>
          </form>

          {/* If editing an existing task: Google Drive Attachments & Comments */}
          {taskToEdit && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Google Drive Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    <span>Google Drive Attachments ({taskToEdit.attachments.length})</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowDrivePicker(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.modal.attachDrive}</span>
                  </button>
                </div>

                {taskToEdit.attachments.length === 0 ? (
                  <p className="text-slate-400 text-[11px]">No Drive files attached to this task yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {taskToEdit.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FolderOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium truncate">{att.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">({att.size})</span>
                        </div>
                        <a
                          href={att.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold shrink-0"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Comments Feed */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Comments & Collaboration ({taskToEdit.comments.length})
                </span>

                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {taskToEdit.comments.map((cm) => (
                    <div key={cm.id} className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <img src={cm.userAvatar} alt={cm.userName} className="w-4 h-4 rounded-full object-cover" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{cm.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">{cm.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or @mention a collaborator..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          {taskToEdit ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  deleteTask(taskToEdit.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  startTimer(taskToEdit.id, taskToEdit.projectId, taskToEdit.title, taskToEdit.billable);
                  onClose();
                }}
                className="px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center gap-1 font-semibold"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTimerActive ? 'Stopwatch Active' : 'Start Stopwatch'}</span>
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.modal.cancel}
            </button>
            <button
              type="submit"
              form="task-form"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              {t.modal.save}
            </button>
          </div>
        </div>
      </div>

      {/* Drive File Picker Sub-Modal */}
      {showDrivePicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-md animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-500" />
                <span>Google Drive File Picker</span>
              </span>
              <button onClick={() => setShowDrivePicker(false)} className="text-slate-400">×</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {mockDriveAttachments.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSelectDriveFile(f)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{f.name}</div>
                    <div className="text-[10px] text-slate-400">{f.size} · Modified {new Date(f.modifiedTime).toLocaleDateString()}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Select</span>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDrivePicker(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
