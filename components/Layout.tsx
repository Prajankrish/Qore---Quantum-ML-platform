
import React, { useState, useEffect } from 'react';
import { STUDENT_NAV, RESEARCHER_SIDEBAR } from '../constants';
import { PageView, User, SystemNotification } from '../types';
import { authService } from '../services/auth';
import { api } from '../services/api';
import { 
    Atom, User as UserIcon, LogOut, ChevronDown, Repeat, Menu, X, Bell, 
    Moon, Sun, Check, Trash2, Mail, AlertTriangle, Zap, Info, ShieldAlert, 
    CreditCard, Search, Lock, ArrowUpRight, Sparkles 
} from 'lucide-react';

interface LayoutProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children, isDarkMode, toggleTheme, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('notificationUpdated', handleUpdate);
    return () => window.removeEventListener('notificationUpdated', handleUpdate);
  }, [currentPage]); 

  const loadNotifications = () => {
      // Fix: Use notificationCenter instead of notificationService
      const data = api.notificationCenter.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
  };

  const handleMarkRead = (id: string) => {
      // Fix: Use notificationCenter instead of notificationService
      api.notificationCenter.markAsRead(id);
      loadNotifications();
  };

  const handleMarkAllRead = () => {
      // Fix: Use notificationCenter instead of notificationService
      api.notificationCenter.markAllAsRead();
      loadNotifications();
  };

  // Only Admins can cycle roles to test UI
  const adminViewSwitch = () => {
    if (user?.role !== 'admin') return;
    // For local demo/testing, admins can impersonate roles
    const roles: ('student' | 'researcher' | 'admin')[] = ['student', 'researcher', 'admin'];
    const currentIdx = roles.indexOf(user.role);
    const nextRole = roles[(currentIdx + 1) % roles.length];
    
    const updatedUser = authService.updateProfile({ role: nextRole });
    setUser(updatedUser);
    setIsDropdownOpen(false);
    onNavigate(PageView.OVERVIEW);
  };

  const isResearcher = user?.role === 'researcher' || user?.role === 'admin';

  const NotificationCenter = () => (
      <div className="relative">
          <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? 'bg-violet-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              )}
          </button>
          {isNotifOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fade-in-up">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
                      {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1">
                              <Check className="w-3 h-3"/> Mark all read
                          </button>
                      )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                              <p className="text-sm">No notifications yet.</p>
                          </div>
                      ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {notifications.map(notif => (
                                  <div 
                                      key={notif.id} 
                                      className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-default relative group ${notif.read ? 'opacity-70' : 'bg-violet-50/30 dark:bg-violet-900/10'}`}
                                      onClick={() => !notif.read && handleMarkRead(notif.id)}
                                  >
                                      <div className="flex gap-3">
                                          <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                              notif.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                              notif.type === 'job' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                              notif.type === 'message' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                              'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                          }`}>
                                              {notif.type === 'alert' ? <AlertTriangle className="w-4 h-4"/> :
                                               notif.type === 'job' ? <Zap className="w-4 h-4"/> :
                                               notif.type === 'message' ? <Mail className="w-4 h-4"/> :
                                               <Info className="w-4 h-4"/>}
                                          </div>
                                          <div className="flex-grow">
                                              <div className="flex justify-between items-start mb-1">
                                                  <h5 className={`text-sm ${notif.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                                                      {notif.isBroadcast && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5 align-middle" title="System Broadcast"></span>}
                                                      {notif.title}
                                                  </h5>
                                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">{new Date(notif.timestamp).toLocaleDateString()}</span>
                                              </div>
                                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>
  );

  const sidebarItems = RESEARCHER_SIDEBAR.map(group => ({
      ...group,
      items: group.items.map(item => ({
          ...item,
          locked: !isResearcher && group.group !== "Dashboard" && group.group !== "Discovery & Data"
      }))
  }));

  if (user?.role === 'student' && currentPage !== PageView.BILLING && currentPage !== PageView.PROFILE) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-100 selection:text-violet-900 transition-colors duration-300">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-18">
                        <div className="flex items-center gap-4 md:gap-8">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                            </button>
                            <Logo markOnly={false} onClick={() => onNavigate(PageView.OVERVIEW)} />
                            <div className="hidden md:flex space-x-1">
                                {STUDENT_NAV.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id as PageView)}
                                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${currentPage === item.id ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <item.icon className={`w-4 h-4 mr-2 ${currentPage === item.id ? 'text-white' : 'text-slate-400'}`} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <button 
                                onClick={() => onNavigate(PageView.BILLING)}
                                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-bold border border-violet-100 dark:border-violet-800 hover:bg-violet-100 transition-colors"
                            >
                                <Sparkles className="w-3.5 h-3.5"/>
                                Upgrade to Researcher
                            </button>
                            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                            </button>
                            <NotificationCenter />
                            <UserProfile user={user} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} onNavigate={onNavigate} switchRole={adminViewSwitch} handleLogout={onLogout} />
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-violet-100 selection:text-violet-900 overflow-hidden transition-colors duration-300">
        <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 z-40 transition-colors duration-300">
            <div className="h-18 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                <Logo markOnly={false} onClick={() => onNavigate(PageView.OVERVIEW)} />
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
                {sidebarItems.map((group, idx) => (
                    <div key={idx}>
                        <h4 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">{group.group}</h4>
                        <div className="space-y-1">
                            {group.items.map(item => {
                                const isActive = currentPage === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        disabled={item.locked}
                                        onClick={() => onNavigate(item.id as PageView)}
                                        className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${item.locked ? 'opacity-40 cursor-not-allowed' : isActive ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                    >
                                        <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} strokeWidth={2} />
                                        {item.label}
                                        {item.locked && <Lock className="ml-auto w-3.5 h-3.5 text-slate-400" />}
                                        {isActive && !item.locked && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 shadow-lg shadow-slate-200 dark:shadow-none" onClick={() => onNavigate(PageView.BILLING)}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500 rounded-full blur-xl opacity-20 -mr-8 -mt-8"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-white font-bold text-sm">{user?.subscription?.planId || 'Starter'} Plan</p>
                            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">Active</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">280 QPU hours left</p>
                    </div>
                </div>
            </div>
        </aside>

        <div className="flex-1 flex flex-col md:ml-64 min-w-0 h-screen overflow-hidden">
            <header className="h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
                <div className="flex items-center gap-8 flex-1">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden md:block whitespace-nowrap">
                        {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('_', ' ')}
                    </h1>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <button onClick={toggleTheme} className="hidden md:flex p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    </button>
                    <NotificationCenter />
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <UserProfile user={user} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} onNavigate={onNavigate} switchRole={adminViewSwitch} handleLogout={onLogout} />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    </div>
  );
};

const Logo: React.FC<{ markOnly: boolean, onClick: () => void }> = ({ markOnly, onClick }) => (
    <div className="flex items-center cursor-pointer group gap-3" onClick={onClick}>
        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 bg-violet-100 dark:bg-violet-900/30 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white z-10 group-hover:scale-105 transition-transform">
                <Atom size={22} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-700" />
            </div>
        </div>
        {!markOnly && (
            <div className="flex flex-col justify-center -space-y-0.5">
                <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 leading-none">QORE</span>
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.25em] leading-tight mt-1 uppercase">
                    <span className="text-slate-500 dark:text-slate-400">Quantum</span>
                    <span className="text-violet-600 dark:text-violet-400">Platform</span>
                </div>
            </div>
        )}
    </div>
);

const UserProfile: React.FC<any> = ({ user, isDropdownOpen, setIsDropdownOpen, onNavigate, switchRole, handleLogout }) => {
    if (!user) return null;
    return (
        <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-1 capitalize">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/50 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-300 uppercase">
                    {user.name.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                    <div className="p-2">
                        <button onClick={() => { onNavigate(PageView.PROFILE); setIsDropdownOpen(false); }} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-slate-700 rounded-lg"><UserIcon className="w-4 h-4 mr-2" /> Profile</button>
                        <button onClick={() => { onNavigate(PageView.BILLING); setIsDropdownOpen(false); }} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-slate-700 rounded-lg"><CreditCard className="w-4 h-4 mr-2" /> Billing</button>
                        {user.role === 'admin' && (
                            <button onClick={switchRole} className="w-full flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"><Repeat className="w-4 h-4 mr-2" /> View As Persona</button>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><LogOut className="w-4 h-4 mr-2" /> Sign Out</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <p className="text-sm text-slate-400 font-medium">&copy; 2025 Qore Platform.</p>
            <span className="text-xs text-blue-300 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Simulation Mode</span>
        </div>
    </footer>
);
