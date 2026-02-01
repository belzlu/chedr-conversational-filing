import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProcessedDocument, ExtractedField, FieldValue } from '../../types';
import { LineageCanvas } from './lineage';
import { IconClose, IconFile, IconCheck, IconAlert, IconEye, IconEdit, IconTrash, IconChevronDown, IconChevronRight } from '../Icons';
import { updateModelFromCorrection, detectAnomalies } from '../../services/documentClassifier';

const isSafeImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('data:image/') || url.startsWith('https://') || url.startsWith('blob:');
};

interface DocumentDetailProps {
  document: ProcessedDocument;
  onClose: () => void;
  onFieldEdit?: (fieldId: string, newValue: FieldValue) => void;
}

// ... (helper functions remain unchanged)
const getFieldStatus = (field: ExtractedField, isAnomaly: boolean) => {
  if (isAnomaly || field.status === 'WARN' || field.status === 'FAIL') {
    return 'attention';
  }
  if (field.confidence >= 0.7) {
    return 'verified';
  }
  return 'pending';
};

const humanizeLabel = (label: string): string => {
  let clean = label.replace(/^Box\s*\d+[a-z]?\s*/i, '');
  clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  clean = clean.replace(/withheld/i, 'Withheld');
  clean = clean.replace(/wages/i, 'Wages');
  clean = clean.replace(/tips/i, 'Tips');
  clean = clean.replace(/, etc\.?/i, '');
  return clean.trim();
};

