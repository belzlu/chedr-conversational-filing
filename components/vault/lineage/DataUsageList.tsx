import React from 'react';
import { ExtractedField, DocumentType } from '../../../types';
import { IconArrowRight, IconFile, IconCheck } from '../../Icons'; // Need to add IconArrowRight

interface DataUsageListProps {
  fields: ExtractedField[];
  documentType: DocumentType;
}

interface TaxMapping {
  form: string;
  line: string;
  description: string;
}

const getTaxMapping = (label: string, docType: DocumentType): TaxMapping | null => {
  const normalizedLabel = label.toLowerCase();
  
  if (docType === 'W-2') {
    if (normalizedLabel.includes('wages') || normalizedLabel.includes('compensation')) {
      return { form: 'Form 1040', line: 'Line 1a', description: 'Total Income' };
    }
    if (normalizedLabel.includes('federal income tax') || normalizedLabel.includes('withheld')) {
      return { form: 'Form 1040', line: 'Line 25a', description: 'Federal Tax Withheld' };
    }
    if (normalizedLabel.includes('social security wages')) {
      return { form: 'Schedule SE', line: 'Part I', description: 'Self-Employment Tax' };
    }
    if (normalizedLabel.includes('medicare')) {
      return { form: 'Form 8959', line: 'Part I', description: 'Medicare Tax' };
    }
  }

  if (docType === '1099-INT') {
    if (normalizedLabel.includes('interest')) {
      return { form: 'Form 1040', line: 'Line 2b', description: 'Taxable Interest' };
    }
  }

  if (docType === '1099-DIV') {
    if (normalizedLabel.includes('ordinary dividends')) {
      return { form: 'Form 1040', line: 'Line 3b', description: 'Ordinary Dividends' };
    }
    if (normalizedLabel.includes('qualified dividends')) {
      return { form: 'Form 1040', line: 'Line 3a', description: 'Qualified Dividends' };
    }
  }

  if (docType === '1098') {
    if (normalizedLabel.includes('mortgage')) {
      return { form: 'Schedule A', line: 'Line 8a', description: 'Home Mortgage Interest' };
    }
  }

  // Default fallback for demo purposes if no specific match
  if (normalizedLabel.includes('tax')) {
    return { form: 'Schedule A', line: 'Line 5', description: 'State and Local Taxes' };
  }

  return null;
};

export const DataUsageList: React.FC<DataUsageListProps> = ({ fields, documentType }) => {
  const mappedFields = fields.map(field => ({
    ...field,
    mapping: getTaxMapping(field.label, documentType)
  })).filter(f => f.mapping !== null); // Only show fields that are used

  if (mappedFields.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-hig-footnote font-semibold text-white/80">Data Usage</h3>
        <span className="text-hig-caption2 text-white/40">{mappedFields.length} fields used in filing</span>
      </div>

      <div className="space-y-2">
        {mappedFields.map((field) => (
          <div key={field.id} className="group relative p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
             {/* Connection Line (Visual Decoration) */}
             <div className="absolute left-[19px] top-8 bottom-[-10px] w-0.5 bg-white/10 group-last:hidden" />

            <div className="flex items-start gap-4">
              {/* Source Icon */}
              <div className="mt-1 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <IconFile className="w-4 h-4 text-white/60" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Field Source */}
                <div className="mb-2">
                  <p className="text-hig-caption2 text-white/40 mb-0.5">Extracted from {documentType}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-hig-footnote font-medium text-white/90">{field.label}</p>
                    <p className="text-hig-footnote font-mono text-white/80">{String(field.value)}</p>
                  </div>
                </div>

                {/* Flow Arrow */}
                <div className="flex items-center gap-2 py-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[10px] uppercase tracking-wider text-hig-blue font-semibold">Maps To</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                </div>

                {/* Destination */}
                <div className="mt-2 flex items-center gap-3 p-2 rounded bg-hig-blue/10 border border-hig-blue/20">
                  <div className="w-6 h-6 rounded-full bg-hig-blue/20 flex items-center justify-center shrink-0">
                    <IconCheck className="w-3 h-3 text-hig-blue" />
                  </div>
                  <div>
                    <p className="text-hig-footnote font-semibold text-white/90">
                      {field.mapping?.form} • <span className="text-hig-blue">{field.mapping?.line}</span>
                    </p>
                    <p className="text-hig-caption2 text-white/50">{field.mapping?.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
