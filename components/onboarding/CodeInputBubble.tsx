'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface CodeInputBubbleProps {
  onSubmit: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
  codeLength?: number;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export const CodeInputBubble: React.FC<CodeInputBubbleProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
  codeLength = 6,
  className,
}) => {
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last char
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCode.every(d => d) && index === codeLength - 1) {
      onSubmit(newCode.join(''));
    }
  }, [code, codeLength, onSubmit]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    // Handle backspace navigation
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle left/right arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code, codeLength]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, codeLength);

    if (pasted.length === 0) return;

    const newCode = [...code];
    pasted.split('').forEach((digit, i) => {
      if (i < codeLength) newCode[i] = digit;
    });
    setCode(newCode);

    // Focus last filled input or next empty one
    const nextEmptyIndex = newCode.findIndex(d => !d);
    const focusIndex = nextEmptyIndex === -1 ? codeLength - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pasted.length === codeLength) {
      onSubmit(pasted);
    }
  }, [code, codeLength, onSubmit]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus
    e.target.select();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className={cn('flex flex-col gap-2', className)}
    >
      <div
        className="flex gap-2"
        role="group"
        aria-label="Verification code input"
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={isLoading}
            aria-label={`Digit ${index + 1} of ${codeLength}`}
            aria-invalid={error ? 'true' : 'false'}
            className={cn(
              // Size and layout
              'w-12 h-14 text-center',
              // Typography
              'text-[24px] font-medium',
              // Colors
              'bg-chedr-surface text-white',
              // Border
              'rounded-[12px] border',
              error
                ? 'border-chedr-error'
                : 'border-chedr-border focus:border-chedr-orange',
              // Focus & interaction
              'focus:outline-none',
              'transition-colors duration-150',
              // Disabled state
              'disabled:opacity-50',
              // Shake animation on error
              error && 'animate-shake'
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="alert"
          className="text-[13px] text-chedr-error"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default CodeInputBubble;
