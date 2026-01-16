
import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../components/UI';
import { Atom, Loader2, ArrowLeft } from 'lucide-react';

interface MockOAuthProps {
  provider: 'Google' | 'GitHub';
  onLogin: () => void;
  onCancel: () => void;
}

export const MockOAuth: React.FC<MockOAuthProps> = ({ provider, onLogin, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Loading, 2: Form, 3: Authenticating
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Simulate initial redirect load time
    const timer = setTimeout(() => setStep(2), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    // Simulate auth verification time
    setTimeout(() => {
        onLogin();
    }, 1500);
  };

  if (step === 1 || step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white animate-fade-in">
        <div className="mb-8">
            {provider === 'Google' ? (
                <svg className="w-16 h-16 animate-bounce" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            ) : (
                <svg className="w-16 h-16 animate-bounce" viewBox="0 0 24 24" fill="#181717"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            )}
        </div>
        <p className="text-slate-500 font-medium text-lg">
            {step === 1 ? `Contacting ${provider}...` : `Verifying credentials...`}
        </p>
      </div>
    );
  }

  // GOOGLE MOCK SCREEN
  if (provider === 'Google') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
              <Card className="max-w-md w-full !p-10 !rounded-[28px] !shadow-sm border border-slate-200 !bg-white">
                  <div className="flex justify-center mb-6">
                    <svg className="w-12 h-12" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  </div>
                  <h2 className="text-2xl font-medium text-center text-slate-800 mb-2">Sign in with Google</h2>
                  <p className="text-center text-slate-600 mb-10">to continue to <strong>Qore Platform</strong></p>
                  
                  <form onSubmit={handleSignIn} className="space-y-6">
                      <div>
                          <div className="border border-slate-300 rounded px-3 py-2 bg-white">
                              <p className="text-xs text-slate-500 font-medium">Email or phone</p>
                              <input 
                                className="w-full outline-none text-slate-900 bg-white" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                              />
                          </div>
                          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 inline-block">Forgot email?</a>
                      </div>
                      
                      <p className="text-sm text-slate-500">
                          Not your computer? Use Guest mode to sign in privately. <a href="#" className="text-blue-600 font-medium">Learn more</a>
                      </p>

                      <div className="flex justify-between items-center pt-4">
                          <button type="button" onClick={onCancel} className="text-blue-600 font-medium text-sm hover:bg-blue-50 px-4 py-2 rounded">Create account</button>
                          <button type="submit" className="bg-blue-600 text-white font-medium px-6 py-2 rounded hover:bg-blue-700 shadow-sm transition-colors">Next</button>
                      </div>
                  </form>
              </Card>
          </div>
      )
  }

  // GITHUB MOCK SCREEN
  return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] font-sans text-white">
          <div className="w-full max-w-[340px]">
              <div className="flex justify-center mb-6">
                <svg className="w-12 h-12 fill-white" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </div>
              <h2 className="text-2xl font-light text-center mb-6">Sign in to GitHub</h2>
              
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                          <label className="block text-sm mb-2">Username or email address</label>
                          <input 
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder:text-gray-500"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                          />
                      </div>
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="block text-sm">Password</label>
                              <a href="#" className="text-xs text-blue-400 hover:underline">Forgot password?</a>
                          </div>
                          <input 
                            type="password"
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                          />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-1.5 rounded-md text-sm border border-[rgba(240,246,252,0.1)] transition-colors"
                      >
                        Sign in
                      </button>
                  </form>
              </div>
              
              <div className="border border-[#30363d] rounded-lg p-4 mt-4 text-center text-sm">
                  New to GitHub? <a href="#" className="text-blue-400 hover:underline">Create an account</a>.
              </div>
              
              <div className="text-center mt-8">
                  <button onClick={onCancel} className="text-xs text-blue-400 hover:underline">Cancel authentication</button>
              </div>
          </div>
      </div>
  );
};
