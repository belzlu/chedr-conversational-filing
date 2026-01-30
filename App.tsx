
import React, { useState, useCallback, useMemo } from 'react';
import { TaxData, INITIAL_TAX_DATA, Message, ProcessedDocument, FilingStep, ChipAction } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { ChatPanel, LoadingStage } from './components/ChatPanel';
import { LiveModelPanel } from './components/LiveModelPanel';
import { Drawer } from './components/Drawer';
import { Sidebar } from './components/Sidebar';
import { MaterialShell, SurfaceOpaque } from './components/Material';
import { PlaidSelector } from './components/PlaidSelector';
// Added IconCheck to imports to resolve "Cannot find name 'IconCheck'" error
import { IconUpload, IconBank, IconHistory, IconFile, IconCheck } from './components/Icons';

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
  
  const [activeView, setActiveView] = useState('chat');
  
  // Phase 1 Onboarding State + Phase 2 Review + Phase 3 Final
  type OnboardingPhase = 'landing' | 'phone' | 'identity' | 'bank' | 'dashboard' | 'review' | 'final';
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('landing');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlaidOpen, setIsPlaidOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(null);
  const [sidebarState, setSidebarState] = useState<'rail' | 'expanded'>('expanded');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isModelVisible, setIsModelVisible] = useState(false); 

  const saveToHistory = useCallback((current: TaxData) => {
    setHistory(prev => [...prev.slice(-10), current]);
  }, []);

  // Layout Logic: Final mode also uses the 30/70 split
  const chatPanelClass = (onboardingPhase === 'review' || onboardingPhase === 'final')
     ? 'hidden lg:flex w-[30%] min-w-[320px]' 
     : 'flex-1';
  
  const rightPanelClass = (onboardingPhase === 'review' || onboardingPhase === 'final')
     ? 'flex-1 w-[70%]'
     : `hidden lg:flex flex-col h-full gap-3 transition-all duration-500 ${isModelVisible ? 'w-[400px] xl:w-[440px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`;

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
    setIsPlaidOpen(false);
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

  const renderVault = () => (
    <div className="h-full flex flex-col p-8 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Document Vault</h2>
        <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-accent/20 border border-accent/30 rounded-xl text-accent text-xs font-bold hover:bg-accent/30 transition-all flex items-center gap-2">
          <IconUpload className="w-4 h-4" /> Add File
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taxData.vault.map(doc => (
          <div key={doc.id} onClick={() => { setActiveView('chat'); setIsModelVisible(true); }} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-accent transition-colors">
                 <IconFile className="w-5 h-5" />
               </div>
               <div className="min-w-0">
                 <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                 <p className="text-[10px] text-white/30 uppercase tracking-widest">{doc.sourceType} • {doc.taxYear}</p>
               </div>
             </div>
             <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">{doc.dataPointCount} Fields</span>
                <span className="text-[10px] font-bold text-ok/60 flex items-center gap-1"><IconCheck className="w-3 h-3" /> Verified</span>
             </div>
          </div>
        ))}
        {taxData.vault.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-white/5 italic">
            <IconFile className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Vault is currently empty</p>
            <p className="text-sm mt-2">Upload a prior return or connect Plaid to begin.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="h-full flex flex-col p-8 overflow-y-auto space-y-8">
       <div className="flex flex-col gap-1">
         <h2 className="text-2xl font-bold text-white">Finance Dashboard</h2>
         <p className="text-sm text-white/30">Tax Season 2025 Overview</p>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-accent/[0.03] border border-accent/20 rounded-3xl flex flex-col gap-1">
             <span className="text-[11px] font-black text-accent/60 uppercase tracking-widest">Wages (YTD)</span>
             <span className="text-3xl font-black text-white">{taxData.incomeTotal}</span>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col gap-1">
             <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">Deductions</span>
             <span className="text-3xl font-black text-white">{taxData.deductionsTotal}</span>
          </div>
          <div className="p-6 bg-ok/[0.03] border border-ok/20 rounded-3xl flex flex-col gap-1">
             <span className="text-[11px] font-black text-ok/60 uppercase tracking-widest">Est. Refund</span>
             <span className="text-3xl font-black text-white">{taxData.outcome}</span>
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
      // We need to pass a property or just assume 'review' mode can show final summary if we toggle it
      // Actually we defined mode='final' in LiveModelPanel props, let's use it
      // But onboardingPhase type is: 'landing' | 'phone' | 'identity' | 'bank' | 'dashboard' | 'review'
      // We might need a new phase 'final_review' or just manage it via state passed to LiveModelPanel
      
      // Let's use a specific message to trigger the UI changes if needed, but optimally we update state
      // For now, let's just trigger the message and keep 'review' phase, but maybe update a sub-state?
      
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
    <div className="h-screen w-screen flex flex-col lg:flex-row p-4 gap-4 overflow-hidden relative bg-page">
      <MaterialShell className={`hidden lg:flex ${sidebarState === 'expanded' ? 'w-[280px]' : 'w-[72px]'} flex-col items-center py-6 gap-6 relative z-20 transition-all duration-300`}>
        <Sidebar 
          state={sidebarState} 
          onToggle={() => setSidebarState(s => s === 'rail' ? 'expanded' : 'rail')} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
      </MaterialShell>

      <SurfaceOpaque className={`${chatPanelClass} h-full rounded-xl border border-white/5 overflow-hidden relative shadow-elev1 transition-all duration-500`}>
        {activeView === 'chat' && (
          <ChatPanel 
            messages={messages} 
            onSendMessage={handleSendMessage}
            onChipClick={(id, label) => {
              // Step 1 Fix: Guard against duplicate "Get Started" handling
              if (id === 'get_started') {
                  // Only handle if we're still on landing (prevents duplicates from rapid clicks)
                  if (onboardingPhase !== 'landing') return;

                  setOnboardingPhase('phone');
                  setMessages(prev => [...prev,
                    { id: `user-${Date.now()}`, role: 'user', text: "Get Started", timestamp: new Date().toLocaleTimeString() },
                    {
                        id: `model-${Date.now()}`,
                        role: 'model',
                        // Step 1.1 Copy (improved in Step 7)
                        text: "To get started, I'll need your **phone number**. I'll use it to verify your identity and securely connect your accounts—just like when you use your banking app.",
                        timestamp: new Date().toLocaleTimeString()
                    }
                  ]);
              }
              else if (id === 'connect_bank') setIsPlaidOpen(true);
              
              // Refinement Step Handlers
              else if (id === 'connect_vanguard' || id === 'connect_boa') {
                  // Simulate additional connection -> Then trigger Mortgage
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: label, timestamp: new Date().toLocaleTimeString() }]);
                  setTimeout(() => {
                      setMessages(prev => [...prev, {
                          id: Date.now().toString(), role: 'model', 
                          text: `**Connected to ${label.replace('Connect ', '')}.**\n\nI've retrieved your investment documents.`,
                          timestamp: new Date().toLocaleTimeString()
                      }]);
                      // Ask about Mortgage next
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
                   // Step 3: Add conversational pacing with bridging copy
                   setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text: "Skip for now", timestamp: new Date().toLocaleTimeString() }]);

                   // Show typing indicator
                   setIsLoading(true);
                   setLoadingStage('thinking');

                   // Bridging copy first
                   setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: `model-bridge-${Date.now()}`, role: 'model',
                            text: "Got it. Let me check what else I can help with...",
                            timestamp: new Date().toLocaleTimeString()
                        }]);
                   }, 1500);

                   // Then the actual next step
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
                  // Simulate import -> then uploads
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
                  setIsDrawerOpen(true); // Open drawer for upload
                  // After "upload", we'd logically move to summary, but for now just let them close it or msg
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
                  // Trigger Questionnaire shortly after? Or wait for user.
                  // For demo flow, we might want to manually trigger or have a "Continue" button on the panel.
                  // Implemented: LiveModelPanel "Confirm & File" button calls `onNext`.
                  // We should change `onNext` to trigger Questionnaire instead of filing immediately.
              }
              // Phase 2 Refinement Handlers
              else if (id === 'q_charity_yes') handleCharityFollowUp('yes');
              else if (id === 'q_charity_no') handleCharityFollowUp('no');
              else if (id === 'start_filing') handleSendMessage("Starting Filing Process..."); // Move to Phase 3


              else if (id === 'upload_docs' || id === 'import_prior') setIsDrawerOpen(true);
              else if (id === 'view_vault') setActiveView('vault');
              else handleSendMessage(label);
            }}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            isLoading={isLoading}
            loadingStage={loadingStage}
            // Pass Phase
            onboardingPhase={onboardingPhase as any} // Cast to keep TS happy if generic check fails, but we updated the type
            onToggleModel={() => {
              if (window.innerWidth >= 1024) {
                  setIsModelVisible(!isModelVisible);
              } else {
                  setIsMobileFormOpen(true);
              }
            }}
            isModelVisible={isModelVisible}
          />
        )}
        {activeView === 'vault' && renderVault()}
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'profile' && <div className="p-10 flex items-center justify-center h-full text-white/20 italic">Profile management module loading...</div>}
        {activeView === 'settings' && <div className="p-10 flex items-center justify-center h-full text-white/20 italic">Settings configuration loading...</div>}
      </SurfaceOpaque>
      
      {/* Desktop Right Panel */}
      <div className={`${rightPanelClass}`}>
        <LiveModelPanel 
          data={taxData} 
          mode={onboardingPhase === 'review' ? 'review' : onboardingPhase === 'final' ? 'final' : 'summary'}
          onReview={() => { setOnboardingPhase('review'); setIsModelVisible(true); }}
          onNext={() => {
             // If in review, go to questionnaire first
             if (onboardingPhase === 'review') {
                 handleSmartQuestionnaire();
                 setOnboardingPhase('final'); // Or keep review and just show Qs? 
                 // Actually spec says: Review -> Smart Qs -> Final Summary
                 // Let's transition phase to 'final' ONLY after Qs are done.
                 // So here just trigger Qs.
                 // But wait, changing phase might hide the panel if we aren't careful.
                 // Let's keep phase='review' during Qs, then 'final'.
             } else if (onboardingPhase === 'final') {
                 handleSendMessage("Finalize my return for submission.");
             }
          }}
          onUpdateField={handleUpdateField}
          onUndo={() => {
             // ...
          }}
          onClose={() => setIsModelVisible(false)}
        />
      </div>

      {/* Main Action Drawer */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onUpload={() => handleSendMessage("Analyze my uploaded document")}
        onAction={(id) => handleSendMessage(`I'd like to ${id}`)}
      />

      {/* Mobile Form Drawer */}
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

      <PlaidSelector
        isOpen={isPlaidOpen}
        onClose={() => setIsPlaidOpen(false)}
        onSync={handlePlaidSync}
      />

      {/* Step 15: Mobile Bottom Bar for Tax Summary Access */}
      {onboardingPhase !== 'landing' && onboardingPhase !== 'phone' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 hig-safe-area-bottom">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-hig-caption2 text-white/40">Estimated Refund</span>
              <span className="text-hig-headline text-hig-green font-semibold">{taxData.estRefund || '$0.00'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFormOpen(true)}
              className="px-5 py-2.5 bg-hig-blue text-white text-hig-subhead font-semibold rounded-full shadow-lg shadow-hig-blue/20 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hig-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="View tax summary"
            >
              View Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
