import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Task,
  TimeEntry,
  User,
  Language,
  Theme,
  TaskStatus,
  BoekhoudgemakConfig,
  SlackConfig,
  GoogleDriveConfig,
  GDPRConsent,
  NotificationItem,
  ActiveCollaborator,
  DriveAttachment,
} from '../types';
import {
  mockProjects,
  mockTasks,
  mockTimeEntries,
  mockUsers,
  initialBoekhoudgemakConfig,
  initialSlackConfig,
  initialGoogleDriveConfig,
  initialNotifications,
  initialCollaborators,
} from '../data/mockData';
import { translations, TranslationKey } from '../i18n/translations';

interface ActiveTimerState {
  isRunning: boolean;
  isPaused: boolean;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  description: string;
  billable: boolean;
  hourlyRate: number;
  secondsElapsed: number;
  startTime?: number;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  users: User[];
  currentUser: User;
  activeCollaborators: ActiveCollaborator[];

  // Active Timer
  activeTimer: ActiveTimerState;
  startTimer: (taskId: string, projectId: string, description?: string, billable?: boolean) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;

  // Task Handlers
  addTask: (task: Omit<Task, 'id' | 'loggedHours' | 'attachments' | 'comments' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  addCommentToTask: (taskId: string, content: string) => void;
  attachDriveFileToTask: (taskId: string, attachment: DriveAttachment) => void;

  // Time Entries
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'syncedToBoekhoudgemak'>) => void;
  deleteTimeEntry: (id: string) => void;

  // Integrations
  boekhoudgemakConfig: BoekhoudgemakConfig;
  updateBoekhoudgemakConfig: (config: Partial<BoekhoudgemakConfig>) => void;
  syncToBoekhoudgemak: (entryIds?: string[]) => Promise<{ success: boolean; invoiceNumber: string; totalAmount: number; count: number }>;
  exportExactXML: (entryIds?: string[]) => void;
  testAppConnection: (url?: string) => Promise<{ success: boolean; message: string; latencyMs: number }>;
  syncDebtorsFromBoekhoudGemak: () => Promise<number>;

  slackConfig: SlackConfig;
  updateSlackConfig: (config: Partial<SlackConfig>) => void;
  sendSlackMessage: (text: string, channel?: string) => void;

  googleDriveConfig: GoogleDriveConfig;
  updateGoogleDriveConfig: (config: Partial<GoogleDriveConfig>) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // GDPR
  gdprConsent: GDPRConsent;
  saveGdprConsent: (consent: Partial<GDPRConsent>) => void;
  exportGdprData: () => void;
  purgeWorkspaceData: () => void;

  // Global filters & navigation
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kopilot_lang') as Language) || 'en';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('kopilot_theme') as Theme) || 'dark';
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kopilot_theme', theme);
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kopilot_lang', lang);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const t = translations[language];

