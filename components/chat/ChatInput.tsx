import React, { useRef, useState } from 'react';
import { IconAttach, IconSend, IconFile, IconClose } from '../Icons';

interface ChatInputProps {
  onSendMessage: (text: string, attachment?: { data: string; mimeType: string; preview: string; name?: string }) => void;
  isLoading: boolean;
  isPhoneMode?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isPhoneMode }) => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; preview: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isPhoneMode) {
    return (
      <div className="bg-hig-gray6 border border-white/10 rounded-full p-1.5 flex items-center shadow-2xl shadow-black/50">
          <div className="pl-4 pr-2 text-white/40 text-sm font-medium select-none" aria-hidden="true">+1</div>
          <label htmlFor="phone-input" className="sr-only">Phone Number</label>
          <input
            id="phone-input"
            autoFocus
            type="tel"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="(555) 123-4567"
            className="flex-1 bg-transparent border-none outline-none text-white text-[16px] placeholder:text-white/20 h-10"
          />
          <button
            onClick={handleSend}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Verify
          </button>
      </div>
    );
  }

  return (
    <div className="bg-hig-gray6 border border-white/10 rounded-full p-2 flex flex-col gap-2 shadow-2xl shadow-black/50 focus-within:border-white/20 transition-colors">
      {selectedFile && (
          <div className="mx-2 mt-2 p-2 bg-white/5 rounded-lg flex items-center justify-between group">
            <div className="flex items-center gap-2 overflow-hidden">
              <IconFile className="w-4 h-4 text-hig-blue shrink-0" />
              <span className="text-xs text-white truncate">{selectedFile.name}</span>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10" aria-label="Remove attachment">
              <IconClose className="w-3.5 h-3.5" />
            </button>
          </div>
      )}
      <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            title="Attach file"
            aria-label="Attach file"
          >
            <IconAttach className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) processFile(f); }} className="hidden" />
          
          <label htmlFor="chat-message-input" className="sr-only">Type your message</label>
          <textarea
            id="chat-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Chedr..."
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] leading-relaxed placeholder:text-white/20 py-2.5 max-h-[200px] resize-none overflow-y-auto"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`
              p-2.5 rounded-full shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              ${(input.trim() || selectedFile)
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-white/5 text-white/20 cursor-not-allowed'}
            `}
            aria-label="Send message"
          >
            <IconSend className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
};
