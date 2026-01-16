
import React from 'react';
import { ArrowRight, Cpu, ShieldCheck, Sparkles, Atom } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-sans text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-100/50 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
      
      {/* Header/Nav (Minimal) */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
              {/* Logo Mark - Catchy Design */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                  <div className="absolute inset-0 bg-violet-100 rounded-xl rotate-6"></div>
                  <div className="absolute inset-0 bg-indigo-50 rounded-xl -rotate-6"></div>
                  <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 w-10 h-10 rounded-xl shadow-lg shadow-violet-200 flex items-center justify-center text-white z-10">
                      <Atom size={22} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 z-20">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                      </span>
                  </div>
              </div>
              
              {/* Logo Text */}
              <div className="flex flex-col justify-center -space-y-0.5">
                <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-600 leading-none">
                  QORE
                </span>
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.25em] leading-tight mt-1 uppercase">
                  <span className="text-slate-400">Quantum</span>
                  <span className="text-violet-600">Platform</span>
                </div>
              </div>
          </div>
          
          <button onClick={onEnter} className="text-xs md:text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50">
              Skip to Dashboard
          </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col min-h-screen justify-center py-24 md:py-0">
        
        {/* Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-12 md:mb-20">
            <div className="inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] md:text-xs font-bold text-violet-600 mb-6 md:mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-violet-500 mr-2 animate-pulse"></span>
                v2.0 Simulation Engine Online
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tight mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-fade-in-up leading-tight">
                Quantum Precision,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">Hybrid Intelligence.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 font-medium px-4">
                The comprehensive platform for training Variational Quantum Classifiers (VQC) with classical baselines, error mitigation, and AI-driven research.
            </p>
            
            <button 
                onClick={onEnter}
                className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 text-base md:text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105 animate-fade-in-up animation-delay-300"
            >
                Launch Platform
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up animation-delay-500 max-w-6xl mx-auto w-full pb-8 md:pb-0">
            {/* Card 1 */}
            <div className="group p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                    <Cpu size={24} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">Hybrid Modelling</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Compare Quantum VQCs against classical baselines like SVM and Random Forest in real-time.
                </p>
            </div>

            {/* Card 2 */}
            <div className="group p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-emerald-100">
                    <ShieldCheck size={24} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">Error Mitigation</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Advanced Zero Noise Extrapolation (ZNE) to stabilize results on noisy quantum backends.
                </p>
            </div>

            {/* Card 3 */}
            <div className="group p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-violet-100">
                    <Sparkles size={24} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">AI Research</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Integrated AI agent extracts insights from arXiv papers to guide your ansatz design.
                </p>
            </div>
        </div>
      </div>
      
      {/* Decorative footer text */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-slate-400 text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase hidden md:block">
          Powered by Qore Engine v2.0
      </div>
    </div>
  );
};
