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
        return 'border-hig-blue bg-hig-blue/10 scale-[1.01]';
      case 'uploading':
      case 'processing':
        return 'border-hig-blue/50 bg-hig-blue/5';
      default:
        return 'border-white/20 hover:border-white/40 hover:bg-white/5';
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploadState === 'uploading' || uploadState === 'processing'}
      />

      <div className="flex flex-col items-center justify-center text-center pointer-events-none">
        {uploadState === 'idle' && (
          <>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <IconUpload className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-hig-body font-medium text-white/90 mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-hig-caption2 text-white/50">
              Supports W-2, 1099, receipts, and bank statements
            </p>
          </>
        )}

        {uploadState === 'hover' && (
          <>
            <div className="w-12 h-12 rounded-full bg-hig-blue/20 flex items-center justify-center mb-4 animate-pulse">
              <IconFile className="w-6 h-6 text-hig-blue" />
            </div>
            <p className="text-hig-body font-medium text-hig-blue">
              Release to upload
            </p>
          </>
        )}

        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <>
            <div className="w-12 h-12 rounded-full bg-hig-blue/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-hig-blue border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-hig-body font-medium text-white/90 mb-2">
              {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
            </p>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-hig-blue rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-hig-caption2 text-white/50 mt-2">
              {progress}% complete
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VaultUploadZone;
