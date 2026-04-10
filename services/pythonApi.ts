/**
 * Qore Platform - Python Backend API Client
 * ==========================================
 * This service ONLY calls the Python FastAPI backend.
 * All business logic, data storage, and AI processing happens in Python.
 * The frontend is just a UI layer.
 */

// Python Backend URL - change this for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (): string | null => {
    const session = localStorage.getItem('qore_session');
    if (session) {
        try {
            const user = JSON.parse(session);
            return user.token || null;
        } catch {
            return null;
        }
    }
    return null;
};

// HTTP client with auth headers
const fetchAPI = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    return response.json();
};

// ==================== PYTHON BACKEND API ====================

export const pythonApi = {
    
    // ==================== AUTHENTICATION ====================
    auth: {
        async register(email: string, password: string, name: string, role: string = 'student') {
            return fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name, role })
            });
        },
        
        async login(email: string, password: string) {
            return fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },
        
        async getMe() {
            return fetchAPI('/auth/me');
        },
        
        async updateProfile(updates: Record<string, any>) {
            return fetchAPI('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        },
        
        getGoogleAuthUrl() {
            return `${API_BASE_URL}/auth/google`;
        },
        
        getGitHubAuthUrl() {
            return `${API_BASE_URL}/auth/github`;
        }
    },
    
    // ==================== EXPERIMENTS ====================
    experiments: {
        async list() {
            return fetchAPI('/experiments');
        },
        
        async create(data: {
            name: string;
            description?: string;
            dataset?: string;
            feature_map?: string;
            ansatz?: string;
            optimizer?: string;
            shots?: number;
            epochs?: number;
        }) {
            return fetchAPI('/experiments', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        async run(experimentId: string) {
            return fetchAPI(`/experiments/${experimentId}/run`, {
                method: 'POST'
            });
        },
        
        async delete(experimentId: string) {
            return fetchAPI(`/experiments/${experimentId}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==================== MODELS ====================
    models: {
        async list() {
            return fetchAPI('/models');
        },
        
        async create(data: {
            name: string;
            description?: string;
            model_type?: string;
            qubits?: number;
            layers?: number;
            config?: Record<string, any>;
        }) {
            return fetchAPI('/models', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        async analyze(modelId: string) {
            return fetchAPI(`/models/${modelId}/analyze`, {
                method: 'POST'
            });
        },
        
        async delete(modelId: string) {
            return fetchAPI(`/models/${modelId}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==================== DATASETS ====================
    datasets: {
        async list() {
            return fetchAPI('/datasets');
        },
        
        async create(name: string, csvContent: string) {
            return fetchAPI('/datasets', {
                method: 'POST',
                body: JSON.stringify({ name, content: csvContent })
            });
        },
        
        async delete(datasetId: string) {
            return fetchAPI(`/datasets/${datasetId}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==================== PREDICTIONS ====================
    predictions: {
        async quantum(features: number[], dataset: string = 'iris') {
            return fetchAPI('/predict/quantum', {
                method: 'POST',
                body: JSON.stringify({ features, dataset })
            });
        },
        
        async classical(features: number[], dataset: string = 'iris', model: string = 'random_forest') {
            return fetchAPI(`/predict/classical?model=${model}`, {
                method: 'POST',
                body: JSON.stringify({ features, dataset })
            });
        },
        
        async computeQuantumState(features: number[]) {
            return fetchAPI('/quantum/state', {
                method: 'POST',
                body: JSON.stringify({ features, dataset: 'iris' })
            });
        }
    },
    
    // ==================== TRAINING ====================
    training: {
        async run(config: {
            dataset: string;
            epochs?: number;
            learning_rate?: number;
            feature_map?: string;
            ansatz?: string;
        }) {
            return fetchAPI('/training/run', {
                method: 'POST',
                body: JSON.stringify(config)
            });
        }
    },
    
    // ==================== EVALUATION ====================
    evaluation: {
        async evaluate(dataset: string = 'iris') {
            return fetchAPI(`/evaluate?dataset=${dataset}`, {
                method: 'POST'
            });
        }
    },
    
    // ==================== ERROR MITIGATION ====================
    mitigation: {
        async run(samples: number[], strategy: string = 'ZNE') {
            return fetchAPI(`/mitigation/run?strategy=${strategy}`, {
                method: 'POST',
                body: JSON.stringify(samples)
            });
        }
    },
    
    // ==================== RESEARCH ====================
    research: {
        async searchPapers(query: string) {
            return fetchAPI(`/research/papers?query=${encodeURIComponent(query)}`);
        },
        
        async getTrending() {
            return fetchAPI('/research/trending');
        },
        
        async getSavedPapers() {
            return fetchAPI('/research/saved');
        },
        
        async savePaper(paper: {
            title: string;
            summary?: string;
            pdf_url?: string;
            web_url?: string;
            source?: string;
            category?: string;
            ai_insight?: string;
            published_date?: string;
        }) {
            return fetchAPI('/research/save', {
                method: 'POST',
                body: JSON.stringify(paper)
            });
        }
    },
    
    // ==================== LEARNING ====================
    learning: {
        async generatePath(interests: string[] = []) {
            return fetchAPI('/learning/path', {
                method: 'POST',
                body: JSON.stringify({ interests })
            });
        },
        
        async explainConcept(concept: string, level: string = 'beginner') {
            return fetchAPI('/learning/explain', {
                method: 'POST',
                body: JSON.stringify({ concept, level })
            });
        }
    },
    
    // ==================== CODE ====================
    code: {
        async analyze(code: string) {
            return fetchAPI('/code/analyze', {
                method: 'POST',
                body: JSON.stringify({ code })
            });
        },
        
        async generate(prompt: string) {
            return fetchAPI('/code/generate', {
                method: 'POST',
                body: JSON.stringify({ prompt })
            });
        }
    },
    
    // ==================== NOTIFICATIONS ====================
    notifications: {
        async list() {
            return fetchAPI('/notifications');
        },
        
        async markAsRead(notificationId: string) {
            return fetchAPI(`/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
        },
        
        async markAllAsRead() {
            return fetchAPI('/notifications/read-all', {
                method: 'PUT'
            });
        }
    },
    
    // ==================== BROADCASTS (Admin) ====================
    broadcasts: {
        async list() {
            return fetchAPI('/broadcasts');
        },
        
        async send(data: {
            title: string;
            message: string;
            type?: string;
            target_role?: string;
        }) {
            return fetchAPI('/broadcasts', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
    },
    
    // ==================== BILLING ====================
    billing: {
        async getInvoices() {
            return fetchAPI('/billing/invoices');
        },
        
        async subscribe(plan: string) {
            return fetchAPI('/billing/subscribe', {
                method: 'POST',
                body: JSON.stringify({ plan })
            });
        }
    },
    
    // ==================== HEALTH CHECK ====================
    async healthCheck() {
        return fetchAPI('/health');
    },
    
    async getApiInfo() {
        return fetchAPI('/');
    }
};

// Export as default for easy importing
export default pythonApi;
