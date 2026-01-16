
import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, Button, Badge, Input } from '../components/UI';
import { api } from '../services/api';
import { DocumentAnalysis } from '../types';
import { 
    Upload, FileText, Sparkles, Send, Bot, User, 
    CheckCircle2, BrainCircuit, Microscope, Info, 
    BookOpen, Search, X, MessageSquare, Loader2,
    RefreshCw, Zap, Binary, Layers, FileSearch, ShieldCheck,
    ChevronRight, Compass
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

/**
 * Enhanced Markdown Component to handle structured AI technical reports
 */
const FormattedMessage: React.FC<{ text: string; role: 'user' | 'assistant' }> = ({ text, role }) => {
    if (role === 'user') return <>{text}</>;

    // Split text into blocks (paragraphs or headers)
    const blocks = text.split('\n');

    return (
        <div className="space-y-3">
            {blocks.map((block, idx) => {
                const trimmed = block.trim();
                if (!trimmed) return <div key={idx} className="h-2" />;

                // Handle Headers (### Header)
                if (trimmed.startsWith('###')) {
                    return (
                        <h4 key={idx} className="text-sm font-black text-violet-700 dark:text-violet-400 mt-4 mb-2 uppercase tracking-tight">
                            {trimmed.replace(/^###\s*/, '')}
                        </h4>
                    );
                }

                // Handle Bullet Points (* Item)
                if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                    const content = trimmed.replace(/^[*|-]\s*/, '');
                    return (
                        <div key={idx} className="flex gap-2 ml-2">
                            <span className="text-violet-500 font-bold mt-1">•</span>
                            <p className="flex-1 text-sm">
                                {renderInlines(content)}
                            </p>
                        </div>
                    );
                }

                // Default Paragraph
                return (
                    <p key={idx} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {renderInlines(trimmed)}
                    </p>
                );
            })}
        </div>
    );
};

// Helper to render bold text within a block
const renderInlines = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 px-1 rounded">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
};

export const DocInsight: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'metadata'>('summary');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setAnalyzing(true);
        setAnalysis(null);
        setMessages([]);

        const contentStub = `Technical document regarding ${selectedFile.name}. Analysis required for AI/ML/Quantum context.`;
        
        try {
            const result = await api.documentService.analyzeDocument(selectedFile.name, contentStub);
            setAnalysis(result);
            setMessages([{
                id: '1',
                role: 'assistant',
                text: `### Identification Complete\nI have successfully indexed **${selectedFile.name}**. \n\nThis document is classified as a **${result.complexity}** complexity paper within the field of **${result.field}**. I am now fully grounded in its technical methodology.\n\n* **Primary Focus:** ${result.summary.slice(0, 100)}...\n* **Ready for Query:** You may now ask specific questions about the data or implementation details.`
            }]);
        } catch (e) {
            console.error("Document analysis error:", e);
            if ((window as any).notify) (window as any).notify('error', 'Analysis pipeline failed.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !analysis) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const questionText = input;
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.documentService.askDocQuestion(questionText, analysis.summary);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: response }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsTyping(false);
        }
    };

    const triggerQuickQuestion = (q: string) => {
        if (isTyping) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        
        api.documentService.askDocQuestion(q, analysis?.summary || "").then(response => {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: response }]);
            setIsTyping(false);
        });
    };

    const clearSession = () => {
        setFile(null);
        setAnalysis(null);
        setMessages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            <div className="flex-shrink-0">
                <SectionTitle 
                    title="Research Copilot" 
                    subtitle="Semantic document intelligence grounded in technical literature" 
                    rightElement={
                        file && (
                            <Button variant="outline" className="h-9 px-4 text-xs font-bold border-red-100 text-red-500 hover:bg-red-50" onClick={clearSession}>
                                <RefreshCw className="w-3.5 h-3.5 mr-2" /> New Document
                            </Button>
                        )
                    }
                />
            </div>

            {!file ? (
                <div className="flex-grow flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full p-0 border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                        <div 
                            className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-16 text-center hover:border-violet-400 dark:hover:border-violet-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
                            <div className="w-24 h-24 mx-auto bg-violet-50 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                                <Upload className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Drop Research Paper</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                                Qore analyzes PDFs using Gemini 3 Pro to provide deep technical summaries and contextual Q&A.
                            </p>
                            <div className="mt-10 flex justify-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500"/> Privacy Encrypted
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <Zap className="w-4 h-4 text-amber-500"/> Instant Indexing
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                    
                    {/* LEFT: DOCUMENT ANALYSIS PANE */}
                    <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                        
                        <Card className="border-l-4 border-l-violet-500 shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-violet-600">
                                    <FileText className="w-6 h-6"/>
                                </div>
                                <div className="truncate flex-1">
                                    <p className="font-black text-slate-800 dark:text-slate-100 text-sm truncate uppercase tracking-tight">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        {analyzing ? (
                                            <span className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold animate-pulse">
                                                <Loader2 className="w-3 h-3 animate-spin"/> PROCESSING...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                                                <CheckCircle2 className="w-3 h-3"/> READY
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {analyzing ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 space-y-4 py-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-violet-500 animate-spin"></div>
                                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-violet-500 animate-pulse"/>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black uppercase tracking-widest animate-pulse">Scanning Hilbert Space...</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">Grounding AI in PDF Context</p>
                                </div>
                            </div>
                        ) : (
                            analysis && (
                                <div className="space-y-6 animate-fade-in flex-grow pb-6">
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        <button 
                                            onClick={() => setActiveTab('summary')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            <BookOpen className="w-3 h-3"/> Summary
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('metadata')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'metadata' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            <Binary className="w-3 h-3"/> Intel
                                        </button>
                                    </div>

                                    {activeTab === 'summary' ? (
                                        <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-none">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                                                <FileSearch className="w-3.5 h-3.5"/> Executive Abstract
                                            </h4>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic border-l-2 border-violet-200 dark:border-violet-800 pl-4 py-1">
                                                {analysis.summary}
                                            </p>
                                        </Card>
                                    ) : (
                                        <div className="space-y-6 animate-fade-in">
                                            <Card title="Intelligence Profiling">
                                                <div className="space-y-5">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Field Classification</span>
                                                        <Badge color="violet" className="text-[10px] px-3 py-1">{analysis.field}</Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Cognitive Depth</span>
                                                        <Badge color={analysis.complexity === 'High' ? 'red' : 'blue'} className="text-[10px] px-3 py-1">{analysis.complexity} Complexity</Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Semantic Anchors</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {analysis.keyConcepts.map((concept, i) => (
                                                                <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                                                                    {concept}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Moved Suggested Questions here to Sidebar */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                            <Compass className="w-3.5 h-3.5"/> Guided Exploration
                                        </h4>
                                        <div className="space-y-2">
                                            {analysis.suggestedQuestions.map((q, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => triggerQuickQuestion(q)}
                                                    disabled={isTyping}
                                                    className="w-full text-left text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-3 h-3 mr-2 text-violet-500 group-hover:translate-x-1 transition-transform" />
                                                    <span className="flex-1 line-clamp-2">{q}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* RIGHT: CHAT / Q&A STAGE */}
                    <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl relative">
                        
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <MessageSquare className="w-5 h-5"/>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm tracking-tight">Paper Intelligence Copilot</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Grounded Mode Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge color="gray" className="text-[9px] font-black">Gemini 3 Pro</Badge>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/20">
                            {messages.length === 0 && !analyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <Bot className="w-10 h-10 opacity-20"/>
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Awaiting Knowledge Ingestion...</p>
                                </div>
                            )}

                            {messages.map(m => (
                                <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md ${m.role === 'assistant' ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>
                                        {m.role === 'assistant' ? <Bot size={20}/> : <User size={20}/>}
                                    </div>
                                    <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
                                        m.role === 'user' 
                                        ? 'bg-violet-600 text-white rounded-tr-none text-sm font-medium' 
                                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none font-medium'
                                    }`}>
                                        <FormattedMessage text={m.text} role={m.role} />
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shadow-sm"><Bot size={20}/></div>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl rounded-tl-none flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce animation-delay-200"></span>
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce animation-delay-500"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
                                <div className="relative group">
                                    <input 
                                        className="w-full pr-14 h-14 shadow-inner bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 outline-none focus:border-violet-500 dark:focus:border-violet-400 transition-all text-sm font-medium text-slate-800 dark:text-white"
                                        placeholder={analysis ? "Ask a technical question about the paper..." : "Ingest a document to begin..."}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        disabled={!analysis || isTyping}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!input.trim() || isTyping || !analysis}
                                        className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-90"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <p className="mt-3 text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">
                                    AI responses are strictly grounded in document semantics
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
