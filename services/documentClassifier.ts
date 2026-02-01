import { DocumentType, ProcessedDocument, LineageStage, VerificationStatus, ExtractedField } from '../types';

interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
  suggestedName?: string;
}

const DOCUMENT_PATTERNS: Array<{ pattern: RegExp; type: DocumentType; confidence: number }> = [
  { pattern: /w-?2/i, type: 'W-2', confidence: 0.95 },
  { pattern: /1099-?int/i, type: '1099-INT', confidence: 0.95 },
  { pattern: /1099-?misc/i, type: '1099-MISC', confidence: 0.95 },
  { pattern: /1099-?nec/i, type: '1099-NEC', confidence: 0.95 },
  { pattern: /1099-?div/i, type: '1099-DIV', confidence: 0.95 },
  { pattern: /1099-?b/i, type: '1099-B', confidence: 0.95 },
  { pattern: /1099/i, type: '1099-MISC', confidence: 0.7 },
  { pattern: /1098/i, type: '1098', confidence: 0.95 },
  { pattern: /receipt|rcpt/i, type: 'Receipt', confidence: 0.85 },
  { pattern: /invoice|inv/i, type: 'Invoice', confidence: 0.85 },
  { pattern: /bank\s*statement|statement/i, type: 'Bank Statement', confidence: 0.8 },
  { pattern: /tax/i, type: 'Tax Document', confidence: 0.6 },
  // Broaden support for common image/doc formats in naming
  { pattern: /\.(pdf|tiff?|jpe?g|png)$/i, type: 'Tax Document', confidence: 0.4 }, 
];

// Simulated Adaptive Learning Cache
const LEARNING_CACHE: Record<string, { corrections: number; lastValue: any }> = {};

export function updateModelFromCorrection(fieldId: string, oldValue: any, newValue: any) {
    // Simulate learning: if a field is corrected, we "learn" 
    if (!LEARNING_CACHE[fieldId]) {
        LEARNING_CACHE[fieldId] = { corrections: 0, lastValue: null };
    }
    LEARNING_CACHE[fieldId].corrections++;
    LEARNING_CACHE[fieldId].lastValue = newValue;
    console.log(`[Adaptive Learning] Updated model for field ${fieldId}. Total corrections: ${LEARNING_CACHE[fieldId].corrections}`);
}

export function detectAnomalies(fields: ExtractedField[]): string[] {
    const anomalies: string[] = [];
    const currentYear = new Date().getFullYear();

    fields.forEach(field => {
        // 1. Date Check: Future dates
        if (field.label.toLowerCase().includes('date') && typeof field.value === 'string') {
            const date = new Date(field.value);
            if (!isNaN(date.getTime()) && date.getFullYear() > currentYear) {
                anomalies.push(field.id);
            }
        }
        // 2. High Value Check (Simple Heuristic)
        if (typeof field.value === 'string' && field.value.startsWith('$')) {
             const num = parseFloat(field.value.replace(/[^0-9.]/g, ''));
             if (num > 1000000) { // Flag > $1M
                 anomalies.push(field.id);
             }
        }
    });
    return anomalies;
}

export function classifyDocument(filename: string): ClassificationResult {
  const normalizedName = filename.toLowerCase();

  for (const { pattern, type, confidence } of DOCUMENT_PATTERNS) {
    if (pattern.test(normalizedName)) {
      return { documentType: type, confidence };
    }
  }

  return { documentType: 'Tax Document', confidence: 0.3 };
}

export function generateDocumentId(): string {
  return crypto.randomUUID();
}

export function getFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function createInitialLineageStages(): LineageStage[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'source',
      type: 'source',
      label: 'Document Uploaded',
      timestamp: now,
      status: 'completed',
    },
    {
      id: 'extraction',
      type: 'extraction',
      label: 'Data Extraction',
      timestamp: now,
      status: 'active',
    },
    {
      id: 'verification',
      type: 'verification',
      label: 'Verification',
      timestamp: now,
      status: 'pending',
    },
  ];
}

export function determineVerificationStatus(confidence: number): VerificationStatus {
  if (confidence >= 0.9) return 'auto_verified';
  if (confidence >= 0.6) return 'needs_review';
  return 'discrepancy';
}

interface CreateDocumentOptions {
  file: File;
  thumbnailUrl?: string;
  fileUrl?: string;
  rawText?: string;
}

export async function createProcessedDocument(options: CreateDocumentOptions): Promise<ProcessedDocument> {
  const { file, thumbnailUrl, fileUrl, rawText } = options;
  const classification = classifyDocument(file.name);

  const doc: ProcessedDocument = {
    id: generateDocumentId(),
    type: classification.documentType,
    name: file.name,
    taxYear: new Date().getFullYear().toString(),
    timestamp: new Date().toISOString(),
    dataPointCount: 0,
    fields: [],
    confidence: classification.confidence,
    status: 'pending',
    sourceType: 'OCR',
    documentType: classification.documentType,
    processingStatus: 'extracting',
    verificationStatus: determineVerificationStatus(classification.confidence),
    lineageStages: createInitialLineageStages(),
    thumbnailUrl,
    fileUrl,
    mimeType: file.type,
    fileSize: getFileSize(file.size),
    rawText,
  };

  return doc;
}

export function getDocumentIcon(documentType: DocumentType): string {
  switch (documentType) {
    case 'W-2':
    case '1099-INT':
    case '1099-MISC':
    case '1099-NEC':
    case '1099-DIV':
    case '1099-B':
    case '1098':
    case 'Tax Document':
      return 'file-text';
    case 'Receipt':
    case 'Invoice':
      return 'receipt';
    case 'Bank Statement':
      return 'building-2';
    default:
      return 'file';
  }
}

export function isTaxDocument(documentType: DocumentType): boolean {
  return ['W-2', '1099-INT', '1099-MISC', '1099-NEC', '1099-DIV', '1099-B', '1098', 'Tax Document'].includes(documentType);
}

export function isReceiptDocument(documentType: DocumentType): boolean {
  return ['Receipt', 'Invoice', 'Bank Statement'].includes(documentType);
}
