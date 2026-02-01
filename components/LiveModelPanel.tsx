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

// Standardized card icons
const DocIcon = ({ type, sourceType }: { type: string, sourceType?: string }) => {
  const baseClasses = "w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center";

  if (sourceType === 'Plaid') return <div className={`${baseClasses} text-green-400`}><IconBank className="w-4 h-4" /></div>;
  if (sourceType === 'LastYear') return <div className={`${baseClasses} text-white/60`}><IconHistory className="w-4 h-4" /></div>;
  return <div className={`${baseClasses} text-white/40`}><IconFile className="w-4 h-4" /></div>;
};

const SectionHeader = ({ title, total }: { title: string, total: string }) => (
  <div className="flex items-center justify-between px-1 mb-2 mt-4">
    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{title}</span>
    <span className="text-[13px] font-mono text-white/60 tabular-nums">{total}</span>
  </div>
);

const FormSection = ({ title, value, icon, active, onClick, verified }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-center justify-between group
        ${active 
          ? 'bg-white/[0.08] border-white/20 shadow-sm' 
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
          active ? 'bg-chedr-orange/20 text-chedr-orange' : 'bg-white/[0.06] text-white/40 group-hover:text-white/60'
        }`}>
          {icon}
        </div>
        <div>
          <span className="text-[14px] text-white/90 font-medium block leading-tight">{title}</span>
          {verified && <span className="text-[10px] text-green-400 font-medium mt-0.5 block">Verified</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[14px] text-white/80 tabular-nums font-mono">{value}</span>
        <IconChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
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
      <div className="h-full flex flex-col bg-chedr-background-secondary">
        <header className="px-4 py-3 flex items-center gap-3 border-b border-white/10 sticky top-0 bg-chedr-background-secondary/80 backdrop-blur-md z-10">
           <button onClick={() => setSelectedDocId(null)} className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors">
             <IconArrowLeft className="w-4 h-4" />
           </button>
           <span className="text-[13px] font-semibold text-white/90">Document Details</span>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {/* Header Card */}
           <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex items-center gap-4">
             <DocIcon type={selectedDoc.type} sourceType={selectedDoc.sourceType} />
             <div>
               <h3 className="text-[15px] font-semibold text-white">{selectedDoc.name}</h3>
               <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">{selectedDoc.sourceType}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[11px] text-white/40 font-mono">{selectedDoc.taxYear}</span>
               </div>
             </div>
           </div>

           {/* Fields List */}
           <div className="space-y-3">
             <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1">Extracted Data</div>
             {selectedDoc.fields.map(field => (
               <div key={field.id} className="group p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/5 transition-colors">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">{field.label}</span>
                   {field.status === 'WARN' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold tracking-wide">CHECK</span>}
                 </div>
                 <input 
                   type="text" 
                   value={field.value} 
                   onChange={(e) => onUpdateField(selectedDoc.id, field.id, e.target.value)}
                   className="w-full bg-transparent border-b border-white/10 py-1 text-[14px] text-white font-mono outline-none focus:border-chedr-orange/50 transition-colors placeholder:text-white/20"
                 />
                 <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-white/20 font-medium">Mapping Target</span>
                    <span className="text-[10px] text-chedr-orange/80 font-mono bg-chedr-orange/10 px-1.5 py-0.5 rounded">{field.mapping || 'Unassigned'}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="h-full flex flex-col bg-chedr-background-secondary border-l border-white/[0.06]"
      role="region"
      aria-labelledby="live-panel-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-inner ${
            mode === 'review' ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-white/60'
          }`}>
            {mode === 'review' ? <IconCheck className="w-5 h-5" /> : <IconBank className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="live-panel-heading" className="text-[15px] font-semibold text-white tracking-tight">
              {mode === 'review' ? 'Review & Optimize' : 'Tax Summary'}
            </h2>
            <p className="text-[11px] text-white/40 font-medium">
              {mode === 'review' ? 'Maximize your refund' : 'FY 2025 • Draft'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white/40 transition-colors"
            aria-label="Close panel"
          >
            <IconClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Optimization Card (Phase 2) */}
        {mode === 'review' && optimizations.map(opt => !opt.applied && (
          <article key={opt.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 p-5 transition-all">
             {/* Left accent strip */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
             
             <div className="relative z-10 pl-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 relative" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Opportunity Found</span>
                </div>
                
                <h3 className="text-[16px] font-semibold text-white mb-1">{opt.title}</h3>
                <p className="text-[13px] text-white/60 mb-4 leading-relaxed">{opt.reason} • Est. Value: <span className="text-white font-medium">$520</span></p>
                
                <div className="flex gap-3">
                   <button
                     onClick={() => { handleApplyOptimization(opt.id); onUpdateField('system', 'optimization', opt.amount); }}
                     className="px-4 py-2 bg-orange-500 text-black text-[12px] font-bold rounded-lg hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                   >
                     Apply Deduction
                   </button>
                   <button
                      onClick={() => handleApplyOptimization(opt.id)}
                      className="px-4 py-2 bg-transparent text-white/40 text-[12px] font-medium rounded-lg hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                   >
                     Dismiss
                   </button>
                </div>
             </div>
          </article>
        ))}

        {mode === 'final' && (
           <div className="p-5 rounded-xl bg-green-500/[0.08] border border-green-500/20 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 text-black">
                    <IconCheck className="w-5 h-5" />
                 </div>
                 <h3 className="text-[15px] font-bold text-white">Return Ready</h3>
              </div>
              <p className="text-[13px] text-white/70 leading-relaxed pl-11">
                 All documents verified. Audit risk is low.
              </p>
           </div>
        )}

        {/* Form Sections */}
        <div>
          <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2 mt-4 flex justify-between items-center">
             <span>Income</span>
             <span className="text-[13px] font-mono text-white/60 tabular-nums">{data.incomeTotal}</span>
          </h3>
          <div className="space-y-2">
            <FormSection 
              title="W-2 Income" 
              value={data.incomeTotal} 
              icon={<IconFile className="w-4 h-4" />} 
              active={data.currentStep === 'INCOME'}
              verified={true}
              onClick={() => onUpdateField('system', 'step', 'INCOME')}
            />
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2 mt-4 flex justify-between items-center">
             <span>Deductions</span>
             <span className="text-[13px] font-mono text-white/60 tabular-nums">{data.deductionsTotal}</span>
          </h3>
          <div className="space-y-2">
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
                icon={<IconCheck className="w-4 h-4" />}
                active={true}
                verified={true}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>

        {mode === 'final' && (
           <div className="space-y-3 pt-6 mt-2 border-t border-white/[0.06]">
             <div className="flex justify-between text-[13px] text-white/50 px-2">
                <span>Tax Owed</span>
                <span className="font-mono">$8,200</span>
             </div>
             <div className="flex justify-between text-[13px] text-white/50 px-2">
                <span>Withholding</span>
                <span className="font-mono">$15,670</span>
             </div>
           </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/[0.06] bg-chedr-background-secondary/40">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Estimated Refund</span>
          <span className="text-[24px] font-semibold text-green-400 tabular-nums tracking-tight">{data.estRefund}</span>
        </div>

        {mode === 'review' ? (
           <button
             type="button"
             onClick={onNext}
             className="w-full py-3 rounded-xl bg-white text-black font-bold text-[14px] hover:bg-gray-200 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
           >
             Confirm & File
           </button>
        ) : mode === 'final' ? (
           <button
             type="button"
             onClick={onNext}
             className="w-full py-3 rounded-xl bg-green-500 text-black font-bold text-[14px] hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
           >
             Submit Return
           </button>
        ) : (
           <button
             type="button"
             onClick={onReview}
             className="w-full py-3 rounded-xl bg-white/[0.08] text-white font-semibold text-[14px] hover:bg-white/[0.12] transition-colors border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
           >
             Review Tax Return
           </button>
        )}
      </div>
    </section>
  );
};
