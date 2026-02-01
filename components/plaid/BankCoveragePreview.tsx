import React, { useState } from 'react';
import { PlaidCoverage } from '../../types';
import { CoverageBadge } from './CoverageBadge';
import { IconChevronDown } from '../Icons';

interface BankCoveragePreviewProps {
  coverage: PlaidCoverage;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

interface CoverageRowProps {
  label: string;
  available: boolean;
  hint?: string;
}

const CoverageRow: React.FC<CoverageRowProps> = ({ label, available, hint }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-hig-caption1 text-white/70">{label}</span>
    <div className="flex items-center gap-2">
      {available ? (
        <span className="text-hig-caption1 text-hig-green">✓</span>
      ) : (
        <span className="text-hig-caption1 text-white/30">○</span>
      )}
      {hint && !available && (
        <span className="text-hig-caption2 text-white/40 italic">{hint}</span>
      )}
    </div>
  </div>
);

interface CoverageSectionProps {
  title: string;
  coverage: number;
  children: React.ReactNode;
}

const CoverageSection: React.FC<CoverageSectionProps> = ({ title, coverage, children }) => (
  <div className="py-2">
    <div className="flex items-center justify-between mb-1">
      <span className="text-hig-footnote font-medium text-white/90">{title}</span>
      <CoverageBadge coverage={coverage} size="sm" showLabel={false} />
    </div>
    <div className="pl-3 border-l border-white/10">
      {children}
    </div>
  </div>
);

export const BankCoveragePreview: React.FC<BankCoveragePreviewProps> = ({
  coverage,
  expanded = false,
  onToggleExpand,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggleExpand?.();
  };

  return (
    <div className="mt-3 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-300">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-inset"
      >
        <span className="text-hig-caption1 text-white/60">
          {isExpanded ? '▲' : '▼'} What data will Chedr access?
        </span>
        <IconChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          {/* Identity Section */}
          <CoverageSection title="IDENTITY" coverage={coverage.identity.coverage}>
            <div className="text-hig-caption1 text-white/50">
              {coverage.identity.fields.join(', ') || 'No identity data'}
            </div>
          </CoverageSection>

          {/* Income Section */}
          <CoverageSection title="INCOME" coverage={coverage.income.coverage}>
            <CoverageRow label="Wages (W-2)" available={coverage.income.wages} />
            <CoverageRow
              label="Interest (1099-INT)"
              available={coverage.income.interest}
            />
            <CoverageRow
              label="Investments"
              available={coverage.income.investments}
              hint="add brokerage"
            />
            <CoverageRow label="Other (1099-MISC)" available={coverage.income.other} />
          </CoverageSection>

          {/* Deductions Section */}
          <CoverageSection title="DEDUCTIONS" coverage={coverage.deductions.coverage}>
            <CoverageRow
              label="Mortgage (1098)"
              available={coverage.deductions.mortgage}
            />
            <CoverageRow
              label="Charitable"
              available={coverage.deductions.charitable}
              hint="upload receipts"
            />
            <CoverageRow
              label="Medical"
              available={coverage.deductions.medical}
              hint="upload receipts"
            />
          </CoverageSection>
        </div>
      </div>
    </div>
  );
};

export default BankCoveragePreview;
