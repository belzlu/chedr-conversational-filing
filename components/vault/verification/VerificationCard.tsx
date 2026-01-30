import React, { useState } from 'react';
import { ExtractedField, VerificationStatus, ChipAction } from '../../../types';
import { VerificationBadge } from './VerificationBadge';
import { FieldEditor } from './FieldEditor';
import { IconCheck, IconAlert, IconInfo, IconChevronRight } from '../../Icons';

interface VerificationCardProps {
  field: ExtractedField;
  onVerify?: (fieldId: string) => void;
  onEdit?: (fieldId: string, newValue: any) => void;
  onResolve?: (fieldId: string, resolution: 'accept' | 'reject' | 'edit') => void;
  conflictingValue?: string;
  conflictingSource?: string;
  chips?: ChipAction[];
  onChipClick?: (actionId: string) => void;
}

type CardVariant = 'clean' | 'clarify' | 'discrepancy';

const getVariant = (status?: VerificationStatus): CardVariant => {
  switch (status) {
    case 'auto_verified':
    case 'user_verified':
      return 'clean';
    case 'discrepancy':
      return 'discrepancy';
    case 'needs_review':
    default:
      return 'clarify';
  }
};

const getVariantStyles = (variant: CardVariant) => {
  switch (variant) {
    case 'clean':
      return {
        border: 'border-ok/30',
        bg: 'bg-ok/5',
        accentBg: 'bg-ok/10',
        icon: IconCheck,
        iconColor: 'text-ok'
      };
    case 'discrepancy':
      return {
        border: 'border-danger/30',
        bg: 'bg-danger/5',
        accentBg: 'bg-danger/10',
        icon: IconAlert,
        iconColor: 'text-danger'
      };
    case 'clarify':
    default:
      return {
        border: 'border-hig-orange/30',
        bg: 'bg-hig-orange/5',
        accentBg: 'bg-hig-orange/10',
        icon: IconInfo,
        iconColor: 'text-hig-orange'
      };
  }
};

export const VerificationCard: React.FC<VerificationCardProps> = ({
  field,
  onVerify,
  onEdit,
  onResolve,
  conflictingValue,
  conflictingSource,
  chips,
  onChipClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const variant = getVariant(field.verificationStatus);
  const styles = getVariantStyles(variant);
  const Icon = styles.icon;

  const handleSaveEdit = (newValue: string) => {
    onEdit?.(field.id, newValue);
    setIsEditing(false);
  };

  const renderCleanCard = () => (
    <div className={`p-4 rounded-hig-card border ${styles.border} ${styles.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full ${styles.accentBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${styles.iconColor}`} />
          </div>
          <div>
            <p className="text-hig-caption2 text-white/50">{field.label}</p>
            <p className="text-hig-body font-medium text-white/90">{String(field.value)}</p>
            <p className="text-hig-caption2 text-white/30 mt-1">
              {field.lineage} • {Math.round(field.confidence * 100)}% confidence
            </p>
          </div>
        </div>
        <VerificationBadge status={field.verificationStatus || 'auto_verified'} size="sm" />
      </div>
    </div>
  );

  const renderClarifyCard = () => (
    <div className={`p-4 rounded-hig-card border ${styles.border} ${styles.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${styles.accentBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-hig-caption2 text-white/50">{field.label}</p>
              {!isEditing ? (
                <p className="text-hig-body font-medium text-white/90">{String(field.value)}</p>
              ) : (
                <div className="mt-2">
                  <FieldEditor
                    value={String(field.value)}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                    type={typeof field.value === 'number' ? 'number' : 'text'}
                  />
                </div>
              )}
            </div>
            <VerificationBadge status="needs_review" size="sm" />
          </div>

          {!isEditing && (
            <>
              <p className="text-hig-caption2 text-hig-orange mt-2">
                Low confidence ({Math.round(field.confidence * 100)}%) - please verify this value
              </p>

              {/* Action Chips */}
              <div className="flex items-center gap-2 mt-3">
                {chips?.map(chip => (
                  <button
                    key={chip.actionId}
                    type="button"
                    onClick={() => onChipClick?.(chip.actionId)}
                    className={`
                      px-3 py-1.5 rounded-full text-hig-caption2 font-medium transition-all
                      ${chip.primary
                        ? 'bg-hig-blue text-white hover:bg-hig-blue/90'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }
                    `}
                  >
                    {chip.label}
                  </button>
                ))}
                {!chips && (
                  <>
                    <button
                      type="button"
                      onClick={() => onVerify?.(field.id)}
                      className="px-3 py-1.5 rounded-full text-hig-caption2 font-medium bg-ok/20 text-ok hover:bg-ok/30 transition-all"
                    >
                      Looks correct
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 rounded-full text-hig-caption2 font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-all"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderDiscrepancyCard = () => (
    <div className={`p-4 rounded-hig-card border ${styles.border} ${styles.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${styles.accentBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-hig-caption2 text-white/50">{field.label}</p>
            <VerificationBadge status="discrepancy" size="sm" />
          </div>

          <p className="text-hig-caption2 text-danger mt-2 mb-3">
            Conflicting values found - please select the correct one
          </p>

          {/* Conflicting Values */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onResolve?.(field.id, 'accept')}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:border-ok/50 hover:bg-ok/5 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-hig-body font-medium text-white/90">{String(field.value)}</p>
                  <p className="text-hig-caption2 text-white/40">{field.lineage}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-white/20 group-hover:text-ok transition-colors" />
              </div>
            </button>

            {conflictingValue && (
              <button
                type="button"
                onClick={() => onResolve?.(field.id, 'reject')}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:border-ok/50 hover:bg-ok/5 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-hig-body font-medium text-white/90">{conflictingValue}</p>
                    <p className="text-hig-caption2 text-white/40">{conflictingSource || 'Alternative source'}</p>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-white/20 group-hover:text-ok transition-colors" />
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full p-3 rounded-lg bg-white/5 border border-dashed border-white/20 hover:border-white/40 transition-all text-center"
            >
              <p className="text-hig-caption2 text-white/50">Enter a different value</p>
            </button>
          </div>

          {isEditing && (
            <div className="mt-3">
              <FieldEditor
                value=""
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
                label="Enter correct value"
                type={typeof field.value === 'number' ? 'number' : 'text'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'clean':
      return renderCleanCard();
    case 'discrepancy':
      return renderDiscrepancyCard();
    case 'clarify':
    default:
      return renderClarifyCard();
  }
};

export default VerificationCard;
