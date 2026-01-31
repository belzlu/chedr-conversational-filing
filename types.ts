export type FieldValue = string | number | boolean | null;

export interface ExtractedField {
  id: string;
  label: string;
  value: FieldValue;
  confidence: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  mapping?: string;
  lineage: string;
  sourceId: string;
  verificationStatus?: VerificationStatus;
}

// Document Vault Types
export type DocumentType =
  | 'W-2' | '1099-INT' | '1099-MISC' | '1099-NEC' | '1099-DIV' | '1099-B'
  | '1098' | 'Receipt' | 'Invoice' | 'Bank Statement' | 'Tax Document';

export type ProcessingStatus =
  | 'uploading' | 'scanning' | 'extracting'
  | 'processed' | 'review_needed' | 'verified' | 'flagged';

export type VerificationStatus =
  | 'auto_verified'    // green - high confidence
  | 'needs_review'     // amber - low confidence or missing data
  | 'discrepancy'      // red - conflicting values
  | 'user_verified';   // green with user checkmark

export interface LineageStage {
  id: string;
  type: 'source' | 'extraction' | 'verification';
  label: string;
  timestamp: string;
  confidence?: number;
  status: 'completed' | 'active' | 'pending';
}

export type VaultFilter = 'all' | 'tax' | 'receipt';

export type UploadState = 'idle' | 'hover' | 'uploading' | 'processing';

export interface ProcessedDocument {
  id: string;
  type: string;
  name: string;
  taxYear: string;
  timestamp: string;
  dataPointCount: number;
  fields: ExtractedField[];
  confidence: number;
  status: 'processed' | 'pending' | 'flagged';
  sourceType: 'OCR' | 'Plaid' | 'LastYear';
  institution?: string;
  // Extended vault fields
  documentType?: DocumentType;
  processingStatus?: ProcessingStatus;
  verificationStatus?: VerificationStatus;
  lineageStages?: LineageStage[];
  thumbnailUrl?: string;
  fileSize?: string;
  rawText?: string;
}

export type FilingStep = 'START' | 'INTAKE_DECISION' | 'PROFILE' | 'INCOME' | 'DEDUCTIONS' | 'TAXES_PAID' | 'REVIEW' | 'FINALIZING';

export interface TaxProfile {
  legalName?: string;
  ssnProvided: boolean;
  address?: string;
  dateOfBirth?: string;
  occupation?: string;
  lastYearRefund?: string;
}

export interface TaxData {
  profile: TaxProfile;
  filingStatus: string | null;
  dependents: number | null;
  docsReceived: number;
  incomeTotal: string; 
  deductionsTotal: string;
  taxesPaid: string;
  amountDue: string;
  checks: string[]; 
  outcome: string; 
  vault: ProcessedDocument[];
  connectedAccounts: string[];
  currentStep: FilingStep;
  suggestedChips: ChipAction[];
}

export interface ChipAction {
  label: string;
  actionId: string;
  primary?: boolean;
}

// Plaid Coverage Types for Bank Connection Matrix
export interface PlaidCoverage {
  bankId: string;
  bankName: string;
  bankIcon?: string;
  identity: {
    available: boolean;
    fields: string[];
    coverage: number; // 0-4 for ●●●○ style display
  };
  income: {
    wages: boolean;
    interest: boolean;
    investments: boolean;
    other: boolean;
    coverage: number;
  };
  deductions: {
    mortgage: boolean;
    charitable: boolean;
    medical: boolean;
    coverage: number;
  };
  coveragePercent: number;
}

export interface PlaidConnectionResult {
  bankId: string;
  bankName: string;
  success: boolean;
  documentsFound: {
    type: string;
    amount: string;
    form?: string;
  }[];
  coverage: {
    identity: { complete: boolean; found: string[] };
    income: { count: number; total: number; types: string[] };
    deductions: { count: number; total: number; types: string[] };
  };
}

// Mock coverage data for demo banks
export const BANK_COVERAGE_DATA: Record<string, PlaidCoverage> = {
  'chase': {
    bankId: 'chase',
    bankName: 'Chase',
    identity: { available: true, fields: ['Name', 'Address', 'Last 4 SSN'], coverage: 3 },
    income: { wages: true, interest: true, investments: false, other: true, coverage: 3 },
    deductions: { mortgage: true, charitable: false, medical: false, coverage: 1 },
    coveragePercent: 85,
  },
  'bofa': {
    bankId: 'bofa',
    bankName: 'Bank of America',
    identity: { available: true, fields: ['Name', 'Address'], coverage: 2 },
    income: { wages: true, interest: true, investments: false, other: false, coverage: 2 },
    deductions: { mortgage: true, charitable: false, medical: false, coverage: 1 },
    coveragePercent: 78,
  },
  'wells': {
    bankId: 'wells',
    bankName: 'Wells Fargo',
    identity: { available: true, fields: ['Name', 'Address'], coverage: 2 },
    income: { wages: true, interest: true, investments: false, other: false, coverage: 2 },
    deductions: { mortgage: false, charitable: false, medical: false, coverage: 0 },
    coveragePercent: 72,
  },
  'fidelity': {
    bankId: 'fidelity',
    bankName: 'Fidelity',
    identity: { available: true, fields: ['Name'], coverage: 1 },
    income: { wages: false, interest: true, investments: true, other: true, coverage: 3 },
    deductions: { mortgage: false, charitable: false, medical: false, coverage: 0 },
    coveragePercent: 65,
  },
  'schwab': {
    bankId: 'schwab',
    bankName: 'Schwab',
    identity: { available: true, fields: ['Name'], coverage: 1 },
    income: { wages: false, interest: true, investments: true, other: true, coverage: 3 },
    deductions: { mortgage: false, charitable: false, medical: false, coverage: 0 },
    coveragePercent: 65,
  },
  'capital_one': {
    bankId: 'capital_one',
    bankName: 'Capital One',
    identity: { available: true, fields: ['Name', 'Address'], coverage: 2 },
    income: { wages: false, interest: true, investments: false, other: false, coverage: 1 },
    deductions: { mortgage: false, charitable: false, medical: false, coverage: 0 },
    coveragePercent: 55,
  },
};

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  chips?: ChipAction[];
  imagePreview?: string;
  fileMeta?: {
    name: string;
    type: string;
  };
  statusUpdate?: string; 
  isThinking?: boolean;
  widget?: {
    type: 'plaid' | 'upload';
    data?: Record<string, unknown>;
    // Track if widget interaction is complete
    completed?: boolean;
  };
}

export const INITIAL_TAX_DATA: TaxData = {
  profile: {
    ssnProvided: false,
  },
  filingStatus: null,
  dependents: null,
  docsReceived: 0,
  incomeTotal: "$0.00",
  deductionsTotal: "$0.00",
  taxesPaid: "$0.00",
  amountDue: "$0.00",
  checks: ["onboarding_pending"],
  outcome: "Calculating...",
  vault: [],
  connectedAccounts: [],
  currentStep: 'START',
  suggestedChips: []
};
