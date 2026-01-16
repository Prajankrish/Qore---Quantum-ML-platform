
import { User } from '../types';

const USERS_KEY = 'qore_users';
const SESSION_KEY = 'qore_session';

const getDefaultProgress = () => ({
    basics: 'in-progress' as const,
    gates: 'locked' as const,
    vqc: 'locked' as const,
    mitigation: 'locked' as const
});

export const authService = {
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    let user = JSON.parse(sessionStr);
    
    // Auto-update subscription based on role if missing (for demo data consistency)
    if (!user.subscription) {
        user.subscription = {
            planId: user.role === 'researcher' ? 'Researcher' : 'Starter',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            usage: { qpuSeconds: 0, qpuLimit: user.role === 'researcher' ? 500 * 3600 : 3600, storageUsedGB: 0, storageLimitGB: user.role === 'researcher' ? 100 : 5 }
        };
    }

    const today = new Date().toDateString();
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
    
    if (lastLogin !== today) {
        const users = this.getUsers();
        const dbUser = users.find(u => u.id === user.id);
        if (dbUser) {
             const yesterday = new Date();
             yesterday.setDate(yesterday.getDate() - 1);
             const yesterdayStr = yesterday.toDateString();
             let newStreak = dbUser.streak || 0;
             if (lastLogin === yesterdayStr) newStreak += 1;
             else newStreak = 1;
             user.streak = newStreak;
             user.lastLoginDate = new Date().toISOString();
             dbUser.streak = newStreak;
             dbUser.lastLoginDate = user.lastLoginDate;
             const updatedUsers = users.map(u => u.id === user.id ? dbUser : u);
             localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
             localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        }
    }

    return user;
  },

  login(email: string, password: string): { success: boolean; message?: string; user?: User } {
    const users = this.getUsers();
    
    // MASTER ADMIN: Strictly defined
    if (email === "prajankrish7@gmail.com" && password === "admin@3267") {
        let adminUser = users.find(u => u.email === email);
        if (!adminUser) {
            adminUser = {
                id: 'master_admin_pk', email, name: 'Prajan Krish', role: 'admin',
                joinedAt: new Date().toISOString(),
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prajan',
                streak: 999, lastLoginDate: new Date().toISOString(),
                progress: { basics: 'completed', gates: 'completed', vqc: 'completed', mitigation: 'completed' }
            };
            users.push(adminUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            localStorage.setItem(`qore_pass_${adminUser.id}`, password);
        } else {
            // Always reset admin role on login to ensure admin access
            adminUser.role = 'admin';
            adminUser.lastLoginDate = new Date().toISOString();
            const updatedUsers = users.map(u => u.id === adminUser!.id ? adminUser! : u);
            localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
    }

    let user = users.find(u => u.email === email);
    if (!user) return { success: false, message: 'User not found' };

    const storedPassword = localStorage.getItem(`qore_pass_${user.id}`);
    if (storedPassword !== password) return { success: false, message: 'Invalid credentials' };

    this.updateStreakOnLogin(user, users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  loginWithProvider(provider: 'Google' | 'GitHub', role: 'student' | 'researcher'): { success: boolean; user?: User } {
    const users = this.getUsers();
    const socialEmail = `user@${provider.toLowerCase()}.com`; 
    let user = users.find(u => u.email === socialEmail);

    if (!user) {
        const newUser: User = {
            id: `user_${Date.now()}`, email: socialEmail, name: `${provider} User`, role: role, 
            joinedAt: new Date().toISOString(), streak: 1, lastLoginDate: new Date().toISOString(),
            progress: getDefaultProgress()
        };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        user = newUser;
    } else {
        this.updateStreakOnLogin(user, users);
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  register(email: string, password: string, name: string, role: 'student' | 'researcher'): { success: boolean; message?: string; user?: User } {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { success: false, message: 'Email already registered' };

    const newUser: User = {
      id: `user_${Date.now()}`, email, name, role, joinedAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, streak: 1, 
      lastLoginDate: new Date().toISOString(), progress: getDefaultProgress()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`qore_pass_${newUser.id}`, password);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  updateProfile(updates: Partial<User>): User | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    // Security Guard: Regular users cannot change their own role via updateProfile
    if (updates.role && currentUser.role !== 'admin') {
        delete updates.role;
    }

    const updatedUser = { ...currentUser, ...updates };
    const users = this.getUsers().map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  updateStreakOnLogin(user: User, allUsers: User[]) {
    const today = new Date().toDateString();
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
    if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        let newStreak = user.streak || 0;
        if (lastLogin === yesterdayStr) newStreak += 1;
        else newStreak = 1;
        user.streak = newStreak;
        user.lastLoginDate = new Date().toISOString();
        const updatedUsers = allUsers.map(u => u.id === user!.id ? user! : u);
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    }
  }
};
