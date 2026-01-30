import React, { useState, useRef, useEffect } from 'react';
import { IconCheck, IconClose } from '../../Icons';

interface FieldEditorProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'currency';
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  value,
  onSave,
  onCancel,
  label,
  placeholder = 'Enter value...',
  type = 'text'
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const formatValue = (val: string): string => {
    if (type === 'currency') {
      // Strip non-numeric except decimal
      const numeric = val.replace(/[^0-9.]/g, '');
      return numeric;
    }
    return val;
  };

  const displayValue = (val: string): string => {
    if (type === 'currency' && val) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    return val;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {label && (
        <label className="text-hig-caption2 text-white/50 font-medium">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          {type === 'currency' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
          )}
          <input
            ref={inputRef}
            type={type === 'number' || type === 'currency' ? 'text' : 'text'}
            inputMode={type === 'number' || type === 'currency' ? 'decimal' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(formatValue(e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full px-3 py-2 rounded-lg
              bg-white/10 border border-white/20
              text-white text-hig-body
              placeholder:text-white/30
              focus:outline-none focus:ring-2 focus:ring-hig-blue focus:border-transparent
              transition-all
              ${type === 'currency' ? 'pl-7' : ''}
            `}
          />
        </div>
        <button
          type="submit"
          className="p-2 rounded-lg bg-ok/20 text-ok hover:bg-ok/30 transition-colors"
          aria-label="Save"
        >
          <IconCheck className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
          aria-label="Cancel"
        >
          <IconClose className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default FieldEditor;
