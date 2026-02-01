import React, { useState } from 'react';
import { IconUser, IconChevronRight } from './Icons';

interface SettingsViewProps {
  onToggleTestMode: (enabled: boolean) => void;
  isTestMode: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onToggleTestMode, isTestMode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-chedr-background">
      {/* Header */}
      <header>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-[13px] text-white/50 mt-1">
          Manage your preferences and account.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {/* Account */}
        <section aria-labelledby="account-heading">
          <h2 id="account-heading" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2">Account</h2>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 divide-y divide-white/10 overflow-hidden">
            <button type="button" className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors group focus-visible:outline-none focus-visible:bg-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-hig-blue/15 flex items-center justify-center">
                <IconUser className="w-5 h-5 text-hig-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] text-white font-medium group-hover:text-white transition-colors">John Doe</div>
                <div className="text-[12px] text-white/50">john.doe@example.com</div>
              </div>
              <IconChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section aria-labelledby="prefs-heading">
          <h2 id="prefs-heading" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2">Preferences</h2>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 divide-y divide-white/10 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <span id="push-notifs-label" className="text-[15px] text-white font-medium">Push Notifications</span>
              <button
                role="switch"
                aria-checked={notificationsEnabled}
                aria-labelledby="push-notifs-label"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-[51px] h-[31px] rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-green-500 ${notificationsEnabled ? 'bg-green-500' : 'bg-white/20'}`}
              >
                <span className="sr-only">{notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
                <div className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-transform duration-200 ${notificationsEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Developer */}
        <section aria-labelledby="dev-heading">
          <h2 id="dev-heading" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2">Developer</h2>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 divide-y divide-white/10 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div id="test-mode-label" className="text-[15px] text-white font-medium">Test Mode</div>
                <div className="text-[12px] text-white/40">Skip verification, use mock data</div>
              </div>
              <button
                role="switch"
                aria-checked={isTestMode}
                aria-labelledby="test-mode-label"
                onClick={() => onToggleTestMode(!isTestMode)}
                className={`w-[51px] h-[31px] rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-green-500 ${isTestMode ? 'bg-green-500' : 'bg-white/20'}`}
              >
                <span className="sr-only">{isTestMode ? 'Enabled' : 'Disabled'}</span>
                <div className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-transform duration-200 ${isTestMode ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
          {isTestMode && (
            <p className="text-[11px] text-orange-400 mt-2 px-1 font-medium" role="alert">
              Test mode active. Data won't persist.
            </p>
          )}
        </section>

        {/* About */}
        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2">About</h2>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 divide-y divide-white/10 overflow-hidden">
            <button type="button" className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors group focus-visible:outline-none focus-visible:bg-white/[0.06]">
              <span className="text-[15px] text-white font-medium">Privacy Policy</span>
              <IconChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </button>
            <button type="button" className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors group focus-visible:outline-none focus-visible:bg-white/[0.06]">
              <span className="text-[15px] text-white font-medium">Terms of Service</span>
              <IconChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </button>
          </div>
        </section>
      </div>

      <div className="flex-1" />

      <p className="text-[11px] text-white/20 text-center pt-6 pb-2">
        Chedr v2.5.0
      </p>
    </div>
  );
};
