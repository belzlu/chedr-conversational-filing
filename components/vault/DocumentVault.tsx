import React, { useCallback, useState } from 'react';
import { ProcessedDocument, UploadState } from '../../types';
import { VaultProvider, useVault } from './VaultContext';
import { VaultUploadZone } from './VaultUploadZone';
import { DocumentTable } from './DocumentTable';
import { DocumentDetail } from './DocumentDetail';
import { createProcessedDocument } from '../../services/documentClassifier';

interface DocumentVaultProps {
  initialDocuments?: ProcessedDocument[];
  onDocumentSelect?: (doc: ProcessedDocument | null) => void;
  onDocumentProcessed?: (doc: ProcessedDocument) => void;
}

const DocumentVaultInner: React.FC<{
  onDocumentSelect?: (doc: ProcessedDocument | null) => void;
  onDocumentProcessed?: (doc: ProcessedDocument) => void;
}> = ({ onDocumentSelect, onDocumentProcessed }) => {
  const {
    filteredDocuments,
    filter,
    setFilter,
    selectedDocId,
    selectDocument,
    selectedDocument,
    uploadState,
    setUploadState,
    addDocument,
    updateDocument
  } = useVault();

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSelectDocument = useCallback((docId: string) => {
    selectDocument(docId);
    const doc = filteredDocuments.find(d => d.id === docId);
    onDocumentSelect?.(doc || null);
  }, [selectDocument, filteredDocuments, onDocumentSelect]);

  const processFile = useCallback(async (file: File): Promise<ProcessedDocument> => {
    // Create thumbnail for images
    let thumbnailUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      thumbnailUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // Create the processed document
    const doc = await createProcessedDocument({ file, thumbnailUrl });
    return doc;
  }, []);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setUploadProgress(0);
    const totalFiles = files.length;
    let processed = 0;

    for (const file of files) {
      try {
        // Process file
        const doc = await processFile(file);

        // Add to vault
        addDocument(doc);

        // Notify parent
        onDocumentProcessed?.(doc);

        // Simulate extraction delay
        setTimeout(() => {
          updateDocument(doc.id, {
            processingStatus: 'processed',
            status: 'processed',
            dataPointCount: Math.floor(Math.random() * 10) + 5,
            lineageStages: doc.lineageStages?.map(stage =>
              stage.type === 'extraction'
                ? { ...stage, status: 'completed' as const }
                : stage.type === 'verification'
                  ? { ...stage, status: 'active' as const }
                  : stage
            )
          });
        }, 1500);

        processed++;
        setUploadProgress(Math.round((processed / totalFiles) * 100));
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }

    // Reset upload state after short delay
    setTimeout(() => {
      setUploadState('idle');
      setUploadProgress(0);
    }, 500);
  }, [processFile, addDocument, updateDocument, setUploadState, onDocumentProcessed]);

  const handleCloseDetail = useCallback(() => {
    selectDocument(null);
    onDocumentSelect?.(null);
  }, [selectDocument, onDocumentSelect]);

  const handleFieldEdit = useCallback((fieldId: string, newValue: any) => {
    if (!selectedDocId) return;
    updateDocument(selectedDocId, {
      fields: selectedDocument?.fields?.map(f =>
        f.id === fieldId ? { ...f, value: newValue, status: 'PASS' as const } : f
      )
    });
  }, [selectedDocId, selectedDocument, updateDocument]);

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col gap-6 p-6 overflow-y-auto transition-all duration-300 ${selectedDocument ? 'lg:w-1/2' : 'w-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-hig-title2 font-semibold text-white/90">
              Document Vault
            </h1>
            <p className="text-hig-footnote text-white/50 mt-1">
              Upload and manage your tax documents
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <VaultUploadZone
          uploadState={uploadState}
          onUploadStateChange={setUploadState}
          onFilesSelected={handleFilesSelected}
          progress={uploadProgress}
        />

        {/* Document Table */}
        <DocumentTable
          documents={filteredDocuments}
          filter={filter}
          onFilterChange={setFilter}
          selectedDocId={selectedDocId}
          onSelectDocument={handleSelectDocument}
        />
      </div>

      {/* Document Detail Slide-Over */}
      {selectedDocument && (
        <div className="hidden lg:block w-1/2 border-l border-white/10 h-full animate-in slide-in-from-right duration-300">
          <DocumentDetail
            document={selectedDocument}
            onClose={handleCloseDetail}
            onFieldEdit={handleFieldEdit}
          />
        </div>
      )}

      {/* Mobile Detail Modal */}
      {selectedDocument && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 top-16 bg-hig-gray6 rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <DocumentDetail
              document={selectedDocument}
              onClose={handleCloseDetail}
              onFieldEdit={handleFieldEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  initialDocuments = [],
  onDocumentSelect,
  onDocumentProcessed
}) => {
  return (
    <VaultProvider initialDocuments={initialDocuments}>
      <DocumentVaultInner
        onDocumentSelect={onDocumentSelect}
        onDocumentProcessed={onDocumentProcessed}
      />
    </VaultProvider>
  );
};

export default DocumentVault;
