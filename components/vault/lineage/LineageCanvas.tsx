import React from 'react';
import { LineageStage } from '../../../types';
import { LineageNode } from './LineageNode';
import { LineageConnection } from './LineageConnection';

interface LineageCanvasProps {
  stages: LineageStage[];
  className?: string;
}

const getConnectionStatus = (
  currentStage: LineageStage,
  nextStage: LineageStage
): 'completed' | 'active' | 'pending' => {
  if (currentStage.status === 'completed' && nextStage.status === 'completed') {
    return 'completed';
  }
  if (currentStage.status === 'completed' && nextStage.status === 'active') {
    return 'active';
  }
  return 'pending';
};

export const LineageCanvas: React.FC<LineageCanvasProps> = ({
  stages,
  className = ''
}) => {
  if (!stages || stages.length === 0) {
    return (
      <div className={`p-4 text-center text-white/40 text-hig-caption2 ${className}`}>
        No lineage data available
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-hig-footnote font-semibold text-white/80">Data Lineage</h3>
        <p className="text-hig-caption2 text-white/40 mt-0.5">Track your document through processing</p>
      </div>

      {/* Lineage Flow */}
      <div className="flex items-start justify-between py-4">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <LineageNode
              stage={stage}
              isFirst={index === 0}
              isLast={index === stages.length - 1}
            />
            {index < stages.length - 1 && (
              <div className="flex-1 flex items-center pt-6">
                <LineageConnection
                  status={getConnectionStatus(stage, stages[index + 1])}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Status Summary */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-hig-caption2">
          <span className="text-white/40">Processing Status</span>
          <StatusBadge stages={stages} />
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  stages: LineageStage[];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ stages }) => {
  const completedCount = stages.filter(s => s.status === 'completed').length;
  const activeStage = stages.find(s => s.status === 'active');
  const allComplete = completedCount === stages.length;

  if (allComplete) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-ok/20 text-ok font-medium">
        Complete
      </span>
    );
  }

  if (activeStage) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-hig-blue/20 text-hig-blue font-medium">
        {activeStage.label}
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-medium">
      {completedCount}/{stages.length} Complete
    </span>
  );
};

export default LineageCanvas;
