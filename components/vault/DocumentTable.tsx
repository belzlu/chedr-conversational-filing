import React from 'react';
import { ProcessedDocument, VaultFilter } from '../../types';
import { DocumentCard } from './DocumentCard';
import { IconFile, IconSearch, IconInfo, IconCheck, IconAlert } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex flex-col gap-8">
      {/* Stats Summary - Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" count={stats.total} icon={IconFile} color="text-white/40" />
        <StatCard label="Verified" count={stats.processed} icon={IconCheck} color="text-green-400" />
        <StatCard label="Review" count={stats.pending} icon={IconInfo} color="text-orange-400" />
        <StatCard label="Attention" count={stats.flagged} icon={IconAlert} color="text-red-400" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Search Bar - Glass Pill */}
        <div className="relative group w-full">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white/60 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-11 pr-6 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`
                px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                ${filter === option.value
                  ? 'bg-white text-black ring-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                selected={selectedDocId === doc.id}
                onClick={() => onSelectDocument(doc.id)}
              />
            ))
          ) : (
             <motion.div 
               key="empty"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="col-span-1 md:col-span-2"
             >
                <EmptyState filter={filter} hasSearch={searchTerm.length > 0} />
             </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; count: number; icon: any; color: string }> = ({ label, count, icon: Icon, color }) => (
  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between h-24 hover:bg-white/[0.05] transition-colors group">
    <div className="flex items-start justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30 group-hover:text-white/50 transition-colors">{label}</span>
      <Icon className={`w-4 h-4 ${color} opacity-80`} />
    </div>
    <span className="text-2xl font-semibold text-white tracking-tight">{count}</span>
  </div>
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
        description: 'Try adjusting your search terms.'
      };
    }
    switch (filter) {
      case 'tax':
        return {
          title: 'No tax forms',
          description: 'Upload W-2s, 1099s, or other tax documents.'
        };
      case 'receipt':
        return {
          title: 'No receipts',
          description: 'Add receipts or invoices to track expenses.'
        };
      default:
        return {
          title: 'Vault is empty',
          description: 'Upload documents to get started.'
        };
    }
  };

  const message = getMessage();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4 relative"
      >
        <div className="absolute inset-0 bg-white/5 rounded-full animate-ping opacity-20" />
        <IconSearch className="w-6 h-6 text-white/20" />
      </motion.div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-white/80 mb-1">
          {message.title}
        </h3>
        <p className="text-xs text-white/40 max-w-[200px] leading-relaxed mx-auto">
          {message.description}
        </p>
      </motion.div>
    </div>
  );
};

export default DocumentTable;
