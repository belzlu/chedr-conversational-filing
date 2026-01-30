import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProcessedDocument, VaultFilter, UploadState } from '../../types';

interface VaultContextValue {
  // State
  documents: ProcessedDocument[];
  filter: VaultFilter;
  selectedDocId: string | null;
  uploadState: UploadState;

  // Actions
  setFilter: (filter: VaultFilter) => void;
  selectDocument: (docId: string | null) => void;
  addDocument: (doc: ProcessedDocument) => void;
  updateDocument: (docId: string, updates: Partial<ProcessedDocument>) => void;
  removeDocument: (docId: string) => void;
  setUploadState: (state: UploadState) => void;

  // Computed
  filteredDocuments: ProcessedDocument[];
  selectedDocument: ProcessedDocument | null;
}

const VaultContext = createContext<VaultContextValue | null>(null);

interface VaultProviderProps {
  children: ReactNode;
  initialDocuments?: ProcessedDocument[];
}

export const VaultProvider: React.FC<VaultProviderProps> = ({
  children,
  initialDocuments = []
}) => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>(initialDocuments);
  const [filter, setFilter] = useState<VaultFilter>('all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');

  const selectDocument = useCallback((docId: string | null) => {
    setSelectedDocId(docId);
  }, []);

  const addDocument = useCallback((doc: ProcessedDocument) => {
    setDocuments(prev => [doc, ...prev]);
  }, []);

  const updateDocument = useCallback((docId: string, updates: Partial<ProcessedDocument>) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, ...updates } : doc
    ));
  }, []);

  const removeDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    if (selectedDocId === docId) {
      setSelectedDocId(null);
    }
  }, [selectedDocId]);

  // Computed: filtered documents based on current filter
  const filteredDocuments = React.useMemo(() => {
    if (filter === 'all') return documents;

    return documents.filter(doc => {
      const docType = doc.documentType || doc.type;

      if (filter === 'tax') {
        return docType?.includes('1099') ||
               docType?.includes('W-2') ||
               docType?.includes('1098') ||
               docType === 'Tax Document';
      }

      if (filter === 'receipt') {
        return docType === 'Receipt' ||
               docType === 'Invoice' ||
               docType === 'Bank Statement';
      }

      return true;
    });
  }, [documents, filter]);

  // Computed: currently selected document
  const selectedDocument = React.useMemo(() => {
    if (!selectedDocId) return null;
    return documents.find(doc => doc.id === selectedDocId) || null;
  }, [documents, selectedDocId]);

  const value: VaultContextValue = {
    documents,
    filter,
    selectedDocId,
    uploadState,
    setFilter,
    selectDocument,
    addDocument,
    updateDocument,
    removeDocument,
    setUploadState,
    filteredDocuments,
    selectedDocument,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = (): VaultContextValue => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export default VaultContext;
