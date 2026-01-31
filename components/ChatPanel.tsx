import React, { useRef, useEffect, useState } from 'react';
import { Message, ChipAction } from '../types';
import { IconAttach, IconSend, IconMenu, IconFile, IconSecure, IconUpload, IconClose, IconImage, IconCheck, IconInfo, IconCode } from './Icons';
import { LiquidGlass } from './Material';
import { PlaidInline } from './PlaidSelector';
import { InlineUploadWidget } from './chat-widgets/InlineUploadWidget';

// Added 'identifying'
export type LoadingStage = 'uploading' | 'scanning' | 'extracting' | 'processing' | 'thinking' | 'identifying' | null;

// Simple markdown renderer for chat messages
const renderMarkdown = (text: string) => {
  // Split by double newlines for paragraphs
  const parts = text.split(/\n\n+/);

  return parts.map((part, i) => {
    // Handle Headers (H1)
    if (part.startsWith('# ')) {
       return <h1 key={i} className="text-hig-largeTitle text-white font-semibold tracking-tight mb-4">{part.substring(2)}</h1>;
    }

    // Handle Numbered Lists
    if (part.match(/^\d\./)) {
        const items = part.split('\n');
        return (
            <div key={i} className="flex flex-col gap-[12px] my-6 pl-2">
                {items.map((item, idx) => {
                    const [num, ...rest] = item.split(' ');
                    const content = rest.join(' ');
                    // Bold handling inside list items
                    const contentWithBold = content.split(/\*\*(.+?)\*\*/g).map((segment, j) =>
                        j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{segment}</strong> : segment
                    );
                    return (
                        <div key={idx} className="flex gap-4">
                            <span className="text-hig-body font-semibold text-white/55 min-w-[20px]">{num}</span>
                            <p className="text-hig-body text-white/85 leading-relaxed">{contentWithBold}</p>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Handle bold **text**
    const withBold = part.split(/\*\*(.+?)\*\*/g).map((segment, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{segment}</strong> : segment
    );

    // Handle line breaks
    // ... (rest of logic unchanged)
    const withBreaks: React.ReactNode[] = [];
    withBold.forEach((segment, j) => {
      if (typeof segment === 'string') {
        const lines = segment.split('\n');
        lines.forEach((line, k) => {
          withBreaks.push(line);
          if (k < lines.length - 1) withBreaks.push(<br key={`br-${j}-${k}`} />);
        });
      } else {
        withBreaks.push(segment);
      }
    });

    return <p key={i} className={i > 0 ? 'mt-4 text-hig-body text-white/85 leading-relaxed' : 'text-hig-body text-white/85 leading-relaxed'}>{withBreaks}</p>;
  });
};

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

// Apple HIG: File attachment card
const FileCard = ({ name, type }: { name: string, type: string }) => (
  <div className="flex items-center gap-3 p-3 bg-hig-gray5 rounded-hig-card self-end mb-2 max-w-[280px] animate-in fade-in slide-in-from-right-2">
    <div className="w-10 h-10 rounded-hig-card bg-hig-blue/10 flex items-center justify-center text-hig-blue shrink-0">
      {type.includes('image') ? <IconImage className="w-5 h-5" /> : <IconFile className="w-5 h-5" />}
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-hig-footnote font-semibold text-white truncate">{name}</span>
      <span className="text-hig-caption2 text-white/40 font-medium mt-0.5">Ready for Analysis</span>
    </div>
  </div>
);

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
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; preview: string; name: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, messages.length]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64 = result.split(',')[1];
      setSelectedFile({
        data: base64,
        mimeType: file.type,
        preview: file.type.startsWith('image/') ? result : 'https://img.icons8.com/color/512/pdf.png',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;
    onSendMessage(
      input || (selectedFile ? `Analyzing ${selectedFile.name}...` : ""), 
      selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType, preview: selectedFile.preview, name: selectedFile.name } : undefined
    );
    setInput("");
    setSelectedFile(null);
  };

  const getLoadingMessage = (stage: LoadingStage) => {
    switch (stage) {
      case 'uploading': return 'Uploading file...';
      case 'scanning': return 'Analyzing document...';
      case 'extracting': return 'Extracting data...';
      case 'processing': return 'Syncing with model...';
      case 'thinking': return 'Reasoning...';
      case 'identifying': return 'Verifying Identity (Secure)...';
      default: return 'Thinking...';
    }
  };

  return (
    <section
      className={`flex flex-col h-full bg-black transition-all duration-200 relative ${isDragging ? 'ring-2 ring-inset ring-hig-blue/50' : ''}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if(f) processFile(f); }}
    >
      {/* Apple HIG: Navigation header */}
      <div className="flex items-center justify-between px-hig-md py-3 border-b border-white/[0.08] sticky top-0 z-10 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-hig-card bg-hig-blue/15 flex items-center justify-center text-hig-blue">
            <IconCode className="w-5 h-5" />
          </div>
          <h1 className="text-hig-headline text-white">Chedr</h1>
        </div>
        <button
          onClick={onToggleModel}
          className="hig-chip hig-chip-secondary hig-touch-target"
        >
          {isModelVisible ? 'Hide Form' : 'Show Form'}
        </button>
      </div>

      {/* Apple HIG: Message list with proper spacing and GPU acceleration */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-hig-md py-hig-md scroll-smooth will-change-scroll">
        {/* Extra bottom padding on mobile for bottom bar (Step 15) */}
        <div className="max-w-4xl mx-auto flex flex-col gap-hig-sm pb-24 lg:pb-24 transform-gpu" style={{ paddingBottom: 'max(96px, calc(96px + env(safe-area-inset-bottom)))' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'system' ? 'items-center my-hig-md' : msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex flex-col gap-1 ${msg.role === 'system' ? 'w-full max-w-md' : 'max-w-[75%]'} w-full`}>

                {/* Apple HIG: Sender label and timestamp */}
                {msg.role !== 'system' && (
                  <div className={`flex items-center gap-hig-sm px-1 mb-1 ${msg.role === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                    <span className="text-hig-caption1 font-medium text-white/50">
                      {msg.role === 'user' ? 'You' : 'Chedr'}
                    </span>
                    <span className="hig-timestamp">
                      {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {msg.fileMeta && <FileCard name={msg.fileMeta.name} type={msg.fileMeta.type} />}

                {/* Apple HIG: Chat bubbles */}
                <div
                  className={`
                    relative chat-text w-fit
                    ${msg.role === 'user'
                      ? 'hig-bubble hig-bubble-sent text-white'
                      : msg.role === 'system'
                        ? 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0px_8px_40px_rgba(0,0,0,0.6)] text-white text-left px-[40px] py-[48px] rounded-[24px]'
                        : 'hig-bubble hig-bubble-received'
                    }
                    ${onboardingPhase === 'review' ? 'py-2 px-3 text-hig-subhead' : ''}
                  `}
                >
                  {renderMarkdown(msg.text)}
                </div>

                {/* Inline Widgets */}
                {msg.widget && (
                  <div className="mt-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 w-full flex flex-col items-start px-2">
                     {msg.widget.type === 'plaid' && onPlaidSync && (
                        <div className="w-full max-w-lg">
                          <PlaidInline onSync={onPlaidSync} />
                        </div>
                     )}
                     {msg.widget.type === 'upload' && onFileUpload && (
                        <div className="w-full max-w-lg">
                          <InlineUploadWidget onFilesSelected={onFileUpload} />
                        </div>
                     )}
                  </div>
                )}

                {/* Apple HIG: Status update badge */}
                {msg.statusUpdate && (
                  <div className="flex items-center gap-hig-xs px-1 mt-hig-xs ml-1">
                    <div className="w-4 h-4 rounded-full bg-hig-green/15 flex items-center justify-center">
                      <IconCheck className="w-2.5 h-2.5 text-hig-green" />
                    </div>
                    <span className="text-hig-caption2 font-medium text-hig-green">{msg.statusUpdate}</span>
                  </div>
                )}

                {/* Apple HIG: Suggestion chips as capsules */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className={`flex flex-wrap gap-hig-sm mt-hig-sm ${msg.role === 'system' ? 'justify-center' : ''} animate-in fade-in slide-in-from-bottom-3 delay-100`}>
                    {msg.chips.map((chip) => (
                      <button
                        type="button"
                        key={chip.actionId}
                        onClick={() => onChipClick(chip.actionId, chip.label)}
                        className={`
                          hig-chip hig-touch-target transition-all transform active:scale-95
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                          ${chip.primary
                            ? 'hig-chip-primary focus-visible:ring-hig-blue'
                            : 'hig-chip-secondary focus-visible:ring-white/40'
                          }
                        `}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Apple HIG: Typing indicator with status icon */}
          {isLoading && (
            <div className="flex flex-col gap-2 items-start animate-in fade-in duration-300" role="status" aria-live="polite">
              <span className="text-hig-caption1 font-medium text-white/50 ml-1 mb-1">Chedr</span>
              <div className="hig-typing-indicator" aria-hidden="true">
                <div className="hig-typing-dot"></div>
                <div className="hig-typing-dot"></div>
                <div className="hig-typing-dot"></div>
              </div>
              <div className="flex items-center gap-hig-xs ml-1 mt-1">
                {loadingStage === 'identifying' && <IconSecure className="w-3 h-3 text-hig-green" aria-hidden="true" />}
                {(loadingStage === 'uploading' || loadingStage === 'scanning') && <IconFile className="w-3 h-3 text-hig-blue" aria-hidden="true" />}
                {loadingStage === 'thinking' && <IconInfo className="w-3 h-3 text-white/40" aria-hidden="true" />}
                <span className="text-hig-caption2 text-white/30">{getLoadingMessage(loadingStage)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apple HIG: Input area with safe area padding */}
      <div className="px-hig-md pb-hig-md pt-hig-sm bg-black/90 backdrop-blur-xl sticky bottom-0 z-10 hig-safe-area-bottom animate-in slide-in-from-bottom-5 duration-300">
        <div className="max-w-4xl mx-auto">
          {onboardingPhase === 'phone' ? (
            /* Apple HIG: Phone input for verification - Step 11: Pre-allocated height to prevent layout shift */
            <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto min-h-[88px]">
              <div className="w-full relative">
                <div className="flex items-center bg-hig-gray5 border border-white/10 rounded-hig-input overflow-hidden focus-within:border-hig-blue transition-colors" role="group" aria-label="Phone verification">
                  <div className="pl-4 pr-2 text-white/50" aria-hidden="true">
                    <span className="text-hig-body">+1</span>
                  </div>
                  <input
                    autoFocus
                    type="tel"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="(555) 123-4567"
                    className="hig-input flex-1 border-none bg-transparent font-mono tracking-wide"
                    aria-label="Phone number"
                    autoComplete="tel"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="hig-chip hig-chip-primary m-1 px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Verify phone number"
                  >
                    Verify
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-hig-xs text-hig-caption2 text-white/30">
                <IconSecure className="w-3 h-3 text-hig-green" aria-hidden="true" />
                <span>Bank-level encryption</span>
              </div>
            </div>
          ) : (
            /* Apple HIG: Main chat input with accessibility */
            <div className="relative flex items-center bg-hig-gray5 rounded-hig-input focus-within:ring-1 focus-within:ring-hig-blue/50 transition-all" role="group" aria-label="Message composer">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-hig-gray hover:text-white/60 transition-colors hig-touch-target flex items-center justify-center text-hig-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-inset rounded-l-hig-input"
                aria-label="Attach file"
              >
                <IconAttach className="w-5 h-5" aria-hidden="true" />
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) processFile(f); }} className="hidden" aria-label="File upload" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Message"
                className="flex-1 bg-transparent border-none py-3 text-hig-body text-white outline-none placeholder:text-white/30"
                aria-label="Type your message"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading}
                className={`p-3 transition-all hig-touch-target flex items-center justify-center rounded-full mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue ${input.trim() || selectedFile ? 'text-white bg-hig-blue' : 'text-hig-gray'}`}
                aria-label="Send message"
              >
                <IconSend className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
