import React from 'react';
import { ProcessedDocument } from '../../types';
import { IconFile, IconBank } from '../Icons';
import { motion } from 'framer-motion';

const isSafeImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('data:image/') || url.startsWith('https://') || url.startsWith('blob:');
};

interface DocumentCardProps {
  document: ProcessedDocument;
  onClick?: () => void;
  selected?: boolean;
}

// Simplified status - just show what matters to the user
const getStatus = (doc: ProcessedDocument) => {
  // Priority: issues > needs review > verified
  if (doc.verificationStatus === 'discrepancy' || doc.status === 'flagged') {
    return { label: 'Needs attention', color: 'text-orange-400', dot: 'bg-orange-500' };
  }
  if (doc.verificationStatus === 'needs_review' || doc.confidence < 0.7) {
    return { label: 'Review', color: 'text-white/50', dot: 'bg-orange-500' };
  }
  return { label: 'Verified', color: 'text-green-400', dot: 'bg-green-500' };
};

const getSourceLabel = (sourceType: string) => {
  switch (sourceType) {
    case 'OCR': return 'Scanned';
    case 'Plaid': return 'Synced';
    case 'LastYear': return 'Imported';
    default: return sourceType;
  }
};

const getDocumentIcon = (documentType?: string) => {
  if (documentType === 'Bank Statement') return IconBank;
  return IconFile;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  selected = false
}) => {
  const status = getStatus(document);
  const sourceLabel = getSourceLabel(document.sourceType);
  const DocumentIcon = getDocumentIcon(document.documentType);

  const isProcessing = document.processingStatus && ['uploading', 'scanning', 'extracting'].includes(document.processingStatus);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`
        relative w-full text-left p-4 rounded-xl transition-colors duration-200 group overflow-hidden
        border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chedr-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${selected
          ? 'bg-chedr-orange/[0.06] border-chedr-orange/30'
          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
        }
      `}
    >
      {/* Scanning Effect Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-chedr-orange/5 animate-shimmer" />
          <div className="scan-line" />
        </div>
      )}

      <div className="relative z-10 flex items-center gap-4">
        {/* Thumbnail / Icon */}
        <div className="relative w-11 h-11 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
          {isSafeImageUrl(document.thumbnailUrl) ? (
            <img
              src={document.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <DocumentIcon className={`w-5 h-5 ${selected ? 'text-chedr-orange' : 'text-white/30'} transition-colors`} />
          )}

          {/* Status Dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-black ${status.dot}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type + Source */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-chedr-orange uppercase tracking-wide">
              {document.documentType || document.type}
            </span>
            <span className="text-[10px] text-white/30">
              {sourceLabel}
            </span>
          </div>

          {/* Name */}
          <h4 className="text-[14px] font-medium text-white/90 truncate leading-tight">
            {document.name}
          </h4>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 shrink-0 transition-all ${selected ? 'text-white/40' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-chedr-orange/20 overflow-hidden rounded-b-xl">
          <div className="h-full bg-chedr-orange animate-progress-indeterminate" />
        </div>
      )}
    </motion.button>
  );
};

export default DocumentCard;
