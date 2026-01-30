import React, { useState } from 'react';
import { TaxData, ProcessedDocument } from '../types';
import { 
  IconCheck, 
  IconAlert, 
  IconClose, 
  IconFile, 
  IconBank, 
  IconChevronRight, 
  IconArrowLeft, 
  IconInfo, 
  IconMoney,
  IconUser,
  IconHistory
} from './Icons';
import { LiquidGlass, SurfaceOpaque } from './Material';

interface LiveModelPanelProps {
  data: TaxData;
  onReview: () => void;
  onNext: () => void;
  onUpdateField: (docId: string, fieldId: string, newValue: any) => void;
  onUndo?: () => void;
  onClose?: () => void;
  mode?: 'summary' | 'review' | 'final';
}

const DocIcon = ({ type, sourceType }: { type: string, sourceType?: string }) => {
  if (sourceType === 'Plaid') return <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><IconBank className="w-4 h-4" /></div>;
  if (sourceType === 'LastYear') return <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"><IconHistory className="w-4 h-4" /></div>;
  return <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40"><IconFile className="w-4 h-4" /></div>;
};

// Step 5: Typography - use HIG scale
const SectionHeader = ({ title, total }: { title: string, total: string }) => (
  <div className="flex items-center justify-between px-1 mb-2">
    <span className="text-hig-caption2 font-semibold text-white/40 uppercase tracking-widest">{title}</span>
    <span className="text-hig-caption2 font-mono text-white/60">{total}</span>
  </div>
);

