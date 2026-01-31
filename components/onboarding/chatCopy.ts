// ============================================
// ONBOARDING COPY CONSTANTS - Keep it ≤7 words
// ============================================

export const copy = {
  // Onboarding flow
  onboarding: {
    greeting: "Let's get you filed.",
    phoneRequest: "What's your phone number?",
    phoneHint: "We'll text you a code.",
    verifying: "Verifying...",
    codeSent: "Code sent!",
    codeRequest: "Enter your code.",
    success: "You're in.",
    errorGeneric: "Something went wrong.",
    errorInvalidPhone: "Check that number.",
    errorInvalidCode: "Wrong code. Try again?",
    errorRateLimit: "Too many attempts.",
  },

  // Trust signals
  trust: {
    encryption: "Bank-level encryption",
    irs: "IRS authorized e-file provider",
    secure: "Your data is secure",
  },

  // CTAs
  cta: {
    verify: "Verify",
    continue: "Continue",
    tryAgain: "Try again",
    resendCode: "Resend code",
  },
} as const;

// Legacy exports for backwards compatibility
export const ONBOARDING_COPY = {
  greeting: copy.onboarding.greeting,
  phoneRequest: copy.onboarding.phoneRequest,
  phoneHint: copy.onboarding.phoneHint,
  phonePlaceholder: "(555) 123-4567",
  verifyButton: copy.cta.verify,
  verifying: copy.onboarding.verifying,
  codeSent: copy.onboarding.codeSent,
  codeRequest: copy.onboarding.codeRequest,
  codePlaceholder: "000000",
  codeVerifying: copy.onboarding.verifying,
  codeSuccess: copy.onboarding.success,
  codeError: copy.onboarding.errorInvalidCode,
  phoneError: copy.onboarding.errorInvalidPhone,
  trustBadge: copy.trust.encryption,
} as const;

export type OnboardingStep =
  | 'greeting'
  | 'phone-request'
  | 'phone-input'
  | 'phone-verifying'
  | 'code-sent'
  | 'code-input'
  | 'code-verifying'
  | 'success'
  | 'error';

export interface OnboardingState {
  step: OnboardingStep;
  phone: string;
  error?: string;
}

export default copy;
