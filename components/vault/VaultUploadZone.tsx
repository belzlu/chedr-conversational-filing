import React, { useCallback, useState } from 'react';
import { UploadState } from '../../types';
import { IconUpload, IconFile } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <motion.div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      animate={{
        scale: uploadState === 'hover' ? 1.02 : 1,
        borderColor: uploadState === 'hover' ? 'var(--color-chedr-orange)' : 'rgba(255, 255, 255, 0.2)',
        backgroundColor: uploadState === 'hover' ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 255, 255, 0.04)',
      }}
      transition={{ duration: 0.2 }}
      className={`
        relative rounded-hig-card border-2 border-dashed p-8
        cursor-pointer overflow-hidden
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
        disabled={uploadState === 'uploading' || uploadState === 'processing'}
      />

      <div className="flex flex-col items-center justify-center text-center pointer-events-none relative z-0">
        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <IconUpload className="w-6 h-6 text-white/80" />
              </div>
              <p className="text-hig-body font-medium text-white mb-1">
                Drop files here or click to upload
              </p>
              <p className="text-hig-caption2 text-white/70">
                Supports W-2, 1099, receipts, and bank statements
              </p>
            </motion.div>
          )}

          {uploadState === 'hover' && (
            <motion.div
              key="hover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-chedr-orange/20 flex items-center justify-center mb-4 animate-bounce">
                <IconFile className="w-6 h-6 text-chedr-orange" />
              </div>
              <p className="text-hig-body font-medium text-chedr-orange">
                Release to upload
              </p>
            </motion.div>
          )}

          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full max-w-xs"
            >
              <div className="w-12 h-12 rounded-full bg-chedr-orange/20 flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-chedr-orange border-t-transparent rounded-full"
                />
              </div>
              <p className="text-hig-body font-medium text-white mb-4">
                {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
              </p>
              
              {/* Liquid Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-chedr-orange to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <p className="text-hig-caption2 text-white/50 mt-2">
                {progress}% complete
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VaultUploadZone;
