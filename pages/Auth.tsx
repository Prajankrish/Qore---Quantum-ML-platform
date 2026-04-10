
import React, { useState, useEffect } from 'react';
import { Button, Input } from '../components/UI';
import { authService } from '../services/auth';
import { Atom, ArrowRight, GraduationCap, Microscope, CheckCircle2, Sparkles, Cpu, Zap, Binary, Shield, BookOpen, FlaskConical, Loader2 } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
  onSocialLogin?: (provider: 'Google' | 'GitHub') => void;
}

interface OAuthStatus {
  google: boolean;
  github: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onSocialLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'researcher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'Google' | 'GitHub' | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({ google: false, github: false });

  // Check backend status and OAuth availability on mount
  useEffect(() => {
    const checkStatus = async () => {
      const available = await authService.isBackendAvailable();
      setBackendStatus(available ? 'online' : 'offline');
      
      // Get OAuth status
      const oauth = await authService.getOAuthStatus();
      setOauthStatus(oauth);
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await authService.login(email, password);
      } else {
        if (!name) { 
          setError('Full name is required for registration.'); 
          setLoading(false); 
          return; 
        }
        result = await authService.register(email, password, name, role);
      }

      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginClick = async (provider: 'Google' | 'GitHub') => {
      setError('');
      setOauthLoading(provider);
      
      try {
        const result = await authService.loginWithProvider(provider, role);
        
        if (!result.redirecting) {
          if (result.error) {
            setError(result.error);
          } else {
            // Mock OAuth completed (local fallback mode)
            window.location.reload();
          }
        }
        // If redirecting, the page will navigate away
      } catch (err: any) {
        setError(err.message || `${provider} authentication failed. Please try again.`);
      } finally {
        // Only clear loading if we didn't redirect
        setTimeout(() => setOauthLoading(null), 1000);
      }
  };

  // Quantum features to showcase
  const quantumFeatures = [
    { icon: Cpu, title: "Variational Quantum Circuits", desc: "Design and train VQCs with intuitive visualizers" },
    { icon: Zap, title: "Quantum Error Mitigation", desc: "ZNE, PEC, and Clifford techniques built-in" },
    { icon: Binary, title: "Hybrid ML Pipelines", desc: "Seamlessly blend classical and quantum models" },
    { icon: Shield, title: "NISQ-Optimized", desc: "Algorithms tuned for current quantum hardware" },
  ];

  const lightInputStyles = "!bg-white !text-slate-900 !border-slate-200 !placeholder:text-slate-400 !focus:ring-offset-white";

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* LEFT SIDE: QUANTUM SHOWCASE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
         {/* Animated Background Elements */}
         <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
         <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
         
         {/* Grid Pattern Overlay */}
         <div className="absolute inset-0 opacity-[0.03]" style={{
           backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
           backgroundSize: '50px 50px'
         }}></div>
         
         {/* Floating Quantum Particles */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {[...Array(20)].map((_, i) => (
             <div
               key={i}
               className="absolute w-1 h-1 bg-violet-400 rounded-full animate-pulse"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 3}s`,
                 opacity: 0.3 + Math.random() * 0.5
               }}
             />
           ))}
         </div>

         {/* Bloch Sphere SVG Illustration */}
         <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-20 pointer-events-none">
           <svg width="300" height="300" viewBox="0 0 200 200" className="animate-spin-slow">
             {/* Sphere outline */}
             <circle cx="100" cy="100" r="80" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5"/>
             {/* Equator ellipse */}
             <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1" strokeDasharray="4 4"/>
             {/* Vertical circle */}
             <ellipse cx="100" cy="100" rx="25" ry="80" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="1" strokeDasharray="4 4"/>
             {/* Z-axis */}
             <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
             {/* X-axis */}
             <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
             {/* State vector */}
             <line x1="100" y1="100" x2="145" y2="45" stroke="url(#vectorGradient)" strokeWidth="2.5" strokeLinecap="round"/>
             {/* State point */}
             <circle cx="145" cy="45" r="6" fill="url(#pointGradient)"/>
             <circle cx="145" cy="45" r="10" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="1" className="animate-ping"/>
             {/* |0⟩ label */}
             <text x="100" y="8" fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle" fontFamily="monospace">|0⟩</text>
             {/* |1⟩ label */}
             <text x="100" y="198" fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle" fontFamily="monospace">|1⟩</text>
             {/* Gradients */}
             <defs>
               <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="rgba(139,92,246,0.8)"/>
                 <stop offset="50%" stopColor="rgba(6,182,212,0.6)"/>
                 <stop offset="100%" stopColor="rgba(16,185,129,0.8)"/>
               </linearGradient>
               <linearGradient id="vectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(139,92,246,1)"/>
                 <stop offset="100%" stopColor="rgba(6,182,212,1)"/>
               </linearGradient>
               <radialGradient id="pointGradient">
                 <stop offset="0%" stopColor="rgba(6,182,212,1)"/>
                 <stop offset="100%" stopColor="rgba(139,92,246,1)"/>
               </radialGradient>
             </defs>
           </svg>
         </div>

         {/* Quantum Circuit SVG */}
         <div className="absolute bottom-32 right-12 opacity-15 pointer-events-none">
           <svg width="200" height="120" viewBox="0 0 200 120">
             {/* Qubit lines */}
             <line x1="10" y1="30" x2="190" y2="30" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5"/>
             <line x1="10" y1="60" x2="190" y2="60" stroke="rgba(6,182,212,0.6)" strokeWidth="1.5"/>
             <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(16,185,129,0.6)" strokeWidth="1.5"/>
             {/* Qubit labels */}
             <text x="5" y="33" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end" fontFamily="monospace">q₀</text>
             <text x="5" y="63" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end" fontFamily="monospace">q₁</text>
             <text x="5" y="93" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end" fontFamily="monospace">q₂</text>
             {/* H Gate */}
             <rect x="30" y="18" width="24" height="24" rx="4" fill="rgba(139,92,246,0.3)" stroke="rgba(139,92,246,0.8)" strokeWidth="1"/>
             <text x="42" y="34" fill="white" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">H</text>
             {/* CNOT Gate */}
             <circle cx="80" cy="30" r="6" fill="rgba(6,182,212,0.4)" stroke="rgba(6,182,212,0.8)" strokeWidth="1.5"/>
             <line x1="80" y1="30" x2="80" y2="60" stroke="rgba(6,182,212,0.8)" strokeWidth="1.5"/>
             <circle cx="80" cy="60" r="8" fill="none" stroke="rgba(6,182,212,0.8)" strokeWidth="1.5"/>
             <line x1="72" y1="60" x2="88" y2="60" stroke="rgba(6,182,212,0.8)" strokeWidth="1.5"/>
             <line x1="80" y1="52" x2="80" y2="68" stroke="rgba(6,182,212,0.8)" strokeWidth="1.5"/>
             {/* RY Gate */}
             <rect x="110" y="48" width="24" height="24" rx="4" fill="rgba(16,185,129,0.3)" stroke="rgba(16,185,129,0.8)" strokeWidth="1"/>
             <text x="122" y="64" fill="white" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Rᵧ</text>
             {/* Measurement */}
             <rect x="160" y="78" width="24" height="24" rx="4" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.8)" strokeWidth="1"/>
             <path d="M 168 94 Q 172 86 176 94" fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth="1.5"/>
             <line x1="172" y1="94" x2="172" y2="84" stroke="rgba(251,191,36,0.9)" strokeWidth="1.5"/>
           </svg>
         </div>

         {/* Quantum Wave Function */}
         <div className="absolute top-20 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
           <svg width="400" height="80" viewBox="0 0 400 80">
             <path 
               d="M 0 40 Q 25 10, 50 40 T 100 40 T 150 40 T 200 40 T 250 40 T 300 40 T 350 40 T 400 40" 
               fill="none" 
               stroke="url(#waveGradient)" 
               strokeWidth="2"
               className="animate-pulse"
             />
             <path 
               d="M 0 40 Q 25 70, 50 40 T 100 40 T 150 40 T 200 40 T 250 40 T 300 40 T 350 40 T 400 40" 
               fill="none" 
               stroke="url(#waveGradient2)" 
               strokeWidth="1.5"
               opacity="0.5"
             />
             <defs>
               <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(139,92,246,0)"/>
                 <stop offset="50%" stopColor="rgba(139,92,246,1)"/>
                 <stop offset="100%" stopColor="rgba(6,182,212,0)"/>
               </linearGradient>
               <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(6,182,212,0)"/>
                 <stop offset="50%" stopColor="rgba(6,182,212,1)"/>
                 <stop offset="100%" stopColor="rgba(139,92,246,0)"/>
               </linearGradient>
             </defs>
           </svg>
         </div>

         {/* Logo */}
         <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 ring-2 ring-white/10">
               <Atom className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight block">QORE</span>
              <span className="text-xs text-slate-400 font-medium">Quantum ML Platform</span>
            </div>
         </div>

         {/* Main Content */}
         <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-400/30 rounded-full px-4 py-2 mb-6">
              <FlaskConical className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-300">Next-Gen Quantum Computing</span>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
               Master the Art of <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">Quantum Intelligence</span>
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
               Build, train, and deploy Variational Quantum Classifiers with an AI-powered research assistant. From Bloch sphere visualization to real-time error mitigation.
            </p>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {quantumFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all group">
                  <feature.icon className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-black text-white">50K+</p>
                <p className="text-xs text-slate-400">Experiments Run</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">127</p>
                <p className="text-xs text-slate-400">Qubit Support</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">98%</p>
                <p className="text-xs text-slate-400">Accuracy Rate</p>
              </div>
            </div>
         </div>

         {/* Footer with Quote */}
         <div className="relative z-10">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-lg">PK</div>
               <div className="flex-1">
                  <p className="text-slate-300 text-sm italic mb-1">
                     "From understanding superposition to deploying production VQCs - Qore made quantum accessible."
                  </p>
                  <p className="text-xs text-slate-500">
                     <span className="font-bold text-white">Prajan Krish</span> · Platform Creator
                  </p>
               </div>
               <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
               </div>
            </div>
            <p className="text-xs text-slate-600 mt-4 text-center">© 2025 Qore Platform · Built for the NISQ Era</p>
         </div>
      </div>

      {/* RIGHT SIDE: AUTHENTICATION FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-16 relative bg-white dark:bg-white text-slate-900">
         <div className="w-full max-w-md">
            
            <div className="mb-10">
               <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
                  {isLogin ? 'Welcome back' : 'Create your account'}
               </h2>
               <p className="text-base text-slate-600 font-medium leading-relaxed">
                  {isLogin 
                    ? 'Enter your credentials to access your workspace.' 
                    : 'Select your role and join the quantum community.'}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {!isLogin && (
                 <div className="space-y-6 animate-fade-in pb-2">
                    <Input 
                      label="Full Name" 
                      placeholder="e.g. Richard Feynman" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required={!isLogin}
                      className={lightInputStyles}
                    />
                    
                    <div className="space-y-4">
                       <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest">Choose your role</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-36 ${role === 'student' ? 'border-violet-600 bg-violet-50/60 shadow-lg ring-2 ring-violet-300' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                            onClick={() => setRole('student')}
                          >
                             {role === 'student' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-violet-600" /></div>}
                             <div className={`p-2.5 w-fit rounded-lg ${role === 'student' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <BookOpen size={22}/>
                             </div>
                             <div>
                                <p className={`font-bold text-base ${role === 'student' ? 'text-violet-900' : 'text-slate-700'}`}>Learner</p>
                                <p className="text-xs text-slate-600 leading-snug mt-1.5">Explore quantum fundamentals and VQC basics.</p>
                             </div>
                          </button>

                          <button 
                            type="button"
                            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-36 ${role === 'researcher' ? 'border-indigo-600 bg-indigo-50/60 shadow-lg ring-2 ring-indigo-300' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                            onClick={() => setRole('researcher')}
                          >
                             {role === 'researcher' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-indigo-600" /></div>}
                             <div className={`p-2.5 w-fit rounded-lg ${role === 'researcher' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Microscope size={22}/>
                             </div>
                             <div>
                                <p className={`font-bold text-base ${role === 'researcher' ? 'text-indigo-900' : 'text-slate-700'}`}>Researcher</p>
                                <p className="text-xs text-slate-600 leading-snug mt-1.5">Train models & conduct research.</p>
                             </div>
                          </button>
                       </div>
                    </div>
                 </div>
               )}

               <Input 
                 label="Email Address" 
                 type="email" 
                 placeholder="name@institution.edu" 
                 value={email} 
                 onChange={e => setEmail(e.target.value)} 
                 required
                 className={lightInputStyles}
               />
               
               <div>
                 <Input 
                   label="Password" 
                   type="password" 
                   placeholder="••••••••" 
                   value={password} 
                   onChange={e => setPassword(e.target.value)} 
                   required
                   className={lightInputStyles}
                 />
                 {isLogin && <div className="flex justify-end mt-3"><a href="#" className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors underline underline-offset-4">Reset Password?</a></div>}
               </div>

               {error && (
                 <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-semibold border border-red-200 flex items-center gap-3 animate-shake">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> {error}
                 </div>
               )}

               <Button 
                 type="submit" 
                 className="w-full py-4 text-base font-bold shadow-xl shadow-violet-100 hover:shadow-violet-200 transition-all active:scale-95 mt-2" 
                 isLoading={loading}
               >
                 {isLogin ? 'Sign In to Workspace' : 'Initialize Account'} <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
            </form>

            <div className="relative py-6 my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500 font-semibold">Secure SSO Access</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    type="button"
                    onClick={() => handleSocialLoginClick('Google')}
                    disabled={oauthLoading !== null}
                    className={`flex items-center justify-center px-4 py-3 border rounded-2xl transition-all font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      oauthStatus.google || backendStatus === 'offline'
                        ? 'border-slate-200 hover:bg-slate-50 text-slate-700' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                    title={!oauthStatus.google && backendStatus === 'online' ? 'Google OAuth not configured on server' : ''}
                >
                   {oauthLoading === 'Google' ? (
                     <Loader2 className="h-5 w-5 mr-3 animate-spin text-violet-600" />
                   ) : (
                     <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                   )}
                   {oauthLoading === 'Google' ? 'Connecting...' : 'Google'}
                   {!oauthStatus.google && backendStatus === 'online' && (
                     <span className="ml-2 text-[10px] text-slate-400">(Not configured)</span>
                   )}
                </button>
                <button 
                    type="button"
                    onClick={() => handleSocialLoginClick('GitHub')}
                    disabled={oauthLoading !== null}
                    className={`flex items-center justify-center px-4 py-3 border rounded-2xl transition-all font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      oauthStatus.github || backendStatus === 'offline'
                        ? 'border-slate-200 hover:bg-slate-50 text-slate-700' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                    title={!oauthStatus.github && backendStatus === 'online' ? 'GitHub OAuth not configured on server' : ''}
                >
                   {oauthLoading === 'GitHub' ? (
                     <Loader2 className="h-5 w-5 mr-3 animate-spin text-violet-600" />
                   ) : (
                     <svg className="h-5 w-5 mr-3 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                   )}
                   {oauthLoading === 'GitHub' ? 'Connecting...' : 'GitHub'}
                   {!oauthStatus.github && backendStatus === 'online' && (
                     <span className="ml-2 text-[10px] text-slate-400">(Not configured)</span>
                   )}
                </button>
            </div>

            <div className="text-center text-sm font-medium pt-4">
               <span className="text-slate-600">{isLogin ? "New to the platform?" : "Joined us before?"}</span>
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                 className="ml-2 font-bold text-violet-600 hover:text-violet-700 transition-colors"
               >
                 {isLogin ? 'Join as Researcher' : 'Back to Login'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
