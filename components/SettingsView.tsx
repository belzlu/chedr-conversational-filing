import React, { useState, useEffect } from 'react';
import { IconUser, IconCheck, IconClose } from './Icons';
import { LiquidGlass, SurfaceOpaque } from './Material';

interface SettingsViewProps {
  onToggleTestMode: (enabled: boolean) => void;
  isTestMode: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onToggleTestMode, isTestMode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-hig-largeTitle font-bold text-white">Settings</h1>
        <p className="text-hig-body text-white/60">Manage your preferences and account configuration.</p>
      </div>

      {/* Account Section */}
      <section className="space-y-4">
        <h2 className="text-hig-headline font-semibold text-white/40 uppercase tracking-widest text-xs">Account</h2>
        <SurfaceOpaque className="rounded-xl overflow-hidden border border-white/5">
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                 <IconUser className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-hig-body font-medium text-white">John Doe</div>
                 <div className="text-hig-caption1 text-white/40">john.doe@example.com</div>
               </div>
             </div>
             <button className="text-hig-blue text-hig-subhead font-medium hover:opacity-80">Edit</button>
          </div>
        </SurfaceOpaque>
      </section>

      {/* Developer Section */}
      <section className="space-y-4">
        <h2 className="text-hig-headline font-semibold text-white/40 uppercase tracking-widest text-xs">Developer & QA</h2>
        <SurfaceOpaque className="rounded-xl overflow-hidden border border-white/5">
           <div className="p-4 flex items-center justify-between bg-white/[0.02]">
             <div>
               <div className="text-hig-body font-medium text-white">Test Mode</div>
               <div className="text-hig-caption1 text-white/40">Bypass phone verification and use mock data.</div>
             </div>
             <button 
               onClick={() => onToggleTestMode(!isTestMode)}
               className={`w-12 h-7 rounded-full transition-colors relative ${isTestMode ? 'bg-hig-green' : 'bg-white/10'}`}
             >
               <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isTestMode ? 'translate-x-5' : 'translate-x-0'}`} />
             </button>
           </div>
        </SurfaceOpaque>
        {isTestMode && (
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
             <strong>Test Mode Active:</strong> Phone verification will be skipped. Data will not be persisted to server.
          </div>
        )}
      </section>
      
      <div className="flex-1" />
      
      <div className="flex justify-center">
         <p className="text-hig-caption2 text-white/20">Chedr v2.5.0 (Build 2026.01.30)</p>
      </div>
    </div>
  );
};
