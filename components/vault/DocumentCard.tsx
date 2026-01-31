import React from 'react';
import { ProcessedDocument, VerificationStatus } from '../../types';
import { IconFile, IconBank, IconCheck, IconAlert, IconInfo } from '../Icons';
import { LiquidGlass } from '../Material';

const isSafeImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('data:image/') || url.startsWith('https://') || url.startsWith('blob:');
};

interface DocumentCardProps {
  document: ProcessedDocument;
  onClick?: () => void;
  selected?: boolean;
}

const getVerificationBadge = (status?: VerificationStatus) => {
  switch (status) {
    case 'auto_verified':
      return {
        label: 'Verified',
        className: 'bg-ok/20 text-ok',
        icon: IconCheck,
      };
    case 'user_verified':
      return {
        label: 'Confirmed',
        className: 'bg-ok/20 text-ok',
        icon: IconCheck,
      };
    case 'needs_review':
      return {
        label: 'Review',
        className: 'bg-hig-orange/20 text-hig-orange',
        icon: IconInfo,
      };
    case 'discrepancy':
      return {
        label: 'Discrepancy',
        className: 'bg-danger/20 text-danger',
        icon: IconAlert,
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-white/10 text-white/60',
        icon: IconInfo,
      };
  }
};

const getSourceBadge = (sourceType: string) => {
  switch (sourceType) {
    case 'OCR':
      return { label: 'Scanned', className: 'bg-hig-blue/20 text-hig-blue' };
    case 'Plaid':
      return { label: 'Connected', className: 'bg-ok/20 text-ok' };
    case 'LastYear':
      return { label: 'Imported', className: 'bg-white/10 text-white/60' };
    default:
      return { label: sourceType, className: 'bg-white/10 text-white/60' };
  }
};

const getDocumentIcon = (documentType?: string) => {
  if (documentType === 'Bank Statement') {
    return IconBank;
  }
  return IconFile;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  selected = false
}) => {
  const verificationBadge = getVerificationBadge(document.verificationStatus);
  const sourceBadge = getSourceBadge(document.sourceType);
  const DocumentIcon = getDocumentIcon(document.documentType);
  const VerificationIcon = verificationBadge.icon;

  const confidencePercent = Math.round(document.confidence * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-hig-card transition-all duration-200
        border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue
        ${selected
          ? 'bg-chedr-orange/15 border-chedr-orange/40'
          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Document Icon/Thumbnail */}
        <div className="w-12 h-12 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
          {isSafeImageUrl(document.thumbnailUrl) ? (
            <img
              src={document.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <DocumentIcon className="w-6 h-6 text-white/80" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Document Type & Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-hig-caption2 font-semibold text-chedr-orange uppercase tracking-wide">
              {document.documentType || document.type}
            </span>
          </div>
          <h4 className="text-hig-footnote font-medium text-white truncate mb-2">
            {document.name}
          </h4>

          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Verification Status */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-hig-caption2 font-medium ${verificationBadge.className}`}>
              <VerificationIcon className="w-3 h-3" />
              {verificationBadge.label}
            </span>

            {/* Source Type */}
            <span className={`px-2 py-0.5 rounded-full text-hig-caption2 font-medium ${sourceBadge.className}`}>
              {sourceBadge.label}
            </span>

            {/* Confidence */}
            <span className="text-hig-caption2 text-white/70">
              {confidencePercent}% conf.
            </span>
          </div>
        </div>

        {/* Data Points Count */}
        {document.dataPointCount > 0 && (
          <div className="text-right shrink-0">
            <span className="text-hig-headline font-semibold text-white">
              {document.dataPointCount}
            </span>
            <p className="text-hig-caption2 text-white/60">fields</p>
          </div>
        )}
      </div>

      {/* Processing Status Indicator */}
      {document.processingStatus && ['uploading', 'scanning', 'extracting'].includes(document.processingStatus) && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-chedr-orange border-t-transparent rounded-full animate-spin" />
            <span className="text-hig-caption2 text-white/80 capitalize">
              {document.processingStatus}...
            </span>
          </div>
        </div>
      )}
    </button>
  );
};

export default DocumentCard;
