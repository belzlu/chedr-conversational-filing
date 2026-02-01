
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { TaxData, INITIAL_TAX_DATA, Message, ProcessedDocument, FilingStep, ChipAction } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { useVaultPersistence } from './services/vaultStorage';
import { ChatPanel, LoadingStage } from './components/ChatPanel';
import { LiveModelPanel } from './components/LiveModelPanel';
import { SettingsView } from './components/SettingsView';
import { Drawer } from './components/Drawer';
import { Sidebar } from './components/Sidebar';
import { MaterialShell, SurfaceOpaque } from './components/Material';
import { DocumentVault } from './components/vault';
import { ChatOnboarding } from './components/onboarding';
import { IconFile } from './components/Icons';

// Golden Ticket: Step 0 - Landing
const WELCOME_MESSAGE: Message = {
    id: 'init-1',
    role: 'system',
    text: "# Welcome to Chedr\n\nFile your 2025 taxes in minutes.\n\n**How it works:**\n1. Connect your accounts\n2. Review & optimize\n3. File electronically\n\nWe'll pull your income, deductions, and documents automatically. Takes about 10 minutes.",
    timestamp: new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'}),
    chips: [
      { label: 'Get Started', actionId: 'get_started', primary: true }
    ]
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [taxData, setTaxData] = useState<TaxData>(INITIAL_TAX_DATA);
  const [history, setHistory] = useState<TaxData[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [activeView, setActiveView] = useState('chat');
  const [isTestMode, setIsTestMode] = useState(false);

  // Phase 1 Onboarding State + Phase 2 Review + Phase 3 Final
  type OnboardingPhase = 'landing' | 'phone' | 'identity' | 'bank' | 'dashboard' | 'review' | 'final';
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('landing');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(null);
  const [sidebarState, setSidebarState] = useState<'rail' | 'expanded'>('expanded');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isModelVisible, setIsModelVisible] = useState(false);

  // Persistence hooks
  const { loadTaxData, persistTaxData, loadSessionState, persistSessionState } = useVaultPersistence();

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedTaxData = await loadTaxData();
        if (storedTaxData) {
          setTaxData(storedTaxData);
          // If user had documents, skip to dashboard phase
          if (storedTaxData.vault && storedTaxData.vault.length > 0) {
            setOnboardingPhase('dashboard');
            setIsModelVisible(true);
          }
        }
        
        // Load Session State
        const sessionState = await loadSessionState();
        if (sessionState) {
          if (sessionState.isTestMode !== undefined) setIsTestMode(sessionState.isTestMode);
          if (sessionState.messages) setMessages(sessionState.messages);
          if (sessionState.onboardingPhase) {
            setOnboardingPhase(sessionState.onboardingPhase as any);
            // Restore model visibility if not landing
            if (sessionState.onboardingPhase !== 'landing' && sessionState.onboardingPhase !== 'phone') {
               // Logic to determine if model was visible? For now default to closed or checking width
            }
          }
        }
      } catch (error) {
        console.error('Failed to load persisted data:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadPersistedData();
  }, []);

  // Persist tax data on changes (debounced)
  useEffect(() => {
    if (!isDataLoaded) return;

    const timeoutId = setTimeout(() => {
      persistTaxData(taxData).catch(error => {
        console.error('Failed to persist tax data:', error);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [taxData, isDataLoaded, persistTaxData]);

  // Persist Session State
  useEffect(() => {
    if (!isDataLoaded) return;
    const timeoutId = setTimeout(() => {
      persistSessionState({ messages, onboardingPhase, isTestMode }).catch(e => console.error(e));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [messages, onboardingPhase, isTestMode, isDataLoaded, persistSessionState]);

  const saveToHistory = useCallback((current: TaxData) => {
    setHistory(prev => [...prev.slice(-10), current]);
  }, []);

  // Layout Logic: Chat Panel always flex-1, Right Panel toggles width
  const chatPanelClass = 'flex-1 min-w-0 transition-all duration-500'; 
  
  const rightPanelClass = `hidden lg:flex flex-col h-full gap-3 transition-all duration-500 ${isModelVisible ? 'w-[400px] xl:w-[480px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`;

  const handleUpdateField = (docId: string, fieldId: string, newValue: any) => {
    saveToHistory(taxData);
    setTaxData(prev => {
      // Mock Refund Update for Phase 2 Optimization
      if (docId === 'system' && fieldId === 'optimization') {
           return { ...prev, estRefund: '$4,720', deductionsTotal: '$9,480.00' }; // Hardcoded bump for demo
      }
      // Handle system updates (like step changes from UI clicks)
      if (docId === 'system') {
        if (fieldId === 'step') return { ...prev, currentStep: newValue as FilingStep };
        return prev;
      }
      const newVault = prev.vault.map(doc => {
        if (doc.id === docId) {
          const newFields = doc.fields.map(f => f.id === fieldId ? { ...f, value: newValue, status: 'PASS' as const } : f);
          return { ...doc, fields: newFields };
        }
        return doc;
      });
      return { ...prev, vault: newVault };
    });
  };

  const handleIdentityVerification = async () => {
    setIsLoading(true);
    setLoadingStage('identifying'); // New stage for "Verifying identity..."
    
    // Simulate Plaid Identity Verification (15s progress)
    // We'll advance the progress bar via the LoadingStage component in ChatPanel later
    
    setTimeout(() => {
       setIsLoading(false);
       setLoadingStage(null);
       setOnboardingPhase('bank');
       
       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: 'model',
         text: "**Identity verified.**\n\nI found 3 accounts associated with your profile. Let's connect them to pull your tax documents.",
         timestamp: new Date().toLocaleTimeString(),
         statusUpdate: "Identity Verified",
         chips: [{ label: 'Connect Accounts', actionId: 'connect_bank', primary: true }]
       }]);
    }, 4000); // Shortened for prototype (design says 15s)
  };

  const handlePhoneSubmit = (phone: string) => {
    // 1. User sent phone number
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: phone,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setOnboardingPhase('identity');

    // 2. AI Responds confirming and starting Identity Check
    setTimeout(() => {
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Thanks. I'm connecting to **Plaid** to verify your identity and find your financial accounts.",
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiMsg]);
        handleIdentityVerification();
    }, 1000);
  };

  // Regular AI processing
  const processTurn = async (userText: string, attachment?: { data: string; mimeType: string; preview: string; name?: string }) => {
    setIsLoading(true);
    const isComplex = !!attachment || userText.length > 80;
    
    if (attachment) {
      setLoadingStage('uploading');
      setTimeout(() => setLoadingStage('scanning'), 600);
      setTimeout(() => setLoadingStage('extracting'), 1500);
      setTimeout(() => setLoadingStage('processing'), 2500);
    } else {
      setLoadingStage('thinking');
    }

    const conversationHistory = messages.map(m => ({
      role: m.role === 'model' || m.role === 'system' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const handleDataUpdate = (updates: Partial<TaxData>) => {
      saveToHistory(taxData);
      setTaxData(prev => ({ ...prev, ...updates }));
    };

    try {
      const responseText = await sendMessageToGemini(
        conversationHistory, 
        userText, 
        taxData, 
        handleDataUpdate, 
        { isComplex, attachment: attachment ? { data: attachment.data, mimeType: attachment.mimeType } : undefined }
      );
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toLocaleTimeString(),
        chips: taxData.suggestedChips.length > 0 ? taxData.suggestedChips : undefined,
        isThinking: isComplex
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "I'm having trouble syncing. Let's try that again.", timestamp: "Now" }]);
    } finally {
      setIsLoading(false);
      setLoadingStage(null);
    }
  };

  const handleSendMessage = (text: string, attachment?: { data: string; mimeType: string; preview: string; name?: string }) => {
    // If in phone phase, handle as phone submit
    if (onboardingPhase === 'phone') {
        handlePhoneSubmit(text);
        return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
      fileMeta: attachment ? { name: attachment.name || 'document', type: attachment.mimeType } : undefined
    };
    setMessages(prev => [...prev, userMsg]);
    processTurn(text, attachment);
  };

  // Phase 1 Refinement Step Management
  const [connectStep, setConnectStep] = useState(0);

  const handlePlaidSync = (bankIds: string[]) => {
    // Inline Plaid Sync
    setIsLoading(true);
    setLoadingStage('processing');
    
    setTimeout(() => {
      saveToHistory(taxData);
      
      // 1.3 Bank Connection Data (Chase)
      const chaseDoc: ProcessedDocument = {
        id: `plaid-${Date.now()}`,
        type: 'Wage & Deduction Sync',
        name: `Chase + TechCorp Data`,
        taxYear: '2025',
        timestamp: new Date().toISOString(),
        dataPointCount: 3,
        sourceType: 'Plaid',
        status: 'processed',
        confidence: 1.0,
        fields: [
          { id: 'p1', label: 'Wages Reported (YTD)', value: '$92,400.00', confidence: 1.0, status: 'PASS', mapping: 'Wage Income', lineage: 'Plaid Payroll API', sourceId: `plaid-${Date.now()}` },
          { id: 'p2', label: 'Federal Withholding', value: '$12,150.00', confidence: 1.0, status: 'PASS', mapping: 'Taxes Paid', lineage: 'Plaid Payroll API', sourceId: `plaid-${Date.now()}` },
          { id: 'p3', label: 'Qualified Deductions', value: '$5,280.00', confidence: 1.0, status: 'PASS', mapping: 'Deductions', lineage: 'Plaid Ledger API', sourceId: `plaid-${Date.now()}` }
        ]
      };

      const updatedData = {
        ...taxData,
        incomeTotal: '$92,400.00',
        deductionsTotal: '$5,280.00',
        taxesPaid: '$12,150.00',
        estRefund: '$4,200', 
        vault: [...taxData.vault, chaseDoc],
        docsReceived: taxData.docsReceived + 1,
        currentStep: 'INCOME' as FilingStep
      };
      setTaxData(updatedData);

      // Animation & Transition to Dashboard
      setIsModelVisible(true);
      setOnboardingPhase('dashboard');
      setIsLoading(false);
      setLoadingStage(null);

      // Message for Step 1.3 -> Prompt Step 1.4
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "**Connected to Chase.**\n\nI've synced your documents: \n• **W-2** from TechCorp\n• **1099-INT** from Chase\n\nI also see you may have accounts with **Vanguard** and **Bank of America**. Would you like to connect those as well?",
        timestamp: new Date().toLocaleTimeString(),
        statusUpdate: "Chase Connected",
        chips: [
          { label: "Connect Vanguard", actionId: "connect_vanguard" },
          { label: "Connect BofA", actionId: "connect_boa" },
          { label: "Skip for now", actionId: "skip_additional" }
        ]
      }]);
    }, 2500);
  };

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        
        handleSendMessage(`Analyzing ${file.name}`, {
          data: base64,
          mimeType: file.type,
          preview: file.type.startsWith('image/') ? result : 'https://img.icons8.com/color/512/pdf.png',
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1.5: Mortgage (Simulated)
  const handleMortgageDetection = () => {
      setIsLoading(true);
      setTimeout(() => {
          setTaxData(prev => ({
              ...prev,
              deductionsTotal: '$17,680.00', // Added 12400
              estRefund: '$6,850', // Updated per spec
              vault: [...prev.vault, {
                  id: 'mortgage-1',
                  type: '1098 Mortgage Interest',
                  name: 'Wells Fargo Mortgage',
                  taxYear: '2025',
                  timestamp: new Date().toISOString(),
                  dataPointCount: 2,
                  sourceType: 'Plaid',
                  status: 'processed',
                  confidence: 1.0,
                  fields: []
              }]
          }));
          setIsLoading(false);
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: "**✓ Connected to Wells Fargo**\n\nRetrieved:\n• **Form 1098** (Mortgage Interest): $12,400\n• **Property Tax** records: $6,200\n\nYour estimated refund has increased to **$6,850**.",
              timestamp: new Date().toLocaleTimeString(),
              chips: [{ label: "Continue", actionId: "step_prior_year", primary: true }]
          }]);
      }, 1500);
  };

  // Step 1.6: Prior Year Import (Step 7: Improved copy)
  const handlePriorYearPrompt = () => {
      // Step 3: Add typing delay for pacing
      setIsLoading(true);
      setLoadingStage('thinking');

      setTimeout(() => {
          setIsLoading(false);
          setLoadingStage(null);
          setMessages(prev => [...prev, {
              id: `model-${Date.now()}`,
              role: 'model',
              text: "I can save you time by importing last year's return. Want me to do that?",
              timestamp: new Date().toLocaleTimeString(),
              chips: [
                  { label: "Import from IRS", actionId: "import_irs", primary: true },
                  { label: "Upload 2024 PDF", actionId: "upload_prior" },
                  { label: "First time filing", actionId: "step_uploads" }
              ]
          }]);
      }, 1500);
  };

  // Step 1.7: Additional Uploads
  const handleAdditionalUploads = () => {
      // Step 3: Add typing delay
      setIsLoading(true);
      setLoadingStage('thinking');

      setTimeout(() => {
          setIsLoading(false);
          setLoadingStage(null);
          setMessages(prev => [...prev, {
              id: `model-${Date.now()}`,
              role: 'model',
              text: "I've pulled most of your documents automatically. Do you have any other forms to add?\n\n(e.g., 1099-MISC, charitable receipts, medical expenses)",
              timestamp: new Date().toLocaleTimeString(),
              chips: [
                  { label: "Upload Documents", actionId: "upload_misc" },
                  { label: "Continue", actionId: "step_summary", primary: true }
              ]
          }]);
      }, 1500);
  };

  // Step 1.8: Summary & Transition (Step 7: Improved copy with checkmarks)
  const handleConnectionSummary = () => {
      setIsLoading(true);
      setLoadingStage('thinking');

      setTimeout(() => {
          setIsLoading(false);
          setLoadingStage(null);
          setMessages(prev => [...prev, {
              id: `model-${Date.now()}`,
              role: 'model',
              text: "**Great!** Here's what I've gathered:\n\n✓ 3 connected accounts (Chase, Vanguard, BofA)\n✓ W-2 from TechCorp\n✓ 1099-INT from Chase\n✓ 1098 Mortgage Interest\n\nNext, I'll review everything and find ways to maximize your refund. Ready?",
              timestamp: new Date().toLocaleTimeString(),
              statusUpdate: "Data Gathering Complete",
              chips: [
                  { label: "Start Review", actionId: "move_review", primary: true }
              ]
          }]);
      }, 2000);
  };

  const handleVaultDocumentProcessed = useCallback((doc: ProcessedDocument) => {
    saveToHistory(taxData);
    setTaxData(prev => ({
      ...prev,
      vault: [...prev.vault, doc],
      docsReceived: prev.docsReceived + 1
    }));
  }, [taxData, saveToHistory]);

  const handleVaultDocumentSelect = useCallback((doc: ProcessedDocument | null) => {
    // Keep user in vault view to show details
    // if (doc) {
    //   setActiveView('chat');
    //   setIsModelVisible(true);
    // }
  }, []);

  const renderDashboard = () => (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-hig-title2 font-semibold text-white">Finance Dashboard</h1>
        <p className="text-hig-footnote text-white/50 mt-1">Tax Season 2025</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <span className="text-hig-caption2 text-white/40 uppercase tracking-wide">Wages</span>
          <span className="block text-hig-title1 font-semibold text-white mt-1">{taxData.incomeTotal}</span>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <span className="text-hig-caption2 text-white/40 uppercase tracking-wide">Deductions</span>
          <span className="block text-hig-title1 font-semibold text-white mt-1">{taxData.deductionsTotal}</span>
        </div>
        <div className="p-4 rounded-xl bg-ok/[0.08] border border-ok/20">
          <span className="text-hig-caption2 text-ok/70 uppercase tracking-wide">Est. Refund</span>
          <span className="block text-hig-title1 font-semibold text-ok mt-1">{taxData.outcome}</span>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-8">
        <h2 className="text-hig-caption2 text-white/40 uppercase tracking-wide px-1 mb-2">Recent Documents</h2>
        <div className="rounded-xl bg-white/[0.04] border border-white/10 divide-y divide-white/10">
          {taxData.vault.slice(0, 3).map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setActiveView('vault')}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <IconFile className="w-5 h-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-hig-caption2 text-hig-blue uppercase tracking-wide">{doc.type}</span>
                <p className="text-hig-body text-white truncate">{doc.name}</p>
              </div>
              <span className="text-hig-caption2 text-white/40">{doc.sourceType}</span>
            </button>
          ))}
          {taxData.vault.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-hig-footnote text-white/40">No documents yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2.3: Smart Questionnaire
  const handleSmartQuestionnaire = () => {
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "**Just to be sure...**\n\nDid you make any charitable donations in 2024 (cash or goods)?",
          timestamp: new Date().toLocaleTimeString(),
          chips: [
              { label: "Yes, I did", actionId: "q_charity_yes" },
              { label: "No", actionId: "q_charity_no" },
              { label: "Not sure", actionId: "q_charity_unsure" }
          ]
      }]);
  };

  const handleCharityFollowUp = (response: string) => {
      if (response === 'yes') {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "What was the total value?", timestamp: new Date().toLocaleTimeString() }]);
          // In a real app we'd wait for input, here we simulate the user typing "$500" via chip or logic
          // For prototype, we'll just fast forward
          setTimeout(() => {
             setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "$500", timestamp: new Date().toLocaleTimeString() }]);
             setTaxData(prev => ({
                 ...prev,
                 deductionsTotal: '$18,180.00', // +500
                 estRefund: '$7,470' // Updated
             }));
             setTimeout(() => handleFinalReview(), 1000);
          }, 1500);
      } else {
          handleFinalReview();
      }
  };

  // Step 2.4: Review Complete & Confidence
  const handleFinalReview = () => {
      // Switch panel to final summary mode
      setIsModelVisible(true);
      
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "**Review Complete.**\n\nYour return looks accurate. I'm confident in these numbers based on your documents.\n\nYou can proceed to file, or request a CPA review for $29.",
          timestamp: new Date().toLocaleTimeString(),
          statusUpdate: "Ready to File",
          chips: [
              { label: "File My Return", actionId: "start_filing", primary: true },
              { label: "Ask a CPA ($29)", actionId: "ask_cpa" }
          ]
      }]);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-chedr-background text-white selection:bg-hig-blue/30 selection:text-white">
      {/* Accessibility: Skip to Main Content */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-bold focus:rounded-md shadow-lg"
      >
        Skip to main content
      </a>
      
      {/* Left Panel: Sidebar Navigation */}
      <nav 
        className={`
          flex flex-col border-r border-white/[0.06] bg-chedr-background z-30 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${sidebarState === 'expanded' ? 'w-[260px]' : 'w-[68px]'}
          hidden lg:flex
        `}
        aria-label="Main Navigation"
      >
        <Sidebar 
          state={sidebarState} 
          onToggle={() => setSidebarState(s => s === 'rail' ? 'expanded' : 'rail')} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
      </nav>

      {/* Center Panel: Primary Workspace */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 relative z-0 bg-chedr-background" tabIndex={-1}>
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Main View Switcher */}
          {activeView === 'chat' && (onboardingPhase === 'landing' || onboardingPhase === 'phone') && (
            <ChatOnboarding
              isTestMode={isTestMode}
              initialMessage={WELCOME_MESSAGE.text}
              onToggleModel={() => {
                if (window.innerWidth >= 1024) {
                  setIsModelVisible(!isModelVisible);
                } else {
                  setIsMobileFormOpen(true);
                }
              }}
              isModelVisible={isModelVisible}
              onComplete={(phone) => {
                setOnboardingPhase('bank');
                setMessages(prev => [...prev,
                  { id: `user-${Date.now()}`, role: 'user', text: phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'), timestamp: new Date().toLocaleTimeString() },
                  {
                    id: `model-${Date.now()}`,
                    role: 'model',
                    text: "Now let's connect your accounts to pull your tax documents automatically.",
                    timestamp: new Date().toLocaleTimeString(),
                    chips: [
                      { label: 'Connect Bank', actionId: 'connect_bank', primary: true },
                      { label: 'Upload Documents', actionId: 'step_uploads' }
                    ]
                  }
                ]);
              }}
            />
          )}

          {activeView === 'chat' && onboardingPhase !== 'landing' && onboardingPhase !== 'phone' && (
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              onChipClick={(id, label) => {
                // ... (Existing chip logic)
                if (id === 'connect_bank') {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: "Select your bank to securely sync your data:",
                        timestamp: new Date().toLocaleTimeString(),
                        widget: { type: 'plaid' }
                    }]);
                }
                else if (id === 'connect_vanguard' || id === 'connect_boa') {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: label, timestamp: new Date().toLocaleTimeString() }]);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(), role: 'model', 
                            text: `**Connected to ${label.replace('Connect ', '')}.**\n\nI've retrieved your investment documents.`,
                            timestamp: new Date().toLocaleTimeString()
                        }]);
                        setTimeout(() => {
                            setMessages(prev => [...prev, {
                                id: (Date.now()+1).toString(), role: 'model',
                                text: "I see you have a mortgage with **Wells Fargo**. I can pull your 1098 form directly. Would you like me to connect?",
                                timestamp: new Date().toLocaleTimeString(),
                                chips: [{ label: "Connect Wells Fargo", actionId: "connect_mortgage", primary: true }, { label: "Skip", actionId: "step_prior_year" }]
                            }]);
                        }, 1000);
                    }, 1500);
                }
                else if (id === 'skip_additional') {
                     setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text: "Skip for now", timestamp: new Date().toLocaleTimeString() }]);
                     setIsLoading(true);
                     setLoadingStage('thinking');
                     setTimeout(() => {
                          setMessages(prev => [...prev, {
                              id: `model-bridge-${Date.now()}`, role: 'model',
                              text: "Got it. Let me check what else I can help with...",
                              timestamp: new Date().toLocaleTimeString()
                          }]);
                     }, 1500);
                     setTimeout(() => {
                          setIsLoading(false);
                          setLoadingStage(null);
                          setMessages(prev => [...prev, {
                              id: `model-${Date.now()}`, role: 'model',
                              text: "I see you have a mortgage with **Wells Fargo**. I can pull your 1098 form directly. Would you like me to connect?",
                              timestamp: new Date().toLocaleTimeString(),
                              chips: [{ label: "Connect Wells Fargo", actionId: "connect_mortgage", primary: true }, { label: "Skip for now", actionId: "step_prior_year" }]
                          }]);
                     }, 3000);
                }
                else if (id === 'connect_mortgage') {
                    handleSendMessage("Connect Wells Fargo");
                    handleMortgageDetection();
                }
                else if (id === 'step_prior_year') {
                    handlePriorYearPrompt();
                }
                else if (id === 'import_irs' || id === 'upload_prior') {
                    handleSendMessage(label);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(), role: 'model',
                            text: "**Import Successful.**\n\nI've used your 2024 return to populate your filing status and address.",
                            timestamp: new Date().toLocaleTimeString()
                        }]);
                        handleAdditionalUploads();
                    }, 2000);
                }
                else if (id === 'step_uploads') {
                    handleAdditionalUploads();
                }
                else if (id === 'upload_misc') {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: "Upload your additional documents here:",
                        timestamp: new Date().toLocaleTimeString(),
                        widget: { type: 'upload' }
                    }]);
                }
                else if (id === 'step_summary') {
                    handleConnectionSummary();
                }
                else if (id === 'move_review') {
                    setOnboardingPhase('review');
                    setIsModelVisible(true);
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(), 
                        role: 'model', 
                        text: "Let's review your info. I've switched to **Review Mode**. \n\nI see a potential deduction for **Student Loan Interest**.",
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                }
                else if (id === 'q_charity_yes') handleCharityFollowUp('yes');
                else if (id === 'q_charity_no') handleCharityFollowUp('no');
                else if (id === 'start_filing') handleSendMessage("Starting Filing Process...");
                else if (id === 'upload_docs' || id === 'import_prior') setIsDrawerOpen(true);
                else if (id === 'view_vault') setActiveView('vault');
                else handleSendMessage(label);
              }}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              isLoading={isLoading}
              loadingStage={loadingStage}
              onboardingPhase={onboardingPhase as any}
              onToggleModel={() => {
                if (window.innerWidth >= 1024) {
                    setIsModelVisible(!isModelVisible);
                } else {
                    setIsMobileFormOpen(true);
                }
              }}
              isModelVisible={isModelVisible}
              onPlaidSync={handlePlaidSync}
              onFileUpload={handleFileUpload}
            />
          )}

          {activeView === 'vault' && (
            <DocumentVault
              initialDocuments={taxData.vault}
              onDocumentSelect={handleVaultDocumentSelect}
              onDocumentProcessed={handleVaultDocumentProcessed}
            />
          )}
          
          {activeView === 'dashboard' && renderDashboard()}
          
          {activeView === 'profile' && (
             <div className="flex-1 flex items-center justify-center text-white/30 text-sm">Profile Management</div>
          )}
          
          {activeView === 'settings' && (
            <SettingsView 
              isTestMode={isTestMode} 
              onToggleTestMode={setIsTestMode} 
            />
          )}
        </div>
      </main>
      
      {/* Right Panel: Context Drawer */}
      <aside 
        className={`
          hidden lg:flex flex-col border-l border-white/[0.06] bg-chedr-background-secondary/50 backdrop-blur-md
          transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) overflow-hidden
          ${isModelVisible ? 'w-[420px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}
        `}
      >
        <div className="w-[420px] h-full flex flex-col">
          <LiveModelPanel 
            data={taxData} 
            mode={onboardingPhase === 'review' ? 'review' : onboardingPhase === 'final' ? 'final' : 'summary'}
            onReview={() => { setOnboardingPhase('review'); setIsModelVisible(true); }}
            onNext={() => {
               if (onboardingPhase === 'review') {
                   handleSmartQuestionnaire();
                   setOnboardingPhase('final'); 
               } else if (onboardingPhase === 'final') {
                   handleSendMessage("Finalize my return for submission.");
               }
            }}
            onUpdateField={handleUpdateField}
            onUndo={() => {}}
            onClose={() => setIsModelVisible(false)}
          />
        </div>
      </aside>

      {/* Overlays / Modals */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onUpload={() => handleSendMessage("Analyze my uploaded document")}
        onAction={(id) => handleSendMessage(`I'd like to ${id}`)}
      />

      <Drawer 
        isOpen={isMobileFormOpen} 
        onClose={() => setIsMobileFormOpen(false)} 
        title="Tax Form View"
        onUpload={() => {}} 
        onAction={() => {}}
      >
        <div className="h-full pb-8">
           <LiveModelPanel 
            data={taxData} 
            mode={onboardingPhase === 'review' ? 'review' : 'summary'}
            onReview={() => setIsMobileFormOpen(true)}
            onNext={() => { handleSendMessage("Finalize my return for submission."); setIsMobileFormOpen(false); }}
            onUpdateField={handleUpdateField}
            onUndo={() => {}}
            onClose={() => setIsMobileFormOpen(false)} 
          />
        </div>
      </Drawer>

      {/* Mobile Bottom Bar */}
      {onboardingPhase !== 'landing' && onboardingPhase !== 'phone' && (
        <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-chedr-background/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 hig-safe-area-bottom">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[11px] text-white/40 font-medium">Estimated Refund</span>
              <span className="text-[17px] text-hig-green font-semibold tracking-tight">{taxData.estRefund || '$0.00'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFormOpen(true)}
              className="px-5 py-2.5 bg-hig-blue text-white text-[15px] font-semibold rounded-full shadow-lg shadow-hig-blue/20 active:scale-95 transition-transform"
            >
              View Summary
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
