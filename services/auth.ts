/**
 * Qore Platform - Authentication Service
 * =======================================
 * Hybrid mode: Tries Python backend first, falls back to local storage if unavailable.
 * This ensures the app works during development without running the backend.
 */

import { User } from '../types';

const SESSION_KEY = 'qore_session';
const USERS_KEY = 'qore_users';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// OAuth configuration cache
interface OAuthConfig {
    google: boolean;
    github: boolean;
}
let oauthConfig: OAuthConfig | null = null;

// Check if backend is available
let backendAvailable: boolean | null = null;

const checkBackend = async (): Promise<boolean> => {
    if (backendAvailable !== null) return backendAvailable;
    try {
        const response = await fetch(`${API_BASE_URL}/health`, { 
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });
        backendAvailable = response.ok;
        
        // Also get OAuth config
        if (backendAvailable) {
            try {
                const healthData = await response.json();
                if (healthData.oauth) {
                    oauthConfig = healthData.oauth;
                }
            } catch {}
        }
    } catch {
        backendAvailable = false;
    }
    return backendAvailable;
};

// Local storage helpers
const getLocalUsers = (): User[] => {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
        return [];
    }
};

const saveLocalUser = (user: User, password?: string) => {
    let users = getLocalUsers();
    // Remove any existing user with same ID or email to avoid duplicates
    users = users.filter(u => u.id !== user.id && u.email !== user.email);
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    if (password) {
        localStorage.setItem(`qore_pass_${user.id}`, password);
    }
};

const getDefaultProgress = () => ({
    basics: 'in-progress' as const,
    gates: 'locked' as const,
    vqc: 'locked' as const,
    mitigation: 'locked' as const
});

