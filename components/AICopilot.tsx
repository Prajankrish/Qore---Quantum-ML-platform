
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, Maximize2, Minimize2, HelpCircle, Zap, BookOpen, FlaskConical, Database, Cpu, RefreshCw } from 'lucide-react';
import { PageView } from '../types';
import { GoogleGenAI } from "@google/genai";

// Get API key from Vite environment
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface AICopilotProps {
  currentPage: PageView;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// Quick action suggestions based on current page
const getQuickActions = (page: PageView): { icon: React.ReactNode, label: string, prompt: string }[] => {
  const actions: Record<string, { icon: React.ReactNode, label: string, prompt: string }[]> = {
    overview: [
      { icon: <Zap className="w-3 h-3"/>, label: "What is QML?", prompt: "What is Quantum Machine Learning and why is it important?" },
      { icon: <BookOpen className="w-3 h-3"/>, label: "Get started", prompt: "How do I get started with Qore platform?" },
    ],
    learn: [
      { icon: <BookOpen className="w-3 h-3"/>, label: "Explain superposition", prompt: "Explain quantum superposition in simple terms" },
      { icon: <FlaskConical className="w-3 h-3"/>, label: "Bell State", prompt: "How do I create a Bell state in the Simulation Lab?" },
    ],
    playground: [
      { icon: <Cpu className="w-3 h-3"/>, label: "VQC basics", prompt: "What is a Variational Quantum Classifier and how does it work?" },
      { icon: <Zap className="w-3 h-3"/>, label: "Gate types", prompt: "What are the different quantum gate types I can use?" },
    ],
    datasets: [
      { icon: <Database className="w-3 h-3"/>, label: "Encoding data", prompt: "How do I encode classical data for quantum circuits?" },
      { icon: <Zap className="w-3 h-3"/>, label: "Feature maps", prompt: "What's the difference between ZFeatureMap and ZZFeatureMap?" },
    ],
    research: [
      { icon: <BookOpen className="w-3 h-3"/>, label: "Find papers", prompt: "How do I search for quantum ML research papers?" },
      { icon: <Zap className="w-3 h-3"/>, label: "Citation graph", prompt: "How does the citation graph visualization work?" },
    ],
  };
  return actions[page] || actions.overview;
};

// Comprehensive fallback responses for offline mode
const getFallbackResponse = (query: string, currentPage: PageView): string => {
  const q = query.toLowerCase();
  
  // Quantum Computing Concepts
  if (q.includes('qubit')) {
    return "A **Qubit** (quantum bit) is the fundamental unit of quantum information. Unlike classical bits that are either 0 or 1, qubits can exist in a **superposition** of both states simultaneously. This is represented mathematically as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex amplitudes. When measured, the qubit collapses to either |0⟩ or |1⟩ with probabilities |α|² and |β|².";
  }
  if (q.includes('superposition')) {
    return "**Superposition** is a fundamental quantum property where a qubit exists in multiple states at once. Think of it like a coin spinning in the air - it's neither heads nor tails until it lands. The **Hadamard (H) gate** creates superposition by transforming |0⟩ into an equal mix of |0⟩ and |1⟩. This enables quantum parallelism - processing multiple possibilities simultaneously.";
  }
  if (q.includes('entangle')) {
    return "**Entanglement** is a quantum phenomenon where two or more qubits become correlated such that measuring one instantly affects the other, regardless of distance. The **CNOT gate** creates entanglement when applied after a Hadamard gate (forming a Bell state). Einstein called this 'spooky action at a distance.' Entanglement is crucial for quantum algorithms and quantum communication.";
  }
  if (q.includes('vqc') || q.includes('variational')) {
    return "A **Variational Quantum Classifier (VQC)** is a hybrid quantum-classical algorithm for machine learning. It works in 3 steps:\n\n1. **Encoding**: Classical data is encoded into quantum states using feature maps\n2. **Variational Circuit**: Parameterized gates (ansatz) process the data\n3. **Measurement & Optimization**: Results are measured, and a classical optimizer updates parameters to minimize loss\n\nVQCs are promising for near-term quantum computers because they're noise-resilient.";
  }
  if (q.includes('gate') || q.includes('hadamard') || q.includes('pauli')) {
    return "**Quantum Gates** are operations that transform qubit states:\n\n• **H (Hadamard)**: Creates superposition, transforms |0⟩ → (|0⟩+|1⟩)/√2\n• **X (Pauli-X)**: Bit flip, like classical NOT. Swaps |0⟩ and |1⟩\n• **Z (Pauli-Z)**: Phase flip, adds negative phase to |1⟩\n• **CNOT**: Two-qubit gate, flips target if control is |1⟩. Creates entanglement\n• **RY, RZ**: Rotation gates with tunable angles for variational circuits";
  }
  if (q.includes('bell state')) {
    return "A **Bell State** is a maximally entangled two-qubit state. To create one in the Simulation Lab:\n\n1. Apply **H gate** to qubit 0 (creates superposition)\n2. Apply **CNOT gate** (entangles the qubits)\n\nResult: |ψ⟩ = (|00⟩ + |11⟩)/√2\n\nThis means both qubits will always measure the same value (both 0 or both 1), with 50% probability each. Try the 'Bell State' preset in the lab!";
  }
  if (q.includes('noise') || q.includes('error') || q.includes('zne') || q.includes('mitigation')) {
    return "**Quantum Noise** is a major challenge in current quantum computers. Common error types:\n\n• **Decoherence**: Qubits lose quantum properties over time\n• **Gate errors**: Imperfect gate operations\n• **Measurement errors**: Incorrect readout\n\n**Error Mitigation** techniques include:\n• **ZNE (Zero Noise Extrapolation)**: Run circuits at different noise levels and extrapolate to zero\n• **Probabilistic Error Cancellation**: Cancel errors using inverse operations";
  }
  if (q.includes('feature map') || q.includes('zfeature') || q.includes('encoding')) {
    return "**Feature Maps** encode classical data into quantum states:\n\n• **ZFeatureMap**: Simple angle encoding using RZ rotations. Good for low-dimensional data.\n• **ZZFeatureMap**: Includes entangling layers (ZZ interactions). Better for capturing data correlations.\n• **Amplitude Encoding**: Encodes data in state amplitudes (exponentially efficient but harder to prepare)\n\nChoose based on your data structure. Use AI Analysis in the Datasets tab for recommendations!";
  }
  
  // Platform Navigation
  if (q.includes('start') || q.includes('begin') || q.includes('how do i')) {
    return "Welcome to **Qore**! Here's how to get started:\n\n1. **Overview**: Check your dashboard for progress and quick actions\n2. **Learn**: Go to Path Planner, add interests, and get a personalized curriculum\n3. **Simulation Lab**: Practice building quantum circuits hands-on\n4. **Study Aid**: Upload PDFs for AI-powered analysis\n\nTip: Maintain daily streaks to boost your XP multiplier!";
  }
  if (q.includes('playground') || q.includes('circuit build')) {
    return "The **Playground** lets you design and test quantum circuits:\n\n1. Drag gates onto qubit wires to build circuits\n2. See real-time Bloch sphere visualization\n3. Compare quantum VQC vs classical algorithms\n4. Get AI insights on performance\n\nStart simple: try adding an H gate to create superposition, then watch the probability distribution change!";
  }
  if (q.includes('dataset') || q.includes('upload') || q.includes('csv')) {
    return "To work with **Datasets** in Qore:\n\n1. Go to the **Datasets** tab\n2. Click **Upload CSV** to add your data\n3. Preview data and view statistics\n4. Run **AI Analysis** for encoding recommendations\n\nThe AI will suggest optimal feature maps and qubit counts based on your data structure.";
  }
  if (q.includes('research') || q.includes('paper') || q.includes('arxiv')) {
    return "The **Research** section helps you explore QML literature:\n\n1. **Search**: Query arXiv and IEEE for quantum ML papers\n2. **AI Insights**: Each paper gets a one-sentence summary\n3. **Citation Graph**: Visualize connections between papers\n4. **Save to Library**: Build your reading list\n\nTry searching for 'variational quantum eigensolver' or 'quantum kernel methods'!";
  }
  
  // Page-specific context
  if (currentPage === 'learn') {
    return "You're in the **Learning Center**! Here you can:\n\n• **Path Planner**: Create a personalized curriculum based on your interests\n• **Concept Explorer**: Ask the Quantum Oracle about any concept\n• **Simulation Lab**: Build quantum circuits interactively\n\nTry asking me about specific concepts like 'superposition', 'entanglement', or 'VQC'!";
  }
  if (currentPage === 'playground') {
    return "You're in the **Playground**! This is your quantum circuit sandbox:\n\n• Build VQC circuits with drag-and-drop\n• Configure ansatz layers and feature maps\n• Compare quantum vs classical performance\n• Visualize qubit states on the Bloch sphere\n\nNeed help with a specific gate or concept? Just ask!";
  }
  
  // Default response
  return "I'm here to help with **Quantum Machine Learning**! You can ask me about:\n\n• **Concepts**: Qubits, superposition, entanglement, gates\n• **Algorithms**: VQC, QAOA, quantum kernels\n• **Platform**: Navigation, features, how-to guides\n• **Coding**: Qiskit, circuit design, optimization\n\nWhat would you like to explore?";
};

export const AICopilot: React.FC<AICopilotProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: "Hello! I'm **Qore AI**, your quantum computing assistant. I can explain concepts, help with circuits, or guide you through the platform. What would you like to explore?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, isTyping]);

  const generateResponse = async (userQuery: string) => {
      setIsTyping(true);
      
      try {
          if (GEMINI_API_KEY) {
              const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
              const systemPrompt = `You are Qore AI, an expert assistant for a Quantum Machine Learning educational platform called Qore.

CONTEXT:
- User is currently on the "${currentPage}" page
- Platform features: Learning Center (Path Planner, Concept Explorer, Simulation Lab), Playground (circuit builder), Datasets, Research (paper search), Model Hub
- Target audience: Students and researchers learning quantum computing and QML

YOUR EXPERTISE:
- Quantum Computing fundamentals (qubits, superposition, entanglement, measurement)
- Quantum Gates (H, X, Y, Z, CNOT, RX, RY, RZ, Toffoli)
- Quantum Algorithms (VQC, QAOA, VQE, Grover's, Shor's)
- Quantum Machine Learning (quantum kernels, feature maps, variational circuits)
- Qiskit programming and circuit design
- Error mitigation techniques (ZNE, PEC, measurement error mitigation)
- Platform navigation and feature explanations

RESPONSE GUIDELINES:
1. Be concise but thorough (aim for 100-200 words unless code is requested)
2. Use **bold** for key terms and concepts
3. Include practical examples when helpful
4. For code questions, provide working Qiskit snippets
5. Reference platform features when relevant to the user's question
6. Be encouraging and educational in tone
7. If unsure, acknowledge limitations rather than guessing

CURRENT PAGE CONTEXT:
${currentPage === 'learn' ? 'User is in Learning Center - can use Path Planner, Concept Explorer (Quantum Oracle), and Simulation Lab' : ''}
${currentPage === 'playground' ? 'User is in Playground - can build quantum circuits, compare with classical ML' : ''}
${currentPage === 'datasets' ? 'User is in Datasets - can upload CSV data, run AI analysis for encoding recommendations' : ''}
${currentPage === 'research' ? 'User is in Research - can search arXiv/IEEE papers, view citation graphs' : ''}
${currentPage === 'overview' ? 'User is on Dashboard - sees XP progress, streaks, quick actions' : ''}`;

              const response = await ai.models.generateContent({
                  model: 'gemini-2.0-flash',
                  contents: userQuery,
                  config: {
                      systemInstruction: systemPrompt,
                      maxOutputTokens: 1024,
                      temperature: 0.7,
                  }
              });

              const text = response.text || getFallbackResponse(userQuery, currentPage);
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text }]);
          } else {
              // Enhanced Fallback Logic
              await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
              const response = getFallbackResponse(userQuery, currentPage);
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: response }]);
          }
      } catch (error) {
          console.error("AI Error:", error);
          // Use fallback on error
          const fallback = getFallbackResponse(userQuery, currentPage);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: fallback }]);
      } finally {
          setIsTyping(false);
      }
  };

  const handleSend = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;
      
      const msg: Message = { id: Date.now().toString(), role: 'user', text: input };
      setMessages(prev => [...prev, msg]);
      setInput('');
      generateResponse(input);
  };

  const handleQuickAction = (prompt: string) => {
      const msg: Message = { id: Date.now().toString(), role: 'user', text: prompt };
      setMessages(prev => [...prev, msg]);
      generateResponse(prompt);
  };

  const clearChat = () => {
      setMessages([
          { id: '1', role: 'assistant', text: "Chat cleared! I'm **Qore AI**, ready to help with quantum computing concepts, platform navigation, or coding questions. What's on your mind?" }
      ]);
  };

  const quickActions = getQuickActions(currentPage);

  return (
    <div className={`fixed bottom-6 right-6 z-[90] flex flex-col items-end pointer-events-none ${isOpen ? 'z-[110]' : ''}`}>
      
      {/* Chat Window */}
      {isOpen && (
         <div className="pointer-events-auto mb-4 w-[360px] sm:w-[420px] h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
             {/* Header */}
             <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                         <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                     </div>
                     <div>
                         <h3 className="font-bold">Qore Copilot</h3>
                         <p className="text-[10px] opacity-80 flex items-center gap-1.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${GEMINI_API_KEY ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span> 
                             {GEMINI_API_KEY ? 'Gemini 2.0 Flash' : 'Offline Mode (Limited)'}
                         </p>
                     </div>
                 </div>
                 <div className="flex gap-1">
                     <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Clear chat">
                         <RefreshCw className="w-4 h-4"/>
                     </button>
                     <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                         <Minimize2 className="w-4 h-4"/>
                     </button>
                 </div>
             </div>

             {/* Quick Actions */}
             {messages.length <= 1 && (
                 <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Questions</p>
                     <div className="flex flex-wrap gap-2">
                         {quickActions.map((action, i) => (
                             <button
                                 key={i}
                                 onClick={() => handleQuickAction(action.prompt)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                             >
                                 {action.icon}
                                 {action.label}
                             </button>
                         ))}
                     </div>
                 </div>
             )}

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50" ref={scrollRef}>
                 {messages.map(m => (
                     <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'assistant' ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                             {m.role === 'assistant' ? <Bot size={16}/> : <User size={16}/>}
                         </div>
                         <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                             m.role === 'user' 
                             ? 'bg-violet-600 text-white rounded-tr-none' 
                             : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'
                         }`}>
                             {/* Enhanced markdown parsing */}
                             {m.text.split('\n').map((line, lineIdx) => (
                                 <p key={lineIdx} className={lineIdx > 0 ? 'mt-2' : ''}>
                                     {line.split('**').map((part, i) => 
                                        i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                                     )}
                                 </p>
                             ))}
                         </div>
                     </div>
                 ))}
                 {isTyping && (
                     <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center"><Bot size={16}/></div>
                         <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                             <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                             <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                         </div>
                     </div>
                 )}
             </div>

             {/* Input */}
             <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                 <input 
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                    placeholder="Ask about quantum computing..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                 />
                 <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-violet-200 dark:shadow-none"
                 >
                     <Send size={18} />
                 </button>
             </form>
         </div>
      )}

      {/* FAB Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-700 ${isOpen ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-400/50'}`}
      >
          {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>
    </div>
  );
};