// Step 4: Added focus-visible styles for keyboard accessibility
// Step 5: Updated typography to HIG scale
const FormSection = ({ title, value, icon, active, onClick }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl bg-white/[0.03] border transition-all group text-left relative overflow-hidden
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${active ? 'border-accent/30 shadow-[0_0_20px_rgba(251,191,36,0.05)]' : 'border-white/5 hover:border-white/20 hover:bg-white/[0.05]'}`}
    >
      <div className={`absolute inset-0 bg-accent/5 opacity-0 transition-opacity ${active ? 'opacity-100' : 'group-hover:opacity-50'}`} />
      <div className="relative flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
            {icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={`text-hig-footnote font-semibold transition-colors ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{title}</span>
            <span className="text-hig-caption2 text-white/30 group-hover:text-white/50 transition-colors">
              {value === '$0.00' ? 'Ready to start' : 'Edit'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-hig-footnote font-mono font-semibold transition-colors ${active ? 'text-accent' : 'text-white'}`}>{value}</span>
          <IconChevronRight className={`w-3 h-3 transition-all opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 ${active ? 'text-accent' : 'text-white/40'}`} aria-hidden="true" />
        </div>
      </div>
    </button>
  );

export const LiveModelPanel: React.FC<LiveModelPanelProps> = ({ 
  data, onReview, onNext, onUpdateField, onUndo, onClose, mode = 'summary' 
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const selectedDoc = data.vault.find(d => d.id === selectedDocId);

  // Phase 2: Optimization Card Logic
  const [optimizations, setOptimizations] = useState<{id: string, title: string, amount: string, reason: string, applied: boolean}[]>([
    { id: 'opt-1', title: 'Student Loan Interest', amount: '$4,200', reason: 'You paid interest to Nelnet', applied: false }
  ]);

  const handleApplyOptimization = (optId: string) => {
    setOptimizations(prev => prev.map(o => o.id === optId ? { ...o, applied: true } : o));
  };

  if (selectedDoc) {
    return (
      <div className="h-full flex flex-col gap-3">
        <LiquidGlass variant="regular" className="px-6 py-4 flex items-center justify-between border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedDocId(null)} className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-accent"><IconArrowLeft className="w-4 h-4" /></button>
            <h2 className="text-[13px] font-bold text-white">Document Details</h2>
          </div>
        </LiquidGlass>
        <SurfaceOpaque className="flex-1 rounded-xl border border-white/10 overflow-y-auto p-4 space-y-4">
           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
             <DocIcon type={selectedDoc.type} sourceType={selectedDoc.sourceType} />
             <div>
               <h3 className="text-sm font-bold text-white">{selectedDoc.name}</h3>
               <p className="text-[10px] text-white/30 uppercase tracking-widest">{selectedDoc.sourceType} • {selectedDoc.taxYear}</p>
             </div>
           </div>
           {selectedDoc.fields.map(field => (
             <div key={field.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{field.label}</span>
                 {field.status === 'WARN' && <span className="text-[8px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-black">CONFIRM</span>}
               </div>
               <input 
                 type="text" 
                 value={field.value} 
                 onChange={(e) => onUpdateField(selectedDoc.id, field.id, e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-accent/40"
               />
               <p className="text-[9px] text-white/20">Mapping: <span className="text-accent/60">{field.mapping || 'Unassigned'}</span></p>
             </div>
           ))}
        </SurfaceOpaque>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface1/50 backdrop-blur-xl border-l border-white/5 relative overflow-hidden transition-all duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            {mode === 'review' ? <IconCheck className="w-5 h-5" /> : <IconBank className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'review' ? 'Review & Optimize' : 'Tax Summary'}
            </h2>
            <p className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
              {mode === 'review' ? 'Maximize your refund' : 'Updates automatically'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60">
            <IconClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Optimization Cards (Phase 2) */}
        {mode === 'review' && optimizations.map(opt => !opt.applied && (
          <div key={opt.id} className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 relative overflow-hidden animate-in slide-in-from-right-4 duration-700">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <button
                type="button"
                className="group relative focus-visible:outline-none"
                aria-label="More information about this deduction"
              >
                <IconInfo className="w-12 h-12 text-accent group-hover:opacity-40 transition-opacity" />
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/90 text-white text-hig-caption2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-lg">
                  Based on your connected accounts
                </span>
              </button>
            </div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-accent text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  Potential Deduction
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{opt.title}</h3>
                <p className="text-sm text-white/60 mb-4">{opt.reason} • Could reduce tax by ~$520</p>
                
                <div className="flex gap-3">
                   <button
                     onClick={() => { handleApplyOptimization(opt.id); onUpdateField('system', 'optimization', opt.amount); }}
                     className="px-4 py-2 bg-accent text-black text-hig-caption1 font-semibold rounded-lg shadow-lg shadow-accent/20 hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                   >
                     Claim Deduction
                   </button>
                   <button
                      onClick={() => handleApplyOptimization(opt.id)}
                      className="px-4 py-2 bg-white/5 text-white/60 text-hig-caption1 font-semibold rounded-lg hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                   >
                     Not applicable
                   </button>
                </div>
             </div>
          </div>
        ))}

        {mode === 'final' && (
           <div className="p-5 rounded-2xl bg-ok/10 border border-ok/20 relative overflow-hidden animate-in slide-in-from-right-4 duration-700 mb-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-ok text-black flex items-center justify-center shadow-lg shadow-ok/20">
                    <IconCheck className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Return Ready</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                 Based on your <strong>8 verified documents</strong>, I'm confident this return is accurate.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-ok/60 uppercase tracking-widest border-t border-ok/10 pt-3">
                 <span>Audit Risk: Low</span>
                 <span>Max Refund: Yes</span>
              </div>
           </div>
        )}

        {/* Existing Sections - now interactive/editable */}
        <div className="space-y-3">
          <SectionHeader title="Income" total={data.incomeTotal} />
          {/* ... existing income items */}
          <FormSection 
            title="W-2 Income" 
            value={data.incomeTotal} 
            icon={<IconFile className="w-4 h-4" />} 
            active={data.currentStep === 'INCOME'}
            onClick={() => onUpdateField('system', 'step', 'INCOME')}
          />
        </div>

        <div className="space-y-3">
          <SectionHeader title="Deductions" total={data.deductionsTotal} />
          {/* ... existing deduction items */}
          <FormSection 
             title="Standard Deduction" 
             value="$14,600" 
             icon={<IconFile className="w-4 h-4" />}
             active={false}
             onClick={() => {}}
          />
           <FormSection 
             title="Mortgage & Property" 
             value={data.deductionsTotal} 
             icon={<IconBank className="w-4 h-4" />}
             active={data.currentStep === 'DEDUCTIONS'}
             onClick={() => onUpdateField('system', 'step', 'DEDUCTIONS')}
          />
          {(mode === 'review' || mode === 'final') && optimizations.map(opt => opt.applied && (
             <FormSection 
               key={opt.id}
               title={opt.title}
               value={opt.amount}
               icon={<IconCheck className="w-4 h-4 text-accent" />}
               active={true}
               onClick={() => {}}
             />
          ))}
        </div>

        {mode === 'final' && (
           <div className="space-y-3 pt-4 border-t border-white/5">
             <SectionHeader title="Summary" total="" />
             <div className="flex justify-between text-sm text-white/60 px-4">
                <span>Tax Owed</span>
                <span>$8,200</span>
             </div>
             <div className="flex justify-between text-sm text-white/60 px-4">
                <span>Withholding</span>
                <span>$15,670</span>
             </div>
           </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Estimated Refund</span>
          <span className="text-2xl font-bold text-ok tabular-nums tracking-tight">{data.estRefund}</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
           <div className="h-full bg-ok w-[65%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
        </div>

        {mode === 'review' ? (
           <button
             type="button"
             onClick={onNext}
             className="w-full py-4 rounded-xl bg-ok text-black font-semibold text-hig-subhead hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ok focus-visible:ring-offset-2 focus-visible:ring-offset-black"
           >
             <span>Confirm & File</span>
             <IconCheck className="w-4 h-4" aria-hidden="true" />
           </button>
        ) : mode === 'final' ? (
           <button
             type="button"
             onClick={onNext}
             className="w-full py-4 rounded-xl bg-ok text-black font-semibold text-hig-subhead hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ok focus-visible:ring-offset-2 focus-visible:ring-offset-black"
           >
             <span>Propel to Filing</span>
             <IconCheck className="w-4 h-4" aria-hidden="true" />
           </button>
        ) : (
           <button
             type="button"
             onClick={onReview}
             className="w-full py-4 rounded-xl bg-accent text-black font-semibold text-hig-subhead hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(251,191,36,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
           >
             Review Tax Return
           </button>
        )}
      </div>
    </div>
  );
};