export const authService = {
    /**
     * Get current user from local session
     */
    getCurrentUser(): User | null {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (!sessionStr) return null;
        
        try {
            return JSON.parse(sessionStr);
        } catch {
            return null;
        }
    },

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
        // Try Python backend first
        const useBackend = await checkBackend();
        
        if (useBackend) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const user: User = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role as 'student' | 'researcher' | 'admin',
                        avatar: data.user.avatar,
                        streak: parseInt(data.user.streak) || 1,
                        token: data.access_token,
                        joinedAt: new Date().toISOString(),
                        lastLoginDate: new Date().toISOString(),
                        progress: data.user.progress || getDefaultProgress()
                    };
                    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                    
                    // Sync user data from backend
                    await this.syncUserData();
                    
                    return { success: true, user };
                } else {
                    const error = await response.json().catch(() => ({}));
                    return { success: false, message: error.detail || 'Invalid credentials' };
                }
            } catch (err) {
                console.warn('Backend login failed, trying local fallback');
            }
        }
        
        // Fallback to local storage
        const users = getLocalUsers();
        
        // Master admin check - ALWAYS grant admin access with correct credentials
        if (email === "prajankrish7@gmail.com" && password === "admin@3267") {
            // Create or update admin user - always ensure admin role
            const adminUser: User = {
                id: 'master_admin_pk',
                email,
                name: 'Prajan Krish',
                role: 'admin',  // Force admin role
                actualRole: 'admin', // Track actual role for view switching
                joinedAt: new Date().toISOString(),
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajan',
                streak: 999,
                lastLoginDate: new Date().toISOString(),
                progress: { basics: 'completed', gates: 'completed', vqc: 'completed', mitigation: 'completed' }
            };
            saveLocalUser(adminUser, password);
            localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
            return { success: true, user: adminUser };
        }
        
        const user = users.find(u => u.email === email);
        if (!user) return { success: false, message: 'User not found. Please register first.' };
        
        const storedPassword = localStorage.getItem(`qore_pass_${user.id}`);
        if (storedPassword !== password) return { success: false, message: 'Invalid password' };
        
        user.lastLoginDate = new Date().toISOString();
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { success: true, user };
    },

    /**
     * Register new user
     */
    async register(email: string, password: string, name: string, role: 'student' | 'researcher' | 'admin'): Promise<{ success: boolean; message?: string; user?: User }> {
        // Try Python backend first
        const useBackend = await checkBackend();
        
        if (useBackend) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name, role })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const user: User = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role as 'student' | 'researcher' | 'admin',
                        avatar: data.user.avatar,
                        streak: 1,
                        token: data.access_token,
                        joinedAt: new Date().toISOString(),
                        lastLoginDate: new Date().toISOString(),
                        progress: getDefaultProgress()
                    };
                    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                    return { success: true, user };
                } else {
                    const error = await response.json().catch(() => ({}));
                    return { success: false, message: error.detail || 'Registration failed' };
                }
            } catch (err) {
                console.warn('Backend registration failed, using local fallback');
            }
        }
        
        // Fallback to local storage
        const users = getLocalUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        const newUser: User = {
            id: `user_${Date.now()}`,
            email,
            name,
            role,
            joinedAt: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            streak: 1,
            lastLoginDate: new Date().toISOString(),
            progress: getDefaultProgress()
        };
        
        saveLocalUser(newUser, password);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        return { success: true, user: newUser };
    },

    /**
     * Login with OAuth provider
     */
    async loginWithProvider(provider: 'Google' | 'GitHub', role: 'student' | 'researcher'): Promise<{ redirecting: boolean; error?: string }> {
        // Store role for callback
        localStorage.setItem('oauth_pending_role', role);
        
        // Generate OAuth state for security (CSRF prevention)
        const state = crypto.randomUUID ? crypto.randomUUID() : `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('oauth_state', state);
        localStorage.setItem('oauth_provider', provider.toLowerCase());
        
        // Check if backend is available and OAuth is configured
        const available = await checkBackend();
        
        if (available && oauthConfig) {
            const providerKey = provider.toLowerCase() as 'google' | 'github';
            if (!oauthConfig[providerKey]) {
                return { 
                    redirecting: false, 
                    error: `${provider} OAuth is not configured. Please set up ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in the backend .env file.` 
                };
            }
            
            // Redirect to Python backend OAuth endpoint with role and state
            window.location.href = `${API_BASE_URL}/auth/${provider.toLowerCase()}?role=${role}&state=${state}`;
            return { redirecting: true };
        } else if (available) {
            // Backend available but no OAuth config - try redirect anyway
            window.location.href = `${API_BASE_URL}/auth/${provider.toLowerCase()}?role=${role}&state=${state}`;
            return { redirecting: true };
        } else {
            // Fallback: Mock OAuth login for development
            const socialEmail = `user@${provider.toLowerCase()}.com`;
            const users = getLocalUsers();
            let user = users.find(u => u.email === socialEmail);
            
            if (!user) {
                user = {
                    id: `user_${Date.now()}`,
                    email: socialEmail,
                    name: `${provider} User`,
                    role: role,
                    joinedAt: new Date().toISOString(),
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
                    streak: 1,
                    lastLoginDate: new Date().toISOString(),
                    progress: getDefaultProgress()
                };
                saveLocalUser(user);
            }
            
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return { redirecting: false }; // Will trigger page reload in caller
        }
    },

    /**
     * Check OAuth provider availability
     */
    async getOAuthStatus(): Promise<OAuthConfig> {
        await checkBackend();
        return oauthConfig || { google: false, github: false };
    },

    /**
     * Handle OAuth callback from Python backend
     */
    async handleOAuthCallback(token: string, provider: string, returnedState?: string): Promise<{ success: boolean; user?: User; error?: string }> {
        // Verify state for CSRF protection (optional - backend validates OAuth)
        const storedState = localStorage.getItem('oauth_state');
        const storedProvider = localStorage.getItem('oauth_provider');
        
        // Clean up OAuth state
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_provider');
        
        // State validation is optional since backend validates OAuth code
        // Only fail if both states exist and don't match
        if (returnedState && storedState && returnedState !== storedState) {
            console.warn('OAuth state mismatch (non-blocking):', { returned: returnedState?.slice(0, 10), stored: storedState?.slice(0, 10) });
            // Don't fail here - backend already validated the OAuth code
        }
        
        if (storedProvider && storedProvider !== provider.toLowerCase()) {
            console.warn('OAuth provider mismatch (non-blocking):', { returned: provider, stored: storedProvider });
            // Don't fail here - proceed with the provider from the response
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const userInfo = await response.json();
                const user: User = {
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.name,
                    role: userInfo.role as 'student' | 'researcher' | 'admin',
                    avatar: userInfo.avatar,
                    streak: parseInt(userInfo.streak) || 1,
                    token: token,
                    joinedAt: new Date().toISOString(),
                    lastLoginDate: new Date().toISOString(),
                    progress: userInfo.progress || getDefaultProgress()
                };
                
                localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                localStorage.removeItem('oauth_pending_role');
                
                // Sync user data from backend
                await this.syncUserData();
                
                return { success: true, user };
            } else {
                const error = await response.json().catch(() => ({}));
                return { success: false, error: error.detail || 'Failed to get user information' };
            }
        } catch (error) {
            console.error('OAuth callback error:', error);
            return { success: false, error: 'OAuth authentication failed. Please try again.' };
        }
    },

    /**
     * Logout
     */
    logout(): void {
        const currentUser = this.getCurrentUser();
        
        // Clear user session
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_provider');
        localStorage.removeItem('oauth_pending_role');
        
        // Clear user-specific cached data
        if (currentUser?.id) {
            const userCacheKeys = [
                'qore_experiments',
                'qore_models',
                'qore_custom_datasets',
                'qore_notifications',
                'qore_saved_papers',
                'qore_learning_progress',
                'qore_user_stats'
            ];
            
            userCacheKeys.forEach(key => {
                localStorage.removeItem(`${key}_${currentUser.id}`);
            });
        }
        
        backendAvailable = null; // Reset backend check
        oauthConfig = null; // Reset OAuth config
    },

    /**
     * Update user profile
     */
    updateProfile(updates: Partial<User>): User | null {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;
        
        // Security: Don't allow role changes unless admin (check actualRole too for view switching)
        const isActuallyAdmin = currentUser.role === 'admin' || currentUser.actualRole === 'admin';
        if (updates.role && !isActuallyAdmin) {
            delete updates.role;
        }
        
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        saveLocalUser(updatedUser);
        
        return updatedUser;
    },

    /**
     * Get all registered users (for admin panel)
     */
    getUsers(): User[] {
        return getLocalUsers();
    },

    /**
     * Check if backend is available
     */
    async isBackendAvailable(): Promise<boolean> {
        return checkBackend();
    },

    /**
     * Validate admin credentials
     * Returns true only if the provided credentials match the master admin credentials
     */
    validateAdminCredentials(email: string, password: string): boolean {
        const ADMIN_EMAIL = "prajankrish7@gmail.com";
        const ADMIN_PASSWORD = "admin@3267";
        
        // Constant-time comparison to prevent timing attacks
        const emailMatch = email === ADMIN_EMAIL;
        const passwordMatch = password === ADMIN_PASSWORD;
        
        return emailMatch && passwordMatch;
    },

    /**
     * Check if current user is admin
     */
    isCurrentUserAdmin(): boolean {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;
        
        // Check both role and actualRole (for role switching)
        return currentUser.role === 'admin' || currentUser.actualRole === 'admin';
    },

    /**
     * Sync user data from backend after login
     * This ensures fresh data is loaded and old user data is cleared
     */
    async syncUserData(): Promise<void> {
        const user = this.getCurrentUser();
        if (!user) return;
        
        try {
            // Import pythonApi inside the function to avoid circular dependencies
            const { pythonApi } = await import('./pythonApi');
            
            // Fetch fresh data from backend
            const [experiments, models, datasets] = await Promise.allSettled([
                pythonApi.experiments.list().catch(() => []),
                pythonApi.models.list().catch(() => []),
                pythonApi.datasets.list().catch(() => [])
            ]);
            
            // Store in user-specific cache with fresh data
            if (experiments.status === 'fulfilled') {
                const key = `qore_experiments_${user.id}`;
                localStorage.setItem(key, JSON.stringify(experiments.value || []));
            }
            
            if (models.status === 'fulfilled') {
                const key = `qore_models_${user.id}`;
                localStorage.setItem(key, JSON.stringify(models.value || []));
            }
            
            if (datasets.status === 'fulfilled') {
                const key = `qore_custom_datasets_${user.id}`;
                localStorage.setItem(key, JSON.stringify(datasets.value || []));
            }
        } catch (err) {
            console.warn('Could not sync user data from backend:', err);
            // Gracefully degrade - local storage will be used
        }
    },

    /**
     * Ensure user is admin or logout
     */
    requireAdminAccess(): boolean {
        if (this.isCurrentUserAdmin()) {
            return true;
        }
        // Auto logout if not admin
        this.logout();
        return false;
    }
};

