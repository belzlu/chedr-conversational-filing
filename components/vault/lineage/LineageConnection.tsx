import React from 'react';

interface LineageConnectionProps {
  status: 'completed' | 'active' | 'pending';
  animate?: boolean;
}

export const LineageConnection: React.FC<LineageConnectionProps> = ({
  status,
  animate = true
}) => {
  const getConnectionStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-ok/60 to-ok/60';
      case 'active':
        return 'bg-gradient-to-r from-ok/60 via-hig-blue/80 to-hig-blue/40';
      case 'pending':
      default:
        return 'bg-gradient-to-r from-white/10 to-white/5';
    }
  };

  return (
    <div className="flex-1 h-0.5 mx-2 relative overflow-hidden rounded-full">
      {/* Base line */}
      <div className={`absolute inset-0 ${getConnectionStyles()} transition-all duration-500`} />

      {/* Animated flow effect for active state */}
      {status === 'active' && animate && (
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.8) 50%, transparent 100%)',
            animation: 'flowRight 1.5s ease-in-out infinite'
          }}
        />
      )}

      {/* Completed pulse for visual feedback */}
      {status === 'completed' && (
        <div className="absolute inset-0 bg-ok/20 animate-pulse" />
      )}

      {/* Add keyframe animation via inline style tag */}
      <style>{`
        @keyframes flowRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LineageConnection;
