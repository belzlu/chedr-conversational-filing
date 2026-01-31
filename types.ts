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
    data?: any;
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
