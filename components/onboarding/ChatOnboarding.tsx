'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copy } from './chatCopy';
import { IconSecure } from '../Icons';

// ============================================
// TYPES
// ============================================

type FlowState = 'empty' | 'phone' | 'verifying' | 'code' | 'verifying-code' | 'success';

interface ChatOnboardingProps {
  onComplete: (phone: string) => void;
  onVerifyPhone?: (phone: string) => Promise<boolean>;
  onVerifyCode?: (code: string) => Promise<boolean>;
  onToggleModel?: () => void;
  isModelVisible?: boolean;
  isTestMode?: boolean;
  initialMessage?: string;
}

interface ConversationTurn {
  id: string;
  userMessage?: string;
  aiResponse?: string;
  isLoading?: boolean;
}

// ============================================
// SIMPLE MARKDOWN PARSER (for AI responses)
// ============================================

const parseMarkdown = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-[15px] font-semibold text-primary mt-4 mb-2 first:mt-0">
          {parseInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-[17px] font-semibold text-primary mt-4 mb-2 first:mt-0">
          {parseInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-[20px] font-semibold text-primary mt-3 mb-3 first:mt-0">
          {parseInline(line.slice(2))}
        </h1>
      );
    } else if (line.match(/^[-•]\s/)) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-1 my-1">
          <span className="text-chedr-orange shrink-0">•</span>
          <span>{parseInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={key++} className="flex gap-3 ml-1 my-1">
            <span className="text-tertiary shrink-0 w-5">{match[1]}.</span>
            <span>{parseInline(match[2])}</span>
          </div>
        );
      }
    } else if (line.trim() === '') {
      if (i > 0 && i < lines.length - 1) {
        elements.push(<div key={key++} className="h-3" />);
      }
    } else {
      elements.push(
        <p key={key++} className="my-1">
          {parseInline(line)}
        </p>
      );
    }
  }

  return <>{elements}</>;
};

