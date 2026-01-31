import React from 'react';
import { ProcessedDocument, VaultFilter } from '../../types';
import { DocumentCard } from './DocumentCard';
import { IconFile, IconSearch, IconInfo, IconCheck, IconAlert } from '../Icons';
import { LiquidGlass } from '../Material';

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
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = documents.filter(doc => {
    const matchesFilter = filter === 'all' || 
                         doc.documentType?.toLowerCase() === filter.toLowerCase() || 
                         doc.type?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: documents.length,
    processed: documents.filter(d => d.status === 'processed').length,
    pending: documents.filter(d => d.status === 'pending').length,
    flagged: documents.filter(d => d.status === 'flagged').length
  };
  return (
    <div className="flex flex-col gap-6">
      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" count={stats.total} icon={IconFile} color="text-white/60" />
        <StatCard label="Verified" count={stats.processed} icon={IconCheck} color="text-ok" />
        <StatCard label="Pending" count={stats.pending} icon={IconInfo} color="text-hig-orange" />
        <StatCard label="Flagged" count={stats.flagged} icon={IconAlert} color="text-danger" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-chedr-orange transition-colors" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-hig-footnote text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-chedr-orange/40 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {FILTER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`
                px-4 py-2 rounded-full text-hig-footnote font-medium transition-all whitespace-nowrap
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chedr-orange
                ${filter === option.value
                  ? 'bg-chedr-orange text-white shadow-lg shadow-chedr-orange/20'
                  : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.10] hover:text-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid/List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              selected={selectedDocId === doc.id}
              onClick={() => onSelectDocument(doc.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState filter={filter} hasSearch={searchTerm.length > 0} />
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; count: number; icon: any; color: string }> = ({ label, count, icon: Icon, color }) => (
  <LiquidGlass className="p-3 flex items-center gap-3 border-white/5">
    <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{label}</p>
      <p className="text-hig-title3 font-bold text-white leading-none mt-0.5">{count}</p>
    </div>
  </LiquidGlass>
);

interface EmptyStateProps {
  filter: VaultFilter;
  hasSearch?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter, hasSearch }) => {
  const getMessage = () => {
    if (hasSearch) {
      return {
        title: 'No matches found',
        description: 'Try adjusting your search terms or filters.'
      };
    }
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
          title: 'Your vault is empty',
          description: 'Drag and drop files above or click to upload your first document.'
        };
    }
  };

  const message = getMessage();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
        <IconFile className="w-10 h-10 text-white/20" />
      </div>
      <h3 className="text-hig-title3 font-semibold text-white/90 mb-2">
        {message.title}
      </h3>
      <p className="text-hig-subhead text-white/50 max-w-sm leading-relaxed">
        {message.description}
      </p>
    </div>
  );
};

export default DocumentTable;
