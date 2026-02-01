import React from 'react';

/**
 * CONTENT layer surface. Always opaque.
 * Use for: primary content areas, conversation surface, document views
 */
export function SurfaceOpaque({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`surface-opaque rounded-hig-lg ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

/**
 * SHELL layer for secondary panels. Subtle translucency.
 * Use for: side panels, secondary surfaces, collapsed states
 */
export function MaterialShell({
  tone = "ultraThin",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "ultraThin" | "regular" }) {
  const baseClass = tone === "ultraThin" ? "material-shell-ultraThin" : "material-shell-regular";
  return (
    <div className={`${baseClass} rounded-hig-lg ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CONTROL/NAV layer. Liquid glass for overlays and sheets.
 * Per agent.md: structural use only - panels, overlays, sheets
 * Subtle translucency + hairline borders, not decorative
 */
export function LiquidGlass({
  variant = "regular",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "regular" | "clear" }) {
  return (
    <div
      data-variant={variant}
      className={`liquid-glass rounded-hig-lg ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Panel component with consistent elevation hierarchy
 * Use for: cards, drawers, contextual panels
 */
export function Panel({
  elevation = "primary",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevation?: "primary" | "secondary" | "overlay" }) {
  const baseClass = `panel-${elevation}`;
  return (
    <div className={`${baseClass} rounded-hig-lg ${className || ''}`} {...props}>
      {children}
    </div>
  );
}