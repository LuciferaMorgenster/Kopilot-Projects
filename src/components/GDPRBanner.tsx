import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Settings2, Check, X } from 'lucide-react';

export const GDPRBanner: React.FC = () => {
  const { t, gdprConsent, saveGdprConsent } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(gdprConsent.analyticsConsent);
  const [integrations, setIntegrations] = useState(gdprConsent.integrationsConsent);

  if (gdprConsent.consentGiven) {
    return null;
  }

  const handleAcceptAll = () => {
    saveGdprConsent({
      strictlyNecessary: true,
      analyticsConsent: true,
      integrationsConsent: true,
    });
  };

  const handleSaveCustom = () => {
    saveGdprConsent({
      strictlyNecessary: true,
      analyticsConsent: analytics,
      integrationsConsent: integrations,
    });
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3 flex-1">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-100">
              {t.gdpr.cookieBanner.title}
            </h4>
            <p className="text-slate-300 leading-relaxed max-w-3xl">
              {t.gdpr.cookieBanner.desc}
            </p>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 animate-in fade-in">
                <div className="flex items-start justify-between gap-3 p-2 rounded bg-slate-800/60">
                  <div>
                    <span className="font-semibold text-slate-200">{t.gdpr.cookieBanner.strictlyNecessary}</span>
                    <p className="text-[11px] text-slate-400">{t.gdpr.cookieBanner.strictlyNecessaryDesc}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 py-1">Required</span>
                </div>

                <div className="flex items-start justify-between gap-3 p-2 rounded bg-slate-800/60">
                  <div>
                    <span className="font-semibold text-slate-200">{t.gdpr.cookieBanner.analytics}</span>
                    <p className="text-[11px] text-slate-400">{t.gdpr.cookieBanner.analyticsDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-start justify-between gap-3 p-2 rounded bg-slate-800/60">
                  <div>
                    <span className="font-semibold text-slate-200">{t.gdpr.cookieBanner.integrations}</span>
                    <p className="text-[11px] text-slate-400">{t.gdpr.cookieBanner.integrationsDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={integrations}
                    onChange={(e) => setIntegrations(e.target.checked)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 inline mr-1" />
            <span>{showDetails ? 'Hide Options' : 'Customize'}</span>
          </button>

          {showDetails ? (
            <button
              onClick={handleSaveCustom}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              {t.gdpr.cookieBanner.savePreferences}
            </button>
          ) : (
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              {t.gdpr.cookieBanner.acceptAll}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
