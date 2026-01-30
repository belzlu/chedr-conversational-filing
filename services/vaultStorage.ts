import { ProcessedDocument, TaxData } from '../types';

const STORAGE_KEYS = {
  VAULT_DOCUMENTS: 'chedr_vault_documents',
  TAX_DATA: 'chedr_tax_data',
  VAULT_VERSION: 'chedr_vault_version'
};

const CURRENT_VERSION = '1.0.0';

export interface VaultStorageInterface {
  init(): Promise<void>;
  saveDocuments(documents: ProcessedDocument[]): Promise<void>;
  getDocuments(): Promise<ProcessedDocument[]>;
  saveDocument(document: ProcessedDocument): Promise<void>;
  updateDocument(docId: string, updates: Partial<ProcessedDocument>): Promise<void>;
  deleteDocument(docId: string): Promise<void>;
  saveTaxData(data: TaxData): Promise<void>;
  getTaxData(): Promise<TaxData | null>;
  clear(): Promise<void>;
}

class LocalStorageVaultStorage implements VaultStorageInterface {
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    // Check version and migrate if needed
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VAULT_VERSION);
    if (storedVersion !== CURRENT_VERSION) {
      await this.migrate(storedVersion);
      localStorage.setItem(STORAGE_KEYS.VAULT_VERSION, CURRENT_VERSION);
    }

    this.isInitialized = true;
  }

  private async migrate(fromVersion: string | null): Promise<void> {
    // Handle future migrations here
    // For now, if no version exists, we're starting fresh
    if (!fromVersion) {
      console.log('Initializing vault storage v' + CURRENT_VERSION);
    }
  }

  async saveDocuments(documents: ProcessedDocument[]): Promise<void> {
    try {
      // Strip large data (thumbnails) for storage, keeping references
      const storableDocuments = documents.map(doc => ({
        ...doc,
        // Keep thumbnail URLs but limit size
        thumbnailUrl: doc.thumbnailUrl?.startsWith('data:')
          ? doc.thumbnailUrl.length > 50000
            ? undefined // Skip very large thumbnails
            : doc.thumbnailUrl
          : doc.thumbnailUrl
      }));

      localStorage.setItem(
        STORAGE_KEYS.VAULT_DOCUMENTS,
        JSON.stringify(storableDocuments)
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Attempting to save without thumbnails...');
        const minimalDocuments = documents.map(doc => ({
          ...doc,
          thumbnailUrl: undefined,
          rawText: undefined
        }));
        localStorage.setItem(
          STORAGE_KEYS.VAULT_DOCUMENTS,
          JSON.stringify(minimalDocuments)
        );
      } else {
        throw error;
      }
    }
  }

  async getDocuments(): Promise<ProcessedDocument[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.VAULT_DOCUMENTS);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as ProcessedDocument[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.error('Failed to parse stored documents');
      return [];
    }
  }

  async saveDocument(document: ProcessedDocument): Promise<void> {
    const documents = await this.getDocuments();
    const existingIndex = documents.findIndex(d => d.id === document.id);

    if (existingIndex >= 0) {
      documents[existingIndex] = document;
    } else {
      documents.unshift(document);
    }

    await this.saveDocuments(documents);
  }

  async updateDocument(docId: string, updates: Partial<ProcessedDocument>): Promise<void> {
    const documents = await this.getDocuments();
    const index = documents.findIndex(d => d.id === docId);

    if (index >= 0) {
      documents[index] = { ...documents[index], ...updates };
      await this.saveDocuments(documents);
    }
  }

  async deleteDocument(docId: string): Promise<void> {
    const documents = await this.getDocuments();
    const filtered = documents.filter(d => d.id !== docId);
    await this.saveDocuments(filtered);
  }

  async saveTaxData(data: TaxData): Promise<void> {
    // Strip vault from tax data since it's stored separately
    const dataWithoutVault = {
      ...data,
      vault: [] // Don't duplicate vault storage
    };
    localStorage.setItem(
      STORAGE_KEYS.TAX_DATA,
      JSON.stringify(dataWithoutVault)
    );
  }

  async getTaxData(): Promise<TaxData | null> {
    const stored = localStorage.getItem(STORAGE_KEYS.TAX_DATA);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as TaxData;
      // Rehydrate vault from separate storage
      const vault = await this.getDocuments();
      return { ...parsed, vault };
    } catch {
      console.error('Failed to parse stored tax data');
      return null;
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.VAULT_DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.TAX_DATA);
    // Keep version to track cleared state
  }
}

// Singleton instance
let storageInstance: VaultStorageInterface | null = null;

export function getVaultStorage(): VaultStorageInterface {
  if (!storageInstance) {
    storageInstance = new LocalStorageVaultStorage();
  }
  return storageInstance;
}

// React hook for vault persistence
export function useVaultPersistence() {
  const storage = getVaultStorage();

  const loadDocuments = async (): Promise<ProcessedDocument[]> => {
    await storage.init();
    return storage.getDocuments();
  };

  const persistDocuments = async (documents: ProcessedDocument[]): Promise<void> => {
    await storage.init();
    return storage.saveDocuments(documents);
  };

  const loadTaxData = async (): Promise<TaxData | null> => {
    await storage.init();
    return storage.getTaxData();
  };

  const persistTaxData = async (data: TaxData): Promise<void> => {
    await storage.init();
    return storage.saveTaxData(data);
  };

  return {
    loadDocuments,
    persistDocuments,
    loadTaxData,
    persistTaxData,
    storage
  };
}

export default getVaultStorage;
