'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type BubbleSender = 'chedr' | 'user';
export type BubbleVariant = 'chedr' | 'user' | 'subtle';

export interface ChatBubbleProps {
  /** Message text (new API) */
  message?: string;
  /** Children content (legacy API) */
  children?: React.ReactNode;
  /** Sender type for styling */
  sender?: BubbleSender;
  /** Variant for styling (legacy API) */
  variant?: BubbleVariant;
  /** Animation delay in seconds */
  delay?: number;
  /** Whether to animate (legacy API) */
  animate?: boolean;
  className?: string;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const bubbleVariants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.95,
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1], // ease-out
      delay,
    },
  }),
};

// ============================================
// COMPONENT
// ============================================

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  children,
  sender,
  variant,
  className,
  delay = 0,
  animate = true,
}) => {
  // Support both new (sender) and legacy (variant) APIs
  const resolvedVariant = variant || sender || 'chedr';
  const isChedr = resolvedVariant === 'chedr';
  const isSubtle = resolvedVariant === 'subtle';
  const content = message || children;

  // Convert delay from ms (legacy) to seconds (framer-motion)
  const delaySeconds = typeof delay === 'number' && delay > 1 ? delay / 1000 : delay;

  if (isSubtle) {
    return (
      <motion.div
        variants={animate ? bubbleVariants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={delaySeconds}
        className={cn('text-[#8E8E93] text-[13px] px-1 py-0 max-w-[280px]', className)}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={animate ? bubbleVariants : undefined}
      initial={animate ? 'hidden' : undefined}
      animate={animate ? 'visible' : undefined}
      custom={delaySeconds}
      className={cn(
        'flex',
        isChedr ? 'justify-start' : 'justify-end',
        className
      )}
    >
      <div
        className={cn(
          // Base styles
          'px-4 py-3 max-w-[280px]',
          'text-[17px] leading-relaxed font-normal',

          // Sender-specific styles
          isChedr
            ? 'bg-chedr-surface-elevated text-white rounded-[18px] rounded-bl-[4px]'
            : 'bg-chedr-orange text-white rounded-[18px] rounded-br-[4px]'
        )}
      >
        {content}
      </div>
    </motion.div>
  );
};

// ============================================
// TYPING INDICATOR
// ============================================

export const TypingIndicator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn('flex justify-start', className)}
    >
      <div className="px-4 py-3 bg-chedr-surface-elevated rounded-[18px] rounded-bl-[4px]">
        <div className="flex gap-1 items-center h-[20px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-chedr-text-secondary rounded-full animate-typing"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
