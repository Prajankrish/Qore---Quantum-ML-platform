
import React, { useState } from 'react';
import { Button, Input } from '../components/UI';
import { authService } from '../services/auth';
import { Atom, ArrowRight, GraduationCap, Microscope, CheckCircle2, Sparkles } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
  onSocialLogin?: (provider: 'Google' | 'GitHub') => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onSocialLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'researcher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network latency for realistic feel
    setTimeout(() => {
      let result;
      if (isLogin) {
        result = authService.login(email, password);
      } else {
        if (!name) { 
          setError('Full name is required for registration.'); 
          setLoading(false); 
          return; 
        }
        // Note: authService.register only accepts 'student' | 'researcher'
        result = authService.register(email, password, name, role);
      }

      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message || 'Authentication failed. Please check your credentials.');
      }
      setLoading(false);
    }, 800);
  };

  const handleSocialLoginClick = (provider: 'Google' | 'GitHub') => {
      if (onSocialLogin) {
          onSocialLogin(provider);
      } else {
          setError("Social login provider not configured.");
      }
  };

  const lightInputStyles = "!bg-white !text-slate-900 !border-slate-200 !placeholder:text-slate-400 !focus:ring-offset-white";

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* LEFT SIDE: BRAND & VALUE PROP */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

         <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
               <Atom className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tight">QORE</span>
         </div>

         <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
               Accelerate your <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Quantum Leap.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
               Join thousands of researchers and students in the world's most intuitive platform for Variational Quantum Classifiers and Hybrid ML.
            </p>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
               <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
               </div>
               <p className="text-slate-200 italic mb-4">
                  "The interactive visualizers and AI research insights transformed my understanding of Hilbert space optimization."
               </p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">PK</div>
                  <div>
                     <p className="font-bold text-white text-sm">System Administrator</p>
                     <p className="text-xs text-slate-400">Quantum Research Lead</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative z-10 text-xs text-slate-500 font-medium">
            © 2025 Qore Quantum Platform. Built for the NISQ Era.
         </div>
      </div>

      {/* RIGHT SIDE: AUTHENTICATION FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-white dark:bg-white text-slate-900">
         <div className="w-full max-w-md space-y-8">
            
            <div className="text-center lg:text-left">
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {isLogin ? 'Welcome back' : 'Create your account'}
               </h2>
               <p className="text-slate-500 mt-2 font-medium">
                  {isLogin 
                    ? 'Enter your credentials to access your workspace.' 
                    : 'Select your persona and join the quantum community.'}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
               {!isLogin && (
                 <div className="space-y-5 animate-fade-in">
                    <Input 
                      label="Full Name" 
                      placeholder="e.g. Richard Feynman" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required={!isLogin}
                      className={lightInputStyles}
                    />
                    
                    <div className="space-y-3">
                       <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">Identify your workspace role</label>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            type="button"
                            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-32 ${role === 'student' ? 'border-violet-600 bg-violet-50/50 shadow-md ring-4 ring-violet-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                            onClick={() => setRole('student')}
                          >
                             {role === 'student' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-violet-600" /></div>}
                             <div className={`p-2 w-fit rounded-xl ${role === 'student' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <GraduationCap size={20}/>
                             </div>
                             <div>
                                <p className={`font-bold text-sm ${role === 'student' ? 'text-violet-900' : 'text-slate-700'}`}>Student</p>
                                <p className="text-[10px] text-slate-500 leading-tight mt-1">Learning foundations and exploring labs.</p>
                             </div>
                          </button>

                          <button 
                            type="button"
                            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-32 ${role === 'researcher' ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                            onClick={() => setRole('researcher')}
                          >
                             {role === 'researcher' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-indigo-600" /></div>}
                             <div className={`p-2 w-fit rounded-xl ${role === 'researcher' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Microscope size={20}/>
                             </div>
                             <div>
                                <p className={`font-bold text-sm ${role === 'researcher' ? 'text-indigo-900' : 'text-slate-700'}`}>Researcher</p>
                                <p className="text-[10px] text-slate-500 leading-tight mt-1">Training models and mitigating noise.</p>
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
                 {isLogin && <div className="flex justify-end mt-2"><a href="#" className="text-xs font-bold text-violet-600 hover:text-violet-700 underline underline-offset-4">Reset Password?</a></div>}
               </div>

               {error && (
                 <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100 flex items-center gap-3 animate-shake">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> {error}
                 </div>
               )}

               <Button 
                 type="submit" 
                 className="w-full py-4 text-base font-bold shadow-xl shadow-violet-100 hover:shadow-violet-200 transition-all active:scale-95" 
                 isLoading={loading}
               >
                 {isLogin ? 'Sign In to Workspace' : 'Initialize Account'} <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
            </form>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-medium">Secure SSO Access</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    type="button"
                    onClick={() => handleSocialLoginClick('Google')}
                    className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm active:scale-95 disabled:opacity-50"
                >
                   <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                   Google
                </button>
                <button 
                    type="button"
                    onClick={() => handleSocialLoginClick('GitHub')}
                    className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm active:scale-95 disabled:opacity-50"
                >
                   <svg className="h-5 w-5 mr-3 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                   GitHub
                </button>
            </div>

            <div className="text-center text-sm font-medium">
               <span className="text-slate-400">{isLogin ? "New to the platform?" : "Joined us before?"}</span>
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                 className="ml-2 font-black text-violet-600 hover:text-violet-700 transition-colors"
               >
                 {isLogin ? 'Join as Researcher' : 'Back to Login'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
