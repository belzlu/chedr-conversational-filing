import React from 'react';
import { VerificationStatus } from '../../../types';
import { IconCheck, IconAlert, IconInfo } from '../../Icons';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const getStatusConfig = (status: VerificationStatus) => {
  switch (status) {
    case 'auto_verified':
      return {
        icon: IconCheck,
        label: 'Verified',
        bgColor: 'bg-ok/20',
        textColor: 'text-ok',
        borderColor: 'border-ok/30',
        description: 'Auto-verified with high confidence'
      };
    case 'user_verified':
      return {
        icon: IconCheck,
        label: 'Confirmed',
        bgColor: 'bg-ok/20',
        textColor: 'text-ok',
        borderColor: 'border-ok/30',
        description: 'Manually confirmed by you'
      };
    case 'needs_review':
      return {
        icon: IconInfo,
        label: 'Review',
        bgColor: 'bg-hig-orange/20',
        textColor: 'text-hig-orange',
        borderColor: 'border-hig-orange/30',
        description: 'Requires your review'
      };
    case 'discrepancy':
      return {
        icon: IconAlert,
        label: 'Discrepancy',
        bgColor: 'bg-danger/20',
        textColor: 'text-danger',
        borderColor: 'border-danger/30',
        description: 'Conflicting values detected'
      };
    default:
      return {
        icon: IconInfo,
        label: 'Pending',
        bgColor: 'bg-white/10',
        textColor: 'text-white/60',
        borderColor: 'border-white/10',
        description: 'Awaiting verification'
      };
  }
};

const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'px-2 py-0.5 gap-1',
        icon: 'w-3 h-3',
        text: 'text-hig-caption2'
      };
    case 'lg':
      return {
        container: 'px-4 py-2 gap-2',
        icon: 'w-5 h-5',
        text: 'text-hig-body'
      };
    case 'md':
    default:
      return {
        container: 'px-3 py-1 gap-1.5',
        icon: 'w-4 h-4',
        text: 'text-hig-footnote'
      };
  }
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true
}) => {
  const config = getStatusConfig(status);
  const sizeStyles = getSizeStyles(size as 'sm' | 'md' | 'lg');
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.textColor} border ${config.borderColor}
        ${sizeStyles.container}
      `}
      title={config.description}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && <span className={sizeStyles.text}>{config.label}</span>}
    </span>
  );
};

export default VerificationBadge;