  // Core Data State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('kopilot_projects');
    return saved ? JSON.parse(saved) : mockProjects;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('kopilot_tasks');
    return saved ? JSON.parse(saved) : mockTasks;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('kopilot_time_entries');
    return saved ? JSON.parse(saved) : mockTimeEntries;
  });

  const [users] = useState<User[]>(mockUsers);
  const [currentUser] = useState<User>(mockUsers[1]); // Lucas van Dijk as current user
  const [activeCollaborators, setActiveCollaborators] = useState<ActiveCollaborator[]>(initialCollaborators);

  // Integrations State
  const [boekhoudgemakConfig, setBoekhoudgemakConfig] = useState<BoekhoudgemakConfig>(() => {
    const saved = localStorage.getItem('kopilot_boekhoudgemak');
    return saved ? JSON.parse(saved) : initialBoekhoudgemakConfig;
  });

  const [slackConfig, setSlackConfig] = useState<SlackConfig>(() => {
    const saved = localStorage.getItem('kopilot_slack');
    return saved ? JSON.parse(saved) : initialSlackConfig;
  });

  const [googleDriveConfig, setGoogleDriveConfig] = useState<GoogleDriveConfig>(() => {
    const saved = localStorage.getItem('kopilot_gdrive');
    return saved ? JSON.parse(saved) : initialGoogleDriveConfig;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // GDPR Consent State
  const [gdprConsent, setGdprConsent] = useState<GDPRConsent>(() => {
    const saved = localStorage.getItem('kopilot_gdpr_consent');
    return saved
      ? JSON.parse(saved)
      : {
          consentGiven: false,
          strictlyNecessary: true,
          analyticsConsent: true,
          integrationsConsent: true,
        };
  });

  // Global selection & Navigation
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Active Timer State
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>({
    isRunning: false,
    isPaused: false,
    taskId: '',
    taskTitle: '',
    projectId: '',
    projectName: '',
    description: '',
    billable: true,
    hourlyRate: 125,
    secondsElapsed: 0,
  });

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer.isRunning && !activeTimer.isPaused) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          secondsElapsed: prev.secondsElapsed + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning, activeTimer.isPaused]);

  // Periodic Collaborator activity simulation
  useEffect(() => {
    const sections = ['Kanban Board', 'Gantt Timeline', 'Task Grid', 'Time Tracking', 'Boekhoudgemak Sync Hub'];
    const interval = setInterval(() => {
      setActiveCollaborators((prev) =>
        prev.map((c) => {
          if (Math.random() > 0.6) {
            const randomSection = sections[Math.floor(Math.random() * sections.length)];
            const randomStatus = Math.random() > 0.5 ? 'editing' : 'active';
            return {
              ...c,
              currentSection: randomSection,
              status: randomStatus,
              lastPing: Date.now(),
            };
          }
          return c;
        })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('kopilot_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('kopilot_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kopilot_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('kopilot_boekhoudgemak', JSON.stringify(boekhoudgemakConfig));
  }, [boekhoudgemakConfig]);

  useEffect(() => {
    localStorage.setItem('kopilot_slack', JSON.stringify(slackConfig));
  }, [slackConfig]);

  useEffect(() => {
    localStorage.setItem('kopilot_gdrive', JSON.stringify(googleDriveConfig));
  }, [googleDriveConfig]);

  // Notifications helper
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Timer Controls
  const startTimer = (taskId: string, projectId: string, description = '', billable = true) => {
    const task = tasks.find((t) => t.id === taskId);
    const project = projects.find((p) => p.id === projectId);

    setActiveTimer({
      isRunning: true,
      isPaused: false,
      taskId,
      taskTitle: task ? task.title : 'General Task',
      projectId,
      projectName: project ? project.name : 'Workspace',
      description: description || (task ? task.title : 'Project task timer'),
      billable,
      hourlyRate: project ? project.hourlyRate : 125,
      secondsElapsed: 0,
      startTime: Date.now(),
    });

    addNotification({
      title: 'Stopwatch Started',
      message: `Recording time for: ${task ? task.title : 'Task'}`,
      type: 'task',
    });
  };

  const pauseTimer = () => {
    setActiveTimer((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeTimer = () => {
    setActiveTimer((prev) => ({ ...prev, isPaused: false }));
  };

  const stopTimer = () => {
    if (!activeTimer.isRunning) return;

    const hoursLogged = Math.max(0.1, Number((activeTimer.secondsElapsed / 3600).toFixed(2)));

    // Create time entry
    const newEntry: TimeEntry = {
      id: `te_${Date.now()}`,
      taskId: activeTimer.taskId || 'tsk_1',
      taskTitle: activeTimer.taskTitle || 'Ad-hoc Task',
      projectId: activeTimer.projectId || projects[0].id,
      projectName: activeTimer.projectName || projects[0].name,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      description: activeTimer.description || 'Sprint task work',
      date: new Date().toISOString().split('T')[0],
      hours: hoursLogged,
      billable: activeTimer.billable,
      hourlyRate: activeTimer.hourlyRate,
      syncedToBoekhoudgemak: false,
      createdAt: new Date().toISOString(),
    };

    setTimeEntries((prev) => [newEntry, ...prev]);

    // Update logged hours on task
    if (activeTimer.taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeTimer.taskId ? { ...t, loggedHours: Number((t.loggedHours + hoursLogged).toFixed(1)) } : t))
      );
    }

    addNotification({
      title: 'Time Entry Logged',
      message: `${hoursLogged}h saved for "${activeTimer.taskTitle}". Ready for Boekhoudgemak billing.`,
      type: 'accounting',
    });

    if (slackConfig.enabled && slackConfig.notifyOnTimerStop) {
      sendSlackMessage(`⏱️ *${currentUser.name}* logged *${hoursLogged}h* on *${activeTimer.taskTitle}* (${activeTimer.projectName}).`);
    }

    // Reset active timer
    setActiveTimer({
      isRunning: false,
      isPaused: false,
      taskId: '',
      taskTitle: '',
      projectId: '',
      projectName: '',
      description: '',
      billable: true,
      hourlyRate: 125,
      secondsElapsed: 0,
    });
  };

  // Task Handlers
  const addTask = (taskData: Omit<Task, 'id' | 'loggedHours' | 'attachments' | 'comments' | 'order' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `tsk_${Date.now()}`,
      loggedHours: 0,
      attachments: [],
      comments: [],
      order: tasks.filter((t) => t.status === taskData.status).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    addNotification({
      title: 'New Task Created',
      message: `"${newTask.title}" added to ${taskData.status} column.`,
      type: 'task',
    });

    if (slackConfig.enabled && slackConfig.notifyOnTaskComplete) {
      sendSlackMessage(`📋 New task created by *${currentUser.name}*: *${newTask.title}* [${newTask.priority.toUpperCase()}]`);
    }
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : t)));
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const previousStatus = task.status;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );

    if (newStatus === 'done' && previousStatus !== 'done') {
      addNotification({
        title: 'Task Completed',
        message: `"${task.title}" was marked as Done.`,
        type: 'task',
      });

      if (slackConfig.enabled && slackConfig.notifyOnTaskComplete) {
        sendSlackMessage(`🎉 Task marked completed: *${task.title}* by *${currentUser.name}*!`);
      }
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTimeEntries((prev) => prev.filter((te) => te.taskId !== taskId));
  };

  const addCommentToTask = (taskId: string, content: string) => {
    const newComment = {
      id: `cm_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t))
    );
  };

  const attachDriveFileToTask = (taskId: string, attachment: DriveAttachment) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t))
    );
    addNotification({
      title: 'Google Drive File Attached',
      message: `Linked "${attachment.name}" to task.`,
      type: 'drive',
    });
  };

  // Time Entries
  const addTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'syncedToBoekhoudgemak'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `te_${Date.now()}`,
      syncedToBoekhoudgemak: false,
      createdAt: new Date().toISOString(),
    };

    setTimeEntries((prev) => [newEntry, ...prev]);

    // Update logged hours on task
    setTasks((prev) =>
      prev.map((t) => (t.id === entryData.taskId ? { ...t, loggedHours: Number((t.loggedHours + entryData.hours).toFixed(1)) } : t))
    );

    addNotification({
      title: 'Hours Logged',
      message: `${entryData.hours}h logged on "${entryData.taskTitle}".`,
      type: 'accounting',
    });
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Integrations: Boekhoudgemak Direct Sync
  const updateBoekhoudgemakConfig = (cfg: Partial<BoekhoudgemakConfig>) => {
    setBoekhoudgemakConfig((prev) => ({ ...prev, ...cfg }));
  };

  const syncToBoekhoudgemak = async (entryIds?: string[]) => {
    // Filter unbilled and billable entries
    const targetEntries = timeEntries.filter((e) => {
      if (entryIds && entryIds.length > 0) {
        return entryIds.includes(e.id) && e.billable && !e.syncedToBoekhoudgemak;
      }
      return e.billable && !e.syncedToBoekhoudgemak;
    });

    if (targetEntries.length === 0) {
      return { success: false, invoiceNumber: '', totalAmount: 0, count: 0 };
    }

    const totalHours = targetEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalAmount = targetEntries.reduce((sum, e) => sum + e.hours * e.hourlyRate, 0);
    const invoiceNumber = `VF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    // Find debtor code from project
    const project = projects.find((p) => p.id === targetEntries[0].projectId);
    const debtorCode = project ? project.debtorCode : 'DEB-8041';
    const debtorName = project ? project.clientName : 'Client Relatie';

    // Simulated API handshake delay
    await new Promise((res) => setTimeout(res, 800));

    // Update time entries as synced
    const updatedIds = targetEntries.map((e) => e.id);
    setTimeEntries((prev) =>
      prev.map((e) => (updatedIds.includes(e.id) ? { ...e, syncedToBoekhoudgemak: true, boekhoudgemakInvoiceId: invoiceNumber } : e))
    );

    // Create sync audit log
    const syncLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      entriesCount: targetEntries.length,
      totalHours,
      totalAmount,
      debtorCode,
      debtorName,
      invoiceNumber,
      status: 'success' as const,
      endpoint: `${boekhoudgemakConfig.apiUrl}/salesinvoices`,
      message: `Draft sales invoice ${invoiceNumber} created in administration ${boekhoudgemakConfig.administrationCode}. Articles booked to ${boekhoudgemakConfig.defaultLedgerAccount}.`,
      payloadPreview: JSON.stringify(
        {
          Administration: boekhoudgemakConfig.administrationCode,
          DebtorCode: debtorCode,
          InvoiceNumber: invoiceNumber,
          Currency: 'EUR',
          TotalAmount: totalAmount,
          Lines: targetEntries.map((e) => ({
            Description: `${e.projectName} - ${e.taskTitle}: ${e.description}`,
            ArticleCode: boekhoudgemakConfig.defaultArticleCode,
            Quantity: e.hours,
            UnitPrice: e.hourlyRate,
            LedgerAccount: boekhoudgemakConfig.defaultLedgerAccount,
          })),
        },
        null,
        2
      ),
    };

    setBoekhoudgemakConfig((prev) => ({
      ...prev,
      lastSyncTime: new Date().toISOString(),
      syncLogs: [syncLog, ...prev.syncLogs],
    }));

    addNotification({
      title: 'Boekhoudgemak Synchronized',
      message: `Invoice ${invoiceNumber} (${targetEntries.length} entries, €${totalAmount.toFixed(2)}) pushed to Boekhoudgemak.`,
      type: 'accounting',
    });

    if (slackConfig.enabled && slackConfig.notifyOnAccountingSync) {
      sendSlackMessage(
        `💶 *Boekhoudgemak Invoice Created:* ${invoiceNumber}\n• Debtor: *${debtorName}* (${debtorCode})\n• Entries: *${targetEntries.length}*\n• Total: *€${totalAmount.toLocaleString(
          'nl-NL',
          { minimumFractionDigits: 2 }
        )}*`
      );
    }

    return { success: true, invoiceNumber, totalAmount, count: targetEntries.length };
  };

  // eExact XML Export (Standard format for BoekhoudGemak and Multivers desktop/cloud app)
  const exportExactXML = (entryIds?: string[]) => {
    const targetEntries = timeEntries.filter((e) => {
      if (entryIds && entryIds.length > 0) {
        return entryIds.includes(e.id) && e.billable;
      }
      return e.billable && !e.syncedToBoekhoudgemak;
    });

    if (targetEntries.length === 0) {
      addNotification({
        title: 'Export Aborted',
        message: 'No unbilled hours available for eExact XML generation.',
        type: 'accounting',
      });
      return;
    }

    const invoiceNumber = `VF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    // Build eExact XML conforming to Exact Boekhoud Gemak schema
    const xmlLines = targetEntries.map((e, index) => {
      const lineTotal = (e.hours * e.hourlyRate).toFixed(2);
      return `      <InvoiceLine line="${index + 1}">
        <Description>${escapeXml(`${e.projectName} - ${e.taskTitle}: ${e.description}`)}</Description>
        <Item code="${escapeXml(boekhoudgemakConfig.defaultArticleCode)}"/>
        <Quantity>${e.hours.toFixed(2)}</Quantity>
        <Price>
          <Currency code="EUR"/>
          <Value>${e.hourlyRate.toFixed(2)}</Value>
        </Price>
        <Amount>
          <Currency code="EUR"/>
          <Value>${lineTotal}</Value>
        </Amount>
        <GLAccount code="${escapeXml(boekhoudgemakConfig.defaultLedgerAccount)}"/>
        <VAT code="21" type="I">
          <Rate>0.21</Rate>
        </VAT>
      </InvoiceLine>`;
    }).join('\n');

    const project = projects.find((p) => p.id === targetEntries[0].projectId);
    const debtorCode = project ? project.debtorCode : 'DEB-8041';
    const debtorName = project ? project.clientName : 'Client Relatie';

    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<eExact xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="eExact-XML.xsd">
  <Invoices>
    <Invoice status="C" type="V">
      <Journal code="70" type="S">
        <Description>Verkoopboek</Description>
      </Journal>
      <InvoiceNumber>${invoiceNumber}</InvoiceNumber>
      <InvoiceDate>${today}</InvoiceDate>
      <DueDate>${new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]}</DueDate>
      <Debtor code="${escapeXml(debtorCode)}">
        <Name>${escapeXml(debtorName)}</Name>
      </Debtor>
      <PaymentCondition code="14D">
        <Description>Binnen 14 dagen netto</Description>
      </PaymentCondition>
      <Administration code="${escapeXml(boekhoudgemakConfig.administrationCode)}"/>
      <InvoiceLines>
${xmlLines}
      </InvoiceLines>
    </Invoice>
  </Invoices>
</eExact>`;

    // Download XML Blob
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eExact-BoekhoudGemak-${invoiceNumber}-${today}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Record sync log
    const totalAmount = targetEntries.reduce((s, e) => s + e.hours * e.hourlyRate, 0);
    const syncLog = {
      id: `log_xml_${Date.now()}`,
      timestamp: new Date().toISOString(),
      entriesCount: targetEntries.length,
      totalHours: targetEntries.reduce((s, e) => s + e.hours, 0),
      totalAmount,
      debtorCode,
      debtorName,
      invoiceNumber,
      status: 'success' as const,
      endpoint: 'eExact-XML File Export',
      message: `Standard eExact XML batch generated for BoekhoudGemak app import. ${targetEntries.length} items billed.`,
      payloadPreview: xmlContent,
    };

    setBoekhoudgemakConfig((prev) => ({
      ...prev,
      lastSyncTime: new Date().toISOString(),
      syncLogs: [syncLog, ...prev.syncLogs],
    }));

    addNotification({
      title: 'eExact XML Exported for BoekhoudGemak',
      message: `Generated XML batch ${invoiceNumber} for import into your BoekhoudGemak application.`,
      type: 'accounting',
    });
  };

  // Test connection to user's BoekhoudGemak app from app list
  const testAppConnection = async (customUrl?: string) => {
    const targetUrl = customUrl || boekhoudgemakConfig.targetAppUrl;
    setBoekhoudgemakConfig((prev) => ({ ...prev, connectionStatus: 'testing' }));

    const start = Date.now();
    // Simulate real handshake with user's app
    await new Promise((res) => setTimeout(res, 600));
    const latencyMs = Date.now() - start;

    setBoekhoudgemakConfig((prev) => ({
      ...prev,
      connectionStatus: 'connected',
      targetAppUrl: targetUrl,
      lastHandshake: new Date().toISOString(),
    }));

    addNotification({
      title: 'BoekhoudGemak App Connected',
      message: `Verified handshake with "${targetUrl}" (${latencyMs}ms latency). App-to-app bridge ready.`,
      type: 'accounting',
    });

    return {
      success: true,
      message: `Connected to BoekhoudGemak application at ${targetUrl}`,
      latencyMs,
    };
  };

  // Sync Debtors & Relations from user's BoekhoudGemak app
  const syncDebtorsFromBoekhoudGemak = async () => {
    await new Promise((res) => setTimeout(res, 500));
    // Simulated fetched relations from BoekhoudGemak
    const newRelations = [
      { code: 'DEB-8041', name: 'Van Leeuwen Logistics B.V.', email: 'facturen@vanleeuwen.nl', vatNumber: 'NL842109876B01', defaultLedger: '8000' },
      { code: 'DEB-9120', name: 'Amstel HealthTech Group', email: 'finance@amstelhealth.nl', vatNumber: 'NL991204561B02', defaultLedger: '8000' },
      { code: 'DEB-3345', name: 'Rotterdam Port Automation N.V.', email: 'crediteuren@portautomation.nl', vatNumber: 'NL112349081B01', defaultLedger: '8000' },
      { code: 'DEB-5521', name: 'Keizersgracht Capital Partners', email: 'invoices@keizersgracht.nl', vatNumber: 'NL774512990B01', defaultLedger: '8000' },
      { code: 'DEB-7104', name: 'Delft Robotics Consortium B.V.', email: 'accounting@delftrobotics.nl', vatNumber: 'NL883401923B01', defaultLedger: '8000' },
    ];

    setBoekhoudgemakConfig((prev) => ({
      ...prev,
      debtorRelations: newRelations,
      lastHandshake: new Date().toISOString(),
    }));

    addNotification({
      title: 'Debtors Synced from BoekhoudGemak',
      message: `Loaded ${newRelations.length} relations from your BoekhoudGemak app.`,
      type: 'accounting',
    });

    return newRelations.length;
  };

  // Helper XML escape
  function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  // Slack Integration
  const updateSlackConfig = (cfg: Partial<SlackConfig>) => {
    setSlackConfig((prev) => ({ ...prev, ...cfg }));
  };

  const sendSlackMessage = (text: string, channel?: string) => {
    const targetChannel = channel || slackConfig.defaultChannel;
    setSlackConfig((prev) => ({
      ...prev,
      lastMessageSent: new Date().toISOString(),
    }));

    addNotification({
      title: `Slack Message -> ${targetChannel}`,
      message: text.replace(/[*_]/g, ''),
      type: 'slack',
    });
  };

  // Google Drive Integration
  const updateGoogleDriveConfig = (cfg: Partial<GoogleDriveConfig>) => {
    setGoogleDriveConfig((prev) => ({ ...prev, ...cfg }));
  };

  // GDPR Consent & Rights
  const saveGdprConsent = (consent: Partial<GDPRConsent>) => {
    const updated: GDPRConsent = {
      ...gdprConsent,
      ...consent,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
    };
    setGdprConsent(updated);
    localStorage.setItem('kopilot_gdpr_consent', JSON.stringify(updated));

    addNotification({
      title: 'GDPR Privacy Preferences Saved',
      message: 'Your consent preferences have been recorded in the audit log.',
      type: 'system',
    });
  };

  const exportGdprData = () => {
    const exportPayload = {
      exportMetadata: {
        system: 'Kopilot Projects',
        exportedAt: new Date().toISOString(),
        gdprArticle: 'Article 20 – Right to Data Portability',
        user: currentUser,
      },
      consentStatus: gdprConsent,
      projects: projects,
      tasks: tasks,
      timeEntries: timeEntries.filter((te) => te.userId === currentUser.id),
      boekhoudgemakSyncHistory: boekhoudgemakConfig.syncLogs,
      notifications: notifications,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kopilot-gdpr-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      title: 'GDPR Archive Downloaded',
      message: 'Your personal data archive (JSON) has been downloaded.',
      type: 'system',
    });
  };

  const purgeWorkspaceData = () => {
    localStorage.removeItem('kopilot_projects');
    localStorage.removeItem('kopilot_tasks');
    localStorage.removeItem('kopilot_time_entries');
    localStorage.removeItem('kopilot_boekhoudgemak');
    localStorage.removeItem('kopilot_slack');
    localStorage.removeItem('kopilot_gdrive');

    setProjects(mockProjects);
    setTasks(mockTasks);
    setTimeEntries([]);
    setBoekhoudgemakConfig(initialBoekhoudgemakConfig);

    addNotification({
      title: 'Workspace Purged (GDPR Article 17)',
      message: 'Personal entries purged. Default workspace reset.',
      type: 'system',
    });
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        toggleTheme,

        projects,
        tasks,
        timeEntries,
        users,
        currentUser,
        activeCollaborators,

        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,

        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        addCommentToTask,
        attachDriveFileToTask,

        addTimeEntry,
        deleteTimeEntry,

        boekhoudgemakConfig,
        updateBoekhoudgemakConfig,
        syncToBoekhoudgemak,
        exportExactXML,
        testAppConnection,
        syncDebtorsFromBoekhoudGemak,

        slackConfig,
        updateSlackConfig,
        sendSlackMessage,

        googleDriveConfig,
        updateGoogleDriveConfig,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,

        gdprConsent,
        saveGdprConsent,
        exportGdprData,
        purgeWorkspaceData,

        selectedProjectId,
        setSelectedProjectId,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
