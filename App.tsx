import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { SendIcon, PaperclipIcon, BrainIcon, LogOutIcon } from './components/Icons';
import { Message, Sender, UploadedFile, LoadingState, Bot } from './types';
import { streamGeminiResponse, hasApiKey } from './services/geminiService';
import { RoleSelector } from './components/RoleSelector';
import { BotDashboard } from './components/BotDashboard';

type ViewState = 'selection' | 'dashboard' | 'chat';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('selection');
  const [role, setRole] = useState<'student' | 'instructor' | null>(null);
  
  // Multi-Bot State
  const [bots, setBots] = useState<Bot[]>([]);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  
  // Chat State (Per session, resets on bot switch)
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isInstructor = role === 'instructor';
  const activeBot = bots.find(b => b.id === activeBotId);

  // --- Logic: Navigation & Role ---

  const handleRoleSelect = (selectedRole: 'student' | 'instructor') => {
    setRole(selectedRole);
    setView('dashboard');
  };

  const handleBotSelect = (botId: string) => {
    setActiveBotId(botId);
    setView('chat');
    
    // Initialize chat history for this session
    const currentBot = bots.find(b => b.id === botId);
    
    let welcomeText = '';
    if (isInstructor) {
      welcomeText = `You are editing "${currentBot?.title}". Upload materials specifically for this assessment.`;
    } else {
      const fileNames = currentBot?.files.map(f => f.name).join(', ');
      const filesContext = fileNames ? `I currently have access to: ${fileNames}.` : "I don't have any materials uploaded yet.";
      
      welcomeText = `Hi! I'm ready to help with "${currentBot?.title}". 
      
Here is what I can and cannot do:
- **Scope:** I can answer questions, explain concepts, clarify rubrics, and generate revision questions based *only* on the provided module materials. 
- **Limitations:** I cannot draft, write, or complete assignments for you. I won't use outside knowledge.
- **Documents:** ${filesContext}
      
If you are stuck, feeling overwhelmed, or need to speak to someone directly, please contact your module tutor at tutor@university.edu during office hours, or ask in the module Teams channel.

How can I help you engage with the materials today?`;
    }

    setMessages([{
      id: 'welcome',
      text: welcomeText,
      sender: Sender.BOT,
      timestamp: Date.now()
    }]);
  };

  const handleBackToDashboard = () => {
    setActiveBotId(null);
    setView('dashboard');
    setMessages([]);
    setInput('');
  };

  // --- Logic: Bot Management ---

  const handleCreateBot = (title: string, description: string) => {
    const newBot: Bot = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      files: [],
      createdAt: Date.now()
    };
    setBots(prev => [newBot, ...prev]);
  };

  const handleDeleteBot = (botId: string) => {
    setBots(prev => prev.filter(b => b.id !== botId));
    if (activeBotId === botId) handleBackToDashboard();
  };

  // --- Logic: File Management (scoped to active Bot) ---

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    if (!activeBotId) return;
    
    setBots(prev => prev.map(bot => {
      if (bot.id === activeBotId) {
        return { ...bot, files: [...bot.files, ...newFiles] };
      }
      return bot;
    }));
  };

  const handleRemoveFile = (fileId: string) => {
    if (!activeBotId) return;

    setBots(prev => prev.map(bot => {
        if (bot.id === activeBotId) {
            return { ...bot, files: bot.files.filter(f => f.id !== fileId) };
        }
        return bot;
    }));
  };

  // --- Logic: Chat ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || loadingState === 'streaming' || !activeBot) return;
    
    if (!hasApiKey()) {
      alert("API Key is missing. Please ensure process.env.API_KEY is set.");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: Sender.USER,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoadingState('streaming');
    
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
        id: botMsgId,
        text: '',
        sender: Sender.BOT,
        timestamp: Date.now()
    }]);

    try {
        let fullText = "";
        await streamGeminiResponse(
            {
                message: userMsg.text,
                files: activeBot.files, // PASS ONLY ACTIVE BOT FILES
                history: messages,
                courseTitle: activeBot.title
            },
            (chunk) => {
                fullText += chunk;
                setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId ? { ...msg, text: fullText } : msg
                ));
            }
        );
    } catch (error) {
        console.error("Error generating response", error);
        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: "I encountered an error while consulting the course materials. Please try again.", isError: true } : msg
        ));
    } finally {
        setLoadingState('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render ---

  if (view === 'selection') {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  if (view === 'dashboard') {
    return (
      <BotDashboard 
        bots={bots}
        isInstructor={isInstructor}
        onSelectBot={handleBotSelect}
        onCreateBot={handleCreateBot}
        onDeleteBot={handleDeleteBot}
        onSwitchRole={() => setView('selection')}
      />
    );
  }

  // CHAT VIEW
  return (
    <div className="flex h-screen bg-slate-50 font-inter">
      {/* Sidebar */}
      <Sidebar 
        files={activeBot?.files || []} 
        activeBotTitle={activeBot?.title || 'Unknown Assessment'}
        onRemoveFile={handleRemoveFile} 
        onFilesAdded={handleFilesAdded} 
        isInstructor={isInstructor}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-white">
        {/* Header (Mobile Only) */}
        <div className={`md:hidden h-16 text-white flex items-center px-4 justify-between shadow-md z-20 ${isInstructor ? 'bg-indigo-900' : 'bg-emerald-800'}`}>
           <div className="flex items-center gap-2 overflow-hidden">
             <button onClick={handleBackToDashboard}><BrainIcon className="w-6 h-6 text-white flex-shrink-0" /></button>
             <span className="font-semibold truncate">{activeBot?.title}</span>
           </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50/50">
          <div className="max-w-3xl mx-auto w-full pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loadingState === 'streaming' && messages[messages.length - 1]?.sender === Sender.USER && (
               <div className="flex w-full justify-start mb-8 animate-pulse">
                  <div className="flex items-center gap-2 text-slate-400 text-sm ml-12 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     <span className="ml-2 text-xs font-medium">Analyzing course materials...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200 z-20">
          <div className="max-w-3xl mx-auto relative">
            <div className={`relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 shadow-sm focus-within:ring-2 transition-all ${isInstructor ? 'focus-within:ring-indigo-100 focus-within:border-indigo-500' : 'focus-within:ring-emerald-100 focus-within:border-emerald-500'}`}>
              
              {/* Mobile File Upload Trigger (Only for Instructor) */}
              {isInstructor && (
                <div className="md:hidden p-2 text-slate-400">
                    <PaperclipIcon className="w-5 h-5" />
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={(!activeBot?.files || activeBot.files.length === 0) ? "No materials available yet..." : "Ask a question..."}
                className="w-full bg-transparent border-0 focus:ring-0 text-slate-800 text-base placeholder:text-slate-400 resize-none py-3 max-h-[150px] min-h-[50px]"
                rows={1}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loadingState === 'streaming'}
                className={`p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
                  input.trim() && loadingState !== 'streaming'
                    ? isInstructor 
                        ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105'
                        : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Disclaimer Footer */}
            <div className="mt-3 flex flex-col items-center gap-1">
                <p className="text-center text-[10px] text-slate-400">
                EduBot uses AI and may make mistakes. Verify all explanations with your official course materials.
                </p>
                <p className="text-center text-[10px] text-slate-300">
                Academic Integrity: Use this tool for understanding, not for completing graded assignments.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;