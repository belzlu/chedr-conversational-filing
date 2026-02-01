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
        container: 'bg-green-500 text-black border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
        icon: 'text-black',
        label: 'text-green-500'
      };
    case 'active':
      return {
        container: 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]',
        icon: 'text-black',
        label: 'text-white font-semibold'
      };
    case 'pending':
    default:
      return {
        container: 'bg-black border-white/10 text-white/20',
        icon: 'text-white/20',
        label: 'text-white/30'
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
    <div className="flex flex-col items-center gap-3 relative group">
      {/* Node Circle - Structural Token */}
      <div
        className={`
          relative w-10 h-10 rounded-full flex items-center justify-center
          border transition-all duration-500 z-10
          ${styles.container}
        `}
      >
        <Icon className={`w-4 h-4 ${styles.icon}`} />
        
        {/* Subtle active indicator ring instead of heavy pulse */}
        {stage.status === 'active' && (
           <div className="absolute -inset-1 rounded-full border border-white/20" />
        )}
      </div>

      {/* Label */}
      <span className={`text-[10px] uppercase tracking-wider font-medium ${styles.label} text-center max-w-[80px]`}>
        {stage.label}
      </span>

      {/* Warning/Confidence Badge (Only if meaningful/low) */}
      {stage.confidence !== undefined && stage.confidence < 0.8 && stage.status === 'completed' && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-black" title="Low Confidence">
          !
        </span>
      )}
    </div>
  );
};

export default LineageNode;
