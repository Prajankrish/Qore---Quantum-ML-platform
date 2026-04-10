
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
  
  // User Data State
  const [stats, setStats] = useState({
    datasetsCount: 0,
    modelsCount: 0,
    topAccuracy: 0,
    computeTime: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  // Function to fetch and update stats
  const fetchUserStats = async () => {
      try {
          // Import API service
          const { pythonApi } = await import('../services/pythonApi');
          
          // Fetch all user data
          const [datasets, models, experiments] = await Promise.allSettled([
              pythonApi.datasets.list().catch(() => []),
              pythonApi.models.list().catch(() => []),
              pythonApi.experiments.list().catch(() => [])
          ]);
          
          // Calculate stats
          const datasetsList = datasets.status === 'fulfilled' ? datasets.value : [];
          const modelsList = models.status === 'fulfilled' ? models.value : [];
          const experimentsList = experiments.status === 'fulfilled' ? experiments.value : [];
          
          // Calculate AVERAGE accuracy from all trained models (not top)
          const avgAccuracy = experimentsList.length > 0 
              ? (experimentsList.reduce((sum: number, e: any) => sum + (e.accuracy || 0), 0) / experimentsList.length) * 100
              : 0;
          
          // Calculate total compute time (in seconds, display as minutes)
          const computeTimeSeconds = experimentsList.length > 0
              ? experimentsList.reduce((sum: number, e: any) => sum + (e.compute_time || 0), 0)
              : 0;
          const computeTimeMinutes = Math.round(computeTimeSeconds / 60);
          
          setStats({
              datasetsCount: datasetsList.length,
              modelsCount: modelsList.length,
              topAccuracy: avgAccuracy,
              computeTime: computeTimeMinutes
          });
      } catch (err) {
          console.warn('Could not fetch user stats:', err);
          // Stats remain unchanged on error
      } finally {
          setLoading(false);
      }
  };
  
  useEffect(() => {
      // Fetch stats on mount
      fetchUserStats();
      
      // Auto-refresh every 5 seconds to show live data
      const refreshInterval = setInterval(() => {
          fetchUserStats();
      }, 5000);
      
      return () => clearInterval(refreshInterval);
  }, []);
  
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
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : stats.datasetsCount}</p><p className="text-xs font-bold text-slate-400 uppercase">Datasets</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-violet-500 shadow-sm">
              <div className="p-3 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"><Cpu size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : stats.modelsCount}</p><p className="text-xs font-bold text-slate-400 uppercase">Models Trained</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm">
              <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><Trophy size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : stats.topAccuracy.toFixed(1)}%</p><p className="text-xs font-bold text-slate-400 uppercase">Avg Accuracy</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm">
              <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"><Clock size={20}/></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : stats.computeTime}m</p><p className="text-xs font-bold text-slate-400 uppercase">Compute Time</p></div>
          </Card>
      </div>

      {/* Workflow Steps - Professional Pipeline */}
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-850 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-lg transition-colors relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-200/10 to-indigo-200/10 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <SectionTitle title="Research Workflow" subtitle="End-to-end Quantum Machine Learning pipeline - Click any step to explore" />
          
          {/* Main Workflow Timeline */}
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
              {/* Connection Lines - Hidden on mobile */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 via-blue-500 to-emerald-500 opacity-30"></div>
              
              {/* Workflow Steps */}
              {[
                { 
                  title: 'Discovery', 
                  step: '1',
                  mainDesc: 'Fetch and analyze research papers from quantum literature.', 
                  icon: <BookOpen className="w-8 h-8"/>, 
                  color: 'violet',
                  details: 'Search, filter, and explore quantum ML papers',
                  action: 'Explore Papers'
                },
                { 
                  title: 'Optimization', 
                  step: '2',
                  mainDesc: 'Automated circuit architecture search and tuning.', 
                  icon: <Layers className="w-8 h-8"/>, 
                  color: 'indigo',
                  details: 'Find optimal circuit configurations automatically',
                  action: 'Start Sweep'
                },
                { 
                  title: 'Execution', 
                  step: '3',
                  mainDesc: 'Train VQC models with real-time monitoring.', 
                  icon: <Zap className="w-8 h-8"/>, 
                  color: 'blue',
                  details: 'Run experiments with live performance tracking',
                  action: 'Launch Training'
                },
                { 
                  title: 'Registry', 
                  step: '4',
                  mainDesc: 'Version control and deploy trained models.', 
                  icon: <Database className="w-8 h-8"/>, 
                  color: 'emerald',
                  details: 'Store, version, and deploy your best models',
                  action: 'View Models'
                }
              ].map((step, idx) => (
                <div 
                  key={idx} 
                  className="relative group"
                  onClick={() => {
                      const targets = [PageView.RESEARCH, PageView.SWEEP, PageView.TRAINING, PageView.MODEL_HUB];
                      onNavigate(targets[idx]);
                  }}
                >
                  {/* Step Card */}
                  <div className={`relative p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-${step.color}-100 dark:border-${step.color}-900/30 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-${step.color}-400 dark:hover:border-${step.color}-600 overflow-hidden h-full flex flex-col`}>
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${step.color}-50/0 to-${step.color}-100/0 dark:from-${step.color}-900/0 dark:to-${step.color}-800/0 group-hover:from-${step.color}-50/50 group-hover:to-${step.color}-100/50 dark:group-hover:from-${step.color}-900/30 dark:group-hover:to-${step.color}-800/30 transition-all duration-300`}></div>
                    
                    {/* Step Number Badge */}
                    <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-full bg-${step.color}-500 text-white font-bold text-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ring-4 ring-white dark:ring-slate-800`}>
                      {step.step}
                    </div>
                    
                    {/* Header Section - Icon + Title */}
                    <div className="relative z-10 mb-5 pb-5 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-${step.color}-50 dark:bg-${step.color}-900/30 text-${step.color}-600 dark:text-${step.color}-400 shadow-sm group-hover:scale-110 group-hover:bg-${step.color}-100 dark:group-hover:bg-${step.color}-800/50 transition-all`}>
                          {step.icon}
                        </div>
                        <h4 className={`font-bold text-lg text-${step.color}-900 dark:text-${step.color}-100 group-hover:text-${step.color}-600 dark:group-hover:text-${step.color}-300 transition-colors`}>
                          {step.title}
                        </h4>
                      </div>
                    </div>
                    
                    {/* Main Description Section */}
                    <div className="relative z-10 mb-5 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {step.mainDesc}
                      </p>
                    </div>
                    
                    {/* Details Section */}
                    <div className="relative z-10 mb-4 pb-4 border-t border-slate-100 dark:border-slate-700">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-${step.color}-50 dark:bg-${step.color}-900/20 text-${step.color}-700 dark:text-${step.color}-300 text-xs font-semibold mt-3`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-${step.color}-500`}></div>
                        {step.details}
                      </div>
                    </div>
                    
                    {/* Action Button Section */}
                    <div className="relative z-10 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className={`text-xs font-bold text-${step.color}-600 dark:text-${step.color}-400 flex items-center group-hover:gap-2 gap-1 transition-all uppercase tracking-wide`}>
                        {step.action}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom CTA Section */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Ready to start your research?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Begin with discovery to explore cutting-edge quantum papers and find inspiration for your next experiment.</p>
            </div>
            <Button 
              onClick={() => onNavigate(PageView.RESEARCH)}
              className="!bg-violet-600 hover:!bg-violet-700 !text-white whitespace-nowrap shadow-lg"
            >
              Start Discovery <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AtomIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>);
const BinaryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>);
