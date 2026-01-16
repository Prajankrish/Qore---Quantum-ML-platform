
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Badge, Button } from '../components/UI';
import { authService } from '../services/auth';
import { 
  Book, GraduationCap, Microscope, Cpu, Zap, Activity, 
  ShieldCheck, Database, Box, Archive, HelpCircle, 
  ChevronRight, Info, Search, BrainCircuit, Sparkles, Binary,
  Target, LayoutDashboard, Sliders, Settings2, Code, FileText,
  PlayCircle, Rocket, CheckCircle2, ArrowRight, Star, Award,
  Lightbulb, Users, Globe, Clock, TrendingUp, BookOpen, 
  Compass, FlaskConical, MessageSquare, Video, FileQuestion,
  Layers, CircleDot, ChevronDown
} from 'lucide-react';

export const UserGuide: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'student' | 'researcher'>('student');
  const [activeSection, setActiveSection] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Auto-detect role on load
  useEffect(() => {
      const user = authService.getCurrentUser();
      if (user?.role === 'researcher' || user?.role === 'admin') {
          setActiveRole('researcher');
      } else {
          setActiveRole('student');
      }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      setActiveSection(id);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const studentFaqs = [
    { id: 'faq1', q: 'Do I need prior quantum computing knowledge?', a: 'No! Qore is designed for beginners. Start with the Path Planner which creates a personalized curriculum based on your background and interests.' },
    { id: 'faq2', q: 'How do I track my learning progress?', a: 'Your Overview dashboard shows XP points, completed modules, learning streaks, and tier progression. Complete modules to earn XP and unlock new content.' },
    { id: 'faq3', q: 'Can I ask questions about quantum concepts?', a: 'Yes! Use the Quantum Oracle in the Learn section. Type any concept like "superposition" or "entanglement" and get AI-powered explanations tailored to your level.' },
    { id: 'faq4', q: 'What is the Simulation Lab?', a: 'It\'s an interactive quantum circuit builder where you can add gates (H, X, Z, CNOT), see real-time probability distributions, and understand quantum states visually.' },
    { id: 'faq5', q: 'How do I use Study Aid for my documents?', a: 'Upload any PDF in the Study Aid section. Our AI will summarize it, extract key concepts, and let you ask questions about the content.' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <SectionTitle 
        title="Qore Platform Guide" 
        subtitle="Your complete guide to mastering Quantum Machine Learning" 
      />

      {/* Role Selection Switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
           <button 
            onClick={() => setActiveRole('student')}
            className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeRole === 'student' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <GraduationCap className="w-4 h-4"/> Student Manual
           </button>
           <button 
            onClick={() => setActiveRole('researcher')}
            className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeRole === 'researcher' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Microscope className="w-4 h-4"/> Researcher Manual
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
           <Card className="sticky top-24 border-none bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 px-4">Documentation Map</h4>
              <nav className="space-y-1">
                 {activeRole === 'student' ? (
                   <>
                     <GuideNavItem icon={<Rocket/>} label="Welcome to Qore" active={activeSection === 'welcome'} onClick={() => scrollToSection('welcome')} />
                     <GuideNavItem icon={<Compass/>} label="Getting Started" active={activeSection === 'getting-started'} onClick={() => scrollToSection('getting-started')} />
                     <GuideNavItem icon={<LayoutDashboard/>} label="Your Dashboard" active={activeSection === 'student-dash'} onClick={() => scrollToSection('student-dash')} />
                     <GuideNavItem icon={<GraduationCap/>} label="Learning Center" active={activeSection === 'student-learn'} onClick={() => scrollToSection('student-learn')} />
                     <GuideNavItem icon={<FlaskConical/>} label="Simulation Lab" active={activeSection === 'student-labs'} onClick={() => scrollToSection('student-labs')} />
                     <GuideNavItem icon={<FileText/>} label="Study Aid" active={activeSection === 'doc-intel'} onClick={() => scrollToSection('doc-intel')} />
                     <GuideNavItem icon={<PlayCircle/>} label="Playground" active={activeSection === 'playground'} onClick={() => scrollToSection('playground')} />
                     <GuideNavItem icon={<HelpCircle/>} label="FAQs" active={activeSection === 'faqs'} onClick={() => scrollToSection('faqs')} />
                   </>
                 ) : (
                   <>
                     <GuideNavItem icon={<Book/>} label="Research Lab" active={activeSection === 'res-lab'} onClick={() => scrollToSection('res-lab')} />
                     <GuideNavItem icon={<FileText/>} label="Doc Intelligence" active={activeSection === 'doc-intel'} onClick={() => scrollToSection('doc-intel')} />
                     <GuideNavItem icon={<Database/>} label="Data Engineering" active={activeSection === 'res-data'} onClick={() => scrollToSection('res-data')} />
                     <GuideNavItem icon={<Cpu/>} label="Quantum Studio" active={activeSection === 'res-studio'} onClick={() => scrollToSection('res-studio')} />
                     <GuideNavItem icon={<Zap/>} label="Execution Pipeline" active={activeSection === 'res-exec'} onClick={() => scrollToSection('res-exec')} />
                     <GuideNavItem icon={<Box/>} label="Model Registry" active={activeSection === 'res-hub'} onClick={() => scrollToSection('res-hub')} />
                   </>
                 )}
              </nav>
           </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-12">

          {activeRole === 'student' ? (
             <div className="space-y-16 animate-fade-in">
                
                {/* WELCOME SECTION */}
                <section id="welcome" className="scroll-mt-28">
                   <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 md:p-12 text-white">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                      
                      <div className="relative z-10">
                         <Badge color="white" className="mb-4 bg-white/20 text-white border-white/30">Student Guide</Badge>
                         <h2 className="text-3xl md:text-4xl font-black mb-4">Welcome to Qore</h2>
                         <p className="text-lg text-violet-100 max-w-2xl leading-relaxed mb-8">
                            Qore is your gateway to the future of computing. Our AI-enhanced platform makes learning 
                            <strong> Quantum Machine Learning</strong> intuitive, interactive, and engaging—no PhD required.
                         </p>
                         
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <Video className="w-6 h-6 mx-auto mb-2 text-violet-200"/>
                               <p className="text-sm font-bold">Curated Videos</p>
                               <p className="text-xs text-violet-200">Expert-selected content</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <BrainCircuit className="w-6 h-6 mx-auto mb-2 text-violet-200"/>
                               <p className="text-sm font-bold">AI Tutor</p>
                               <p className="text-xs text-violet-200">24/7 concept help</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <FlaskConical className="w-6 h-6 mx-auto mb-2 text-violet-200"/>
                               <p className="text-sm font-bold">Hands-on Labs</p>
                               <p className="text-xs text-violet-200">Build real circuits</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <Award className="w-6 h-6 mx-auto mb-2 text-violet-200"/>
                               <p className="text-sm font-bold">XP & Badges</p>
                               <p className="text-xs text-violet-200">Track your growth</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* GETTING STARTED */}
                <section id="getting-started" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                         <Compass className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Getting Started</h3>
                         <p className="text-slate-500 font-medium">Your first steps on the quantum journey</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                         New to quantum computing? No worries! Follow these simple steps to begin your learning adventure.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <StepCard 
                            step={1}
                            title="Explore Your Dashboard"
                            description="Start at the Overview page to see your progress, XP, and recommended next steps."
                            icon={<LayoutDashboard className="w-5 h-5"/>}
                            color="violet"
                         />
                         <StepCard 
                            step={2}
                            title="Set Your Learning Path"
                            description="Go to Learn → Path Planner. Add your interests to get a personalized curriculum."
                            icon={<Target className="w-5 h-5"/>}
                            color="blue"
                         />
                         <StepCard 
                            step={3}
                            title="Watch & Learn"
                            description="Each module has curated video lessons. Complete them to earn XP and unlock more content."
                            icon={<Video className="w-5 h-5"/>}
                            color="emerald"
                         />
                         <StepCard 
                            step={4}
                            title="Practice in Labs"
                            description="Use the Simulation Lab or Playground to build quantum circuits and see results in real-time."
                            icon={<FlaskConical className="w-5 h-5"/>}
                            color="amber"
                         />
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl border border-violet-100 dark:border-violet-800">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                               <Lightbulb className="w-5 h-5 text-violet-600"/>
                            </div>
                            <div>
                               <h4 className="font-bold text-violet-900 dark:text-violet-200 mb-1">Pro Tip</h4>
                               <p className="text-sm text-violet-700 dark:text-violet-300">
                                  Maintain a daily learning streak to maximize your XP multiplier! Even 10 minutes a day helps build lasting understanding of quantum concepts.
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* DASHBOARD */}
                <section id="student-dash" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
                         <LayoutDashboard className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Your Dashboard</h3>
                         <p className="text-slate-500 font-medium">Your personal command center for learning</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         The <strong>Overview</strong> page is your personalized dashboard showing everything you need to track your quantum learning journey.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FeatureCard
                            icon={<TrendingUp className="w-5 h-5"/>}
                            title="XP & Progress"
                            description="Track experience points earned from completing modules and activities."
                            color="violet"
                         />
                         <FeatureCard
                            icon={<Zap className="w-5 h-5"/>}
                            title="Learning Streaks"
                            description="Maintain daily streaks to boost your XP multiplier and stay motivated."
                            color="amber"
                         />
                         <FeatureCard
                            icon={<Award className="w-5 h-5"/>}
                            title="Tier Progression"
                            description="Level up from Novice to Expert as you master quantum concepts."
                            color="emerald"
                         />
                      </div>
                      
                      <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
                         <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500"/>
                            Dashboard Widgets
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl">
                               <CircleDot className="w-4 h-4 text-violet-500"/>
                               <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Quick Actions</strong> - Jump to recent activities</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl">
                               <CircleDot className="w-4 h-4 text-blue-500"/>
                               <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Notifications</strong> - Updates from instructors</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl">
                               <CircleDot className="w-4 h-4 text-emerald-500"/>
                               <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Recent Modules</strong> - Continue where you left off</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl">
                               <CircleDot className="w-4 h-4 text-pink-500"/>
                               <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Achievements</strong> - Badges you've earned</span>
                            </div>
                         </div>
                      </Card>
                   </div>
                </section>

                {/* LEARNING CENTER */}
                <section id="student-learn" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                         <GraduationCap className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Learning Center</h3>
                         <p className="text-slate-500 font-medium">Your hub for structured quantum education</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         The <strong>Learn</strong> page is where all your educational content lives. It's organized into three powerful sections:
                      </p>
                      
                      <div className="space-y-4">
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Target className="w-6 h-6 text-blue-600"/>
                               </div>
                               <div className="flex-1">
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Path Planner</h4>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                     Add your interests (e.g., "Finance", "Chemistry", "Cryptography") and our AI generates a personalized learning curriculum just for you.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                     <Badge color="blue">Personalized</Badge>
                                     <Badge color="slate">AI-Powered</Badge>
                                     <Badge color="violet">Video Lessons</Badge>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Sparkles className="w-6 h-6 text-violet-600"/>
                               </div>
                               <div className="flex-1">
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Concept Explorer (Quantum Oracle)</h4>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                     Type any quantum concept and get an AI-powered explanation. Ask about "Superposition", "Entanglement", "Quantum Gates", or anything else!
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                     <Badge color="violet">Gemini AI</Badge>
                                     <Badge color="emerald">Instant Answers</Badge>
                                     <Badge color="amber">Beginner-Friendly</Badge>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <FlaskConical className="w-6 h-6 text-amber-600"/>
                               </div>
                               <div className="flex-1">
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Simulation Lab</h4>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                     Build quantum circuits interactively! Add gates (H, X, Z, CNOT), see probability distributions, and understand quantum states visually.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                     <Badge color="amber">Interactive</Badge>
                                     <Badge color="blue">Real-time</Badge>
                                     <Badge color="pink">2-Qubit Simulator</Badge>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* SIMULATION LAB DETAILS */}
                <section id="student-labs" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none">
                         <FlaskConical className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Simulation Lab Deep Dive</h3>
                         <p className="text-slate-500 font-medium">Master quantum circuits hands-on</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         The Simulation Lab lets you experiment with quantum circuits without any coding. Here's what you can do:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="border-2 border-blue-100 dark:border-blue-900">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                               <Layers className="w-5 h-5 text-blue-500"/>
                               Available Gates
                            </h4>
                            <div className="space-y-3">
                               <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">H</div>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Hadamard</p>
                                     <p className="text-xs text-slate-500">Creates superposition</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                                  <div className="w-10 h-10 bg-pink-500 text-white rounded-lg flex items-center justify-center font-bold">X</div>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Pauli-X</p>
                                     <p className="text-xs text-slate-500">Bit flip (quantum NOT)</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                  <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center font-bold">Z</div>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Pauli-Z</p>
                                     <p className="text-xs text-slate-500">Phase flip</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                                  <div className="w-10 h-10 bg-violet-500 text-white rounded-lg flex items-center justify-center font-bold text-xs">CNOT</div>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Controlled-NOT</p>
                                     <p className="text-xs text-slate-500">Creates entanglement</p>
                                  </div>
                               </div>
                            </div>
                         </Card>
                         
                         <Card className="border-2 border-emerald-100 dark:border-emerald-900">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                               <Rocket className="w-5 h-5 text-emerald-500"/>
                               Try These Circuits
                            </h4>
                            <div className="space-y-3">
                               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                  <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Bell State</p>
                                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">H → CNOT</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Creates maximum entanglement between two qubits. Used in quantum teleportation!</p>
                               </div>
                               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                  <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Superposition</p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">H on both qubits</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">All four states have equal 25% probability. This is quantum parallelism!</p>
                               </div>
                               <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                                  <p className="font-semibold text-pink-800 dark:text-pink-200 mb-1">Bit Flip</p>
                                  <p className="text-xs text-pink-600 dark:text-pink-400 mb-2">X on both qubits</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Flips |00⟩ to |11⟩. Understand how quantum NOT works!</p>
                               </div>
                            </div>
                         </Card>
                      </div>
                   </div>
                </section>

                {/* STUDY AID */}
                <section id="doc-intel" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200 dark:shadow-none">
                         <FileText className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Study Aid</h3>
                         <p className="text-slate-500 font-medium">AI-powered document analysis</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         Upload your study materials and let AI help you understand them better. Perfect for research papers, textbooks, and lecture notes.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FeatureCard
                            icon={<FileQuestion className="w-5 h-5"/>}
                            title="Smart Summaries"
                            description="Get instant summaries of uploaded PDFs with key concepts highlighted."
                            color="cyan"
                         />
                         <FeatureCard
                            icon={<MessageSquare className="w-5 h-5"/>}
                            title="Q&A with Documents"
                            description="Ask questions about your documents and get accurate, grounded answers."
                            color="blue"
                         />
                         <FeatureCard
                            icon={<Lightbulb className="w-5 h-5"/>}
                            title="Concept Extraction"
                            description="AI identifies and explains complex concepts found in your materials."
                            color="amber"
                         />
                         <FeatureCard
                            icon={<BookOpen className="w-5 h-5"/>}
                            title="Study Notes"
                            description="Generate study notes and flashcard-ready content automatically."
                            color="emerald"
                         />
                      </div>
                   </div>
                </section>

                {/* PLAYGROUND */}
                <section id="playground" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none">
                         <PlayCircle className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Playground</h3>
                         <p className="text-slate-500 font-medium">Experiment freely with quantum computing</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         The <strong>Playground</strong> is your sandbox for experimenting with quantum circuits and comparing quantum vs classical algorithms.
                      </p>
                      
                      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-100 dark:border-pink-800">
                         <h4 className="font-bold text-slate-800 dark:text-white mb-4">What You Can Do</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                               <CheckCircle2 className="w-5 h-5 text-pink-500 mt-0.5"/>
                               <div>
                                  <p className="font-semibold text-slate-800 dark:text-white">Build Circuits</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Drag-and-drop quantum gates onto wires</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <CheckCircle2 className="w-5 h-5 text-pink-500 mt-0.5"/>
                               <div>
                                  <p className="font-semibold text-slate-800 dark:text-white">Visualize States</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">See Bloch sphere and probability distributions</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <CheckCircle2 className="w-5 h-5 text-pink-500 mt-0.5"/>
                               <div>
                                  <p className="font-semibold text-slate-800 dark:text-white">Compare Algorithms</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Quantum VQC vs classical SVM/Random Forest</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <CheckCircle2 className="w-5 h-5 text-pink-500 mt-0.5"/>
                               <div>
                                  <p className="font-semibold text-slate-800 dark:text-white">Get AI Insights</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Understand why one approach beats another</p>
                               </div>
                            </div>
                         </div>
                      </Card>
                   </div>
                </section>

                {/* FAQS */}
                <section id="faqs" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl flex items-center justify-center shadow-lg">
                         <HelpCircle className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Frequently Asked Questions</h3>
                         <p className="text-slate-500 font-medium">Quick answers to common questions</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      {studentFaqs.map(faq => (
                         <div 
                            key={faq.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                         >
                            <button
                               onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                               className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                               <span className="font-semibold text-slate-800 dark:text-white pr-4">{faq.q}</span>
                               <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}/>
                            </button>
                            {expandedFaq === faq.id && (
                               <div className="px-5 pb-5">
                                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                </section>

             </div>
          ) : (
             <div className="space-y-16 animate-fade-in">
                
                {/* RESEARCHER WELCOME SECTION */}
                <section id="res-welcome" className="scroll-mt-28">
                   <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 md:p-12 text-white">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                      
                      <div className="relative z-10">
                         <Badge color="white" className="mb-4 bg-white/20 text-white border-white/30">Researcher Guide</Badge>
                         <h2 className="text-3xl md:text-4xl font-black mb-4">Advanced Research Toolkit</h2>
                         <p className="text-lg text-blue-100 max-w-2xl leading-relaxed mb-8">
                            Qore provides a complete end-to-end platform for <strong>Quantum Machine Learning research</strong>. 
                            From literature review to model deployment, accelerate your research with AI-powered tools.
                         </p>
                         
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <Search className="w-6 h-6 mx-auto mb-2 text-blue-200"/>
                               <p className="text-sm font-bold">Literature Search</p>
                               <p className="text-xs text-blue-200">arXiv & IEEE</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <Database className="w-6 h-6 mx-auto mb-2 text-blue-200"/>
                               <p className="text-sm font-bold">Data Pipeline</p>
                               <p className="text-xs text-blue-200">Feature engineering</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <Cpu className="w-6 h-6 mx-auto mb-2 text-blue-200"/>
                               <p className="text-sm font-bold">VQC Training</p>
                               <p className="text-xs text-blue-200">Multi-backend</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                               <Box className="w-6 h-6 mx-auto mb-2 text-blue-200"/>
                               <p className="text-sm font-bold">Model Hub</p>
                               <p className="text-xs text-blue-200">Version control</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* RESEARCH WORKFLOW */}
                <section className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                         <Compass className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Research Workflow</h3>
                         <p className="text-slate-500 font-medium">End-to-end QML research pipeline</p>
                      </div>
                   </div>
                   
                   <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-emerald-500 hidden md:block"></div>
                      
                      <div className="space-y-6">
                         <WorkflowStep 
                            number={1}
                            title="Literature Discovery"
                            description="Search and analyze quantum ML papers from arXiv and IEEE. Build citation graphs to understand research lineage."
                            color="indigo"
                         />
                         <WorkflowStep 
                            number={2}
                            title="Data Preparation"
                            description="Upload datasets, run AI analysis for feature recommendations, and configure quantum encoding strategies."
                            color="blue"
                         />
                         <WorkflowStep 
                            number={3}
                            title="Circuit Design"
                            description="Build VQC architectures in the Playground. Configure ansatz layers, feature maps, and entanglement patterns."
                            color="violet"
                         />
                         <WorkflowStep 
                            number={4}
                            title="Hyperparameter Optimization"
                            description="Run grid or Bayesian sweeps to find optimal learning rates, depths, and configurations."
                            color="purple"
                         />
                         <WorkflowStep 
                            number={5}
                            title="Training & Mitigation"
                            description="Execute training on simulators or real quantum hardware. Apply error mitigation techniques like ZNE."
                            color="rose"
                         />
                         <WorkflowStep 
                            number={6}
                            title="Evaluation & Deployment"
                            description="Benchmark with confusion matrices and ROC curves. Export models to Qiskit or OpenQASM."
                            color="emerald"
                         />
                      </div>
                   </div>
                </section>

                {/* RESEARCH LAB */}
                <section id="res-lab" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                         <Book className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Research Discovery</h3>
                         <p className="text-slate-500 font-medium">AI-powered literature management</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                         The <strong>Research</strong> tab is your command center for staying current with quantum ML literature and managing your reading pipeline.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Search className="w-6 h-6 text-indigo-600"/>
                               </div>
                               <div className="flex-1">
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Semantic Paper Search</h4>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                     Search arXiv and IEEE using natural language queries. Our AI generates one-sentence insights for each paper to help you filter faster.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                     <Badge color="indigo">arXiv</Badge>
                                     <Badge color="blue">IEEE</Badge>
                                     <Badge color="violet">AI Summaries</Badge>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Binary className="w-6 h-6 text-violet-600"/>
                               </div>
                               <div className="flex-1">
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Citation Graph Visualization</h4>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                     Explore the relationships between papers visually. Identify foundational works and trace the evolution of ideas in your research area.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                     <Badge color="violet">Interactive</Badge>
                                     <Badge color="slate">Network View</Badge>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-100 dark:border-indigo-800">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                               <Sparkles className="w-5 h-5 text-indigo-600"/>
                            </div>
                            <div>
                               <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">AI Paper Insights</h4>
                               <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                  Each paper in your search results includes an AI-generated insight summarizing key contributions, methodology, and relevance to quantum ML research.
                               </p>
                            </div>
                         </div>
                      </Card>
                   </div>
                </section>

                {/* DOC INTELLIGENCE */}
                <section id="doc-intel" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200 dark:shadow-none">
                         <FileText className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Document Intelligence</h3>
                         <p className="text-slate-500 font-medium">Deep analysis with Gemini AI</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         Upload research papers and interact with them using advanced AI. Perfect for extracting insights from dense technical literature.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FeatureCard
                            icon={<FileQuestion className="w-5 h-5"/>}
                            title="Semantic Summaries"
                            description="AI extracts key findings, methodology, complexity levels, and novel contributions."
                            color="cyan"
                         />
                         <FeatureCard
                            icon={<MessageSquare className="w-5 h-5"/>}
                            title="Grounded Q&A"
                            description="Ask complex questions like 'Explain the proof in Section 3' with cited answers."
                            color="blue"
                         />
                         <FeatureCard
                            icon={<Layers className="w-5 h-5"/>}
                            title="Multi-Document Analysis"
                            description="Compare findings across multiple papers to identify consensus and conflicts."
                            color="indigo"
                         />
                      </div>
                   </div>
                </section>

                {/* DATA ENGINEERING */}
                <section id="res-data" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                         <Database className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Data Engineering</h3>
                         <p className="text-slate-500 font-medium">Prepare datasets for quantum kernels</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         The <strong>Datasets</strong> section helps you prepare and optimize data for quantum machine learning experiments.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="border-2 border-emerald-100 dark:border-emerald-900">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                               <Database className="w-5 h-5 text-emerald-500"/>
                               Dataset Management
                            </h4>
                            <div className="space-y-3">
                               <div className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">CSV Upload</p>
                                     <p className="text-sm text-slate-500">Upload datasets in CSV format with automatic schema detection</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Preview & Statistics</p>
                                     <p className="text-sm text-slate-500">View first rows, column types, and distribution statistics</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Library Organization</p>
                                     <p className="text-sm text-slate-500">Manage multiple datasets with tags and descriptions</p>
                                  </div>
                               </div>
                            </div>
                         </Card>
                         
                         <Card className="border-2 border-violet-100 dark:border-violet-900">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                               <BrainCircuit className="w-5 h-5 text-violet-500"/>
                               AI Analysis
                            </h4>
                            <div className="space-y-3">
                               <div className="flex items-start gap-3">
                                  <Sparkles className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0"/>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Feature Map Recommendations</p>
                                     <p className="text-sm text-slate-500">AI suggests ZZFeatureMap vs ZFeatureMap based on data structure</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-3">
                                  <Sparkles className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0"/>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Encoding Strategy</p>
                                     <p className="text-sm text-slate-500">Get recommendations for amplitude vs angle encoding</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-3">
                                  <Sparkles className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0"/>
                                  <div>
                                     <p className="font-semibold text-slate-800 dark:text-white">Qubit Count Estimation</p>
                                     <p className="text-sm text-slate-500">Estimate required qubits based on feature dimensionality</p>
                                  </div>
                               </div>
                            </div>
                         </Card>
                      </div>
                   </div>
                </section>

                {/* QUANTUM STUDIO */}
                <section id="res-studio" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
                         <Cpu className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Quantum Studio</h3>
                         <p className="text-slate-500 font-medium">Circuit design & hyperparameter optimization</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         The Quantum Studio combines the <strong>Playground</strong> for circuit design and the <strong>Sweep</strong> tool for hyperparameter optimization.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-violet-100 dark:border-violet-900">
                            <div className="flex items-center gap-3 mb-4">
                               <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                                  <PlayCircle className="w-5 h-5 text-violet-600"/>
                               </div>
                               <h4 className="text-lg font-bold text-slate-800 dark:text-white">Playground</h4>
                            </div>
                            <ul className="space-y-2">
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-violet-500"/>
                                  Build VQC circuits with drag-and-drop
                               </li>
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-violet-500"/>
                                  Configure ansatz layers and entanglement
                               </li>
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-violet-500"/>
                                  Compare quantum vs classical baselines
                               </li>
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-violet-500"/>
                                  Real-time Bloch sphere visualization
                               </li>
                            </ul>
                         </div>
                         
                         <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-100 dark:border-amber-900">
                            <div className="flex items-center gap-3 mb-4">
                               <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                  <Sliders className="w-5 h-5 text-amber-600"/>
                               </div>
                               <h4 className="text-lg font-bold text-slate-800 dark:text-white">HP Sweep</h4>
                            </div>
                            <ul className="space-y-2">
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-amber-500"/>
                                  Grid search across parameter space
                               </li>
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-amber-500"/>
                                  Bayesian optimization for efficiency
                               </li>
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-amber-500"/>
                                  3D scatter plot visualization
                               </li>
                               <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CircleDot className="w-4 h-4 text-amber-500"/>
                                  Auto-select optimal configuration
                               </li>
                            </ul>
                         </div>
                      </div>
                   </div>
                </section>

                {/* EXECUTION PIPELINE */}
                <section id="res-exec" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-none">
                         <Zap className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Execution Pipeline</h3>
                         <p className="text-slate-500 font-medium">Training, mitigation, and evaluation</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         Execute your quantum ML experiments with full control over backend selection, error mitigation, and performance evaluation.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="p-5 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl border border-rose-100 dark:border-rose-800">
                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                               <Zap className="w-6 h-6 text-rose-500"/>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Training</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Run VQC training on multiple backends with real-time monitoring.</p>
                            <div className="space-y-1">
                               <p className="text-xs text-slate-500"><strong>Backends:</strong> QasmSimulator, IBM Quantum, IonQ</p>
                               <p className="text-xs text-slate-500"><strong>Monitoring:</strong> Live loss curves, ansatz rotations</p>
                            </div>
                         </div>
                         
                         <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                               <ShieldCheck className="w-6 h-6 text-blue-500"/>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Error Mitigation</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Clean up noise artifacts before recording final results.</p>
                            <div className="space-y-1">
                               <p className="text-xs text-slate-500"><strong>Techniques:</strong> ZNE, Probabilistic Error Cancellation</p>
                               <p className="text-xs text-slate-500"><strong>Analysis:</strong> Before/after comparison charts</p>
                            </div>
                         </div>
                         
                         <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                               <Activity className="w-6 h-6 text-emerald-500"/>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Evaluation</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Comprehensive benchmarking against ground truth.</p>
                            <div className="space-y-1">
                               <p className="text-xs text-slate-500"><strong>Metrics:</strong> Accuracy, F1, AUC-ROC</p>
                               <p className="text-xs text-slate-500"><strong>Visualizations:</strong> Confusion matrices, ROC curves</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* MODEL HUB */}
                <section id="res-hub" className="scroll-mt-28">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                         <Box className="w-7 h-7"/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Model Hub & Registry</h3>
                         <p className="text-slate-500 font-medium">Version control and deployment</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                         All successful training runs are automatically stored in the <strong>Model Hub</strong>. Track experiments, compare versions, and deploy to production.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FeatureCard
                            icon={<Archive className="w-5 h-5"/>}
                            title="Version Control"
                            description="Track all model versions with full experiment metadata and reproducibility."
                            color="blue"
                         />
                         <FeatureCard
                            icon={<Settings2 className="w-5 h-5"/>}
                            title="Resource Audit"
                            description="Analyze gate counts, circuit depth, and hardware compatibility (IBM, IonQ, Rigetti)."
                            color="violet"
                         />
                         <FeatureCard
                            icon={<Code className="w-5 h-5"/>}
                            title="Export to Qiskit"
                            description="One-click export of model weights and OpenQASM circuit definitions."
                            color="emerald"
                         />
                         <FeatureCard
                            icon={<Globe className="w-5 h-5"/>}
                            title="Hardware Deployment"
                            description="Deploy directly to IBM Quantum, IonQ, or other cloud quantum providers."
                            color="cyan"
                         />
                      </div>
                      
                      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                               <Code className="w-5 h-5 text-blue-600"/>
                            </div>
                            <div>
                               <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">Export Formats</h4>
                               <p className="text-sm text-blue-700 dark:text-blue-300">
                                  Export models as <strong>Qiskit Python code</strong>, <strong>OpenQASM 3.0</strong>, or <strong>JSON weights</strong> for integration with your existing pipelines.
                               </p>
                            </div>
                         </div>
                      </Card>
                   </div>
                </section>

             </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const GuideNavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
            active 
            ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-100 dark:border-slate-700' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
    >
        <span className={`transition-colors ${active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </span>
        {label}
        <ChevronRight className={`ml-auto w-3 h-3 transition-all ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
    </button>
);

const FeatureInfo: React.FC<{ title: string, text: string }> = ({ title, text }) => (
    <li className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
            {title}
        </h5>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{text}</p>
    </li>
);

const StepCard: React.FC<{ step: number, title: string, description: string, icon: React.ReactNode, color: string }> = ({ step, title, description, icon, color }) => {
    const colorClasses: Record<string, string> = {
        violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    };
    return (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">Step {step}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                </div>
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, color: string }> = ({ icon, title, description, color }) => {
    const colorClasses: Record<string, { bg: string, text: string, border: string }> = {
        violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600', border: 'border-violet-100 dark:border-violet-800' },
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', border: 'border-blue-100 dark:border-blue-800' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', border: 'border-emerald-100 dark:border-emerald-800' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', border: 'border-amber-100 dark:border-amber-800' },
        cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600', border: 'border-cyan-100 dark:border-cyan-800' },
        pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600', border: 'border-pink-100 dark:border-pink-800' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600', border: 'border-indigo-100 dark:border-indigo-800' },
    };
    const colors = colorClasses[color] || colorClasses.violet;
    return (
        <div className={`p-5 rounded-2xl border ${colors.bg} ${colors.border} hover:shadow-md transition-all`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white dark:bg-slate-900 shadow-sm ${colors.text}`}>
                {icon}
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-1">{title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
    );
};

const WorkflowStep: React.FC<{ number: number, title: string, description: string, color: string }> = ({ number, title, description, color }) => {
    const colorClasses: Record<string, { bg: string, text: string, border: string }> = {
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200 dark:border-indigo-800' },
        blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200 dark:border-blue-800' },
        violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200 dark:border-violet-800' },
        purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800' },
        rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200 dark:border-rose-800' },
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' },
    };
    const colors = colorClasses[color] || colorClasses.indigo;
    return (
        <div className="relative pl-16 md:pl-20">
            <div className={`absolute left-0 w-12 h-12 ${colors.bg} text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg z-10`}>
                {number}
            </div>
            <div className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border ${colors.border} hover:shadow-md transition-all`}>
                <h4 className={`font-bold text-lg mb-1 ${colors.text}`}>{title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
        </div>
    );
};
