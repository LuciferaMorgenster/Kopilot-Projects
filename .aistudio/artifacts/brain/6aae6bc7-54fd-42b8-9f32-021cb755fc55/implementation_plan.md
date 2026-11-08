# Kopilot Projects – Enterprise Collaborative Project Management & Accounting Hub

A modern, responsive, GDPR-compliant SaaS project management platform featuring real-time collaboration, multi-view execution (Kanban, Gantt timeline, dense task list), detailed billable time tracking, productivity analytics, integrations with Slack and Google Drive, and direct WebAPI sync with Boekhoudgemak accounting.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and will govern the system architecture and visual direction:

- **Confirmed Aesthetic Direction**: Modern SaaS style with sleek light and dark mode, using clean border surfaces, high-contrast typography, and strict Tailwind CSS v4 `@custom-variant dark` support.
- **Confirmed Visualization Architecture**: Triple-view workspace providing seamless toggling between an interactive drag-and-drop Kanban board, milestone-driven Gantt timeline, and high-density sorting data list.
- **Confirmed Boekhoudgemak Integration**: Direct WebAPI v1 connection (`api.boekhoudgemak.nl/v1`) with live sync for logged billable hours into draft sales invoices (*concept verkoopfacturen*), debtor relation linking, and synchronization audit trails.
- **Default Language & Localization**: Default English interface with immediate instant switching to Dutch (Nederlands), with full i18n across all views, forms, notifications, and export templates.
- **GDPR / AVG Compliance**: Integrated privacy center, granular consent modal, full data portability (JSON export), and right-to-erasure workflows.
- **Social & SEO Assets**: Production-ready OpenGraph and Twitter card configuration with dedicated cover image generation displayed in both social metadata and `README.md`.

---

## 1. Overview & Core Concept

- **What It Does**: Kopilot Projects is an all-in-one collaborative workspace that bridges project delivery with financial accounting. Teams manage tasks across sprint boards, plan milestones along dynamic Gantt schedules, track time with precision live timers, collaborate with simulated real-time peer presence, receive instant Slack notifications, attach Google Drive assets, and seamlessly push billable work directly to Boekhoudgemak for automated client invoicing.
- **Target Audience / Persona**: Agile software teams, digital agencies, consultancies, engineering leads, project managers, and financial controllers who need to track project progress and convert hours into accountant-verified billables without context switching.
- **Key Value**: Eliminates the disconnect between task execution and client billing. Teams capture hours in flow, managers monitor project health and velocity in real time, and accountants receive synchronized sales invoices in Boekhoudgemak with zero manual data re-entry.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Project Health Hub**:
   - High-level KPI strip with tabular figures: Active Projects, Open Sprint Tasks, Billable Hours (current week), and Boekhoudgemak Sync Status.
   - Quick-action bar: New Project, New Task, Start Live Stopwatch, and Trigger Accounting Sync.
   - Live activity stream showing real-time peer actions, status changes, and recent Slack dispatches.

2. **Project Execution (Kanban, Gantt, and List Views)**:
   - **Kanban Board**: Drag-and-drop cards across Backlog, In Progress, Review, and Done. Cards display clean unboxed metadata (priority, assignee, billable indicator, due date, estimated vs actual hours). Active collaborator presence avatars highlight who is viewing or updating tasks.
   - **Gantt Timeline**: Interactive schedule view displaying project phases, critical paths, milestone markers, task duration bars, and progress percentage sliders.
   - **Dense Data List**: High-density table with sorting, quick inline status updates, filter by assignee/label, and batch actions.

3. **Time Tracking & Productivity Analytics**:
   - Floating stopwatch timer in the top header with one-click play/pause, billable toggle, client selection, and task attribution.
   - Weekly timesheet calendar matrix allowing rapid manual entry and review.
   - Visual productivity dashboard: Billable vs non-billable distribution, member burn rate, budget consumption gauge, and CSV export.

4. **Integrations Hub (Slack, Google Drive, Boekhoudgemak)**:
   - **Boekhoudgemak WebAPI v1**: Connection status indicator, environment toggle (Production / Sandbox), API Key & Administration Code inputs, debtor relation mapping, and 1-click "Sync Billable Hours to Invoices" modal with live progress and audit logs.
   - **Slack Dispatcher**: Webhook configuration, channel selector (`#general`, `#dev-team`, `#billing`), event triggers (task completed, milestone reached, timer logged), and manual "Share to Slack" message composer.
   - **Google Drive Hub**: File manager with folder mapping per project, simulated Google Drive picker modal, document type badges (Docs, Sheets, Slides, Drive folders), and direct external links.

