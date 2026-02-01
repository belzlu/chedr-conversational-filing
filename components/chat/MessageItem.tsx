import React, { memo } from 'react';
import { Message } from '../../types';
import { IconCheck, IconFile, IconImage } from '../Icons';
import { PlaidInline } from '../PlaidSelector';
import { InlineUploadWidget } from '../chat-widgets/InlineUploadWidget';
import { renderMarkdown } from '../../lib/markdown';

interface MessageItemProps {
  message: Message;
  onChipClick: (actionId: string, label: string) => void;
  onPlaidSync?: (bankIds: string[]) => void;
  onFileUpload?: (files: File[]) => void;
}

const FileCard = ({ name, type }: { name: string, type: string }) => (
  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl mb-2 max-w-[280px] hover:bg-white/10 transition-colors cursor-default">
    <div className="w-10 h-10 rounded-lg bg-hig-blue/10 flex items-center justify-center text-hig-blue shrink-0">
      {type.includes('image') ? <IconImage className="w-5 h-5" /> : <IconFile className="w-5 h-5" />}
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-xs font-medium text-white truncate">{name}</span>
      <span className="text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-wide">Ready</span>
    </div>
  </div>
);

export const MessageItem: React.FC<MessageItemProps> = memo(({ 
  message, 
  onChipClick, 
  onPlaidSync, 
  onFileUpload 
}) => {
  const isUser = message.role === 'user';

  return (
    <div 
      className={`
         group flex gap-4 mb-6
         ${isUser ? 'flex-row-reverse' : 'flex-row'}
         animate-in fade-in slide-in-from-bottom-2 duration-300
      `}
      role="listitem"
    >
      {/* Content Column */}
      <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        

        {message.fileMeta && <FileCard name={message.fileMeta.name} type={message.fileMeta.type} />}

        {/* Message Bubble - User gets orange pill, Assistant gets plain text */}
        <div
          className={`
            relative
            ${isUser
              ? 'px-4 py-1.5 rounded-full bg-chedr-orange-soft text-chedr-cloud text-[14px] leading-snug'
              : 'text-chedr-cloud/90 text-[14px] leading-relaxed'
            }
          `}
        >
          {renderMarkdown(message.text)}
        </div>

        {/* Widgets (AI Only) */}
        {!isUser && message.widget && (
          <div className="mt-3 w-full max-w-lg">
             {message.widget.type === 'plaid' && onPlaidSync && <PlaidInline onSync={onPlaidSync} />}
             {message.widget.type === 'upload' && onFileUpload && <InlineUploadWidget onFilesSelected={onFileUpload} />}
          </div>
        )}

        {/* Status Updates */}
        {message.statusUpdate && (
          <div className="flex items-center gap-1.5 mt-2 px-1">
            <IconCheck className="w-3.5 h-3.5 text-hig-green" />
            <span className="text-xs font-medium text-hig-green">{message.statusUpdate}</span>
          </div>
        )}

        {/* Action Chips */}
        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.chips.map((chip) => (
              <button
                key={chip.actionId}
                onClick={() => onChipClick(chip.actionId, chip.label)}
                className={`
                  px-4 py-2 rounded-full text-[14px] font-medium transition-all active:scale-95
                  border
                  ${chip.primary
                    ? 'bg-white text-black border-white hover:bg-white/90 shadow-sm'
                    : 'bg-white/5 text-white/90 border-white/10 hover:bg-white/10 hover:border-white/20'
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
  );
});

MessageItem.displayName = 'MessageItem';
