import React from 'react';
import { LineageStage } from '../../../types';
import { IconUpload, IconFile, IconCheck, IconAlert } from '../../Icons';

interface LineageNodeProps {
  stage: LineageStage;
  isFirst?: boolean;
  isLast?: boolean;
}

const getStageIcon = (type: string, status: string) => {
  if (status === 'completed') {
    return IconCheck;
  }
  switch (type) {
    case 'source':
      return IconUpload;
    case 'extraction':
      return IconFile;
    case 'verification':
      return IconCheck;
    default:
      return IconFile;
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        ring: 'ring-ok/30',
        bg: 'bg-ok/20',
        icon: 'text-ok',
        label: 'text-ok',
        pulse: false
      };
    case 'active':
      return {
        ring: 'ring-hig-blue/50',
        bg: 'bg-hig-blue/20',
        icon: 'text-hig-blue',
        label: 'text-hig-blue',
        pulse: true
      };
    case 'pending':
    default:
      return {
        ring: 'ring-white/10',
        bg: 'bg-white/5',
        icon: 'text-white/30',
        label: 'text-white/30',
        pulse: false
      };
  }
};

export const LineageNode: React.FC<LineageNodeProps> = ({
  stage,
  isFirst = false,
  isLast = false
}) => {
  const Icon = getStageIcon(stage.type, stage.status);
  const styles = getStatusStyles(stage.status);

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Node Circle */}
      <div
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center
          ring-2 ${styles.ring} ${styles.bg}
          transition-all duration-500
        `}
      >
        {/* Pulse animation for active state */}
        {styles.pulse && (
          <>
            <div className="absolute inset-0 rounded-full bg-hig-blue/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-hig-blue/10 animate-pulse" />
          </>
        )}
        <Icon className={`w-5 h-5 ${styles.icon} relative z-10`} />
      </div>

      {/* Label */}
      <span className={`text-hig-caption2 font-medium ${styles.label} text-center max-w-[80px]`}>
        {stage.label}
      </span>

      {/* Confidence Badge (if applicable) */}
      {stage.confidence !== undefined && stage.status === 'completed' && (
        <span className="text-hig-caption2 text-white/40">
          {Math.round(stage.confidence * 100)}%
        </span>
      )}

      {/* Timestamp (condensed) */}
      {stage.status === 'completed' && (
        <span className="text-[10px] text-white/20">
          {new Date(stage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default LineageNode;
