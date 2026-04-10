
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Playground } from './pages/Playground';
import { Training } from './pages/Training';
import { Evaluation } from './pages/Evaluation';
import { ErrorMitigation } from './pages/ErrorMitigation';
import { Research } from './pages/Research';
import { DocInsight } from './pages/DocInsight';
import { Experiments } from './pages/Experiments';
import { ModelHub } from './pages/ModelHub';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Learn } from './pages/Learn';
import { Datasets } from './pages/Datasets';
import { Sweep } from './pages/Sweep';
import { MockOAuth } from './pages/MockOAuth';
import { OAuthCallback } from './pages/OAuthCallback';
import { Billing } from './pages/Billing';
import { AdminBroadcast } from './pages/AdminBroadcast';
import { UserGuide } from './pages/UserGuide';
import { PageView, Notification } from './types';
import { authService } from './services/auth';
import { ToastContainer } from './components/UI';
import { CommandPalette } from './components/CommandPalette';
import { AICopilot } from './components/AICopilot';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mockOAuthProvider, setMockOAuthProvider] = useState<'Google' | 'GitHub' | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Command Palette State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const toggleTheme = () => {
      setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
      const root = window.document.documentElement;
      if (isDarkMode) {
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }, [isDarkMode]);

  // Handle auth check on app load
  useEffect(() => {
    // Check existing session
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
    setIsLoadingAuth(false);
  }, []);

  // Command Palette Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Notification Handler
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  (window as any).notify = notify;

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
  }, [currentPage]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const user = authService.getCurrentUser();
    
    // Auto-redirect admins to the Admin Console
    if (user?.role === 'admin') {
        setCurrentPage(PageView.ADMIN);
        notify('success', 'Welcome back, Administrator.');
    } else {
        setCurrentPage(PageView.OVERVIEW);
        notify('success', 'Welcome back to Qore!');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setShowLanding(true);
    setCurrentPage(PageView.OVERVIEW); 
    notify('info', 'Logged out successfully');
  };

  const handleMockOAuthSuccess = (provider: 'Google' | 'GitHub') => {
      authService.loginWithProvider(provider, 'student'); // Default to student if not specified
      setMockOAuthProvider(null);
      handleLoginSuccess();
  };

  const renderPage = () => {
    // Basic route guard
    const user = authService.getCurrentUser();
    const isActuallyAdmin = user?.role === 'admin' || user?.actualRole === 'admin';
    
    switch (currentPage) {
      case PageView.OVERVIEW: return <Overview onNavigate={setCurrentPage} />;
      case PageView.LEARN: return <Learn onNavigate={setCurrentPage} />;
      case PageView.MODEL_HUB: return <ModelHub onNavigate={setCurrentPage} />;
      case PageView.PLAYGROUND: return <Playground />;
      case PageView.TRAINING: return <Training onNavigate={setCurrentPage} />;
      case PageView.EVALUATION: return <Evaluation />;
      case PageView.MITIGATION: return <ErrorMitigation />;
      case PageView.RESEARCH: return <Research />;
      case PageView.DOC_INSIGHT: return <DocInsight />;
      case PageView.EXPERIMENTS: return <Experiments />;
      case PageView.DATASETS: return <Datasets />;
      case PageView.SWEEP: return <Sweep />;
      case PageView.BILLING: return <Billing />;
      case PageView.USER_GUIDE: return <UserGuide />;
      case PageView.ADMIN: 
          // Guard: Only allow admins (check actualRole for admins viewing as other roles)
          return isActuallyAdmin ? <AdminBroadcast /> : <Overview onNavigate={setCurrentPage} />;
      case PageView.PROFILE: return <Profile onLogout={handleLogout} onNavigate={setCurrentPage} />;
      case PageView.AUTH: return <Auth onLoginSuccess={handleLoginSuccess} onSocialLogin={setMockOAuthProvider} />;
      default: return <Overview onNavigate={setCurrentPage} />;
    }
  };

  if (showLanding && !isAuthenticated) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  // Show loading while checking OAuth callback
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Handle OAuth callback from backend
  if (window.location.pathname === '/auth/callback') {
    return <OAuthCallback onLoginSuccess={handleLoginSuccess} />;
  }

  // Intercept for Mock OAuth flow
  if (mockOAuthProvider) {
      return <MockOAuth provider={mockOAuthProvider} onLogin={() => handleMockOAuthSuccess(mockOAuthProvider)} onCancel={() => setMockOAuthProvider(null)} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Auth onLoginSuccess={handleLoginSuccess} onSocialLogin={setMockOAuthProvider} />
        <ToastContainer notifications={notifications} removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      </>
    );
  }

  return (
    <>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
      
      {/* Global Features */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onNavigate={setCurrentPage}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
      />
      <AICopilot currentPage={currentPage} />
      
      <ToastContainer notifications={notifications} removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
    </>
  );
};

export default App;
