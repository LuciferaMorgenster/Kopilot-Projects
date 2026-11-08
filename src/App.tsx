import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { GanttView } from './components/GanttView';
import { TaskListView } from './components/TaskListView';
import { TimeTrackingView } from './components/TimeTrackingView';
import { ReportsView } from './components/ReportsView';
import { IntegrationsView } from './components/IntegrationsView';
import { PrivacyCenterView } from './components/PrivacyCenterView';
import { TaskModal } from './components/TaskModal';
import { GDPRBanner } from './components/GDPRBanner';
import { Task, TaskStatus } from './types';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('todo');

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setTaskToEdit(null);
    setModalDefaultStatus(status);
    setTaskModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar */}
      <Navbar
        onOpenNewTaskModal={() => handleOpenNewTask('todo')}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView onOpenNewTaskModal={() => handleOpenNewTask('todo')} />
            )}
            {activeTab === 'kanban' && (
              <KanbanView
                onOpenNewTaskModal={handleOpenNewTask}
                onSelectTask={handleSelectTask}
              />
            )}
            {activeTab === 'gantt' && (
              <GanttView onSelectTask={handleSelectTask} />
            )}
            {activeTab === 'taskList' && (
              <TaskListView
                onOpenNewTaskModal={() => handleOpenNewTask('todo')}
                onSelectTask={handleSelectTask}
              />
            )}
            {activeTab === 'timeTracking' && <TimeTrackingView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'integrations' && <IntegrationsView />}
            {activeTab === 'gdpr' && <PrivacyCenterView />}
          </div>
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultStatus={modalDefaultStatus}
      />

      {/* GDPR / AVG Cookie Banner */}
      <GDPRBanner />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
