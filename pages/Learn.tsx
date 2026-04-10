
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Button, Badge, Input, Select, Modal } from '../components/UI';
import { BlochSphere } from '../components/BlochSphere';
import { api } from '../services/api';
import { 
  BookOpen, GraduationCap, Microscope, Atom, BrainCircuit, Binary, 
  ChevronDown, ChevronRight, Lightbulb, ExternalLink, 
  FileText, Play, Activity, ShieldCheck, Database, Layers, Sigma,
  Youtube, Cpu, RotateCw, RefreshCw, CheckCircle2, XCircle, MousePointerClick, ArrowRight,
  Zap, Eraser, FlaskConical, Trophy, Rocket, Sparkles, Loader2, Search, HelpCircle,
  Wand2, Target, Network, Check, Link as LinkIcon, Info, CheckCircle
} from 'lucide-react';
import { PageView, LearningModule, ConceptExplanation } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface LearnProps {
  onNavigate?: (page: PageView) => void;
}

// --- Simple Quantum Simulator logic ---
type Complex = { re: number, im: number };
const add = (a: Complex, b: Complex) => ({ re: a.re + b.re, im: a.im + b.im });
const sub = (a: Complex, b: Complex) => ({ re: a.re - b.re, im: a.im - b.im });
const mul = (a: Complex, s: number) => ({ re: a.re * s, im: a.im * s });
const norm = (a: Complex) => a.re*a.re + a.im*a.im;

interface CircuitGate {
    type: 'H' | 'X' | 'Z' | 'CNOT';
    target: number; 
}

const simulate2Qubits = (gates: CircuitGate[]) => {
    let state = [{re:1,im:0}, {re:0,im:0}, {re:0,im:0}, {re:0,im:0}]; 
    const s2 = 1/Math.sqrt(2);
    gates.forEach(g => {
        const next = [...state];
        if (g.type === 'H') {
            if (g.target === 0) { 
                const p00 = state[0], p10 = state[2];
                next[0] = mul(add(p00, p10), s2); next[2] = mul(sub(p00, p10), s2);
                const p01 = state[1], p11 = state[3];
                next[1] = mul(add(p01, p11), s2); next[3] = mul(sub(p01, p11), s2);
            } else { 
                const p00 = state[0], p01 = state[1];
                next[0] = mul(add(p00, p01), s2); next[1] = mul(sub(p00, p01), s2);
                const p10 = state[2], p11 = state[3];
                next[2] = mul(add(p10, p11), s2); next[3] = mul(sub(p10, p11), s2);
            }
        } else if (g.type === 'X') {
            if (g.target === 0) { [next[0], next[2]] = [state[2], state[0]]; [next[1], next[3]] = [state[3], state[1]]; }
            else { [next[0], next[1]] = [state[1], state[0]]; [next[2], next[3]] = [state[3], state[2]]; }
        } else if (g.type === 'Z') {
            if (g.target === 0) { next[2] = mul(state[2], -1); next[3] = mul(state[3], -1); }
            else { next[1] = mul(state[1], -1); next[3] = mul(state[3], -1); }
        } else if (g.type === 'CNOT') { [next[2], next[3]] = [state[3], state[2]]; }
        state = next;
    });
    return state.map((c, i) => ({ label: `|${(i >> 1)}${i % 2}⟩`, prob: parseFloat(norm(c).toFixed(3)) }));
};

// Bright chart colors for quantum state visualization
const CHART_COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

