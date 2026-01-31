'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble, TypingIndicator } from './ChatBubble';
import { PhoneInputBubble } from './PhoneInputBubble';
import { CodeInputBubble } from './CodeInputBubble';
import { copy } from './chatCopy';
import { IconSecure } from '../Icons';

// ============================================
// TYPES
// ============================================

type FlowState = 'greeting' | 'phone' | 'verifying' | 'code' | 'verifying-code' | 'success';

interface ChatOnboardingProps {
  onComplete: (phone: string) => void;
  onVerifyPhone?: (phone: string) => Promise<boolean>;
  onVerifyCode?: (code: string) => Promise<boolean>;
  onToggleModel?: () => void;
  isModelVisible?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'chedr' | 'user';
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    }
  }
};

// ============================================
// SUCCESS CHECKMARK COMPONENT
// ============================================

const SuccessCheck: React.FC = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="flex justify-start"
  >
    <div className="w-12 h-12 rounded-full bg-chedr-success flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M5 12l5 5L19 7"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      </svg>
    </div>
  </motion.div>
);

// ============================================
// TRUST BADGE COMPONENT
// ============================================

const TrustBadge: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="flex items-center gap-2 text-[13px] text-chedr-text-secondary"
  >
    <IconSecure className="w-4 h-4 text-chedr-success" />
    {copy.trust.encryption}
  </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({
  onComplete,
  onVerifyPhone,
  onVerifyCode,
  onToggleModel,
  isModelVisible,
}) => {
  const [flowState, setFlowState] = useState<FlowState>('greeting');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with greeting
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setMessages([{ id: '1', text: copy.onboarding.greeting, sender: 'chedr' }]);
    }, 300);

    const timer2 = setTimeout(() => {
      setMessages(prev => [...prev, { id: '2', text: copy.onboarding.phoneRequest, sender: 'chedr' }]);
      setFlowState('phone');
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const addChedrMessage = useCallback((text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), text, sender: 'chedr' }]);
    }, 500);
  }, []);

  const handlePhoneSubmit = useCallback(async (phoneNumber: string) => {
    setError(null);
    setFlowState('verifying');
    setPhone(phoneNumber);

    // Add user's phone as a message
    const formatted = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text: formatted, sender: 'user' }]);

    try {
      // If custom verification handler provided, use it
      if (onVerifyPhone) {
        const success = await onVerifyPhone(phoneNumber);
        if (!success) {
          setError(copy.onboarding.errorInvalidPhone);
          setFlowState('phone');
          return;
        }
      } else {
        // Default: simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Success - show code sent message
      addChedrMessage(copy.onboarding.codeSent);
      setTimeout(() => {
        addChedrMessage(copy.onboarding.codeRequest);
        setFlowState('code');
      }, 1000);
    } catch {
      setError(copy.onboarding.errorGeneric);
      setFlowState('phone');
    }
  }, [onVerifyPhone, addChedrMessage]);

  const handleCodeSubmit = useCallback(async (code: string) => {
    setError(null);
    setFlowState('verifying-code');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text: '••••••', sender: 'user' }]);

    try {
      // If custom verification handler provided, use it
      if (onVerifyCode) {
        const success = await onVerifyCode(code);
        if (!success) {
          setError(copy.onboarding.errorInvalidCode);
          setFlowState('code');
          return;
        }
      } else {
        // Default: simulate verification
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Success
      addChedrMessage(copy.onboarding.success);
      setFlowState('success');

      // Auto-advance after success animation
      setTimeout(() => {
        onComplete(phone);
      }, 1200);
    } catch {
      setError(copy.onboarding.errorGeneric);
      setFlowState('code');
    }
  }, [onVerifyCode, phone, onComplete, addChedrMessage]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-chedr-orange/15 flex items-center justify-center">
            <ChedrLogo />
          </div>
          <h1 className="text-[17px] font-semibold text-white">Chedr</h1>
        </div>
        {onToggleModel && (
          <button
            type="button"
            onClick={onToggleModel}
            className="px-4 py-2 text-[15px] font-medium text-white/60 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-colors"
          >
            {isModelVisible ? 'Hide Form' : 'Show Form'}
          </button>
        )}
      </header>

      {/* Chat container - centered, max-width 480px */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Chat Container */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {/* Message History */}
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.text}
                  sender={msg.sender}
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && <TypingIndicator />}
            </AnimatePresence>

            {/* Interactive Elements */}
            <AnimatePresence mode="wait">
              {flowState === 'phone' && (
                <PhoneInputBubble
                  key="phone-input"
                  onSubmit={handlePhoneSubmit}
                  error={error}
                />
              )}

              {flowState === 'code' && (
                <CodeInputBubble
                  key="code-input"
                  onSubmit={handleCodeSubmit}
                  error={error}
                />
              )}

              {flowState === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 bg-chedr-surface-elevated rounded-[18px] rounded-bl-[4px]">
                    <div className="flex items-center gap-2 text-chedr-text-secondary">
                      <LoadingSpinner />
                      <span>{copy.onboarding.verifying}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {flowState === 'verifying-code' && (
                <motion.div
                  key="verifying-code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 bg-chedr-surface-elevated rounded-[18px] rounded-bl-[4px]">
                    <div className="flex items-center gap-2 text-chedr-text-secondary">
                      <LoadingSpinner />
                      <span>{copy.onboarding.verifying}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {flowState === 'success' && (
                <SuccessCheck key="success" />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trust Badge */}
          <div className="mt-8 flex justify-center">
            <TrustBadge />
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const ChedrLogo = () => (
  <svg className="w-5 h-5 text-chedr-orange" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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

export default ChatOnboarding;
