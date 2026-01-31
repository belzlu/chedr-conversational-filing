// ============================================
// CHEDR ONBOARDING COMPONENTS
// ============================================

// Core chat components
export { ChatBubble, TypingIndicator } from './ChatBubble';
export type { ChatBubbleProps, BubbleSender, BubbleVariant } from './ChatBubble';

export { PhoneInputBubble } from './PhoneInputBubble';
export type { PhoneInputBubbleProps } from './PhoneInputBubble';

export { CodeInputBubble } from './CodeInputBubble';
export type { CodeInputBubbleProps } from './CodeInputBubble';

// Main onboarding flow
export { ChatOnboarding } from './ChatOnboarding';

// Copy constants and types
export { copy, ONBOARDING_COPY } from './chatCopy';
export type { OnboardingStep, OnboardingState } from './chatCopy';
