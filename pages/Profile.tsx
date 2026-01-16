
import React, { useEffect, useState } from 'react';
import { Card, SectionTitle, Button, Input } from '../components/UI';
import { authService } from '../services/auth';
import { api } from '../services/api';
import { PageView, User } from '../types';
import { User as UserIcon, Mail, Activity, LogOut, Cpu, Key, Save, CheckCircle2, ShieldAlert, GraduationCap, Microscope, Sparkles, Megaphone, Shield } from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
  onNavigate: (page: PageView) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout, onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ experiments: 0, models: 0 });
  const [ibmKey, setIbmKey] = useState('');
  const [keysSaved, setKeysSaved] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const exps = api.getExperiments();
      const mods = api.getModels();
      setStats({ experiments: exps.length, models: mods.length });
      if (localStorage.getItem('qore_ibm_key')) setIbmKey('••••••••••••••••••••••••••••');
    }
  }, []);

  const saveKeys = () => {
      if (ibmKey && !ibmKey.includes('•')) localStorage.setItem('qore_ibm_key', ibmKey);
      setKeysSaved(true);
      setTimeout(() => setKeysSaved(false), 2000);
      if ((window as any).notify) (window as any).notify('success', 'Credentials Saved');
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <SectionTitle title="Account Settings" subtitle="Manage your profile and security credentials" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 text-center h-fit">
           <div className="w-24 h-24 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg text-3xl font-bold text-violet-600 dark:text-violet-400 uppercase">
              {user.name.charAt(0)}
           </div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user.email}</p>
           
           <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-6 ${
               user.role === 'student' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
           }`}>
              {user.role === 'student' ? <GraduationCap className="w-3 h-3 mr-1"/> : <Microscope className="w-3 h-3 mr-1"/>}
              {user.role.toUpperCase()}
           </div>

           <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Plan</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{user.subscription?.planId || 'Starter'}</p>
                {user.role === 'student' && (
                    <button onClick={() => onNavigate(PageView.BILLING)} className="mt-2 text-xs font-bold text-violet-600 flex items-center justify-center gap-1 mx-auto hover:text-violet-700">
                        <Sparkles className="w-3 h-3"/> Upgrade Plan
                    </button>
                )}
           </div>

           <Button variant="outline" className="w-full" icon={<LogOut className="w-4 h-4"/>} onClick={onLogout}>Sign Out</Button>
        </Card>

        <div className="md:col-span-2 space-y-6">
           <Card title="Security & Integration">
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">IBM Quantum Token</label>
                       <div className="flex gap-2">
                           <Input 
                                type="password" 
                                placeholder="Paste your API Token..." 
                                value={ibmKey}
                                onChange={e => setIbmKey(e.target.value)}
                                className="font-mono text-sm"
                           />
                           <Button onClick={saveKeys} icon={keysSaved ? <CheckCircle2 className="w-4 h-4"/> : <Save className="w-4 h-4"/>}>
                               {keysSaved ? "Saved" : "Save"}
                           </Button>
                       </div>
                   </div>
               </div>
           </Card>

           <div className="grid grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white border-none shadow-lg">
                 <Cpu className="w-8 h-8 mb-4 opacity-80" />
                 <p className="text-3xl font-black">{stats.models}</p>
                 <p className="text-sm font-medium">Saved Models</p>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-none shadow-lg">
                 <Activity className="w-8 h-8 mb-4 opacity-80" />
                 <p className="text-3xl font-black">{stats.experiments}</p>
                 <p className="text-sm font-medium">Total Runs</p>
              </Card>
           </div>

           {/* Admin Panel - Only visible to admins */}
           {user.role === 'admin' && (
              <Card title="Admin Panel" className="border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                       <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-100">Administrator Access</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400">Manage platform broadcasts and notifications</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                       variant="primary" 
                       className="w-full" 
                       icon={<Megaphone className="w-4 h-4"/>} 
                       onClick={() => onNavigate(PageView.ADMIN)}
                    >
                       Broadcast Center
                    </Button>
                    <Button 
                       variant="outline" 
                       className="w-full" 
                       icon={<Activity className="w-4 h-4"/>}
                       onClick={() => onNavigate(PageView.OVERVIEW)}
                    >
                       View Analytics
                    </Button>
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
};
