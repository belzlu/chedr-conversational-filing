import React from 'react';
import { ProcessedDocument, VaultFilter } from '../../types';
import { DocumentCard } from './DocumentCard';
import { IconFile } from '../Icons';

interface DocumentTableProps {
  documents: ProcessedDocument[];
  filter: VaultFilter;
  onFilterChange: (filter: VaultFilter) => void;
  selectedDocId: string | null;
  onSelectDocument: (docId: string) => void;
}

const FILTER_OPTIONS: Array<{ value: VaultFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'tax', label: 'Tax Forms' },
  { value: 'receipt', label: 'Receipts' },
];

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  filter,
  onFilterChange,
  selectedDocId,
  onSelectDocument
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange(option.value)}
            className={`
              px-4 py-2 rounded-full text-hig-footnote font-medium transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue
              ${filter === option.value
                ? 'bg-hig-blue text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90'
              }
            `}
          >
            {option.label}
          </button>
        ))}

        {/* Document Count */}
        <span className="ml-auto text-hig-caption2 text-white/40">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Document Grid/List */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              selected={selectedDocId === doc.id}
              onClick={() => onSelectDocument(doc.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState filter={filter} />
      )}
    </div>
  );
};

interface EmptyStateProps {
  filter: VaultFilter;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const getMessage = () => {
    switch (filter) {
      case 'tax':
        return {
          title: 'No tax forms yet',
          description: 'Upload W-2s, 1099s, or other tax documents to get started.'
        };
      case 'receipt':
        return {
          title: 'No receipts yet',
          description: 'Upload receipts, invoices, or bank statements.'
        };
      default:
        return {
          title: 'No documents yet',
          description: 'Drag and drop files above or click to upload your first document.'
        };
    }
  };

  const message = getMessage();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <IconFile className="w-8 h-8 text-white/30" />
      </div>
      <h3 className="text-hig-body font-medium text-white/70 mb-2">
        {message.title}
      </h3>
      <p className="text-hig-caption2 text-white/40 max-w-xs">
        {message.description}
      </p>
    </div>
  );
};

export default DocumentTable;