5. **GDPR / AVG Privacy & Security Center**:
   - Cookie & privacy preference banner with granular categories (Essential, Functional, Analytics, Integrations).
   - Dedicated Privacy Center accessible from the user menu: Export Personal Data (GDPR Article 20 JSON download), Delete My Account / Erase Data (Article 17 Right to Erasure), and Data Processing Agreement (DPA) log.

6. **Language & Theme Switching**:
   - Instant header toggle for English (default) and Dutch (Nederlands).
   - Seamless Light / Dark theme switch with Tailwind CSS v4 custom variant styling.

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: Modern, high-density SaaS workspace inspired by Linear and Stripe. Structured borders, subtle surface elevations, crisp typography, and restrained accent usage.
- **Color System (60-30-10 Rule)**:
  - *Canvas (60%)*: Neutral clean canvas (`#090D16` dark / `#F8FAFC` light).
  - *Structural Surfaces (30%)*: Subdued card surfaces (`#111827` dark / `#FFFFFF` light) with subtle 1px hairline dividers (`rgba(255,255,255,0.08)` dark / `rgba(0,0,0,0.08)` light).
  - *Accent Budget (10%)*: Electric Indigo (`#4F46E5` / `#6366F1`) for primary actions and active states; Emerald (`#10B981`) for completed tasks and active timers; Amber (`#F59E0B`) for reviews and warning states.
- **Typography**:
  - *Display & Navigation*: Plus Jakarta Sans (`font-sans`) for structural authority and crisp legibility.
  - *Prose & Form Fields*: Plus Jakarta Sans with 14px–15px base size and generous line height.
  - *Data & Timers*: Monospace with tabular numerals (`font-mono tabular-nums`, JetBrains Mono / SF Mono fallback) for stopwatch tickers, hourly rates, financial invoice amounts, and date stamps.
- **Motion & Micro-Interactions**:
  - Instant transitions ($\le 180\text{ms}$) on modal reveals, tab switches, and dropdown menus.
  - Smooth optimistic status updates when dragging tasks or logging time.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Boekhoudgemak WebAPI v1 Integration Model**
  - *Chosen Approach*: Implement an enterprise-grade API client and staging engine targeting `https://api.boekhoudgemak.nl/v1` (with sandbox fallback). Users configure credentials, preview unbilled hours grouped by project and debtor, and dispatch automated `POST /v1/salesinvoices` batches with detailed item lines and ledger account codes.
  - *Why*: Direct API synchronization matches real-world business workflows, eliminating manual CSV export/import steps while maintaining transparent audit trails.
  - *Alternatives Considered*: Pure CSV export was considered too manual for high-velocity teams; direct API with live batch staging provides maximum flexibility.

- **Decision 2: Dual-Theme Architecture with Tailwind CSS v4**
  - *Chosen Approach*: Declare `@custom-variant dark (&:where(.dark, .dark *));` in `src/index.css` with persistent `localStorage` theme state synced to `document.documentElement`.
  - *Why*: Guarantees that dark-mode classes work predictably without relying on OS media queries alone, preventing visual contrast mismatches.

- **Decision 3: Complete English & Dutch i18n Architecture**
  - *Chosen Approach*: Centralized TypeScript translation dictionaries (`en` and `nl`) loaded into a lightweight, type-safe React context hook (`useTranslation`), with language persistence.
  - *Why*: Ensures instant client-side switching with zero page reloads while guaranteeing 100% string coverage across tasks, accounting terminology, GDPR legal clauses, and notifications.

- **Decision 4: SEO, OpenGraph & Cover Asset Delivery**
  - *Chosen Approach*: Generate a bespoke 16:9 social cover image using `generate_image`, place it in the public asset directory, reference it in `index.html` OpenGraph/Twitter card tags (`og:image`, `twitter:image`), and feature it prominently in the English `README.md`.
  - *Why*: Delivers professional social cards for LinkedIn and Facebook shares while fulfilling all SEO and documentation criteria.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Kopilot Projects Workspace                      │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   Top Navigation Bar  │  │ Breadcrumbs · Global Timer · Language  │ │
