import React, { useState, useEffect } from 'react';
import { IconBank, IconClose, IconCheck, IconSecure, IconIdentity, IconIncome, IconDeductions, IconChevronDown, IconChevronRight } from './Icons';
import { LiquidGlass } from './Material';
import { BANK_COVERAGE_DATA, PlaidCoverage } from '../types';

interface PlaidSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (banks: string[]) => void;
}

interface BankOption {
  id: string;
  name: string;
  coverage: PlaidCoverage;
}

const BANKS: BankOption[] = [
  { id: 'chase', name: 'Chase', coverage: BANK_COVERAGE_DATA['chase'] },
  { id: 'bofa', name: 'Bank of America', coverage: BANK_COVERAGE_DATA['bofa'] },
  { id: 'wells', name: 'Wells Fargo', coverage: BANK_COVERAGE_DATA['wells'] },
  { id: 'fidelity', name: 'Fidelity', coverage: BANK_COVERAGE_DATA['fidelity'] },
  { id: 'capital_one', name: 'Capital One', coverage: BANK_COVERAGE_DATA['capital_one'] },
];

// Softer, Apple HIG-compliant icon colors
const ICON_COLOR = 'text-amber-500/60'; // Softer amber instead of harsh orange

// Coverage icons with tooltips - only shows if available
const CoverageIcons: React.FC<{ coverage: PlaidCoverage; showLabels?: boolean }> = ({ coverage, showLabels }) => {
  const hasIdentity = coverage.identity.coverage >= 2;
  const hasIncome = coverage.income.coverage >= 2;
  const hasDeductions = coverage.deductions.coverage >= 1;

  if (!hasIdentity && !hasIncome && !hasDeductions) return null;

  return (
    <div className="flex items-center gap-1.5">
      {hasIdentity && (
        <div className={`w-4 h-4 ${ICON_COLOR}`} title="Identity verification">
          <IconIdentity className="w-full h-full" />
        </div>
      )}
      {hasIncome && (
        <div className={`w-4 h-4 ${ICON_COLOR}`} title="Income data">
          <IconIncome className="w-full h-full" />
        </div>
      )}
      {hasDeductions && (
        <div className={`w-4 h-4 ${ICON_COLOR}`} title="Deduction tracking">
          <IconDeductions className="w-full h-full" />
        </div>
      )}
      {showLabels && (
        <span className="text-white/30 text-[10px] ml-1">
          {[hasIdentity && 'ID', hasIncome && 'Income', hasDeductions && 'Deductions'].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  );
};

// Compact bank row for collapsed view
const BankRow: React.FC<{
  bank: BankOption;
  isSelected: boolean;
  onToggle: () => void;
  isExpanded: boolean;
}> = ({ bank, isSelected, onToggle, isExpanded }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      isSelected
        ? 'bg-white/8 ring-1 ring-amber-500/30'
        : 'hover:bg-white/4'
    }`}
  >
    {/* Checkbox */}
    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors shrink-0 ${
      isSelected ? 'border-amber-500 bg-amber-500' : 'border-white/25'
    }`}>
      {isSelected && <IconCheck className="w-2.5 h-2.5 text-white" />}
    </div>

    {/* Bank name */}
    <span className={`flex-1 text-left text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
      {bank.name}
    </span>

    {/* Coverage icons */}
    {isExpanded && <CoverageIcons coverage={bank.coverage} />}
  </button>
);

// Icon legend component
const IconLegend: React.FC = () => (
  <div className="flex items-center justify-center gap-4 text-[10px] text-white/40 py-2 border-t border-white/5">
    <div className="flex items-center gap-1">
      <IconIdentity className={`w-3 h-3 ${ICON_COLOR}`} />
      <span>Identity</span>
    </div>
    <div className="flex items-center gap-1">
      <IconIncome className={`w-3 h-3 ${ICON_COLOR}`} />
      <span>Income</span>
    </div>
    <div className="flex items-center gap-1">
      <IconDeductions className={`w-3 h-3 ${ICON_COLOR}`} />
      <span>Deductions</span>
    </div>
  </div>
);

// Main inline component with progressive disclosure
export const PlaidInline: React.FC<{ onSync: (banks: string[]) => void }> = ({ onSync }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const selectAll = () => setSelected(prev =>
    prev.length === BANKS.length ? [] : BANKS.map(b => b.id)
  );

  const visibleBanks = isExpanded ? BANKS : BANKS.slice(0, 3);
  const hasMore = BANKS.length > 3;

  return (
    <div className="w-full max-w-md mt-3 rounded-xl bg-[#1C1C1E]/80 border border-white/8 animate-in fade-in slide-in-from-bottom-2 overflow-hidden">
      {/* Header - clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <IconBank className="w-3.5 h-3.5 text-amber-500/80" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white/90">Connect Bank</h3>
            {!isExpanded && selected.length > 0 && (
              <p className="text-[11px] text-white/40">{selected.length} selected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); selectAll(); }}
              className="text-[11px] font-medium text-amber-500/80 hover:text-amber-500 px-2 py-1 rounded transition-colors"
            >
              {selected.length === BANKS.length ? 'Clear' : 'All'}
            </button>
          )}
          <div className={`text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <IconChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Expandable bank list */}
      <div className={`transition-all duration-200 ease-out overflow-hidden ${
        isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-3 pb-2 space-y-0.5">
          {visibleBanks.map(bank => (
            <BankRow
              key={bank.id}
              bank={bank}
              isSelected={selected.includes(bank.id)}
              onToggle={() => toggle(bank.id)}
              isExpanded={isExpanded}
            />
          ))}

          {/* Show more button */}
          {hasMore && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full text-center py-2 text-[11px] text-white/40 hover:text-white/60 transition-colors"
            >
              +{BANKS.length - 3} more banks
            </button>
          )}
        </div>

        {/* Icon legend */}
        <IconLegend />

        {/* Connect button */}
        <div className="px-3 pb-3 pt-2">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => onSync(selected)}
            className="w-full h-10 rounded-lg bg-amber-500/90 text-sm font-semibold text-white hover:bg-amber-500 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {selected.length === 0
              ? 'Select banks to connect'
              : selected.length === 1
                ? `Connect ${BANKS.find(b => b.id === selected[0])?.name}`
                : `Connect ${selected.length} banks`
            }
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-white/30">
            <IconSecure className="w-3 h-3" />
            <span>256-bit encryption · Plaid secure</span>
          </div>
        </div>
      </div>

      {/* Collapsed quick-select preview */}
      {!isExpanded && (
        <div className="px-3 pb-3">
          <div className="flex gap-1.5 mb-2">
            {BANKS.slice(0, 4).map(bank => (
              <button
                key={bank.id}
                type="button"
                onClick={() => toggle(bank.id)}
                className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-medium transition-all ${
                  selected.includes(bank.id)
                    ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/40'
                    : 'bg-white/5 text-white/60 hover:bg-white/8'
                }`}
              >
                {bank.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => selected.length > 0 && onSync(selected)}
            className="w-full h-9 rounded-lg bg-amber-500/90 text-sm font-semibold text-white hover:bg-amber-500 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {selected.length === 0 ? 'Select a bank' : `Connect${selected.length > 1 ? ` (${selected.length})` : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

// Modal version
export const PlaidSelector: React.FC<PlaidSelectorProps> = ({ isOpen, onClose, onSync }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const selectAll = () => setSelected(prev =>
    prev.length === BANKS.length ? [] : BANKS.map(b => b.id)
  );

  useEffect(() => { if (isOpen) setSelected([]); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e: React.MouseEvent) => e.target === e.currentTarget && onClose()}
    >
      <LiquidGlass variant="regular" className="w-full max-w-md overflow-hidden rounded-2xl border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <IconBank className="w-4.5 h-4.5 text-amber-500/80" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white/95">Connect via Plaid</h3>
              <p className="text-[11px] text-white/40">Securely sync your accounts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Bank list */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-white/40 font-medium">Popular banks</span>
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-medium text-amber-500/80 hover:text-amber-500 transition-colors"
            >
              {selected.length === BANKS.length ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="space-y-0.5">
            {BANKS.map(bank => (
              <BankRow
                key={bank.id}
                bank={bank}
                isSelected={selected.includes(bank.id)}
                onToggle={() => toggle(bank.id)}
                isExpanded={true}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <IconLegend />

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/8 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onSync(selected)}
              className="flex-[2] h-10 rounded-lg bg-amber-500/90 text-sm font-semibold text-white hover:bg-amber-500 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {selected.length === 0
                ? 'Select banks'
                : `Connect ${selected.length} bank${selected.length > 1 ? 's' : ''}`
              }
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30">
            <IconSecure className="w-3 h-3" />
            <span>256-bit encryption · Powered by Plaid</span>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
};
