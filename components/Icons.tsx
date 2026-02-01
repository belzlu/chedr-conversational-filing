
import React from 'react';
import {
  Paperclip,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  Menu,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
  Settings,
  User,
  FileImage,
  FileCode,
  ArrowLeft,
  Building2,
  Banknote,
  History,
  Info,
  ExternalLink,
  ChevronDown,
  Search,
  Eye,
  ArrowRight,
  Pencil,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const IconAttach = ({ className }: { className?: string }) => <Paperclip className={className} />;
export const IconSend = ({ className }: { className?: string }) => <Send className={className} />;
export const IconClose = ({ className }: { className?: string }) => <X className={className} />;
export const IconMenu = ({ className }: { className?: string }) => <Menu className={className} />;
export const IconSecure = ({ className }: { className?: string }) => <ShieldCheck className={className} />;
export const IconFile = ({ className }: { className?: string }) => <FileText className={className} />;
export const IconUpload = ({ className }: { className?: string }) => <UploadCloud className={className} />;
export const IconCheck = ({ className }: { className?: string }) => <CheckCircle2 className={className} />;
export const IconAlert = ({ className }: { className?: string }) => <AlertCircle className={className} />;
export const IconPlus = ({ className }: { className?: string }) => <Plus className={className} />;
export const IconClock = ({ className }: { className?: string }) => <Clock className={className} />;
export const IconSettings = ({ className }: { className?: string }) => <Settings className={className} />;
export const IconUser = ({ className }: { className?: string }) => <User className={className} />;
export const IconImage = ({ className }: { className?: string }) => <FileImage className={className} />;
export const IconCode = ({ className }: { className?: string }) => <FileCode className={className} />;
export const IconChevronRight = ({ className }: { className?: string }) => <ChevronRight className={className} />;
export const IconChevronDown = ({ className }: { className?: string }) => <ChevronDown className={className} />;
export const IconArrowLeft = ({ className }: { className?: string }) => <ArrowLeft className={className} />;
export const IconArrowRight = ({ className }: { className?: string }) => <ArrowRight className={className} />;
export const IconBank = ({ className }: { className?: string }) => <Building2 className={className} />;
export const IconMoney = ({ className }: { className?: string }) => <Banknote className={className} />;
export const IconHistory = ({ className }: { className?: string }) => <History className={className} />;
export const IconInfo = ({ className }: { className?: string }) => <Info className={className} />;
export const IconExternal = ({ className }: { className?: string }) => <ExternalLink className={className} />;
export const IconSearch = ({ className }: { className?: string }) => <Search className={className} />;
export const IconEye = ({ className }: { className?: string }) => <Eye className={className} />;
export const IconEdit = ({ className }: { className?: string }) => <Pencil className={className} />;
export const IconRefresh = ({ className }: { className?: string }) => <RefreshCw className={className} />;
export const IconTrash = ({ className }: { className?: string }) => <Trash2 className={className} />;

// SF Symbol-style icons (Apple-inspired clean line icons)
export const IconIdentity = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="12" cy="8" r="4" />
    <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
  </svg>
);

export const IconIncome = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="12" cy="12" r="10" fillOpacity="0.15" />
    <path d="M12 6v12M9 9.5c0-1.38 1.34-2.5 3-2.5s3 1.12 3 2.5c0 1.38-1.34 2.5-3 2.5v0c-1.66 0-3 1.12-3 2.5s1.34 2.5 3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const IconDeductions = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fillOpacity="0.15" />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
