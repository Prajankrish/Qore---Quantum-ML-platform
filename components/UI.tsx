
import React, { useEffect, useState } from 'react';
import { Loader2, CircleHelp, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { Notification } from '../types';

// --- NOTIFICATION TOAST SYSTEM ---
interface ToastContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] animate-fade-in-up transition-all duration-300
            ${n.type === 'success' ? 'bg-white/95 dark:bg-slate-800/95 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 shadow-emerald-100 dark:shadow-emerald-900/20' : 
              n.type === 'error' ? 'bg-white/95 dark:bg-slate-800/95 border-red-100 dark:border-red-900 text-red-800 dark:text-red-400 shadow-red-100 dark:shadow-red-900/20' : 
              'bg-white/95 dark:bg-slate-800/95 border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-400 shadow-blue-100 dark:shadow-blue-900/20'}
          `}
        >
          {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {n.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {n.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <p className="text-sm font-semibold flex-grow">{n.message}</p>
          <button onClick={() => removeNotification(n.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={16}/></button>
        </div>
      ))}
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
         <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500 dark:text-slate-400"/></button>
         </div>
         <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
         </div>
      </div>
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, subtitle, action, ...props }) => (
  <div 
    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-md overflow-hidden ${className}`}
    {...props}
  >
    {(title || action) && (
      <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start bg-slate-50/30 dark:bg-slate-800/30 backdrop-blur-sm">
        <div>
          {title && <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium uppercase tracking-wide">{subtitle}</p>}
        </div>
        {action && <div className="ml-4 flex-shrink-0">{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'soft' | 'ghost' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = "", 
  disabled,
  icon,
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    primary: "border border-transparent text-white bg-violet-600 hover:bg-violet-700 shadow-violet-200 dark:shadow-none shadow-lg hover:shadow-xl focus:ring-violet-500",
    secondary: "border border-transparent text-white bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none shadow-lg hover:shadow-xl focus:ring-emerald-500",
    outline: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm focus:ring-slate-400",
    soft: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-100 dark:border-violet-800 focus:ring-violet-500",
    ghost: "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900 focus:ring-red-500",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
      ) : icon ? (
        <span className="mr-2 -ml-1 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'amber' | 'gray' | 'violet' | 'red'; className?: string }> = ({ children, color = 'gray', className = "" }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900',
    gray: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-900',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; rightElement?: React.ReactNode }> = ({ title, subtitle, rightElement }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
    <div>
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-base text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
    </div>
    {rightElement && <div className="mb-1">{rightElement}</div>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; helpText?: string }> = ({ label, helpText, className = "", ...props }) => (
  <div className="w-full">
    {label && (
      <div className="flex items-center mb-1.5">
        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mr-2">{label}</label>
        {helpText && (
          <div className="group relative">
             <CircleHelp className="w-3.5 h-3.5 text-slate-400 cursor-help" />
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
               {helpText}
             </div>
          </div>
        )}
      </div>
    )}
    <div className="relative">
      <select
        className={`bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100 block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl border appearance-none font-medium shadow-sm ${className}`}
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; helpText?: string }> = ({ label, helpText, className = "", ...props }) => (
  <div className="w-full">
    {label && (
      <div className="flex items-center mb-1.5">
        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mr-2">{label}</label>
        {helpText && (
          <div className="group relative">
             <CircleHelp className="w-3.5 h-3.5 text-slate-400 cursor-help" />
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
               {helpText}
             </div>
          </div>
        )}
      </div>
    )}
    <input
      className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full text-sm border-slate-200 dark:border-slate-700 rounded-xl border px-3 py-2.5 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 ${className}`}
      {...props}
    />
  </div>
);

export const Divider: React.FC = () => (
    <hr className="border-slate-100 dark:border-slate-800 my-6" />
);
