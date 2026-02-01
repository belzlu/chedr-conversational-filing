
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

  // Apple HIG-aligned Navigation Item
  const NavItem = ({ icon: Icon, label, id, active = false }: any) => (
    <button
      type="button"
      onClick={() => onViewChange(id)}
      className={`
        relative group flex items-center w-full rounded-md transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue/50
        ${isRail ? 'justify-center p-2' : 'px-3 py-2 gap-3'}
        ${active 
          ? 'bg-white/10 text-white shadow-sm' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'}
      `}
      title={isRail ? label : undefined}
    >
      <Icon 
        className={`
          shrink-0 transition-colors duration-200
          ${isRail ? 'w-5 h-5' : 'w-[18px] h-[18px]'}
          ${active ? 'text-hig-blue' : 'text-white/50 group-hover:text-white/80'}
        `} 
        aria-hidden="true" 
      />
      {!isRail && (
        <span className="text-[14px] font-medium leading-5 tracking-tight truncate">
          {label}
        </span>
      )}
      
      {/* Active Indicator for Rail */}
      {isRail && active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-hig-blue rounded-r-full" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header / Toggle */}
      <div className={`flex items-center shrink-0 h-14 ${isRail ? 'justify-center px-0' : 'justify-between px-3'} mb-2`}>
        {!isRail && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-hig-blue to-orange-600 flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-semibold text-[15px] text-white tracking-tight">Chedr</span>
          </div>
        )}
        <button 
          onClick={onToggle}
          className={`
            rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors
            ${isRail ? 'p-2' : 'p-1.5'}
          `}
          aria-label={isRail ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <IconMenu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden px-2">
        
        {/* Workspace Group */}
        <div className="space-y-0.5">
          {!isRail && (
            <div className="px-3 py-1.5 mb-0.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Workspace
            </div>
          )}
          <NavItem id="chat" icon={IconClock} label="Tax Filings 2025" active={activeView === 'chat'} />
          <NavItem id="vault" icon={IconFile} label="Document Vault" active={activeView === 'vault'} />
          <NavItem id="dashboard" icon={IconBank} label="Finance Dashboard" active={activeView === 'dashboard'} />
        </div>

        {/* History Group */}
        <div className="space-y-0.5">
          {!isRail && (
            <div className="px-3 py-1.5 mb-0.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
              History
            </div>
          )}
          <NavItem id="history_24" icon={IconHistory} label="FY 2024" />
          <NavItem id="history_23" icon={IconHistory} label="FY 2023" />
        </div>

        <div className="flex-1" /> {/* Spacer */}

        {/* Account Group */}
        <div className="space-y-0.5 mb-2">
           {!isRail && (
            <div className="px-3 py-1.5 mb-0.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
              System
            </div>
          )}
          <NavItem id="profile" icon={IconUser} label="Profile" active={activeView === 'profile'} />
          <NavItem id="settings" icon={IconSettings} label="Settings" active={activeView === 'settings'} />
        </div>
      </div>

      {/* User Profile - Compact Footing */}
      <div className="p-2 border-t border-white/[0.06] mt-auto">
        <button
          type="button"
          onClick={() => onViewChange('profile')}
          className={`
            flex items-center w-full p-2 rounded-lg transition-colors hover:bg-white/5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue/50
            ${isRail ? 'justify-center' : 'gap-3'}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-hig-gray4 to-hig-gray5 ring-1 ring-white/10 flex items-center justify-center shrink-0">
             <span className="text-[11px] font-semibold text-white/90">JD</span>
          </div>
          
          {!isRail && (
            <>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-[13px] font-medium text-white/90 truncate">John Doe</span>
                <span className="text-[11px] text-white/40 truncate">Free Plan</span>
              </div>
              <IconChevronRight className="w-3.5 h-3.5 text-white/20" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
