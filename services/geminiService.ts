
import { GoogleGenAI, Type } from "@google/genai";
import { TaxData, ProcessedDocument, FilingStep, ChipAction } from "../types";
import { generateExtractionPrompt } from "./taxFormModels";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const updateTaxModelDeclaration = {
  name: "updateTaxModel",
  description: "Updates the live tax data model including profile, income, deductions, and payment sections.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      profileUpdates: {
        type: Type.OBJECT,
        properties: {
          legalName: { type: Type.STRING },
          ssnProvided: { type: Type.BOOLEAN },
          address: { type: Type.STRING },
          dateOfBirth: { type: Type.STRING },
          occupation: { type: Type.STRING },
          lastYearRefund: { type: Type.STRING }
        }
      },
      filingStatus: { type: Type.STRING },
      incomeTotal: { type: Type.STRING },
      deductionsTotal: { type: Type.STRING },
      taxesPaid: { type: Type.STRING },
      amountDue: { type: Type.STRING },
      currentStep: { type: Type.STRING, enum: ['START', 'INTAKE_DECISION', 'PROFILE', 'INCOME', 'DEDUCTIONS', 'TAXES_PAID', 'REVIEW', 'FINALIZING'] },
      suggestedChips: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            actionId: { type: Type.STRING },
            primary: { type: Type.BOOLEAN }
          },
          required: ["label", "actionId"]
        }
      },
      addDocument: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          name: { type: Type.STRING },
          taxYear: { type: Type.STRING },
          sourceType: { type: Type.STRING, enum: ["OCR", "Plaid", "LastYear"] },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ["PASS", "WARN", "FAIL"] },
                mapping: { type: Type.STRING },
                lineage: { type: Type.STRING }
              },
              required: ["label", "value", "confidence", "status", "lineage"]
            }
          }
        },
        required: ["type", "name", "taxYear", "fields", "sourceType"]
      }
    },
  },
};

const SYSTEM_INSTRUCTION = `
ROLE: You are the Chedr Tax Architect. Lead the user through the 2025 Tax Filing Season.

ONBOARDING OPTIONS:
1. **Prior Year Import**: Uploading 2023/2024 returns to populate identity and carry-over data.
2. **Plaid Sync**: Connecting bank/payroll accounts for instant wage and deduction mapping.
3. **Manual Upload**: Scanning W-2s, 1099s, and receipts for OCR extraction.

PROTOCOLS:
- If a document is uploaded, extract every possible field. Use 'LastYear' sourceType for prior returns.
- Always provide a summary of the extracted data.
- If confidence is low (< 0.8), set status to 'WARN' and tell the user to check the Inspector.
- Move users through steps: START -> PROFILE -> INCOME -> DEDUCTIONS -> TAXES_PAID -> REVIEW.
- Use 'updateTaxModel' every time the model should change. Always provide 'suggestedChips' relevant to the current conversation.

TONE: Warm, professional, expert guide. Formatting: Use **bold** for fields and amounts. Use clear paragraph breaks.

${generateExtractionPrompt()}
`;

export const sendMessageToGemini = async (
  history: any[],
  newMessage: string,
  currentData: TaxData,
  onUpdateData: (newData: Partial<TaxData>) => void,
  options?: { isComplex?: boolean; attachment?: { data: string; mimeType: string } }
): Promise<string> => {
  try {
    // Use Gemini 2.5 Flash for all requests (Pro requires paid quota)
    // TODO: Switch to Pro for vision/complex when API key has Pro access
    const modelName = 'gemini-2.5-flash';
    
    const contextStr = `
      Current Step: ${currentData.currentStep}
      Status: ${currentData.filingStatus || 'Not Set'}
      Income: ${currentData.incomeTotal}
      Deductions: ${currentData.deductionsTotal}
      Taxes Paid: ${currentData.taxesPaid}
    `;

    const parts: any[] = [{ text: `${contextStr}\nUser: ${newMessage}` }];
    // Multimodal support: Add image part
    if (options?.attachment) {
      parts.push({
        inlineData: {
          data: options.attachment.data,
          mimeType: options.attachment.mimeType
        }
      });
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [updateTaxModelDeclaration] }],
    };


    // Use standard config for 1.5 Pro
    // if (modelName.includes('thinking')) { ... } 

    const chat = ai.chats.create({
      model: modelName,
      config,
      history: history.map(h => ({
        role: h.role === "model" ? "model" : "user",
        parts: h.parts
      }))
    });

    const response = await chat.sendMessage({ message: parts });
    const toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
    
    if (toolCalls && toolCalls.length > 0) {
      toolCalls.forEach(call => {
        if (call.functionCall && call.functionCall.name === "updateTaxModel") {
          const args = call.functionCall.args as any;
          const updates: Partial<TaxData> = {};
          
          if (args.profileUpdates) updates.profile = { ...currentData.profile, ...args.profileUpdates };
          if (args.filingStatus) updates.filingStatus = args.filingStatus;
          if (args.incomeTotal) updates.incomeTotal = args.incomeTotal;
          if (args.deductionsTotal) updates.deductionsTotal = args.deductionsTotal;
          if (args.taxesPaid) updates.taxesPaid = args.taxesPaid;
          if (args.amountDue) updates.amountDue = args.amountDue;
          if (args.currentStep) updates.currentStep = args.currentStep as FilingStep;
          if (args.suggestedChips) updates.suggestedChips = args.suggestedChips;
          
          if (args.addDocument) {
            const newDoc: ProcessedDocument = {
              id: Date.now().toString(),
              type: args.addDocument.type,
              name: args.addDocument.name,
              taxYear: args.addDocument.taxYear,
              timestamp: new Date().toISOString(),
              dataPointCount: args.addDocument.fields.length,
              sourceType: args.addDocument.sourceType,
              fields: args.addDocument.fields.map((f: any, i: number) => ({ 
                ...f, id: `f-${i}-${Date.now()}`, sourceId: `doc-${Date.now()}` 
              })),
              confidence: 0.98,
              status: "processed",
            };
            updates.vault = [...(currentData.vault || []), newDoc];
            updates.docsReceived = (currentData.docsReceived || 0) + 1;
          }
          onUpdateData(updates);
        }
      });
    }

    return response.text || "Updated your tax return.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I hit an error. Please try again.";
  }
};