const parseInline = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*([^*]+?)\*/);
    if (italicMatch) {
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const textMatch = remaining.match(/^[^*\n]+/);
    if (textMatch) {
      parts.push(textMatch[0]);
      remaining = remaining.slice(textMatch[0].length);
    } else {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
};

// ============================================
// MAIN COMPONENT - ChatGPT-style workspace
// ============================================

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({
  onComplete,
  onVerifyPhone,
  onVerifyCode,
  onToggleModel,
  isModelVisible,
  isTestMode = false,
  initialMessage,
}) => {
  const [flowState, setFlowState] = useState<FlowState>('empty');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (contentRef.current && conversation.length > 0) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [conversation]);

  // Get the welcome message for the centered prompt
  const welcomeMessage = initialMessage || "# Welcome to Chedr\n\nFile your 2025 taxes in minutes.\n\n**How it works:**\n1. Connect your accounts\n2. Review & optimize\n3. File electronically\n\nWe'll pull your income, deductions, and documents automatically. Takes about 10 minutes.";

  // Handle starting the conversation
  const handleStartConversation = useCallback(() => {
    // Transition from empty state to phone input
    setFlowState('phone');

    // Add initial turn with the welcome message as AI response
    const initialTurn: ConversationTurn = {
      id: '1',
      aiResponse: welcomeMessage + "\n\n" + copy.onboarding.phoneRequest,
    };
    setConversation([initialTurn]);
  }, [welcomeMessage]);

  const handlePhoneSubmit = useCallback(async (phoneNumber: string) => {
    setError(null);
    setFlowState('verifying');
    setPhone(phoneNumber);

    const formatted = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');

    // Add user message and loading state
    const newTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      userMessage: formatted,
      isLoading: true,
    };
    setConversation(prev => [...prev, newTurn]);

    try {
      if (onVerifyPhone) {
        const success = await onVerifyPhone(phoneNumber);
        if (!success) {
          setError(copy.onboarding.errorInvalidPhone);
          setFlowState('phone');
          // Remove loading state
          setConversation(prev => prev.slice(0, -1));
          return;
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Update turn with AI response
      setConversation(prev => prev.map(turn =>
        turn.id === newTurn.id
          ? { ...turn, isLoading: false, aiResponse: copy.onboarding.codeSent + "\n\n" + copy.onboarding.codeRequest }
          : turn
      ));
      setFlowState('code');
    } catch {
      setError(copy.onboarding.errorGeneric);
      setFlowState('phone');
      setConversation(prev => prev.slice(0, -1));
    }
  }, [onVerifyPhone]);

  const handleCodeSubmit = useCallback(async (code: string) => {
    setError(null);
    setFlowState('verifying-code');

    const newTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      userMessage: '••••••',
      isLoading: true,
    };
    setConversation(prev => [...prev, newTurn]);

    if (isTestMode) {
      setTimeout(() => {
        setConversation(prev => prev.map(turn =>
          turn.id === newTurn.id
            ? { ...turn, isLoading: false, aiResponse: 'TEST MODE: Verification bypassed.' }
            : turn
        ));
        setFlowState('success');
        setTimeout(() => onComplete(phone), 1000);
      }, 500);
      return;
    }

    try {
      if (onVerifyCode) {
        const success = await onVerifyCode(code);
        if (!success) {
          setError(copy.onboarding.errorInvalidCode);
          setFlowState('code');
          setConversation(prev => prev.slice(0, -1));
          return;
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setConversation(prev => prev.map(turn =>
        turn.id === newTurn.id
          ? { ...turn, isLoading: false, aiResponse: copy.onboarding.success }
          : turn
      ));
      setFlowState('success');
      setTimeout(() => onComplete(phone), 1200);
    } catch {
      setError(copy.onboarding.errorGeneric);
      setFlowState('code');
      setConversation(prev => prev.slice(0, -1));
    }
  }, [onVerifyCode, phone, onComplete, isTestMode]);

  // Handle input submission based on flow state
  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    if (flowState === 'phone') {
      // Validate phone number (10 digits)
      const digits = value.replace(/\D/g, '');
      if (digits.length === 10) {
        handlePhoneSubmit(digits);
        setInputValue('');
      } else {
        setError('Please enter a valid 10-digit phone number');
      }
    } else if (flowState === 'code') {
      // Validate code (6 digits)
      const digits = value.replace(/\D/g, '');
      if (digits.length === 6) {
        handleCodeSubmit(digits);
        setInputValue('');
      } else {
        setError('Please enter the 6-digit code');
      }
    }
  }, [flowState, inputValue, handlePhoneSubmit, handleCodeSubmit]);

  const getPlaceholder = () => {
    if (flowState === 'empty') return 'Get started...';
    if (flowState === 'phone') return 'Enter your phone number...';
    if (flowState === 'code') return 'Enter verification code...';
    return 'Type a message...';
  };

  const isInputDisabled = flowState === 'verifying' || flowState === 'verifying-code' || flowState === 'success';

  // ============================================
  // RENDER - ChatGPT-style layout
  // ============================================

  return (
    <div className="flex flex-col h-full bg-chedr-background">
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="text-hig-subhead font-medium text-primary">Chedr</span>
          <span className="text-hig-caption1 text-quaternary">Tax Filing</span>
        </div>
        {onToggleModel && (
          <button
            type="button"
            onClick={onToggleModel}
            className="px-3 py-1.5 text-hig-caption1 font-medium text-tertiary bg-white/[0.04] border border-white/[0.06] rounded-hig-sm hover:bg-white/[0.08] hover:text-secondary transition-colors"
          >
            {isModelVisible ? 'Hide Form' : 'Show Form'}
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main ref={contentRef} className="flex-1 overflow-y-auto">
        {flowState === 'empty' ? (
          /* ============================================
             EMPTY STATE - Centered prompt (ChatGPT-style)
             ============================================ */
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl text-center">
              {/* Main Question */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[28px] font-semibold text-primary mb-8"
              >
                Where should we begin?
              </motion.h1>

              {/* Quick Action Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
              >
                <button
                  type="button"
                  onClick={handleStartConversation}
                  className="px-5 py-2.5 text-hig-subhead text-secondary bg-white/[0.04] border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:text-primary hover:border-white/[0.12] transition-all"
                >
                  Start my 2025 return
                </button>
                <button
                  type="button"
                  onClick={handleStartConversation}
                  className="px-5 py-2.5 text-hig-subhead text-secondary bg-white/[0.04] border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:text-primary hover:border-white/[0.12] transition-all"
                >
                  Upload a document
                </button>
              </motion.div>

              {/* Today's pulse / hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 text-hig-footnote text-tertiary"
              >
                <span className="text-[16px]">📋</span>
                <span>Today's pulse</span>
                <span className="text-quaternary">›</span>
                <span className="text-secondary">Chedr's launch audit, bridging AI with verified tax logic...</span>
              </motion.div>
            </div>
          </div>
        ) : (
          /* ============================================
             CONVERSATION VIEW - After user starts
             ============================================ */
          <div className="w-full max-w-3xl mx-auto px-6 py-6">
            <AnimatePresence mode="popLayout">
              {conversation.map((turn) => (
                <motion.div
                  key={turn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  {/* User Message - distinct styling */}
                  {turn.userMessage && (
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-chedr-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[12px] font-semibold text-chedr-orange">Y</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-hig-caption2 font-medium text-tertiary mb-1">You</p>
                          <p className="text-hig-body text-primary">{turn.userMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Response */}
                  {(turn.aiResponse || turn.isLoading) && (
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <ChedrIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-hig-caption2 font-medium text-tertiary mb-1">Chedr</p>
                        {turn.isLoading ? (
                          <div className="flex items-center gap-1.5 py-2">
                            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.15s' }} />
                            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
                          </div>
                        ) : (
                          <div className="text-hig-body text-secondary leading-relaxed">
                            {parseMarkdown(turn.aiResponse!)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Success State */}
            {flowState === 'success' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-3 p-4 rounded-hig-lg bg-chedr-success/10 border border-chedr-success/20"
              >
                <div className="w-8 h-8 rounded-full bg-chedr-success flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-hig-subhead font-medium text-chedr-success">Verified! Redirecting...</p>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Input Bar - ChatGPT-style, centered */}
      <div className="border-t border-white/[0.04] px-6 py-4">
        <div className="w-full max-w-2xl mx-auto">
          <form onSubmit={handleInputSubmit}>
            <div className={`
              flex items-center gap-3 px-5 py-3 rounded-full border transition-all
              ${isInputDisabled
                ? 'bg-white/[0.02] border-white/[0.04]'
                : 'bg-hig-gray6 border-white/[0.08] focus-within:border-white/[0.15] focus-within:bg-white/[0.06]'
              }
            `}>
              {/* Plus icon */}
              <button
                type="button"
                aria-label="Add attachment"
                className="text-tertiary hover:text-secondary transition-colors"
                disabled={isInputDisabled}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError(null);
                }}
                onFocus={() => {
                  if (flowState === 'empty') {
                    handleStartConversation();
                  }
                }}
                placeholder={getPlaceholder()}
                disabled={isInputDisabled}
                className="flex-1 bg-transparent text-hig-body text-primary placeholder:text-quaternary outline-none"
              />

              {/* Error message */}
              {error && (
                <span className="text-hig-caption1 text-chedr-error">{error}</span>
              )}

              {/* Submit button */}
              <button
                type="submit"
                aria-label="Send message"
                disabled={isInputDisabled || !inputValue.trim()}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${inputValue.trim() && !isInputDisabled
                    ? 'bg-chedr-orange text-white hover:bg-chedr-orange-hover'
                    : 'bg-white/[0.06] text-quaternary'
                  }
                `}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 mt-3 text-hig-caption2 text-quaternary">
            <IconSecure className="w-3.5 h-3.5 text-chedr-success" />
            <span>{copy.trust.encryption}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const ChedrIcon = () => (
  <svg className="w-4 h-4 text-chedr-orange" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export default ChatOnboarding;
