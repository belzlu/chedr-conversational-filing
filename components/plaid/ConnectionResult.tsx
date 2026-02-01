import React from 'react';
import { PlaidConnectionResult } from '../../types';
import { CoverageBadge } from './CoverageBadge';
import { IconCheck, IconFile } from '../Icons';

interface ConnectionResultProps {
  result: PlaidConnectionResult;
  onAddAnother?: () => void;
  onContinue?: () => void;
  aiNarration?: string;
}

export const ConnectionResult: React.FC<ConnectionResultProps> = ({
  result,
  onAddAnother,
  onContinue,
  aiNarration,
}) => {
  const { bankName, documentsFound, coverage } = result;

  // Calculate coverage levels for display
  const identityCoverage = coverage.identity.complete ? 4 : coverage.identity.found.length;
  const incomeCoverage = coverage.income.count;
  const deductionsCoverage = coverage.deductions.count;

  return (
    <div className="w-full max-w-lg p-5 rounded-2xl bg-white/[0.03] border border-white/10 animate-in fade-in slide-in-from-bottom-2">
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-hig-green/20 flex items-center justify-center">
          <IconCheck className="w-5 h-5 text-hig-green" />
        </div>
        <div>
          <h3 className="text-hig-callout font-semibold text-white">
            Connected to {bankName}!
          </h3>
          <p className="text-hig-caption1 text-white/50">
            {documentsFound.length} document{documentsFound.length !== 1 ? 's' : ''} imported
          </p>
        </div>
      </div>

      {/* Coverage Mini-Matrix */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
        <div className="space-y-3">
          {/* Identity Row */}
          <div className="flex items-center justify-between">
            <span className="text-hig-footnote font-medium text-white/80">IDENTITY</span>
            <div className="flex items-center gap-2">
              <CoverageBadge coverage={identityCoverage} size="sm" showLabel={false} />
              <span className="text-hig-caption1 text-hig-green">
                {coverage.identity.complete ? '✓ Complete' : `${coverage.identity.found.length} fields`}
              </span>
            </div>
          </div>

          {/* Income Row */}
          <div className="flex items-center justify-between">
            <span className="text-hig-footnote font-medium text-white/80">INCOME</span>
            <div className="flex items-center gap-2">
              <CoverageBadge coverage={incomeCoverage} size="sm" showLabel={false} />
              <span className="text-hig-caption1 text-white/50">
                {coverage.income.count} of {coverage.income.total} types found
              </span>
            </div>
          </div>

          {/* Deductions Row */}
          <div className="flex items-center justify-between">
            <span className="text-hig-footnote font-medium text-white/80">DEDUCTIONS</span>
            <div className="flex items-center gap-2">
              <CoverageBadge coverage={deductionsCoverage} size="sm" showLabel={false} />
              <span className="text-hig-caption1 text-white/50">
                {coverage.deductions.types.length > 0
                  ? coverage.deductions.types.join(', ')
                  : 'None found'}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-4" />

        {/* Documents List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <IconFile className="w-4 h-4 text-white/40" />
            <span className="text-hig-caption1 font-medium text-white/60">Documents imported:</span>
          </div>
          {documentsFound.map((doc, i) => (
            <div key={i} className="flex items-center justify-between pl-6">
              <span className="text-hig-caption1 text-white/70">
                {doc.form || doc.type}
              </span>
              <span className="text-hig-caption1 font-medium text-white">
                {doc.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Narration */}
      {aiNarration && (
        <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 mb-4">
          <p className="text-hig-footnote text-white/80 leading-relaxed">
            💬 {aiNarration}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onAddAnother && (
          <button
            type="button"
            onClick={onAddAnother}
            className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-hig-subhead font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            Add Brokerage
          </button>
        )}
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="flex-[2] h-11 rounded-xl bg-hig-blue text-hig-subhead font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};

// Helper to create mock connection result for demo
export const createMockConnectionResult = (bankId: string): PlaidConnectionResult => {
  const bankData: Record<string, PlaidConnectionResult> = {
    chase: {
      bankId: 'chase',
      bankName: 'Chase Bank',
      success: true,
      documentsFound: [
        { type: 'W-2', form: 'W-2', amount: '$92,400' },
        { type: 'Interest', form: '1099-INT', amount: '$340' },
        { type: 'Mortgage', form: '1098', amount: '$12,400' },
      ],
      coverage: {
        identity: { complete: true, found: ['Name', 'Address', 'SSN'] },
        income: { count: 3, total: 4, types: ['W-2', '1099-INT', '1099-MISC'] },
        deductions: { count: 1, total: 3, types: ['Mortgage'] },
      },
    },
    fidelity: {
      bankId: 'fidelity',
      bankName: 'Fidelity',
      success: true,
      documentsFound: [
        { type: 'Dividends', form: '1099-DIV', amount: '$2,100' },
        { type: 'Capital Gains', form: '1099-B', amount: '$8,450' },
      ],
      coverage: {
        identity: { complete: false, found: ['Name'] },
        income: { count: 2, total: 4, types: ['1099-DIV', '1099-B'] },
        deductions: { count: 0, total: 3, types: [] },
      },
    },
  };

  return bankData[bankId] || {
    bankId,
    bankName: bankId,
    success: true,
    documentsFound: [],
    coverage: {
      identity: { complete: false, found: [] },
      income: { count: 0, total: 4, types: [] },
      deductions: { count: 0, total: 3, types: [] },
    },
  };
};

export default ConnectionResult;
