import React, { useCallback, useState } from 'react';
import { UploadState } from '../../types';
import { IconUpload, IconFile } from '../Icons';
import { LiquidGlass } from '../Material';

interface VaultUploadZoneProps {
  uploadState: UploadState;
  onUploadStateChange: (state: UploadState) => void;
  onFilesSelected: (files: File[]) => void;
  progress?: number;
}

export const VaultUploadZone: React.FC<VaultUploadZoneProps> = ({
  uploadState,
  onUploadStateChange,
  onFilesSelected,
  progress = 0
}) => {
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (uploadState === 'idle') {
      onUploadStateChange('hover');
    }
  }, [uploadState, onUploadStateChange]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0 && uploadState === 'hover') {
        onUploadStateChange('idle');
      }
      return newCount;
    });
  }, [uploadState, onUploadStateChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUploadStateChange('uploading');
      onFilesSelected(files);
    } else {
      onUploadStateChange('idle');
    }
  }, [onUploadStateChange, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onUploadStateChange('uploading');
      onFilesSelected(files);
    }
    e.target.value = '';
  }, [onUploadStateChange, onFilesSelected]);

  const getStateStyles = () => {
    switch (uploadState) {
      case 'hover':
        return 'border-chedr-orange bg-chedr-orange/10 scale-[1.01]';
      case 'uploading':
      case 'processing':
        return 'border-chedr-orange/50 bg-chedr-orange/5';
      default:
        return 'border-white/20 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]';
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative rounded-hig-card border-2 border-dashed p-8
        transition-all duration-200 ease-out cursor-pointer
        ${getStateStyles()}
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ opacity: 0 }}
        disabled={uploadState === 'uploading' || uploadState === 'processing'}
      />

      <div className="flex flex-col items-center justify-center text-center pointer-events-none">
        {uploadState === 'idle' && (
          <>
            <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center mb-4">
              <IconUpload className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-hig-body font-medium text-white mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-hig-caption2 text-white/70">
              Supports W-2, 1099, receipts, and bank statements
            </p>
          </>
        )}

        {uploadState === 'hover' && (
          <>
            <div className="w-12 h-12 rounded-full bg-chedr-orange/20 flex items-center justify-center mb-4 animate-pulse">
              <IconFile className="w-6 h-6 text-chedr-orange" />
            </div>
            <p className="text-hig-body font-medium text-chedr-orange">
              Release to upload
            </p>
          </>
        )}

        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <>
            <div className="w-12 h-12 rounded-full bg-chedr-orange/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-chedr-orange border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-hig-body font-medium text-white mb-2">
              {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
            </p>
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-chedr-orange rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-hig-caption2 text-white/70 mt-2">
              {progress}% complete
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VaultUploadZone;
