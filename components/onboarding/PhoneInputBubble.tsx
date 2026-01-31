'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { copy } from './chatCopy';

// ============================================
// TYPES
// ============================================

export interface PhoneInputBubbleProps {
  /** Controlled value (optional - component can be uncontrolled) */
  value?: string;
  /** Change handler for controlled mode */
  onChange?: (value: string) => void;
  /** Submit handler - receives formatted phone */
  onSubmit: (phone: string) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  className?: string;
}

// ============================================
// UTILITIES
// ============================================

const formatPhoneNumber = (input: string): string => {
  // Strip all non-digits
  const digits = input.replace(/\D/g, '').slice(0, 10);

  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const isValidPhone = (formatted: string): boolean => {
  return formatted.replace(/\D/g, '').length === 10;
};

// ============================================
// COMPONENT
// ============================================

export const PhoneInputBubble: React.FC<PhoneInputBubbleProps> = ({
  value: controlledValue,
  onChange: controlledOnChange,
  onSubmit,
  isLoading = false,
  error = null,
  success = false,
  className,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Support both controlled and uncontrolled modes
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledOnChange || setInternalValue;

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatPhoneNumber(e.target.value));
  }, [setValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPhone(value)) {
      e.preventDefault();
      onSubmit(value.replace(/\D/g, ''));
    }
  }, [value, onSubmit]);

  const handleSubmit = useCallback(() => {
    if (isValidPhone(value) && !isLoading && !success) {
      onSubmit(value.replace(/\D/g, ''));
    }
  }, [value, isLoading, success, onSubmit]);

  const isValid = isValidPhone(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className={cn('flex justify-start', className)}
    >
      <div className="flex flex-col gap-2">
        {/* Input container */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-2',
            'bg-chedr-surface rounded-[18px]',
            'border transition-colors duration-150',
            error
              ? 'border-chedr-error'
              : success
                ? 'border-chedr-success'
                : isFocused
                  ? 'border-chedr-orange'
                  : 'border-chedr-border',
            error && 'animate-shake'
          )}
        >
          {/* Country code */}
          <span className="text-chedr-text-secondary text-[17px] select-none">
            +1
          </span>

          {/* Phone input */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="(555) 555-5555"
            disabled={isLoading || success}
            autoComplete="tel-national"
            aria-label="Phone number"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'phone-error' : 'phone-hint'}
            className={cn(
              'bg-transparent text-white text-[17px]',
              'placeholder-chedr-text-tertiary outline-none',
              'w-[140px]',
              'disabled:opacity-50'
            )}
          />

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isLoading || success}
            aria-label={isLoading ? 'Verifying phone number' : success ? 'Verified' : 'Verify phone number'}
            className={cn(
              'px-4 py-2 rounded-[12px]',
              'text-[15px] font-semibold text-white',
              'transition-all duration-150',
              'min-w-[72px] h-[36px]',
              'flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-white/30',
              success
                ? 'bg-chedr-success'
                : isValid && !isLoading
                  ? 'bg-chedr-orange hover:bg-chedr-orange-hover cursor-pointer active:scale-95'
                  : 'bg-chedr-border cursor-not-allowed'
            )}
          >
            {success ? (
              <SuccessCheck />
            ) : isLoading ? (
              <LoadingSpinner />
            ) : (
              copy.cta.verify
            )}
          </button>
        </div>

        {/* Hint / Error text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          id={error ? 'phone-error' : 'phone-hint'}
          role={error ? 'alert' : undefined}
          className={cn(
            'text-[13px] pl-4 transition-colors duration-150',
            error ? 'text-chedr-error' : 'text-chedr-text-secondary'
          )}
        >
          {error || copy.onboarding.phoneHint}
        </motion.p>
      </div>
    </motion.div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const SuccessCheck: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <motion.path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M5 13l4 4L19 7"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3 }}
    />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default PhoneInputBubble;