│  │   Brand: Kopilot      │  │ NL/EN Toggle · Theme Switch · Profile   │ │
│  └───────────────────────┘  └────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Workspace Navigation: Dashboard │ Kanban │ Gantt │ List │ Time    │ │
│  │                     Analytics │ Integrations │ GDPR Center        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌───────────────────────────────┬──────────────────────────────────┐  │
│  │  Main Viewport                │  Real-Time Activity Drawer       │  │
│  │  • Kanban Board (DnD)         │  • Active Collaborator Presence  │  │
│  │  • Gantt Milestones           │  • Live Notification Feed        │  │
│  │  • Dense Data Grid            │  • Slack Webhook Broadcasts      │  │
│  │  • Timesheet Calendar & Logs  │  • Google Drive File Activity    │  │
│  └───────────────────────────────┴──────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  External Integrations & Sync Layer                              │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │ │
│  │  │ Boekhoudgemak v1 │  │  Slack Webhooks  │  │ Google Drive Sync│ │ │
│  │  │ Direct WebAPI    │  │  Channel Dispatches│  │ Attachments &   │ │ │
│  │  │ Invoices & Hours │  │  & Activity Sync │  │ Cloud Folders    │ │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Data Persistence & Privacy Layer                                │ │
│  │  • LocalStorage / IndexedDB with Simulated Peer Sync Bus          │ │
│  │  • GDPR Audit Logs · Data Portability Export · Consent Storage   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models

- **Project**: `id`, `name`, `code`, `clientName`, `debtorCode` (Boekhoudgemak ID), `color`, `budgetHours`, `hourlyRate`, `status` (`planning`, `active`, `review`, `completed`), `startDate`, `endDate`.
- **Task**: `id`, `projectId`, `title`, `description`, `status` (`backlog`, `todo`, `in_progress`, `review`, `done`), `priority` (`low`, `medium`, `high`, `urgent`), `assignee` (name, avatar, email), `estimatedHours`, `loggedHours`, `billable`, `dueDate`, `attachments` (Google Drive links), `comments` count.
- **TimeEntry**: `id`, `taskId`, `projectId`, `userId`, `userName`, `description`, `date`, `hours`, `billable`, `hourlyRate`, `syncedToBoekhoudgemak`, `boekhoudgemakInvoiceId`, `createdAt`.
- **BoekhoudgemakConfig**: `apiUrl`, `apiKey`, `administrationCode`, `autoSync`, `defaultArticleCode`, `defaultLedgerAccount`, `syncLogs` (`id`, `timestamp`, `entriesCount`, `totalAmount`, `status`, `responsePayload`).
- **SlackConfig**: `webhookUrl`, `channel`, `notifyOnTaskComplete`, `notifyOnMilestone`, `notifyOnTimerStop`, `enabled`.
- **GoogleDriveConfig**: `rootFolderId`, `syncEnabled`, `recentFiles` list.
- **GDPRSettings**: `cookieConsentGiven`, `consentedCategories` (`essential`, `analytics`, `integrations`), `consentDate`, `auditLog`.

### Interactive Component & State Mapping

- **Top Bar**: Houses the live running stopwatch counter (`useTimer`), project selector, quick-create modal button, language switcher (`EN` / `NL`), and dark/light mode toggle.
- **Kanban View**: Columns with interactive drag-and-drop or 1-click status transitions, task creation, filtering by assignee/priority/project, and card detail drawer.
- **Gantt View**: Timeline visualization with month/week scale zoom, milestone markers, task duration bars with drag-resize simulation, and progress completion sliders.
- **Time Tracking View**: Weekly interactive timesheet grid + detailed log table with billable filters, date pickers, hourly rate calculator, and "Export to CSV" / "Sync to Boekhoudgemak".
- **Integrations Panel**: Tabbed configuration interface for Boekhoudgemak WebAPI, Slack Webhooks, and Google Drive files with live test dispatch buttons and error diagnostics.
- **GDPR Privacy Center**: Consent manager, raw JSON data export button (`kopilot-gdpr-data.json`), and right-to-be-forgotten action modal.

---

## Implementation Steps Planned for Turn 3

1. **Asset Generation**: Call `generate_image` to create the high-resolution 16:9 social cover image for Kopilot Projects.
2. **SEO & Social Setup**: Configure `index.html` with title, meta description, OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`), Twitter card tags, and Schema.org `WebApplication` structured data. Update `metadata.json`.
3. **Core Application Implementation**:
   - Internationalization system (`src/i18n.ts`) with English & Dutch translations.
   - Comprehensive mock store with rich seed data for projects, tasks, time entries, clients, and team members (`src/data/mockData.ts`).
   - Reusable UI components adhering strictly to the SaaS visual guidelines and anti-slop rules (unboxed metadata, clean typography, tabular figures).
   - Interactive Kanban, Gantt, and List views.
   - Stopwatch timer and timesheet system.
   - Integrations panel for Boekhoudgemak WebAPI v1, Slack, and Google Drive.
   - Analytics & productivity reports with charts and export tools.
   - GDPR / AVG cookie consent banner and Privacy & Security Center.
4. **Documentation**: Write a complete English `README.md` featuring the generated cover image, system architecture, integration setup guide, and GDPR compliance documentation.
5. **Compilation & Verification**: Run `compile_applet` and `lint_applet` to ensure zero compilation or syntax errors.
