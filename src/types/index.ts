export type Language = 'en' | 'nl';
export type Theme = 'dark' | 'light';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status?: 'active' | 'busy' | 'away';
  currentTaskId?: string;
}

export interface DriveAttachment {
  id: string;
  name: string;
  mimeType: 'document' | 'spreadsheet' | 'presentation' | 'folder' | 'pdf' | 'image';
  size: string;
  webViewLink: string;
  iconUrl?: string;
  modifiedTime: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assignee: User;
  estimatedHours: number;
  loggedHours: number;
  billable: boolean;
  dueDate: string;
  startDate?: string;
  tags: string[];
  attachments: DriveAttachment[];
  comments: TaskComment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  debtorCode: string; // Boekhoudgemak Debtor ID (e.g. "DEB-1002")
  description: string;
  color: string;
  budgetHours: number;
  hourlyRate: number; // in EUR
  status: 'planning' | 'active' | 'review' | 'completed';
  startDate: string;
  endDate: string;
  driveFolderId?: string;
  driveFolderName?: string;
  slackChannel?: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  description: string;
  date: string;
  hours: number;
  billable: boolean;
  hourlyRate: number;
  syncedToBoekhoudgemak: boolean;
  boekhoudgemakInvoiceId?: string;
  createdAt: string;
}

export interface BoekhoudgemakSyncLog {
  id: string;
  timestamp: string;
  entriesCount: number;
  totalHours: number;
  totalAmount: number;
  debtorCode: string;
  debtorName: string;
  invoiceNumber: string;
  status: 'success' | 'failed' | 'pending';
  endpoint: string;
  message: string;
  payloadPreview?: string;
}

export interface BoekhoudgemakConfig {
  apiUrl: string;
  environment: 'production' | 'sandbox';
  apiKey: string;
  administrationCode: string;
  autoSync: boolean;
  defaultArticleCode: string; // e.g. "HOUR-DEV"
  defaultLedgerAccount: string; // e.g. "8000" (Omzet verkopen)
  lastSyncTime?: string;
  syncLogs: BoekhoudgemakSyncLog[];
}

export interface SlackConfig {
  webhookUrl: string;
  defaultChannel: string;
  notifyOnTaskComplete: boolean;
  notifyOnMilestone: boolean;
  notifyOnTimerStop: boolean;
  notifyOnAccountingSync: boolean;
  enabled: boolean;
  lastMessageSent?: string;
}

export interface GoogleDriveConfig {
  connected: boolean;
  rootFolderId: string;
  rootFolderName: string;
  usedStorage: string;
  totalStorage: string;
  autoSyncTaskAttachments: boolean;
}

export interface GDPRConsent {
  consentGiven: boolean;
  strictlyNecessary: boolean; // always true
  analyticsConsent: boolean;
  integrationsConsent: boolean; // Slack & Google Drive webhook/auth
  consentTimestamp?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task' | 'slack' | 'drive' | 'accounting' | 'system';
  actionUrl?: string;
}

export interface ActiveCollaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'viewing' | 'editing';
  currentSection: string;
  lastPing: number;
}
