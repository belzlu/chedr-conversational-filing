import React from 'react';

/**
 * CONTENT layer surface. Always opaque.
 */
export function SurfaceOpaque({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`surface-opaque border border-white/[0.05] shadow-lg ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

/**
 * SHELL layer for secondary panels. Translucent, no lensing.
 */
export function MaterialShell({
  tone = "ultraThin",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "ultraThin" | "regular" }) {
  const baseClass = tone === "ultraThin" ? "material-shell-ultraThin" : "material-shell-regular";
  return (
    <div className={`${baseClass} border border-white/[0.1] ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CONTROL/NAV layer. Liquid glass with lensing effect.
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
      className={`liquid-glass border border-white/[0.15] ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}