
export interface ExtractedField {
  id: string;
  label: string;
  value: any;
  confidence: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  mapping?: string; 
  lineage: string; 
  sourceId: string; 
}

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
