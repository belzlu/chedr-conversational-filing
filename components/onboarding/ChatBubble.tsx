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
// SIMPLE MARKDOWN PARSER
// ============================================

const parseMarkdown = (text: string): React.ReactNode => {
  // Split by lines for block-level parsing
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-[15px] font-semibold text-white/90 mt-3 mb-1 first:mt-0">
          {parseInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-[17px] font-semibold text-white mt-3 mb-1 first:mt-0">
          {parseInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-[20px] font-semibold text-white mt-2 mb-2 first:mt-0">
          {parseInline(line.slice(2))}
        </h1>
      );
    }
    // List items
    else if (line.match(/^[-•]\s/)) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-1 my-0.5">
          <span className="text-chedr-orange shrink-0">•</span>
          <span>{parseInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={key++} className="flex gap-2 ml-1 my-0.5">
            <span className="text-chedr-text-secondary shrink-0 w-4">{match[1]}.</span>
            <span>{parseInline(match[2])}</span>
          </div>
        );
      }
    }
    // Empty line = paragraph break
    else if (line.trim() === '') {
      if (i > 0 && i < lines.length - 1) {
        elements.push(<div key={key++} className="h-2" />);
      }
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={key++} className="my-0.5">
          {parseInline(line)}
        </p>
      );
    }
  }

  return <>{elements}</>;
};

// Parse inline formatting: bold, italic, links
const parseInline = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/^\*([^*]+?)\*/);
    if (italicMatch) {
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Links: [text](url)
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="text-chedr-orange underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="px-1 py-0.5 bg-white/10 rounded text-[15px] font-mono">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Regular text - consume until next special character
    const textMatch = remaining.match(/^[^*`[\n]+/);
    if (textMatch) {
      parts.push(textMatch[0]);
      remaining = remaining.slice(textMatch[0].length);
    } else {
      // Single special char that didn't match a pattern
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
};

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

  // Parse markdown for chedr messages, render raw for user messages
  const content = message
    ? (isChedr || isSubtle ? parseMarkdown(message) : message)
    : children;

  // Convert delay from ms (legacy) to seconds (framer-motion)
  const delaySeconds = typeof delay === 'number' && delay > 1 ? delay / 1000 : delay;

  if (isSubtle) {
    return (
      <motion.div
        variants={animate ? bubbleVariants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={delaySeconds}
        className={cn('text-tertiary text-hig-footnote px-1 py-0 max-w-[320px]', className)}
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
          // Base styles - comfortable reading per agent.md
          'px-4 py-3 max-w-[320px]',
          'text-hig-body',

          // Sender-specific styles: User = orange pill, Chedr = plain text
          isChedr
            ? 'text-chedr-cloud/90'
            : 'bg-chedr-orange text-chedr-cloud rounded-full'
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
      <div className="px-4 py-3 bg-chedr-surface-elevated border border-white/[0.06] rounded-bubble rounded-bl-bubble-tail">
        <div className="flex gap-1 items-center h-[20px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-white/40 rounded-full animate-typing"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
