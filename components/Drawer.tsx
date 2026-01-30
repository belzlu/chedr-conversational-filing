import React from 'react';
import { IconClose, IconFile, IconUpload } from './Icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  onAction: (action: string) => void;
  children?: React.ReactNode;
  title?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onUpload, onAction, children, title = "Context & Actions" }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className={`
        fixed left-4 right-4 bottom-4 max-w-[980px] mx-auto 
        rounded-[22px] border border-stroke bg-[#0a0a0e]/90 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)]
        z-50 overflow-hidden transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
        ${isOpen ? 'translate-y-0' : 'translate-y-[120%]'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-[13px] font-[650] text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-accent/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
            {title}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {children ? (
          <div className="max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        ) : (
          <div className="p-3.5 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-3.5">
            {/* Upload Card */}
            <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-3">
              <h3 className="m-0 mb-2 text-[13px] text-white/90 font-medium">Upload documents</h3>
              <p className="m-0 mb-2.5 text-xs text-white/60 leading-relaxed">
                Drop files here or choose from your computer. In this prototype, uploads are simulated.
              </p>
              
              <div 
                onClick={() => { onUpload(); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-[14px] border border-dashed border-white/20 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white/80 transition-colors">
                    <IconUpload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] text-white/90 font-[650]">Add a document</div>
                    <div className="text-[11px] text-white/50">W-2, 1099, PDF, Images</div>
                  </div>
                </div>
                <div className="text-[10px] px-2 py-1 rounded-full border border-ok/30 bg-ok/10 text-ok">
                  Simulate
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="border border-white/10 bg-white/[0.04] rounded-2xl p-3">
              <h3 className="m-0 mb-2 text-[13px] text-white/90 font-medium">Common actions</h3>
              <div className="flex flex-wrap gap-2">
                 {[
                   { label: 'Set status: Single', id: 'status_single' },
                   { label: 'Set status: Married', id: 'status_married' },
                   { label: 'Add dependent', id: 'add_dep' },
                   { label: 'Mark section done', id: 'mark_done' },
                 ].map(action => (
                   <button
                     key={action.id}
                     onClick={() => { onAction(action.id); onClose(); }}
                     className="border border-stroke bg-white/[0.06] text-white/80 px-2.5 py-1.5 rounded-full text-xs hover:bg-white/[0.1] active:translate-y-[1px] transition-all"
                   >
                     {action.label}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
