import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Download,
  Trash2,
  FileCheck,
  History,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const PrivacyCenterView: React.FC = () => {
  const {
    t,
    gdprConsent,
    saveGdprConsent,
    exportGdprData,
    purgeWorkspaceData,
    currentUser,
  } = useApp();

  const [analytics, setAnalytics] = useState(gdprConsent.analyticsConsent);
  const [integrations, setIntegrations] = useState(gdprConsent.integrationsConsent);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleUpdatePreferences = () => {
    saveGdprConsent({
      strictlyNecessary: true,
      analyticsConsent: analytics,
      integrationsConsent: integrations,
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  const handleConfirmPurge = () => {
    purgeWorkspaceData();
    setShowPurgeConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.gdpr.title}
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          {t.gdpr.subtitle}
        </p>
      </div>

      {saveFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your privacy preferences have been updated and timestamped.</span>
        </div>
      )}

      {/* 2-Column Grid: Rights & Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Article 20 – Data Portability */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Download className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.gdpr.rights.portabilityTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.gdpr.rights.portabilityDesc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={exportGdprData}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.gdpr.rights.exportButton}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Article 17 – Right to Erasure */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.gdpr.rights.erasureTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.gdpr.rights.erasureDesc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.gdpr.rights.purgeButton}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consent Management Form */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Consent Preference Center
        </h3>

        <div className="space-y-3 text-xs">
          {/* Strictly necessary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{t.gdpr.cookieBanner.strictlyNecessary}</span>
              <p className="text-[11px] text-slate-500">{t.gdpr.cookieBanner.strictlyNecessaryDesc}</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Active
            </span>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{t.gdpr.cookieBanner.analytics}</span>
              <p className="text-[11px] text-slate-500">{t.gdpr.cookieBanner.analyticsDesc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Integrations */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{t.gdpr.cookieBanner.integrations}</span>
              <p className="text-[11px] text-slate-500">{t.gdpr.cookieBanner.integrationsDesc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations}
                onChange={(e) => setIntegrations(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleUpdatePreferences}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Update Consent Preferences
          </button>
        </div>
      </div>

      {/* DPA & European Security Posture */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            {t.gdpr.rights.dpaTitle}
          </h3>
        </div>
        <p className="text-slate-500 leading-relaxed">
          {t.gdpr.rights.dpaDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Data Controller</span>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentUser.name}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Jurisdiction</span>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">European Union (AVG/GDPR)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Boekhoudgemak API Encryption</span>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">TLS 1.3 / AES-256</div>
          </div>
        </div>
      </div>

      {/* Purge Modal Confirmation */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold">Confirm Right to Erasure</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              This action will purge all local project workspace entries, custom tasks, and reset the environment according to GDPR Article 17 requirements.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-xs"
              >
                Yes, Purge Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
