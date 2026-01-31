import React from 'react';
import { VaultUploadZone } from '../vault/VaultUploadZone';
import { UploadState } from '../../types';

interface InlineUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const InlineUploadWidget: React.FC<InlineUploadProps> = ({ onFilesSelected }) => {
  const [uploadState, setUploadState] = React.useState<UploadState>('idle');
  const [progress, setProgress] = React.useState(0);

  const handleFiles = (files: File[]) => {
    // Simulate upload progress for UI feedback
    setUploadState('uploading');
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
            onFilesSelected(files);
            setUploadState('idle'); // Reset or keep as 'completed' if we want to show success
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="w-full max-w-lg mt-2">
      <VaultUploadZone 
        uploadState={uploadState}
        onUploadStateChange={setUploadState}
        onFilesSelected={handleFiles}
        progress={progress}
      />
    </div>
  );
};
