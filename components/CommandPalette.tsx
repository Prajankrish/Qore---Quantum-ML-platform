import React, { useState, useEffect } from 'react';
import { 
  Search, LayoutDashboard, Zap, Database, Box, ShieldCheck, 
  Settings, LogOut, Sun, Moon, CreditCard, Users, BookOpen
} from 'lucide-react';
import { PageView } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageView) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  onLogout: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, onNavigate, toggleTheme, isDarkMode, onLogout 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { section: 'Navigation', icon: <LayoutDashboard/>, label: 'Go to Dashboard', action: () => onNavigate(PageView.OVERVIEW) },
    { section: 'Navigation', icon: <Zap/>, label: 'Go to Training', action: () => onNavigate(PageView.TRAINING) },
    { section: 'Navigation', icon: <Box/>, label: 'Go to Model Hub', action: () => onNavigate(PageView.MODEL_HUB) },
    { section: 'Navigation', icon: <Database/>, label: 'Go to Datasets', action: () => onNavigate(PageView.DATASETS) },
    { section: 'Navigation', icon: <ShieldCheck/>, label: 'Go to Mitigation', action: () => onNavigate(PageView.MITIGATION) },
    { section: 'Navigation', icon: <BookOpen/>, label: 'Go to Research', action: () => onNavigate(PageView.RESEARCH) },
    { section: 'Navigation', icon: <Users/>, label: 'Admin Console', action: () => onNavigate(PageView.ADMIN) },
    { section: 'Navigation', icon: <CreditCard/>, label: 'Billing & Plans', action: () => onNavigate(PageView.BILLING) },
    
    { section: 'System', icon: isDarkMode ? <Sun/> : <Moon/>, label: isDarkMode ? 'Light Mode' : 'Dark Mode', action: toggleTheme },
    { section: 'System', icon: <LogOut/>, label: 'Log Out', action: onLogout },
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
           filteredActions[selectedIndex].action();
           onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Reset selection when query changes
  useEffect(() => setSelectedIndex(0), [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            className="flex-1 py-4 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            placeholder="Type a command or search..."
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="hidden sm:flex items-center gap-1">
             <kbd className="px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
             <div className="py-8 text-center text-slate-400 text-sm">No commands found.</div>
          ) : (
             <div className="space-y-1">
                {filteredActions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { item.action(); onClose(); }}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm transition-colors ${
                      idx === selectedIndex 
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-5 h-5 mr-3 flex items-center justify-center ${idx === selectedIndex ? 'text-white' : 'text-slate-400'}`}>
                       {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {idx === selectedIndex && (
                        <span className="ml-auto text-[10px] opacity-70 font-bold uppercase tracking-wider">Enter</span>
                    )}
                  </button>
                ))}
             </div>
          )}
        </div>
        
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
           <span>ProTip: Use arrow keys to navigate</span>
           <span>Qore v2.1</span>
        </div>
      </div>
    </div>
  );
};
