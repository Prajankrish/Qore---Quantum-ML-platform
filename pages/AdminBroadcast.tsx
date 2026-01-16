
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Button, Input, Select, Badge } from '../components/UI';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { BroadcastMessage, User } from '../types';
import { 
  Send, Users, AlertTriangle, Info, Bell, Trash2, Radio, 
  Activity, Server, Database, ShieldCheck, Clock, CheckCircle2, XCircle, Search
} from 'lucide-react';

export const AdminBroadcast: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'users' | 'health'>('broadcast');

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <SectionTitle 
        title="System Administration" 
        subtitle="Platform Management Console" 
        rightElement={<Badge color="red" className="animate-pulse shadow-red-200">Admin Mode Active</Badge>}
      />

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 bg-white dark:bg-slate-900 rounded-t-xl px-4 pt-2">
          <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative top-[2px] ${activeTab === 'broadcast' ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-slate-50 dark:bg-slate-800 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
              <Radio className="w-4 h-4" /> Broadcast Center
          </button>
          <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative top-[2px] ${activeTab === 'users' ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-slate-50 dark:bg-slate-800 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
              <Users className="w-4 h-4" /> User Management
          </button>
          <button
              onClick={() => setActiveTab('health')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative top-[2px] ${activeTab === 'health' ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-slate-50 dark:bg-slate-800 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
              <Activity className="w-4 h-4" /> System Health
          </button>
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[500px]">
        {activeTab === 'broadcast' && <BroadcastTab />}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'health' && <SystemHealthTab />}
      </div>
    </div>
  );
};

// --- TAB 1: BROADCAST CENTER ---
const BroadcastTab: React.FC = () => {
  const [history, setHistory] = useState<BroadcastMessage[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system' as 'system' | 'job' | 'alert' | 'message',
    targetRole: 'all' as 'all' | 'student' | 'researcher'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    // Fix: Use notificationCenter instead of notificationService
    setHistory(api.notificationCenter.getBroadcasts());
  };

  const handleSend = () => {
    if (!formData.title || !formData.message) {
        if ((window as any).notify) (window as any).notify('error', 'Title and message are required.');
        return;
    }
    
    setSending(true);
    setTimeout(() => {
        // Fix: Use notificationCenter instead of notificationService
        api.notificationCenter.sendBroadcast(formData);
        
        // Reset form
        setFormData({
            title: '',
            message: '',
            type: 'system',
            targetRole: 'all'
        });
        
        loadHistory();
        setSending(false);
        if ((window as any).notify) (window as any).notify('success', 'Broadcast sent successfully to all active sessions.');
    }, 800);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Compose Card */}
          <Card title="Compose Message" subtitle="Send global notifications">
             <div className="space-y-6">
                <Input 
                    label="Subject Line" 
                    placeholder="e.g. Scheduled Maintenance" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
                
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Message Content</label>
                    <textarea 
                        className="w-full h-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        placeholder="Type your announcement here..."
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select 
                        label="Notification Type" 
                        value={formData.type} 
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                        <option value="system">System Info (Blue)</option>
                        <option value="alert">Critical Alert (Red)</option>
                        <option value="job">Success/Update (Green)</option>
                    </Select>
                    
                    <Select 
                        label="Target Audience" 
                        value={formData.targetRole} 
                        onChange={e => setFormData({...formData, targetRole: e.target.value as any})}
                    >
                        <option value="all">All Users</option>
                        <option value="student">Students Only</option>
                        <option value="researcher">Researchers Only</option>
                    </Select>
                </div>

                {/* LIVE PREVIEW BOX */}
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">User View Preview</p>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex gap-3 shadow-sm items-start">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              formData.type === 'alert' ? 'bg-red-100 text-red-600' :
                              formData.type === 'job' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                              {formData.type === 'alert' ? <AlertTriangle className="w-4 h-4"/> : <Bell className="w-4 h-4"/>}
                        </div>
                        <div className="flex-grow">
                             <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{formData.title || 'Notification Title'}</h4>
                                <span className="text-[10px] text-slate-400">Just now</span>
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {formData.message || 'The message content will appear here exactly as the user sees it.'}
                             </p>
                        </div>
                    </div>
                </div>

                <Button 
                    onClick={handleSend} 
                    isLoading={sending} 
                    className="w-full py-3 shadow-lg shadow-violet-200 dark:shadow-none"
                    icon={<Send className="w-4 h-4"/>}
                >
                    Broadcast Message
                </Button>
             </div>
          </Card>

          {/* History Card */}
          <Card title="Broadcast History" subtitle="Sent messages log">
              {history.length === 0 ? (
                  <div className="text-center py-24 opacity-50 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Radio className="w-8 h-8 text-slate-300 dark:text-slate-600"/>
                      </div>
                      <p className="text-sm font-medium text-slate-500">No broadcasts sent yet.</p>
                  </div>
              ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {history.map(msg => (
                          <div key={msg.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                      <Badge color={msg.type === 'alert' ? 'amber' : msg.type === 'job' ? 'green' : 'blue'}>
                                        {msg.type.toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-slate-400 flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                                        <Users className="w-3 h-3"/> {msg.targetRole}
                                      </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{msg.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{msg.message}</p>
                              <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-300 dark:text-slate-600">Author: {msg.author}</span>
                                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Sent</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </Card>
      </div>
  );
};

// --- TAB 2: USER MANAGEMENT ---
const UserManagementTab: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setUsers(authService.getUsers());
    }, []);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card title="Registered Users" subtitle={`Total Users: ${users.length}`}>
            <div className="mb-6 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Last Active</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-300">{user.role}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(user.joinedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                    {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                        Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-400">No users found matching "{search}"</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- TAB 3: SYSTEM HEALTH ---
const SystemHealthTab: React.FC = () => {
    // Mock Logs
    const [logs, setLogs] = useState<string[]>([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            const msgs = [
                "[INFO] Worker #4 completed job 8f72a",
                "[INFO] Database backup success (45ms)",
                "[WARN] High latency on node-us-east-1",
                "[INFO] User authentication verified",
                "[INFO] Cache cleared"
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            const time = new Date().toLocaleTimeString();
            setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400"><Server className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">System Status</p>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">Operational</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400"><Activity className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">API Latency</p>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">24ms</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-violet-500">
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-full text-violet-600 dark:text-violet-400"><Users className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Active Sessions</p>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">12</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-600 dark:text-amber-400"><Database className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Storage Used</p>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">45 GB</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Live System Logs" subtitle="Real-time event stream">
                    <div className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-xl h-64 overflow-hidden flex flex-col">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0 animate-fade-in">
                                <span className={log.includes('WARN') ? 'text-amber-400' : 'text-emerald-400'}>➜</span> {log}
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Security Status" subtitle="Compliance & Integrity">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300"><ShieldCheck className="w-4 h-4 text-emerald-500"/> SSL Certificate</span>
                            <Badge color="green">Valid</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300"><Database className="w-4 h-4 text-emerald-500"/> Database Backup</span>
                            <span className="text-xs text-slate-500">Last: 2h ago</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300"><Clock className="w-4 h-4 text-emerald-500"/> Uptime (30d)</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">99.98%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
