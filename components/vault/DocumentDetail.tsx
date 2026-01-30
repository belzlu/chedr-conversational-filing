import React from 'react';
import { ProcessedDocument, ExtractedField } from '../../types';
import { LineageCanvas } from './lineage';
import { IconClose, IconFile, IconCheck, IconAlert, IconInfo } from '../Icons';
import { LiquidGlass } from '../Material';

interface DocumentDetailProps {
  document: ProcessedDocument;
  onClose: () => void;
  onFieldEdit?: (fieldId: string, newValue: any) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PASS':
      return { icon: IconCheck, color: 'text-ok' };
    case 'WARN':
      return { icon: IconInfo, color: 'text-hig-orange' };
    case 'FAIL':
      return { icon: IconAlert, color: 'text-danger' };
    default:
      return { icon: IconInfo, color: 'text-white/40' };
  }
};

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document,
  onClose,
  onFieldEdit
}) => {
  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            {document.thumbnailUrl ? (
              <img
                src={document.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <IconFile className="w-5 h-5 text-white/60" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-hig-body font-semibold text-white/90 truncate">
              {document.name}
            </h2>
            <p className="text-hig-caption2 text-hig-blue font-medium uppercase tracking-wide">
              {document.documentType || document.type}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          aria-label="Close panel"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Lineage Canvas */}
        {document.lineageStages && document.lineageStages.length > 0 && (
          <div className="p-4 rounded-hig-card bg-white/5 border border-white/10">
            <LineageCanvas stages={document.lineageStages} />
          </div>
        )}

        {/* Document Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <MetaCard label="Tax Year" value={document.taxYear} />
          <MetaCard label="Source" value={document.sourceType} />
          <MetaCard label="Confidence" value={`${Math.round(document.confidence * 100)}%`} />
          <MetaCard label="Fields" value={document.dataPointCount.toString()} />
          {document.fileSize && <MetaCard label="File Size" value={document.fileSize} />}
          {document.institution && <MetaCard label="Institution" value={document.institution} />}
        </div>

        {/* Extracted Fields */}
        {document.fields && document.fields.length > 0 && (
          <div>
            <h3 className="text-hig-footnote font-semibold text-white/80 mb-3">
              Extracted Data
            </h3>
            <div className="space-y-2">
              {document.fields.map(field => (
                <FieldRow
                  key={field.id}
                  field={field}
                  onEdit={onFieldEdit ? (value) => onFieldEdit(field.id, value) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Raw Text Preview (if available) */}
        {document.rawText && (
          <div>
            <h3 className="text-hig-footnote font-semibold text-white/80 mb-3">
              Raw Text
            </h3>
            <pre className="p-3 rounded-lg bg-white/5 border border-white/10 text-hig-caption2 text-white/60 overflow-x-auto whitespace-pre-wrap">
              {document.rawText.slice(0, 500)}
              {document.rawText.length > 500 && '...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

interface MetaCardProps {
  label: string;
  value: string;
}

const MetaCard: React.FC<MetaCardProps> = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
    <p className="text-hig-caption2 text-white/40 mb-0.5">{label}</p>
    <p className="text-hig-footnote font-medium text-white/90">{value}</p>
  </div>
);

interface FieldRowProps {
  field: ExtractedField;
  onEdit?: (newValue: any) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({ field, onEdit }) => {
  const { icon: StatusIcon, color } = getStatusIcon(field.status);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <StatusIcon className={`w-4 h-4 ${color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-hig-footnote text-white/70">{field.label}</span>
          {field.mapping && (
            <span className="text-hig-caption2 text-hig-blue">→ {field.mapping}</span>
          )}
        </div>
        <p className="text-hig-body font-medium text-white/90 truncate">
          {String(field.value)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-hig-caption2 ${
          field.confidence >= 0.9 ? 'text-ok' :
          field.confidence >= 0.7 ? 'text-hig-orange' : 'text-danger'
        }`}>
          {Math.round(field.confidence * 100)}%
        </span>
      </div>
    </div>
  );
};

export default DocumentDetail;