export const Learn: React.FC<LearnProps> = () => {
  const [activeTab, setActiveTab] = useState<'path' | 'concepts' | 'labs'>('path');
  const [interests, setInterests] = useState<string[]>([]);
  const [generatedPath, setGeneratedPath] = useState<LearningModule[]>([]);
  const [pathLoading, setPathLoading] = useState(false);
  const [interestInput, setInterestInput] = useState('');
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  // Concept & Lab state
  const [conceptQuery, setConceptQuery] = useState('');
  const [conceptResult, setConceptResult] = useState<ConceptExplanation | null>(null);
  const [conceptLoading, setConceptLoading] = useState(false);
  const [conceptLevel, setConceptLevel] = useState('Beginner');
  const [circuit, setCircuit] = useState<CircuitGate[]>([]);
  // Initialize with the default |00⟩ state (empty circuit results)
  const [simResults, setSimResults] = useState<{label:string, prob:number}[]>(() => simulate2Qubits([]));

  // Load persisted learning progress on mount
  useEffect(() => {
      const saved = api.learningProgress.getCompletedModules();
      if (saved.length > 0) {
          setCompletedModules(saved);
      }
  }, []);

  useEffect(() => {
     setSimResults(simulate2Qubits(circuit));
  }, [circuit]);

  useEffect(() => {
      generateCustomPath();
  }, []);

  const generateCustomPath = async () => {
      setPathLoading(true);
      try {
          const modules = await api.learningService.generatePath(interests);
          setGeneratedPath(modules);
      } catch (e) { console.error(e); }
      finally { setPathLoading(false); }
  };

  /**
   * ROBUST YOUTUBE PARSING
   */
  const extractVideoId = (url: string) => {
      if (!url) return null;
      // Aggressive matching for any YouTube URL style
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
      const videoId = extractVideoId(url);
      if (!videoId) return '';
      // Using youtube-nocookie.com to bypass restrictive corporate/edu filters
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=0`;
  };

  const getYouTubeLink = (url: string) => {
      const videoId = extractVideoId(url);
      // Construct a clean watch link that ignores embed restrictions
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com';
  };

  const markModuleComplete = () => {
      if (activeModule && !completedModules.includes(activeModule.id)) {
          const newCompleted = [...completedModules, activeModule.id];
          setCompletedModules(newCompleted);
          // Persist learning progress
          api.learningProgress.saveCompletedModules(newCompleted);
          api.learningProgress.updateStats({ 
              completedCount: newCompleted.length, 
              lastActivity: new Date().toISOString() 
          });
          if ((window as any).notify) (window as any).notify('success', `Completed: ${activeModule.title}`);
      }
      setActiveModule(null);
  };

  const explainConcept = async () => {
      if (!conceptQuery) return;
      setConceptLoading(true);
      try {
          const res = await api.learningService.explainConcept(conceptQuery, conceptLevel);
          setConceptResult(res);
      } catch (e) { console.error(e); }
      finally { setConceptLoading(false); }
  };

  const progressPercentage = Math.round((completedModules.length / Math.max(generatedPath.length, 1)) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <SectionTitle title="Learning Center" subtitle="Master Quantum ML with AI-guided lessons and sandbox labs" />

      {/* Introduction to Quantum Computing */}
      <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Welcome Banner */}
              <div className="lg:col-span-3">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 shadow-2xl">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                              <Rocket className="w-8 h-8 text-yellow-300"/>
                              <h2 className="text-3xl font-black text-white">Welcome to Quantum ML</h2>
                          </div>
                          <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                              You're about to explore one of the most transformative technologies of our time. Quantum computing harnesses the bizarre rules of quantum mechanics to solve problems that classical computers cannot. Learn the fundamentals, experiment with circuits, and build your intuition for quantum machine learning.
                          </p>
                          <div className="mt-6 flex items-center gap-2 text-white/80 text-sm">
                              <CheckCircle className="w-5 h-5 text-green-300"/>
                              <span>No prior quantum knowledge required - we'll start from the basics</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Core Concepts You'll Learn */}
              <Card className="border-l-4 border-l-violet-500">
                  <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-violet-600"/>
                      <h3 className="font-bold text-slate-900 dark:text-white">Three Pillars</h3>
                  </div>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-violet-600 mt-1 flex-shrink-0"/>
                          <div className="text-sm">
                              <p className="font-bold text-slate-900 dark:text-white">Superposition</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Qubits exist in multiple states simultaneously</p>
                          </div>
                      </li>
                      <li className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-violet-600 mt-1 flex-shrink-0"/>
                          <div className="text-sm">
                              <p className="font-bold text-slate-900 dark:text-white">Entanglement</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Qubits become correlated and interdependent</p>
                          </div>
                      </li>
                      <li className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-violet-600 mt-1 flex-shrink-0"/>
                          <div className="text-sm">
                              <p className="font-bold text-slate-900 dark:text-white">Interference</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Amplify correct answers, cancel wrong ones</p>
                          </div>
                      </li>
                  </ul>
              </Card>

              {/* Learning Approach */}
              <Card className="border-l-4 border-l-indigo-500">
                  <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="w-6 h-6 text-indigo-600"/>
                      <h3 className="font-bold text-slate-900 dark:text-white">How We Teach</h3>
                  </div>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0"/>
                          <div className="text-sm">
                              <p className="font-bold text-slate-900 dark:text-white">Concept Explorer</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">AI-guided explanations of quantum ideas</p>
                          </div>
                      </li>
                      <li className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0"/>
                          <div className="text-sm">
                              <p className="font-bold text-slate-900 dark:text-white">Simulation Lab</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Build circuits and see quantum effects</p>
                          </div>
                      </li>
                      <li className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0"/>
                          <div className="text-sm">
                              <p className="font-bold text-slate-900 dark:text-white">Application Guide</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">See how to use quantum ML in real problems</p>
                          </div>
                      </li>
                  </ul>
              </Card>

              {/* Getting Started */}
              <Card className="border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3 mb-4">
                      <Atom className="w-6 h-6 text-blue-600"/>
                      <h3 className="font-bold text-slate-900 dark:text-white">Get Started</h3>
                  </div>
                  <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">1</span>
                          <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Explore Concepts</span> on the Concept Explorer tab</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">2</span>
                          <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Try Simulation Lab</span> to build quantum circuits</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">3</span>
                          <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Use Path Planner</span> for structured learning</span>
                      </li>
                  </ol>
              </Card>
          </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 bg-white dark:bg-slate-900 rounded-t-xl px-4 pt-2 overflow-x-auto">
          <button onClick={() => setActiveTab('path')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'path' ? 'border-violet-600 text-violet-700 dark:text-violet-400 bg-slate-50 dark:bg-slate-800 rounded-t-lg' : 'border-transparent text-slate-500'}`}><GraduationCap className="w-4 h-4"/> Path Planner</button>
          <button onClick={() => setActiveTab('concepts')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'concepts' ? 'border-violet-600 text-violet-700 dark:text-violet-400 bg-slate-50 dark:bg-slate-800 rounded-t-lg' : 'border-transparent text-slate-500'}`}><Lightbulb className="w-4 h-4"/> Concept Explorer</button>
          <button onClick={() => setActiveTab('labs')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'labs' ? 'border-violet-600 text-violet-700 dark:text-violet-400 bg-slate-50 dark:bg-slate-800 rounded-t-lg' : 'border-transparent text-slate-500'}`}><FlaskConical className="w-4 h-4"/> Simulation Lab</button>
      </div>

      {activeTab === 'path' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                  <Card title="Tailor Your Path" subtitle="Personalized research sequence">
                      <div className="space-y-4">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Interest Tags</p>
                          <div className="flex gap-2">
                              <Input 
                                value={interestInput} 
                                onChange={e => setInterestInput(e.target.value)} 
                                placeholder="e.g. Finance, Biology" 
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && interestInput) {
                                    setInterests([...interests, interestInput]);
                                    setInterestInput('');
                                  }
                                }}
                              />
                              <Button onClick={() => { if(interestInput) setInterests([...interests, interestInput]); setInterestInput(''); }} variant="soft">+</Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {interests.map(int => <Badge key={int} color="violet">{int}</Badge>)}
                          </div>
                          <Button onClick={generateCustomPath} isLoading={pathLoading} className="w-full shadow-lg shadow-violet-200 dark:shadow-none" icon={<Wand2 className="w-4 h-4"/>}>Regenerate Path</Button>
                      </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-none shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                          <Trophy className="w-8 h-8 text-yellow-300"/>
                          <div><h4 className="font-bold text-lg">XP Tracker</h4><p className="text-xs text-indigo-200">Tier: Quantum Novice</p></div>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2 mb-2 overflow-hidden">
                          <div className="bg-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                      <p className="text-xs font-medium text-right">{progressPercentage}% Course Complete</p>
                  </Card>
              </div>

              <div className="lg:col-span-8 space-y-4">
                  {generatedPath.map((module) => (
                      <div 
                        key={module.id} 
                        className={`group p-6 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            completedModules.includes(module.id) ? 'border-emerald-200 dark:border-emerald-800 opacity-90' : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:shadow-md'
                        }`}
                        onClick={() => setActiveModule(module)}
                      >
                          <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${
                                      completedModules.includes(module.id) ? 'bg-emerald-500' :
                                      module.iconType === 'atom' ? 'bg-blue-500' : 
                                      module.iconType === 'binary' ? 'bg-pink-500' : 
                                      module.iconType === 'shield' ? 'bg-indigo-500' : 'bg-amber-500'
                                  }`}>
                                      {completedModules.includes(module.id) ? <Check className="w-6 h-6"/> : <Atom size={24}/>}
                                  </div>
                                  <div>
                                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex items-center gap-2">
                                          {module.title}
                                          {completedModules.includes(module.id) && <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase font-bold">Solved</span>}
                                      </h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{module.difficulty} • {module.estimatedTime}</p>
                                  </div>
                              </div>
                              <Button variant={completedModules.includes(module.id) ? 'soft' : 'primary'} className="h-9">
                                  {completedModules.includes(module.id) ? 'Review' : 'Start'}
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'concepts' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Quantum Oracle</h2>
              <div className="flex flex-col md:flex-row gap-4">
                  <Input className="h-14 text-lg shadow-lg" placeholder="Ask about 'Entanglement'..." value={conceptQuery} onChange={e => setConceptQuery(e.target.value)} />
                  <Button onClick={explainConcept} isLoading={conceptLoading} className="h-14 px-8">Ask AI</Button>
              </div>
              {conceptResult && (
                  <Card className="mt-8 text-left p-8">
                      <h3 className="text-2xl font-bold mb-4">{conceptResult.concept}</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{conceptResult.explanation}</p>
                  </Card>
              )}
          </div>
      )}

      {activeTab === 'labs' && (
          <div className="space-y-8 animate-fade-in">
              {/* Educational Introduction */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quantum Gate Palette Explanation */}
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex gap-3 mb-3">
                          <div className="p-2 bg-blue-500 text-white rounded-lg">
                              <Atom className="w-5 h-5" />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 dark:text-white">Quantum Gate Palette</h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Your building blocks</p>
                          </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        Quantum gates are the fundamental operations that manipulate quantum bits (qubits). Just like classical logic gates (AND, OR, NOT) control normal bits, quantum gates control qubits and can create superposition and entanglement.
                      </p>
                  </Card>

                  {/* Quantum Circuit Builder Explanation */}
                  <Card className="border-l-4 border-l-violet-500 bg-violet-50 dark:bg-violet-950/20">
                      <div className="flex gap-3 mb-3">
                          <div className="p-2 bg-violet-500 text-white rounded-lg">
                              <Layers className="w-5 h-5" />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 dark:text-white">Quantum Circuit Builder</h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Create & visualize</p>
                          </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        A quantum circuit is a sequence of quantum gates applied to qubits. Click gates below to add them to your circuit. The visualization updates in real-time showing how your circuit transforms the quantum state.
                      </p>
                  </Card>

                  {/* Quantum State Measurement Explanation */}
                  <Card className="border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
                      <div className="flex gap-3 mb-3">
                          <div className="p-2 bg-emerald-500 text-white rounded-lg">
                              <Sigma className="w-5 h-5" />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 dark:text-white">Quantum State Measurement</h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Collapse & observe</p>
                          </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        When you measure a quantum circuit, it "collapses" from superposition to a definite state. The probability distribution shows how likely each outcome is. This probability comes from the quantum states created by your gates.
                      </p>
                  </Card>
              </div>

              {/* Interactive Lab */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Gate Palette & Controls */}
                  <div className="lg:col-span-4 space-y-6">
                      <Card title="Quantum Gate Palette" subtitle="Click gates to add them to your circuit">
                          <div className="space-y-6">
                              {/* Single Qubit Gates Section */}
                              <div>
                                  <div className="flex items-center gap-2 mb-3">
                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Single Qubit Gates</p>
                                      <div className="group relative">
                                          <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help"/>
                                          <div className="absolute z-50 hidden group-hover:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs p-2 rounded whitespace-nowrap bottom-full mb-2 left-0">
                                              These gates affect a single qubit
                                          </div>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                      {/* Hadamard Gate */}
                                      <div className="group">
                                          <button 
                                              onClick={() => setCircuit([...circuit, {type: 'H', target: 0}])}
                                              className="w-full p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                          >
                                              H
                                              <p className="text-[10px] opacity-80 mt-1">Hadamard</p>
                                          </button>
                                          <p className="text-[11px] text-slate-500 mt-1 text-center hidden group-hover:block">Creates superposition</p>
                                      </div>

                                      {/* Pauli-X Gate */}
                                      <div className="group">
                                          <button 
                                              onClick={() => setCircuit([...circuit, {type: 'X', target: 0}])}
                                              className="w-full p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                          >
                                              X
                                              <p className="text-[10px] opacity-80 mt-1">Pauli-X</p>
                                          </button>
                                          <p className="text-[11px] text-slate-500 mt-1 text-center hidden group-hover:block">Flips bit state</p>
                                      </div>

                                      {/* Pauli-Z Gate */}
                                      <div className="group">
                                          <button 
                                              onClick={() => setCircuit([...circuit, {type: 'Z', target: 0}])}
                                              className="w-full p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                          >
                                              Z
                                              <p className="text-[10px] opacity-80 mt-1">Pauli-Z</p>
                                          </button>
                                          <p className="text-[11px] text-slate-500 mt-1 text-center hidden group-hover:block">Adds phase</p>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Multi-Qubit Gates Section */}
                              <div>
                                  <div className="flex items-center gap-2 mb-3">
                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Multi-Qubit Gates</p>
                                      <div className="group relative">
                                          <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help"/>
                                          <div className="absolute z-50 hidden group-hover:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs p-2 rounded whitespace-nowrap bottom-full mb-2 left-0">
                                              These gates create entanglement
                                          </div>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => setCircuit([...circuit, {type: 'CNOT', target: 1}])}
                                      className="w-full p-4 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                  >
                                      CNOT
                                      <p className="text-[10px] opacity-80 mt-1">Controlled-NOT (Entanglement)</p>
                                  </button>
                              </div>
                          </div>

                          {/* Clear & Undo Buttons */}
                          <div className="flex gap-2 pt-6 border-t border-slate-100 dark:border-slate-700">
                              <Button 
                                  onClick={() => setCircuit([])} 
                                  variant="outline" 
                                  className="flex-1"
                                  icon={<Eraser className="w-4 h-4"/>}
                              >
                                  Clear
                              </Button>
                              <Button 
                                  onClick={() => setCircuit(circuit.slice(0, -1))} 
                                  variant="soft" 
                                  className="flex-1"
                                  icon={<RotateCw className="w-4 h-4"/>}
                              >
                                  Undo
                              </Button>
                          </div>
                      </Card>

                      {/* Gate Education Guide */}
                      <Card className="border-t-4 border-t-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-500 text-white rounded-lg">
                                  <BookOpen className="w-6 h-6"/>
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Quantum Gate Guide</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Learn what each gate does</p>
                              </div>
                          </div>

                          <div className="space-y-4">
                              {/* Hadamard Gate */}
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border-l-4 border-l-blue-500">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-500 text-white font-bold rounded-md text-sm">H</span>
                                      <span className="font-bold text-slate-900 dark:text-white">Hadamard Gate</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                      Creates <span className="font-semibold italic">superposition</span> by transforming |0⟩ to (|0⟩ + |1⟩)/√2. A qubit is now in both states simultaneously until measured. This is the foundation of quantum computing's power.
                                  </p>
                              </div>

                              {/* Pauli-X Gate */}
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border-l-4 border-l-pink-500">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex items-center justify-center w-7 h-7 bg-pink-500 text-white font-bold rounded-md text-sm">X</span>
                                      <span className="font-bold text-slate-900 dark:text-white">Pauli-X Gate</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                      The quantum <span className="font-semibold italic">NOT gate</span>. Flips |0⟩ ↔ |1⟩. It's like a classical bit flip - if your qubit was "0", it becomes "1" and vice versa. Useful for initializing qubits to desired states.
                                  </p>
                              </div>

                              {/* Pauli-Z Gate */}
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border-l-4 border-l-amber-500">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-500 text-white font-bold rounded-md text-sm">Z</span>
                                      <span className="font-bold text-slate-900 dark:text-white">Pauli-Z Gate</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                      Applies a <span className="font-semibold italic">phase flip</span> without changing the basis. Changes the sign of the |1⟩ state: |1⟩ → -|1⟩. This subtle operation is essential for quantum interference effects.
                                  </p>
                              </div>

                              {/* CNOT Gate */}
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border-l-4 border-l-violet-500">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex items-center justify-center w-7 h-7 bg-violet-500 text-white font-bold rounded-md text-sm">⊗</span>
                                      <span className="font-bold text-slate-900 dark:text-white">CNOT Gate (Controlled-NOT)</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                      Creates <span className="font-semibold italic">entanglement</span> between qubits. If control qubit is |1⟩, it flips the target qubit. This creates quantum correlations - measuring one instantly affects the other, no matter the distance!
                                  </p>
                              </div>
                          </div>

                          <div className="p-3 mt-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                              <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
                                  💡 <span className="font-bold">Pro Tip:</span> Start with H gates to create superposition, then use CNOT to entangle. These building blocks create powerful quantum algorithms!
                              </p>
                          </div>
                      </Card>
                      
                      {/* Quick Presets */}
                      <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-none shadow-xl">
                          <div className="flex items-center gap-3 mb-4">
                              <Sparkles className="w-8 h-8 text-yellow-300"/>
                              <div>
                                  <h4 className="font-bold text-lg">Quick Presets</h4>
                                  <p className="text-xs text-emerald-200">Try famous quantum circuits</p>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <button 
                                  onClick={() => setCircuit([{type: 'H', target: 0}, {type: 'CNOT', target: 1}])}
                                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors"
                              >
                                  <span className="font-bold">Bell State</span>
                                  <p className="text-xs text-emerald-200">H → CNOT (Creates entanglement)</p>
                              </button>
                              <button 
                                  onClick={() => setCircuit([{type: 'H', target: 0}, {type: 'H', target: 1}])}
                                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors"
                              >
                                  <span className="font-bold">Superposition</span>
                                  <p className="text-xs text-emerald-200">H on both qubits (Equal probabilities)</p>
                              </button>
                              <button 
                                  onClick={() => setCircuit([{type: 'X', target: 0}, {type: 'X', target: 1}])}
                                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors"
                              >
                                  <span className="font-bold">Bit Flip</span>
                                  <p className="text-xs text-emerald-200">X on both (|00⟩ → |11⟩)</p>
                              </button>
                          </div>
                      </Card>
                  </div>

                  {/* Right Column: Circuit Visualization & Results */}
                  <div className="lg:col-span-8 space-y-6">
                      <Card title="Quantum Circuit Builder" subtitle="2-Qubit Simulation Environment">
                          <div className="space-y-6">
                              {/* Circuit Visualization */}
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                              <div className="space-y-4">
                                  {/* Qubit 0 Wire */}
                                  <div className="flex items-center gap-2">
                                      <div className="w-16 text-xs font-bold text-slate-500">|q₀⟩</div>
                                      <div className="flex-1 h-12 flex items-center gap-2 border-b-2 border-slate-300 dark:border-slate-600 relative">
                                          {circuit.map((gate, i) => (
                                              gate.target === 0 || gate.type === 'CNOT' ? (
                                                  <div 
                                                      key={i} 
                                                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                                                          gate.type === 'H' ? 'bg-blue-500' :
                                                          gate.type === 'X' ? 'bg-pink-500' :
                                                          gate.type === 'Z' ? 'bg-amber-500' :
                                                          gate.type === 'CNOT' ? 'bg-violet-500' : 'bg-slate-500'
                                                      }`}
                                                  >
                                                      {gate.type === 'CNOT' ? '●' : gate.type}
                                                  </div>
                                              ) : <div key={i} className="w-10 h-10" />
                                          ))}
                                          {circuit.length === 0 && (
                                              <span className="text-slate-400 text-sm italic">← Add gates from palette</span>
                                          )}
                                      </div>
                                  </div>
                                  
                                  {/* Qubit 1 Wire */}
                                  <div className="flex items-center gap-2">
                                      <div className="w-16 text-xs font-bold text-slate-500">|q₁⟩</div>
                                      <div className="flex-1 h-12 flex items-center gap-2 border-b-2 border-slate-300 dark:border-slate-600 relative">
                                          {circuit.map((gate, i) => {
                                              // Handle gates that target the second qubit
                                              if (gate.target === 1) {
                                                  return (
                                                      <div
                                                          key={i}
                                                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                                                              gate.type === 'H' ? 'bg-blue-500' :
                                                              gate.type === 'X' ? 'bg-pink-500' :
                                                              gate.type === 'Z' ? 'bg-amber-500' :
                                                              'bg-violet-500' // CNOT case
                                                          }`}
                                                      >
                                                          {gate.type === 'CNOT' ? '⊕' : gate.type}
                                                      </div>
                                                  );
                                              }
                                              
                                              // For gates that do not target the second qubit (like single-qubit gates on qubit 0),
                                              // we need to render a placeholder to keep the layout consistent, unless it's a CNOT 
                                              // which is visually represented on both wires.
                                              if (gate.type !== 'CNOT') {
                                                  return <div key={i} className="w-10 h-10" />;
                                              }
                                              
                                              // For CNOT gates where this is the control wire (target=0), we don't render a second placeholder.
                                              // The logic on the |q0> wire already rendered the '●'.
                                              return null;
                                          })}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Gate Sequence Display */}
                          <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-500 uppercase">Circuit Sequence:</span>
                              {circuit.length === 0 ? (
                                  <span className="text-sm text-slate-400 italic">Empty circuit</span>
                              ) : (
                                  circuit.map((gate, i) => (
                                      <Badge key={i} color={
                                          gate.type === 'H' ? 'blue' :
                                          gate.type === 'X' ? 'pink' :
                                          gate.type === 'Z' ? 'yellow' : 'violet'
                                      }>
                                          {gate.type}(q{gate.target})
                                      </Badge>
                                  ))
                              )}
                          </div>
                      </div>
                  </Card>
                  
                  {/* Measurement Results */}
                  <Card title="Quantum State Measurement" subtitle="Probability distribution of output states">
                      <div className="space-y-6">
                          {/* Educational Context */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                                  <p className="text-xs font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wide mb-1">What is Measurement?</p>
                                  <p className="text-xs text-violet-800 dark:text-violet-300 leading-relaxed">
                                      When you measure a quantum system, the superposition collapses to one definite outcome. The bars below show the probability of each outcome when measuring your circuit many times.
                                  </p>
                              </div>
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide mb-1">Why Probabilities?</p>
                                  <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                                      Quantum systems are probabilistic. Your circuit creates different states with different likelihoods. The states shown are all possible outcomes, with chances weighted by their probabilities.
                                  </p>
                              </div>
                          </div>

                          {/* Probability Visualization */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={simResults} layout="vertical">
                                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                          <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                          <YAxis type="category" dataKey="label" width={50} tick={{ fontFamily: 'monospace', fontWeight: 'bold' }} />
                                          <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} 
                                              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                          />
                                          <Bar dataKey="prob" radius={[0, 8, 8, 0]}>
                                              {simResults.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                              ))}
                                          </Bar>
                                      </BarChart>
                                  </ResponsiveContainer>
                              </div>
                              
                              <div className="space-y-4">
                                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-violet-500" />
                                      Computational Basis States
                                  </h4>
                                  <div className="space-y-3">
                                      {simResults.map((result, i) => (
                                          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                              <div className="flex items-center justify-between mb-2">
                                                  <div>
                                                      <span className="font-mono font-bold text-base text-slate-900 dark:text-white">{result.label}</span>
                                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Output state</p>
                                                  </div>
                                                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                                      {(result.prob * 100).toFixed(1)}%
                                                  </span>
                                              </div>
                                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                  <div 
                                                      className="h-2 rounded-full transition-all duration-500"
                                                      style={{ 
                                                          width: `${result.prob * 100}%`,
                                                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                                                      }}
                                                  />
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* Quantum Phenomena Detection */}
                          <div className="pl-4 border-l-4 border-l-slate-200 dark:border-l-slate-700 space-y-3">
                              {circuit.length === 0 && (
                                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                          👈 <span className="italic">Build a circuit using gates to see quantum effects in action!</span>
                                      </p>
                                  </div>
                              )}
                              
                              {circuit.length > 0 && simResults.some(r => r.prob > 0 && r.prob < 1) && (
                                  <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                                      <div className="flex items-start gap-3">
                                          <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                              <p className="font-bold text-violet-900 dark:text-violet-200 mb-1">⚡ Superposition Detected!</p>
                                              <p className="text-xs text-violet-800 dark:text-violet-300 leading-relaxed">
                                                  Your circuit exists in multiple states simultaneously. Each bar represents a possible outcome when measured. This quantum behavior has no classical equivalent - a normal bit must be 0 OR 1, but your qubit is both until observed!
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              )}
                              
                              {circuit.some(g => g.type === 'CNOT') && simResults.length > 0 && simResults[0].prob < 1 && (
                                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                                      <div className="flex items-start gap-3">
                                          <Network className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                              <p className="font-bold text-pink-900 dark:text-pink-200 mb-1">🔗 Entanglement Active!</p>
                                              <p className="text-xs text-pink-800 dark:text-pink-300 leading-relaxed">
                                                  The CNOT gate has created entanglement between your qubits. Look at the probability pattern - you'll see correlated outcomes (like |00⟩ and |11⟩ together). Measuring one qubit instantly determines the state of the other, even if they were separated across the universe. Einstein called this "spooky action at a distance"!
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              )}

                              {circuit.length > 0 && simResults.every(r => r.prob === 0 || r.prob === 1) && (
                                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                      <div className="flex items-start gap-3">
                                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                              <p className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">✓ Deterministic State</p>
                                              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                                  Your circuit produces a definite outcome every time you measure it. All probability is concentrated in one state - this is classical behavior! Try adding more gates (especially H gates) to explore quantum superposition.
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* Circuit Results Summary */}
                          {circuit.length > 0 && (
                              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-indigo-500"/>
                                      What This Means
                                  </h4>
                                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                                      <p>
                                          Your circuit has transformed the initial state |00⟩ through a sequence of quantum gates. Each gate modified the quantum state in specific ways - some increased probability of certain outcomes, others created correlations between qubits.
                                      </p>
                                      <p>
                                          In a real quantum computer, running this circuit 1,000 times would produce measurement outcomes matching these probabilities. Try modifying your circuit and watching how the probabilities change!
                                      </p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </Card>
              </div>
          </div>
      </div>
      )}

      {activeModule && (
          <Modal isOpen={!!activeModule} onClose={() => setActiveModule(null)} title={activeModule.title}>
              <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative aspect-video bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-50">
                                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                            </div>
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={getEmbedUrl(activeModule.videoUrl || '')} 
                                title={activeModule.title} 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="relative z-20 w-full h-full border-none"
                            ></iframe>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600">
                                <Info size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Educational Source</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Topic: {activeModule.title} | Verified by Qore Engine</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            className="text-xs h-9 font-bold bg-white dark:bg-slate-900 shadow-sm whitespace-nowrap"
                            onClick={() => window.open(getYouTubeLink(activeModule.videoUrl || ''), '_blank')}
                            icon={<Youtube size={14} className="text-red-500"/>}
                        >
                            Open on YouTube Directly
                        </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 space-y-6">
                        <div className="prose dark:prose-invert max-w-none">
                            <h4 className="font-black text-slate-800 dark:text-white text-xl flex items-center gap-2">
                                <FileText className="w-5 h-5 text-violet-500"/> Lesson Overview
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {activeModule.description}
                            </p>
                            
                            <div className="mt-8 flex flex-wrap gap-2">
                                {activeModule.topics?.map((t, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                        # {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                      </div>

                      <div className="lg:col-span-4 space-y-6">
                         <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <h5 className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4"/> Recommended Resources
                            </h5>
                            <div className="space-y-3">
                                {activeModule.relatedResources && activeModule.relatedResources.length > 0 ? (
                                    activeModule.relatedResources.map((res, i) => (
                                        <a 
                                            key={i} href={res.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:border-blue-400 transition-all group"
                                        >
                                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 leading-tight truncate w-full">{res.title}</p>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 italic">Explore platform labs for hands-on practice.</p>
                                )}
                            </div>
                         </div>

                         <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                            <p className="text-xs text-slate-400 font-medium mb-4 text-center">Ready to progress to the next module?</p>
                            <Button 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 border-none" 
                                onClick={markModuleComplete} 
                                icon={<CheckCircle2 className="w-4 h-4"/>}
                            >
                                Mark as Complete
                            </Button>
                         </div>
                      </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button variant="outline" onClick={() => setActiveModule(null)}>Dismiss Lesson</Button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};
