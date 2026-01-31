
import React from 'react';
import { IconClock, IconSettings, IconUser, IconMenu, IconFile, IconBank, IconHistory, IconChevronRight } from './Icons';

interface SidebarProps {
  state: 'expanded' | 'rail';
  onToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onToggle, activeView, onViewChange }) => {
  const isRail = state === 'rail';

// Apple HIG: Sidebar Nav Item with accessibility
  // Updated: Outline active state instead of solid fill for less visual weight
  const NavItem = ({ icon: Icon, label, id, active = false }: any) => (
    <button
      type="button"
      onClick={() => onViewChange(id)}
      className={`
      w-full flex items-center gap-[12px] px-3 py-3 rounded-[10px] text-hig-footnote font-medium transition-all group
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black
      ${active
        ? 'bg-transparent border border-hig-blue/40 text-white'
        : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'}
      ${isRail ? 'justify-center px-0' : ''}
    `}>
      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-hig-blue' : 'text-white/50 group-hover:text-white'}`} style={{ width: '20px', height: '20px' }} aria-hidden="true" />
      {!isRail && <span className="truncate tracking-normal">{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className={`p-6 flex items-center ${isRail ? 'justify-center' : 'justify-between'} mb-2`}>
        {!isRail && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-hig-blue flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="font-semibold tracking-tight text-white text-[16px]">Chedr</span>
          </div>
        )}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" aria-label="Toggle Navigation">
          <IconMenu className="w-5 h-5" />
        </button>
      </div>

      <div className={`flex-1 ${isRail ? 'px-2' : 'px-4'} space-y-6 overflow-y-auto`}>
        <div className="space-y-1">
          {!isRail && <h3 className="px-3 mb-2 text-hig-caption2 text-white/40 font-medium">Workspace</h3>}
          <div className="flex flex-col gap-1">
            <NavItem id="chat" icon={IconClock} label="Tax Filings 2025" active={activeView === 'chat'} />
            <NavItem id="vault" icon={IconFile} label="Document Vault" active={activeView === 'vault'} />
            <NavItem id="dashboard" icon={IconBank} label="Finance Dashboard" active={activeView === 'dashboard'} />
          </div>
        </div>

        <div className="h-px bg-white/10 mx-2" /> 

        <div className="space-y-1">
          {!isRail && <h3 className="px-3 mb-2 text-hig-caption2 text-white/40 font-medium">History</h3>}
          <div className="flex flex-col gap-1">
            <NavItem id="history_24" icon={IconHistory} label="FY 2024" />
            <NavItem id="history_23" icon={IconHistory} label="FY 2023" />
          </div>
        </div>

        <div className="h-px bg-white/10 mx-2" />

        <div className="space-y-1">
          {!isRail && <h3 className="px-3 mb-2 text-hig-caption2 text-white/40 font-medium">Account</h3>}
          <div className="flex flex-col gap-1">
            <NavItem id="profile" icon={IconUser} label="Profile" active={activeView === 'profile'} />
            <NavItem id="settings" icon={IconSettings} label="Settings" active={activeView === 'settings'} />
          </div>
        </div>
      </div>

      {/* Step 9: Profile area with hover state and chevron */}
      <button
        type="button"
        onClick={() => onViewChange('profile')}
        className={`p-4 mt-auto border-t border-white/10 flex w-full transition-colors hover:bg-white/5 group
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-inset
          ${isRail ? 'justify-center' : 'items-center gap-3'}`}
      >
        <div className="w-8 h-8 rounded-full bg-hig-gray5 flex items-center justify-center text-hig-caption2 font-semibold text-white shrink-0">JD</div>
        {!isRail && (
          <>
            <div className="flex flex-col min-w-0 flex-1 text-left">
              <span className="text-hig-footnote font-medium text-white/90 truncate">John Doe</span>
              <span className="text-hig-caption2 text-hig-blue font-semibold uppercase tracking-wide">Active Filing</span>
            </div>
            <IconChevronRight className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
};