const formatValue = (value: any): string => {
  const str = String(value);
  if (/^\d+(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (num >= 100) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num);
    }
  }
  return str;
};

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document,
  onClose,
  onFieldEdit
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const anomalies = useMemo(() => detectAnomalies(document.fields), [document.fields]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus management: Focus panel on mount
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.focus();
    }
  }, []);

  const handleEdit = (fieldId: string, newValue: any) => {
    const field = document.fields.find(f => f.id === fieldId);
    if (field && onFieldEdit) {
      updateModelFromCorrection(fieldId, field.value, newValue);
      onFieldEdit(fieldId, newValue);
    }
  };

  const fieldsNeedingAttention = document.fields.filter(f =>
    anomalies.includes(f.id) || f.status === 'WARN' || f.status === 'FAIL' || f.confidence < 0.7
  );
  const verifiedFields = document.fields.filter(f =>
    !anomalies.includes(f.id) && f.status !== 'WARN' && f.status !== 'FAIL' && f.confidence >= 0.7
  );

  const allVerified = fieldsNeedingAttention.length === 0;

  return (
    <div 
      ref={panelRef}
      className="h-full flex flex-col panel-secondary outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-detail-title"
      tabIndex={-1}
    >
      {/* Header - Clean and minimal per agent.md */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-10 h-10 rounded-hig-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 hover:bg-white/[0.08] transition-colors overflow-hidden group focus-visible:ring-2 focus-visible:ring-white"
            aria-label="View Document Preview"
          >
            {isSafeImageUrl(document.thumbnailUrl) ? (
              <>
                <img
                  src={document.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <IconEye className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <IconFile className="w-5 h-5 text-quaternary" />
            )}
          </button>
          <div className="min-w-0">
            <h2 id="document-detail-title" className="text-hig-subhead font-semibold text-primary truncate">
              {document.documentType || document.type}
            </h2>
            <p className="text-hig-caption1 text-tertiary">
              {document.fields.length} fields extracted
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 rounded-hig-sm hover:bg-white/[0.06] text-quaternary hover:text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-white"
            title="Delete"
            aria-label="Delete Document"
          >
            <IconTrash className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-hig-sm hover:bg-white/[0.06] text-quaternary hover:text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Status Banner - Only show if needs attention */}
        {!allVerified && (
          <div className="mx-5 mt-5 p-4 rounded-hig-lg bg-orange-500/[0.08] border border-orange-500/20" role="status">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <IconAlert className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-hig-footnote font-medium text-primary">
                  {fieldsNeedingAttention.length} field{fieldsNeedingAttention.length !== 1 ? 's' : ''} need review
                </p>
                <p className="text-hig-caption1 text-tertiary">
                  Please verify the highlighted values below
                </p>
              </div>
            </div>
          </div>
        )}

        {/* All Verified Banner */}
        {allVerified && document.fields.length > 0 && (
          <div className="mx-5 mt-5 p-4 rounded-hig-lg bg-green-500/[0.06] border border-green-500/15" role="status">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <IconCheck className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-hig-footnote font-medium text-primary">All fields verified</p>
                <p className="text-hig-caption1 text-tertiary">Ready to use in your return</p>
              </div>
            </div>
          </div>
        )}

        {/* Fields Needing Attention */}
        {fieldsNeedingAttention.length > 0 && (
          <section className="px-5 pt-6" aria-labelledby="needs-review-heading">
            <h3 id="needs-review-heading" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
              Needs Review
            </h3>
            <div className="space-y-2">
              {fieldsNeedingAttention.map(field => (
                <FieldCard
                  key={field.id}
                  field={field}
                  status="attention"
                  onEdit={(value) => handleEdit(field.id, value)}
                  showMapping={showAdvanced}
                />
              ))}
            </div>
          </section>
        )}

        {/* Verified Fields */}
        {verifiedFields.length > 0 && (
          <section className="px-5 pt-6 pb-6" aria-labelledby="verified-data-heading">
            <h3 id="verified-data-heading" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
              Verified Data
            </h3>
            <div className="space-y-2">
              {verifiedFields.map(field => (
                <FieldCard
                  key={field.id}
                  field={field}
                  status="verified"
                  onEdit={(value) => handleEdit(field.id, value)}
                  showMapping={showAdvanced}
                />
              ))}
            </div>
          </section>
        )}

        {/* Advanced Toggle - Progressive Disclosure */}
        <div className="px-5 pb-6 border-t border-white/[0.04] pt-4 mt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? (
              <IconChevronDown className="w-3 h-3" />
            ) : (
              <IconChevronRight className="w-3 h-3" />
            )}
            {showAdvanced ? 'Hide' : 'Show'} technical details
          </button>

          {/* Lineage - Only in advanced mode */}
          {showAdvanced && document.lineageStages && document.lineageStages.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
                Processing History
              </h4>
              <LineageCanvas stages={document.lineageStages} />
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Document Preview"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h3 className="text-[14px] font-medium text-white flex items-center gap-2">
              <IconFile className="w-4 h-4 text-white/40" />
              {document.name}
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close Preview"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
            {document.fileUrl && !document.mimeType?.startsWith('image/') ? (
              <iframe
                src={document.fileUrl}
                className="w-full h-full rounded-lg bg-white"
                title="Document Preview"
              />
            ) : (
              <img
                src={document.fileUrl || document.thumbnailUrl}
                className="max-w-full max-h-full object-contain rounded-lg"
                alt="Original Document"
                loading="lazy"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FieldCardProps {
  field: ExtractedField;
  status: 'verified' | 'attention' | 'pending';
  onEdit?: (newValue: any) => void;
  showMapping?: boolean;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, status, onEdit, showMapping }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(field.value));

  const handleSave = () => {
    onEdit?.(editValue);
    setIsEditing(false);
  };

  const label = humanizeLabel(field.label);
  const value = formatValue(field.value);

  return (
    <div className={`group p-3 rounded-xl border transition-all ${
      status === 'attention'
        ? 'bg-orange-500/[0.04] border-orange-500/20 hover:bg-orange-500/[0.06]'
        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Status indicator */}
          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            status === 'verified'
              ? 'bg-green-500/20'
              : status === 'attention'
                ? 'bg-orange-500/20'
                : 'bg-white/10'
          }`}>
            {status === 'verified' ? (
              <IconCheck className="w-3 h-3 text-green-400" />
            ) : status === 'attention' ? (
              <IconAlert className="w-3 h-3 text-orange-400" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-white/50 mb-0.5">{label}</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-[14px] text-white font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                  autoFocus
                  aria-label={`Edit ${label}`}
                />
                <button
                  onClick={handleSave}
                  className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  aria-label="Save"
                >
                  <IconCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditValue(String(field.value)); }}
                  className="p-1.5 rounded-lg bg-white/10 text-white/40 hover:text-white/60 transition-colors"
                  aria-label="Cancel"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-[15px] font-medium text-white/90 font-mono tabular-nums">
                {value}
              </p>
            )}

            {/* Technical mapping - only when advanced mode */}
            {showMapping && field.mapping && (
              <p className="text-[10px] text-white/30 mt-1 font-mono">
                → {field.mapping}
              </p>
            )}
          </div>
        </div>

        {/* Edit button - only when not editing */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            aria-label={`Edit ${label}`}
          >
            <IconEdit className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
