
import React, { useEffect, useState } from 'react';
import { PageView, User } from '../types';
import { Button, Card, SectionTitle, Badge } from '../components/UI';
import { authService } from '../services/auth';
import { 
  Activity, Cpu, ShieldCheck, Play, ArrowRight, GraduationCap, 
  BookOpen, Trophy, Sparkles, Rocket, FlaskConical, Target, 
  Zap, BrainCircuit, Star, Clock, Database, Flame, Medal, Search, Layers, Server
} from 'lucide-react';
import { COLORS } from '../constants';

interface OverviewProps {
  onNavigate: (page: PageView) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  if (user?.role === 'student') {
    return <StudentDashboard user={user} onNavigate={onNavigate} />;
  }

  return <ResearcherDashboard onNavigate={onNavigate} />;
};

// --- STUDENT DASHBOARD (Gamified & Educational) ---
const StudentDashboard: React.FC<{ user: User, onNavigate: (page: PageView) => void }> = ({ user, onNavigate }) => {
  
  // Define modules mapped to user progress keys
  const modules = [
     { id: 'basics', title: "Quantum Basics", icon: <AtomIcon />, color: "bg-emerald-500", target: PageView.LEARN, desc: "Concept Review" },
     { id: 'gates', title: "Gate Logic", icon: <BinaryIcon />, color: "bg-amber-500", target: PageView.PLAYGROUND, desc: "Try Gates in Lab" },
     { id: 'vqc', title: "VQC Models", icon: <BrainCircuit />, color: "bg-violet-500", target: PageView.TRAINING, desc: "See Circuit Topology" },
     { id: 'mitigation', title: "Noise Correction", icon: <ShieldCheck />, color: "bg-blue-500", target: PageView.MITIGATION, desc: "Run ZNE Analysis" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Student Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-200/50 dark:shadow-none">
         {/* Decorative Blobs */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
         
         <div className="relative px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
               <div className="flex items-center gap-2 text-violet-200 font-bold uppercase tracking-wider text-xs mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Welcome Back, {user.name.split(' ')[0]}</span>
               </div>
               <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                  Ready to unlock the <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white">Quantum Universe?</span>
               </h1>
               <p className="text-violet-100 text-lg mb-8 max-w-lg leading-relaxed font-medium">
                  Your journey from classical bit to quantum qubit starts here. Complete today's mission to earn XP.
               </p>
               <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => onNavigate(PageView.LEARN)}
                    className="!bg-white !text-violet-700 !border-none hover:!bg-violet-50 shadow-lg px-8 py-3 text-base font-bold transition-transform hover:scale-105"
                    icon={<Play className="w-5 h-5 fill-current" />}
                  >
                    Resume Course
                  </Button>
               </div>
            </div>
            
            {/* Gamification Stats Card - LIVE */}
            <div className="hidden md:block w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white relative hover:bg-white/15 transition-colors cursor-default shadow-lg">
               <div className="flex justify-between items-center mb-6">
                  <div>
                      <p className="text-xs text-violet-200 font-bold uppercase">Current Rank</p>
                      <p className="text-xl font-black flex items-center gap-2"><Medal className="w-5 h-5 text-yellow-400"/> Novice</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-violet-200 font-bold uppercase">Total XP</p>
                      <p className="text-xl font-black">1,250</p>
                  </div>
               </div>
               <div className="bg-white/20 rounded-xl p-4 flex items-center gap-3">
                   <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-md">
                       <Flame className="w-5 h-5 fill-current" />
                   </div>
                   <div>
                       <p className="text-sm font-bold">{user.streak || 1} Day Streak</p>
                       <p className="text-xs text-violet-100 font-medium">Keep it up!</p>
                   </div>
               </div>
            </div>
         </div>
      </div>

      {/* Interactive Learning Path - DYNAMIC BASED ON USER STATE */}
      <div>
         <SectionTitle 
            title="Your Learning Path" 
            subtitle="Click a module to jump directly to the relevant tool" 
            rightElement={<Badge color="violet">Level 1: Foundations</Badge>}
         />
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {modules.map((step, idx) => {
               // Get status from user profile or default to locked if undefined
               const status = user.progress?.[step.id as keyof typeof user.progress] || 'locked';
               
               return (
                   <button 
                       key={idx} 
                       onClick={() => status !== 'locked' ? onNavigate(step.target) : null}
                       disabled={status === 'locked'}
                       className={`relative p-6 rounded-2xl border text-left transition-all duration-300 group w-full overflow-hidden
                           ${status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:-translate-y-1 hover:shadow-lg' : 
                             status === 'in-progress' ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-700 shadow-md ring-1 ring-amber-100 dark:ring-amber-900/30 hover:ring-amber-300 hover:-translate-y-1' : 
                             'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70 cursor-not-allowed'} 
                       `}
                   >
                       <div className="flex justify-between items-start mb-4 relative z-10">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${status === 'locked' ? 'bg-slate-300 dark:bg-slate-700' : step.color} shadow-md ${status !== 'locked' ? 'group-hover:scale-110' : ''} transition-transform`}>
                              {step.icon}
                           </div>
                           {status === 'completed' && <div className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">DONE</div>}
                           {status === 'locked' && <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">LOCKED</div>}
                       </div>
                       <h3 className={`font-bold text-lg transition-colors relative z-10 ${status === 'locked' ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-400'}`}>{step.title}</h3>
                       <p className="text-xs font-bold uppercase tracking-wider mt-1 text-slate-500 dark:text-slate-400 mb-2 relative z-10">{status.replace('-', ' ')}</p>
                   </button>
               );
            })}
         </div>
      </div>
    </div>
  );
};

// --- RESEARCHER DASHBOARD (Professional SaaS) ---
const ResearcherDashboard: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  // Live Monitor State
  const [qpuLoad, setQpuLoad] = useState(42);
  const [queueSize, setQueueSize] = useState(3);
  
  useEffect(() => {
      // Simulate live monitoring
      const interval = setInterval(() => {
          setQpuLoad(prev => Math.min(100, Math.max(20, prev + Math.floor(Math.random() * 10) - 5)));
          setQueueSize(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* SaaS Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200 dark:shadow-none flex flex-col justify-center p-10">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-violet-500 opacity-20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4 border border-emerald-500/20 animate-pulse">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                        System Operational
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                        Quantum Hybrid Intelligence
                    </h1>
                    <p className="text-slate-400 mb-8 max-w-lg font-medium">
                        Deploy, train, and version control VQC models with automated circuit architecture search.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => onNavigate(PageView.PLAYGROUND)} className="px-6 shadow-violet-500/20">Launch Playground</Button>
                        <Button variant="outline" className="!bg-white/5 !text-white !border-white/20 hover:!bg-white/10" onClick={() => onNavigate(PageView.MODEL_HUB)}>Model Registry</Button>
                    </div>
                </div>
          </div>

          {/* Live Monitor Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500"></div>
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Server className="w-5 h-5 text-indigo-500"/> Live Status</h3>
                  <Badge color="green">Online</Badge>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                          <span>QPU Load (Simulated)</span>
                          <span className={qpuLoad > 80 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}>{qpuLoad}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${qpuLoad > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width: `${qpuLoad}%`}}></div>
                      </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Jobs</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">1</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Queue Depth</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{queueSize}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Quick Stats / Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500 shadow-sm">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Database size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">3</p><p className="text-xs font-bold text-slate-400 uppercase">Datasets</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-violet-500 shadow-sm">
              <div className="p-3 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"><Cpu size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">12</p><p className="text-xs font-bold text-slate-400 uppercase">Models Trained</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm">
              <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><Trophy size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">96.2%</p><p className="text-xs font-bold text-slate-400 uppercase">Top Accuracy</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm">
              <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"><Clock size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">24m</p><p className="text-xs font-bold text-slate-400 uppercase">Compute Time</p></div>
          </Card>
      </div>

      {/* Workflow Steps */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <SectionTitle title="Research Workflow" subtitle="End-to-end Quantum Machine Learning pipeline" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
              { title: '1. Discovery', desc: 'Fetch and analyze papers.', icon: <BookOpen className="w-5 h-5"/>, color: 'violet' },
              { title: '2. Optimization', desc: 'Architecture Search.', icon: <Layers className="w-5 h-5"/>, color: 'indigo' },
              { title: '3. Execution', desc: 'Train VQC on simulator.', icon: <Zap className="w-5 h-5"/>, color: 'blue' },
              { title: '4. Registry', desc: 'Version & Deploy.', icon: <Database className="w-5 h-5"/>, color: 'emerald' }
            ].map((step, idx) => (
                <div key={idx} className="relative group cursor-pointer" onClick={() => {
                    const targets = [PageView.RESEARCH, PageView.SWEEP, PageView.TRAINING, PageView.MODEL_HUB];
                    onNavigate(targets[idx]);
                }}>
                    <div className="flex items-center mb-4">
                        <span className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-${step.color}-50 dark:bg-${step.color}-900/20 text-${step.color}-600 dark:text-${step.color}-400 font-bold mr-4 shadow-sm border border-${step.color}-100 dark:border-${step.color}-900 group-hover:scale-110 transition-transform`}>
                            {step.icon}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{step.title}</h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const AtomIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>);
const BinaryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>);
