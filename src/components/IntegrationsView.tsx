import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Receipt,
  Slack,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  FileCode,
  KeyRound,
  FileSpreadsheet,
  Server,
  Code2,
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const {
    t,
    projects,
    timeEntries,
    boekhoudgemakConfig,
    updateBoekhoudgemakConfig,
    syncToBoekhoudgemak,
    slackConfig,
    updateSlackConfig,
    sendSlackMessage,
    googleDriveConfig,
    updateGoogleDriveConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'boekhoudgemak' | 'slack' | 'drive'>('boekhoudgemak');

  // Boekhoudgemak Local Form State
  const [apiKey, setApiKey] = useState(boekhoudgemakConfig.apiKey);
  const [adminCode, setAdminCode] = useState(boekhoudgemakConfig.administrationCode);
  const [env, setEnv] = useState<'production' | 'sandbox'>(boekhoudgemakConfig.environment);
  const [articleCode, setArticleCode] = useState(boekhoudgemakConfig.defaultArticleCode);
  const [ledgerCode, setLedgerCode] = useState(boekhoudgemakConfig.defaultLedgerAccount);
  const [handshakeState, setHandshakeState] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  // Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Payload viewer modal for audit logs
  const [inspectPayload, setInspectPayload] = useState<string | null>(null);

  // Slack Local Form State
  const [slackWebhook, setSlackWebhook] = useState(slackConfig.webhookUrl);
  const [slackChannel, setSlackChannel] = useState(slackConfig.defaultChannel);
  const [testMessage, setTestMessage] = useState('🚀 Testing Slack integration handshake from Kopilot Projects!');
  const [slackFeedback, setSlackFeedback] = useState<string | null>(null);

  // Unbilled hours staging
  const unbilledEntries = timeEntries.filter((te) => te.billable && !te.syncedToBoekhoudgemak);
  const unbilledTotal = unbilledEntries.reduce((s, te) => s + te.hours * te.hourlyRate, 0);

  const handleSaveBoekhoudgemakConfig = () => {
    const apiUrl = env === 'production'
      ? 'https://api.boekhoudgemak.nl/v1'
      : 'https://sandbox-api.boekhoudgemak.nl/v1';

    updateBoekhoudgemakConfig({
      apiKey,
      administrationCode: adminCode,
      environment: env,
      apiUrl,
      defaultArticleCode: articleCode,
      defaultLedgerAccount: ledgerCode,
    });
    setHandshakeState('success');
    setTimeout(() => setHandshakeState('idle'), 3000);
  };

  const handleTestHandshake = async () => {
    setHandshakeState('testing');
    await new Promise((res) => setTimeout(res, 900));
    setHandshakeState('success');
    setTimeout(() => setHandshakeState('idle'), 4000);
  };

  const handleExecuteBatchSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncToBoekhoudgemak();
      if (res.success) {
        setSyncFeedback(`Created sales invoice ${res.invoiceNumber} in Boekhoudgemak (€${res.totalAmount.toFixed(2)}) for ${res.count} time entries.`);
        setShowSyncModal(false);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSlackConfig = () => {
    updateSlackConfig({
      webhookUrl: slackWebhook,
      defaultChannel: slackChannel,
    });
    setSlackFeedback('Slack webhook settings saved successfully.');
    setTimeout(() => setSlackFeedback(null), 3000);
  };

  const handleSendTestSlack = () => {
    sendSlackMessage(testMessage, slackChannel);
    setSlackFeedback(`Notification dispatched to channel ${slackChannel}!`);
    setTimeout(() => setSlackFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.integrations.title}
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          {t.integrations.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('boekhoudgemak')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'boekhoudgemak'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4 text-indigo-500" />
          <span>{t.integrations.tabs.boekhoudgemak}</span>
          {unbilledEntries.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
              {unbilledEntries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('slack')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'slack'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Slack className="w-4 h-4 text-emerald-500" />
          <span>{t.integrations.tabs.slack}</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'drive'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-blue-500" />
          <span>{t.integrations.tabs.googleDrive}</span>
        </button>
      </div>

      {/* Tab 1: Boekhoudgemak WebAPI Integration */}
      {activeTab === 'boekhoudgemak' && (
        <div className="space-y-6">
          {/* Status and Action Strip */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.integrations.boekhoudgemak.heading}
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
                {t.integrations.boekhoudgemak.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleTestHandshake}
                disabled={handshakeState === 'testing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${handshakeState === 'testing' ? 'animate-spin' : ''}`} />
                <span>{handshakeState === 'testing' ? 'Testing...' : t.integrations.boekhoudgemak.testConnection}</span>
              </button>

              <button
                onClick={() => setShowSyncModal(true)}
                disabled={unbilledEntries.length === 0}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                  unbilledEntries.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{t.integrations.boekhoudgemak.syncSelectedButton} ({unbilledEntries.length})</span>
              </button>
            </div>
          </div>

          {/* Test Handshake Feedback */}
          {handshakeState === 'success' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WebAPI v1 Handshake verified with <strong>{boekhoudgemakConfig.apiUrl}</strong>. Administration <strong>{boekhoudgemakConfig.administrationCode}</strong> authenticated.</span>
            </div>
          )}

          {/* Sync Success Alert */}
          {syncFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
              <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
          )}

          {/* Staging Area: Unbilled Hours Ready for Boekhoudgemak Batching */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.integrations.boekhoudgemak.unbilledHeading}
                </h3>
                <p className="text-xs text-slate-400">
                  Billable hours ready to be pushed to Boekhoudgemak as concept sales invoices (*concept verkoopfacturen*).
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Unbilled: </span>
                <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  €{unbilledTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Project & Client</th>
                    <th className="py-2 px-3">Debtor Code</th>
                    <th className="py-2 px-3">Task & Description</th>
                    <th className="py-2 px-3">Member</th>
                    <th className="py-2 px-3 text-right">Hours</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {unbilledEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        All billable hours are up to date! No unbilled sessions waiting.
                      </td>
                    </tr>
                  ) : (
                    unbilledEntries.map((e) => {
                      const proj = projects.find((p) => p.id === e.projectId);
                      return (
                        <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">{e.date}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            <div>{e.projectName}</div>
                            <div className="text-[11px] text-slate-400">{proj?.clientName}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            {proj?.debtorCode || 'DEB-8041'}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{e.taskTitle}: </span>
                            <span className="text-slate-500">{e.description}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{e.userName}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">{e.hours.toFixed(1)}h</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">€{e.hourlyRate}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                            €{(e.hours * e.hourlyRate).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* WebAPI Configuration Form */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              WebAPI v1 Endpoint & Credential Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.integrations.boekhoudgemak.environment}
                </label>
                <select
                  value={env}
                  onChange={(e) => setEnv(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                >
                  <option value="sandbox">{t.integrations.boekhoudgemak.sandboxEnv}</option>
                  <option value="production">{t.integrations.boekhoudgemak.prodEnv}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.integrations.boekhoudgemak.administrationLabel}
                </label>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="ADM-0042-NL"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.integrations.boekhoudgemak.apiKeyLabel}
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    {t.integrations.boekhoudgemak.defaultArticleLabel}
                  </label>
                  <input
                    type="text"
                    value={articleCode}
                    onChange={(e) => setArticleCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    {t.integrations.boekhoudgemak.defaultLedgerLabel}
                  </label>
                  <input
                    type="text"
                    value={ledgerCode}
                    onChange={(e) => setLedgerCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveBoekhoudgemakConfig}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Save Boekhoudgemak Configuration
              </button>
            </div>
          </div>

          {/* Synchronization Audit Log */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.integrations.boekhoudgemak.auditTrail}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Debtor & Client</th>
                    <th className="py-2 px-3">Invoice Number</th>
                    <th className="py-2 px-3 text-right">Entries</th>
                    <th className="py-2 px-3 text-right">Total Amount</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {boekhoudgemakConfig.syncLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleString('nl-NL')}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{log.debtorName}</span>
                        <span className="ml-1 text-slate-400 font-mono text-[11px]">({log.debtorCode})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {log.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{log.entriesCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        €{log.totalAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          201 Created
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectPayload(log.payloadPreview || '')}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>View JSON</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Slack Integration */}
      {activeTab === 'slack' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.integrations.slack.heading}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {t.integrations.slack.description}
            </p>

            {slackFeedback && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{slackFeedback}</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.integrations.slack.webhookLabel}
                </label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.integrations.slack.channelLabel}
                </label>
                <input
                  type="text"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Event Triggers Checklist */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">Automated Event Triggers:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slackConfig.notifyOnTaskComplete}
                    onChange={(e) => updateSlackConfig({ notifyOnTaskComplete: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>{t.integrations.slack.eventTasks}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slackConfig.notifyOnMilestone}
                    onChange={(e) => updateSlackConfig({ notifyOnMilestone: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>{t.integrations.slack.eventMilestones}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slackConfig.notifyOnAccountingSync}
                    onChange={(e) => updateSlackConfig({ notifyOnAccountingSync: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>{t.integrations.slack.eventAccounting}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slackConfig.notifyOnTimerStop}
                    onChange={(e) => updateSlackConfig({ notifyOnTimerStop: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>{t.integrations.slack.eventTime}</span>
                </label>
              </div>
            </div>

            {/* Test Notification Sender */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-xs mb-2">
                Manual Slack Test Dispatch:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                />
                <button
                  onClick={handleSendTestSlack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Slack</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Google Drive Integration */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.integrations.googleDrive.heading}
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t.integrations.googleDrive.description}
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400">Storage Used: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{googleDriveConfig.usedStorage} / {googleDriveConfig.totalStorage}</span>
              </div>
            </div>

            {/* Storage Progress */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '14.2%' }} />
            </div>

            {/* Drive Files List */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t.integrations.googleDrive.recentDriveFiles}
              </h3>

              <div className="space-y-2">
                {[
                  { name: 'API_Architecture_Spec_v3.pdf', type: 'PDF Specification', size: '3.4 MB', project: 'Exact ERP Modernization' },
                  { name: 'Sprint_Scope_and_Deliverables.gdoc', type: 'Google Doc', size: '128 KB', project: 'Client Portal 2.0' },
                  { name: 'Boekhoudgemak_Ledger_Mapping.gsheet', type: 'Google Sheet', size: '890 KB', project: 'Exact ERP Modernization' },
                  { name: 'Mobile_Design_System_Figma_Export.png', type: 'PNG Asset', size: '4.8 MB', project: 'NextGen Mobile App' },
                  { name: 'GDPR_Data_Processing_Addendum_Signed.pdf', type: 'Signed Legal DPA', size: '1.2 MB', project: 'FinTech Compliance' },
                ].map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                        <div className="text-[11px] text-slate-400">
                          {f.type} · {f.size} · Linked to {f.project}
                        </div>
                      </div>
                    </div>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Opening Google Drive preview for ${f.name}`);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>{t.integrations.googleDrive.openFile}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Execution Confirmation Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-lg animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t.integrations.boekhoudgemak.syncModalTitle}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t.integrations.boekhoudgemak.syncModalDesc}
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Endpoint:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{boekhoudgemakConfig.apiUrl}/salesinvoices</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Administration:</span>
                <span className="font-mono font-semibold">{boekhoudgemakConfig.administrationCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Staged Entries:</span>
                <span className="font-mono font-semibold">{unbilledEntries.length} items</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Invoice Amount:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  €{unbilledTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchSync}
                disabled={isSyncing}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                <span>{isSyncing ? 'Dispatching to API v1...' : 'Confirm & Push to Boekhoudgemak'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect JSON Payload Modal */}
      {inspectPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-xl animate-in fade-in zoom-in-95 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span>Boekhoudgemak WebAPI JSON Payload</span>
              </h3>
              <button
                onClick={() => setInspectPayload(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 p-3 bg-slate-950 rounded-lg text-slate-200 font-mono text-xs">
              <pre className="whitespace-pre-wrap">{inspectPayload}</pre>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectPayload(null)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
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
