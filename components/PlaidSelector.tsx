
import React, { useEffect, useRef } from 'react';
// Fix: Added IconSecure to imports
import { IconBank, IconClose, IconCheck, IconMoney, IconHistory, IconSecure } from './Icons';
import { LiquidGlass, SurfaceOpaque } from './Material';

interface PlaidSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (banks: string[]) => void;
}

const BANKS = [
  { id: 'chase', name: 'Chase Bank', icon: 'CB' },
  { id: 'bofa', name: 'Bank of America', icon: 'BA' },
  { id: 'wells', name: 'Wells Fargo', icon: 'WF' },
  { id: 'capital', name: 'Capital One', icon: 'CO' },
  { id: 'amzn', name: 'Amazon Prime Card', icon: 'AM' }
];

export const PlaidSelector: React.FC<PlaidSelectorProps> = ({ isOpen, onClose, onSync }) => {
  const [selected, setSelected] = React.useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Step 2: Esc key handler for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus first bank option when modal opens
    setTimeout(() => firstButtonRef.current?.focus(), 100);

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    // Step 2: Added ARIA attributes for accessibility
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plaid-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()} // Click outside to close
    >
      <LiquidGlass
        ref={modalRef}
        variant="regular"
        className="w-full max-w-lg overflow-hidden flex flex-col border-white/15 shadow-2xl rounded-2xl"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <IconBank className="w-5 h-5" />
            </div>
            <div>
              <h3 id="plaid-modal-title" className="text-hig-headline font-semibold text-white/95">Connect via Plaid</h3>
              <p className="text-hig-caption2 text-white/40 mt-0.5">Securely connect your financial accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-h-[400px]">
          <div className="space-y-3">
            {BANKS.map((bank, index) => (
              <button
                type="button"
                key={bank.id}
                ref={index === 0 ? firstButtonRef : undefined}
                onClick={() => toggle(bank.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black ${selected.includes(bank.id) ? 'bg-white/10 border-accent/40' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
                aria-pressed={selected.includes(bank.id) ? "true" : "false"}
              >
                <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center font-black text-hig-caption2 text-white/40">
                  {bank.icon}
                </div>
                <span className={`flex-1 text-left text-hig-subhead font-semibold ${selected.includes(bank.id) ? 'text-white' : 'text-white/60'}`}>{bank.name}</span>
                {selected.includes(bank.id) && <IconCheck className="w-4 h-4 text-accent" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex flex-col gap-4 bg-surface1/30">
          {/* Step 14: Simplified security messaging - sentence case, not alarming */}
          <div className="flex items-center gap-2 text-hig-caption1 text-white/40 justify-center">
            <IconSecure className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Your data is encrypted and secure</span>
          </div>

          {/* Step 2: Added Cancel button and improved button layout */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-hig-subhead font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onSync(selected)}
              className="flex-[2] h-12 rounded-xl bg-hig-blue text-hig-subhead font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Connect & Sync
            </button>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
};
