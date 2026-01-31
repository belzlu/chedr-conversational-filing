import React from 'react';

interface CoverageBadgeProps {
  coverage: number; // 0-4 scale for filled dots
  label?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const CoverageBadge: React.FC<CoverageBadgeProps> = ({
  coverage,
  label,
  size = 'md',
  showLabel = true,
}) => {
  const maxDots = 4;
  const filledDots = Math.min(Math.max(0, coverage), maxDots);

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';
  const textSize = size === 'sm' ? 'text-hig-caption2' : 'text-hig-caption1';

  return (
    <div className={`flex items-center ${gap}`}>
      <div className={`flex items-center ${gap}`}>
        {Array.from({ length: maxDots }).map((_, i) => (
          <div
            key={i}
            className={`${dotSize} rounded-full transition-colors ${
              i < filledDots
                ? 'bg-chedr-orange'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
      {showLabel && label && (
        <span className={`${textSize} text-white/50 ml-1`}>{label}</span>
      )}
    </div>
  );
};

interface CoveragePercentBadgeProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CoveragePercentBadge: React.FC<CoveragePercentBadgeProps> = ({
  percent,
  size = 'md',
}) => {
  const clampedPercent = Math.min(Math.max(0, percent), 100);

  const sizeClasses = {
    sm: 'text-hig-caption2',
    md: 'text-hig-caption1',
    lg: 'text-hig-footnote font-medium',
  };

  const barWidth = {
    sm: 'w-12',
    md: 'w-16',
    lg: 'w-24',
  };

  const barHeight = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  const getColorClass = () => {
    if (clampedPercent >= 80) return 'bg-hig-green';
    if (clampedPercent >= 60) return 'bg-chedr-orange';
    return 'bg-hig-red';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${barWidth[size]} ${barHeight[size]} bg-white/10 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${getColorClass()} rounded-full transition-all duration-500`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      <span className={`${sizeClasses[size]} text-white/60`}>{clampedPercent}%</span>
    </div>
  );
};

export default CoverageBadge;
