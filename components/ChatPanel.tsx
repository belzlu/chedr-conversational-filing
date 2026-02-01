import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { IconSecure, IconFile, IconInfo } from './Icons';
import { MessageItem } from './chat/MessageItem';
import { ChatInput } from './chat/ChatInput';

export type LoadingStage = 'uploading' | 'scanning' | 'extracting' | 'processing' | 'thinking' | 'identifying' | null;

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string, attachment?: { data: string; mimeType: string; preview: string; name?: string }) => void;
  onChipClick: (actionId: string, label: string) => void;
  onOpenDrawer: () => void;
  isLoading: boolean;
  loadingStage?: LoadingStage;
  onboardingPhase?: 'landing' | 'phone' | 'identity' | 'bank' | 'dashboard' | 'review';
  
  onToggleSidebar?: () => void;
  onToggleModel?: () => void;
  isModelVisible?: boolean;
  
  // New handlers for widgets
  onPlaidSync?: (bankIds: string[]) => void;
  onFileUpload?: (files: File[]) => void; // For multiple file upload widget
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  onChipClick, 
  onOpenDrawer,
  isLoading,
  loadingStage,
  onboardingPhase,
  onToggleSidebar,
  onToggleModel,
  isModelVisible,
  onPlaidSync,
  onFileUpload
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, messages.length]);

  const getLoadingMessage = (stage: LoadingStage) => {
    switch (stage) {
      case 'uploading': return 'Uploading file...';
      case 'scanning': return 'Analyzing document...';
      case 'extracting': return 'Extracting data...';
      case 'processing': return 'Syncing with model...';
      case 'thinking': return 'Reasoning...';
      case 'identifying': return 'Verifying Identity...';
      default: return 'Thinking...';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // In a real implementation, we'd probably pass this to the ChatInput state
      // For now, we can just trigger a simple "analyze" message immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        onSendMessage(`Analyzing ${file.name}...`, { 
          data: base64, 
          mimeType: file.type, 
          preview: file.type.startsWith('image/') ? result : 'https://img.icons8.com/color/512/pdf.png', 
          name: file.name 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section
      className={`flex flex-col h-full bg-chedr-background relative ${isDragging ? 'after:absolute after:inset-0 after:bg-hig-blue/10 after:border-2 after:border-dashed after:border-hig-blue/50 after:z-50 after:pointer-events-none' : ''}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      aria-label="Chat Interface"
    >
      {/* Header - Transparent/Glass */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] sticky top-0 z-20 bg-chedr-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-chedr-background/60">
        <div className="flex items-center gap-2">
           <span className="text-[15px] font-semibold text-white/90">Assistant</span>
        </div>
        <button
          onClick={onToggleModel}
          className="text-xs font-medium text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {isModelVisible ? 'Hide Context' : 'Show Context'}
        </button>
      </header>

      {/* Message Stream */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto scroll-smooth"
        role="log"
        aria-live="polite"
        aria-label="Message history"
      >
        <div className="max-w-[768px] mx-auto flex flex-col px-4 pt-6 pb-32">
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              onChipClick={onChipClick}
              onPlaidSync={onPlaidSync}
              onFileUpload={onFileUpload}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 mb-6 animate-in fade-in duration-300" role="status">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hig-blue to-orange-600 flex items-center justify-center opacity-80">
                  <span className="text-white font-bold text-[10px]">C</span>
               </div>
               <div className="flex flex-col justify-center gap-1">
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                 </div>
                 {loadingStage && (
                    <span className="text-[11px] text-white/30 font-medium tracking-wide uppercase flex items-center gap-1.5">
                      {loadingStage === 'identifying' && <IconSecure className="w-3 h-3 text-hig-green" />}
                      {(loadingStage === 'uploading' || loadingStage === 'scanning') && <IconFile className="w-3 h-3 text-hig-blue" />}
                      {loadingStage === 'thinking' && <IconInfo className="w-3 h-3 text-white/40" />}
                      {getLoadingMessage(loadingStage)}
                    </span>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Floating Island */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-chedr-background via-chedr-background to-transparent pt-10">
        <div className="max-w-[768px] mx-auto relative">
           <ChatInput 
             onSendMessage={onSendMessage} 
             isLoading={isLoading} 
             isPhoneMode={onboardingPhase === 'phone'} 
           />
           <div className="text-center mt-3 pb-1">
             <p className="text-[10px] text-white/20">Chedr can make mistakes. Verify important info.</p>
           </div>
        </div>
      </div>
    </section>
  );
};