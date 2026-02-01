// Tax Form Models for Extraction
// These define the schema we expect Gemini to extract from documents.

export interface TaxFieldDefinition {
  key: string;
  label: string; // The text on the form (e.g., "Wages, tips, other compensation")
  description?: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface TaxFormDefinition {
  formType: string;
  fields: TaxFieldDefinition[];
}

export const W2_MODEL: TaxFormDefinition = {
  formType: "W-2",
  fields: [
    { key: "employerName", label: "Employer's name", type: "string" },
    { key: "employerId", label: "Employer identification number (EIN)", type: "string" },
    { key: "employeeName", label: "Employee's name", type: "string" },
    { key: "employeeSsn", label: "Employee's social security number", type: "string" },
    { key: "wages", label: "Box 1 Wages, tips, other compensation", type: "number" },
    { key: "fedTaxWithheld", label: "Box 2 Federal income tax withheld", type: "number" },
    { key: "ssWages", label: "Box 3 Social security wages", type: "number" },
    { key: "ssTaxWithheld", label: "Box 4 Social security tax withheld", type: "number" },
    { key: "medicareWages", label: "Box 5 Medicare wages and tips", type: "number" },
    { key: "medicareTaxWithheld", label: "Box 6 Medicare tax withheld", type: "number" },
    { key: "ssTips", label: "Box 7 Social security tips", type: "number" },
    { key: "allocatedTips", label: "Box 8 Allocated tips", type: "number" },
    { key: "dependentCare", label: "Box 10 Dependent care benefits", type: "number" },
    { key: "nonqualifiedPlans", label: "Box 11 Nonqualified plans", type: "number" },
    { key: "box12", label: "Box 12 Codes (List all)", type: "string" },
    { key: "state", label: "Box 15 State", type: "string" },
    { key: "stateWages", label: "Box 16 State wages, tips, etc.", type: "number" },
    { key: "stateTax", label: "Box 17 State income tax", type: "number" },
    { key: "localWages", label: "Box 18 Local wages, tips, etc.", type: "number" },
    { key: "localTax", label: "Box 19 Local income tax", type: "number" },
  ]
};

export const FORM_1099_INT_MODEL: TaxFormDefinition = {
  formType: "1099-INT",
  fields: [
    { key: "payerName", label: "Payer's name", type: "string" },
    { key: "payerTin", label: "Payer's TIN", type: "string" },
    { key: "recipientName", label: "Recipient's name", type: "string" },
    { key: "interestIncome", label: "Box 1 Interest income", type: "number" },
    { key: "earlyWithdrawalPenalty", label: "Box 2 Early withdrawal penalty", type: "number" },
    { key: "usSavingsBonds", label: "Box 3 Interest on U.S. Savings Bonds", type: "number" },
    { key: "fedTaxWithheld", label: "Box 4 Federal income tax withheld", type: "number" },
  ]
};

export const FORM_1099_NEC_MODEL: TaxFormDefinition = {
  formType: "1099-NEC",
  fields: [
    { key: "payerName", label: "Payer's name", type: "string" },
    { key: "payerTin", label: "Payer's TIN", type: "string" },
    { key: "recipientName", label: "Recipient's name", type: "string" },
    { key: "nonemployeeComp", label: "Box 1 Nonemployee compensation", type: "number" },
    { key: "fedTaxWithheld", label: "Box 4 Federal income tax withheld", type: "number" },
    { key: "stateTaxWithheld", label: "Box 5 State tax withheld", type: "number" },
  ]
};

export const FORM_1040_MODEL: TaxFormDefinition = {
  formType: "1040",
  fields: [
    { key: "filingStatus", label: "Filing Status", type: "string" },
    { key: "firstName", label: "Your first name", type: "string" },
    { key: "lastName", label: "Your last name", type: "string" },
    { key: "ssn", label: "Your social security number", type: "string" },
    { key: "spouseFirstName", label: "Spouse's first name", type: "string" },
    { key: "spouseLastName", label: "Spouse's last name", type: "string" },
    { key: "totalIncome", label: "Line 9 Total Income", type: "number" },
    { key: "agi", label: "Line 11 Adjusted Gross Income", type: "number" },
    { key: "taxableIncome", label: "Line 15 Taxable Income", type: "number" },
    { key: "totalTax", label: "Line 24 Total Tax", type: "number" },
    { key: "totalPayments", label: "Line 33 Total Payments", type: "number" },
    { key: "overpaid", label: "Line 34 Amount Overpaid", type: "number" },
    { key: "amountOwed", label: "Line 37 Amount You Owe", type: "number" },
  ]
};

export const ALL_MODELS = [W2_MODEL, FORM_1099_INT_MODEL, FORM_1099_NEC_MODEL, FORM_1040_MODEL];

export function generateExtractionPrompt(): string {
  let prompt = "EXTRACT THE FOLLOWING FIELDS EXACTLY. Return them in the 'fields' array of 'addDocument'.\n\n";
  
  for (const model of ALL_MODELS) {
    prompt += `For ${model.formType}:
`;
    for (const field of model.fields) {
      prompt += `- ${field.label} (Key: ${field.key})
`;
    }
    prompt += "\n";
  }
  
  return prompt;
}

// Visual Reference / Tax Input Map
// This represents the canonical "TaxInput" file structure user requested
export interface TaxInput {
  taxYear: number;
  taxpayer: {
    firstName: string;
    lastName: string;
    ssn: string;
    filingStatus: string;
  };
  spouse?: {
    firstName: string;
    lastName: string;
    ssn: string;
  };
  income: {
    w2s: Array<Record<string, any>>;
    forms1099Int: Array<Record<string, any>>;
    forms1099Nec: Array<Record<string, any>>;
  };
  summary: {
    totalIncome: number;
    agi: number;
    taxableIncome: number;
    totalTax: number;
    totalPayments: number;
    refundOrOwe: number;
  };
}
