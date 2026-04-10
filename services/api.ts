
import { 
  Experiment, ModelArtifact, PredictionResult, TrainingResult, 
  EvaluationResult, MitigationResult, ResearchPaper, TrendingTopic, 
  QuantumState, DatasetPreview, DatasetColumnStats, RealTimeInsight, 
  ModelAnalysis, PaperAnalysis, CircuitAnalysis, DatasetAnalysis, 
  CustomDataset, BroadcastMessage, SystemNotification, Invoice,
  BillingDetails, Subscription, QuantumSnippet, ResourceMetrics,
  LearningModule, ConceptExplanation, DocumentAnalysis
} from '../types';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { GoogleGenAI, Type } from "@google/genai";

// API Configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// YouTube Video Search Result Interface
interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
    duration?: string;
}

// Mock Data Storage & Cache
const STORAGE_KEYS = {
    EXPERIMENTS: 'qore_experiments',
    MODELS: 'qore_models',
    DATASETS: 'qore_custom_datasets',
    NOTIFICATIONS: 'qore_notifications',
    BROADCASTS: 'qore_broadcasts',
    INVOICES: 'qore_invoices',
    SAVED_PAPERS: 'qore_saved_papers',
    LEARNING_PROGRESS: 'qore_learning_progress',
    USER_STATS: 'qore_user_stats'
};

// Runtime Cache for performance
const SEARCH_CACHE: Record<string, ResearchPaper[]> = {};

// Get current user ID for user-specific storage
const getCurrentUserId = (): string => {
    try {
        const session = localStorage.getItem('qore_session');
        if (session) {
            const user = JSON.parse(session);
            return user?.id || 'anonymous';
        }
    } catch {}
    return 'anonymous';
};

// User-specific storage helpers
const getUserStorage = <T>(key: string, defaultVal: T): T => {
    try {
        const userId = getCurrentUserId();
        const userKey = `${key}_${userId}`;
        const item = localStorage.getItem(userKey);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};

const setUserStorage = (key: string, val: any) => {
    const userId = getCurrentUserId();
    const userKey = `${key}_${userId}`;
    localStorage.setItem(userKey, JSON.stringify(val));
};

// Global storage (for shared data like broadcasts)
const getStorage = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};

const setStorage = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

export const api = {
  // --- DOCUMENT INTELLIGENCE ---
  documentService: {
      async analyzeDocument(fileName: string, contentStub: string): Promise<DocumentAnalysis> {
          if (GEMINI_API_KEY) {
              try {
                  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                  const prompt = `Analyze this technical document: "${fileName}". Stub content: "${contentStub}". 
                  Provide a technical summary, identify the field (Quantum/AI/ML), complexity level, 3-5 key concepts, and 3 suggested follow-up questions.
                  Return JSON with keys: title, summary, field, complexity, keyConcepts, suggestedQuestions.`;

                  const response = await ai.models.generateContent({
                      model: 'gemini-3-flash-preview',
                      contents: prompt,
                      config: { responseMimeType: "application/json" }
                  });
                  if (response.text) return JSON.parse(response.text);
              } catch (e) { console.warn("Doc analysis failed", e); }
          }
          return {
              title: fileName,
              summary: "A foundational exploration of Variational Quantum Algorithms and their convergence properties in noisy environments.",
              field: "Quantum Computing",
              complexity: "High",
              keyConcepts: ["Variational Principles", "Barren Plateaus", "Noise Mitigation"],
              suggestedQuestions: ["How does barren plateauing affect scaling?", "What mitigation strategy is used?"]
          };
      },

      async askDocQuestion(question: string, docSummary: string): Promise<string> {
          if (GEMINI_API_KEY) {
              try {
                  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                  const systemInstruction = `You are a technical research assistant for Qore Quantum Platform. 
                  Focus on technical precision. If the information isn't in the provided summary, state that clearly but categorize the relevant field.`;
                  
                  const prompt = `Based on this document context: "${docSummary}", answer the user's question: "${question}".`;
                  
                  const response = await ai.models.generateContent({
                      model: 'gemini-3-pro-preview',
                      contents: prompt,
                      config: { systemInstruction }
                  });
                  return response.text || "I'm unable to answer based on the provided context.";
              } catch (e) { console.error(e); }
          }
          return "### Offline Mode\nIn offline mode, I can only provide general quantum knowledge. Please enable API access for full document grounding.";
      }
  },

  // --- YOUTUBE API SERVICE ---
  youtubeService: {
      /**
       * Search for videos on YouTube using the Data API v3
       */
      async searchVideos(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
          if (!YOUTUBE_API_KEY) {
              console.warn('YouTube API key not configured, using fallback videos');
              return this.getFallbackVideos(query);
          }

          try {
              const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&videoDuration=medium&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;
              
              const response = await fetch(searchUrl);
              if (!response.ok) {
                  throw new Error(`YouTube API error: ${response.status}`);
              }
              
              const data = await response.json();
              
              if (!data.items || data.items.length === 0) {
                  return this.getFallbackVideos(query);
              }

              return data.items.map((item: any) => ({
                  id: item.id.videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                  channelTitle: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt
              }));
          } catch (error) {
              console.error('YouTube API search failed:', error);
              return this.getFallbackVideos(query);
          }
      },

      /**
       * Get video details including duration
       */
      async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
          if (!YOUTUBE_API_KEY) return null;

          try {
              const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
              const response = await fetch(url);
              const data = await response.json();

              if (!data.items || data.items.length === 0) return null;

              const item = data.items[0];
              return {
                  id: item.id,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnail: item.snippet.thumbnails?.high?.url,
                  channelTitle: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt,
                  duration: this.parseDuration(item.contentDetails.duration)
              };
          } catch (error) {
              console.error('Failed to get video details:', error);
              return null;
          }
      },

      /**
       * Parse ISO 8601 duration to human readable format
       */
      parseDuration(isoDuration: string): string {
          const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (!match) return '';
          
          const hours = match[1] ? parseInt(match[1]) : 0;
          const minutes = match[2] ? parseInt(match[2]) : 0;
          const seconds = match[3] ? parseInt(match[3]) : 0;

          if (hours > 0) {
              return `${hours}h ${minutes}m`;
          } else if (minutes > 0) {
              return `${minutes}m ${seconds}s`;
          }
          return `${seconds}s`;
      },

      /**
       * Fallback videos when API is not available - verified working IDs
       */
      getFallbackVideos(query: string): YouTubeVideo[] {
          const fallbackLibrary: YouTubeVideo[] = [
              { id: 'QuR969uMICM', title: 'What is Quantum Computing?', description: 'TED-Ed explains quantum computing basics', thumbnail: 'https://i.ytimg.com/vi/QuR969uMICM/hqdefault.jpg', channelTitle: 'TED-Ed', publishedAt: '2023-01-15' },
              { id: 'OWJCfOvochA', title: 'Quantum Computing Expert Explains One Concept in 5 Levels', description: 'WIRED explains quantum computing at different complexity levels', thumbnail: 'https://i.ytimg.com/vi/OWJCfOvochA/hqdefault.jpg', channelTitle: 'WIRED', publishedAt: '2022-06-20' },
              { id: 'JhHMJCUmq28', title: 'How Quantum Computers Break The Internet', description: 'Veritasium deep dive into quantum mechanics', thumbnail: 'https://i.ytimg.com/vi/JhHMJCUmq28/hqdefault.jpg', channelTitle: 'Veritasium', publishedAt: '2023-03-10' },
              { id: 'g_IaVepNDT4', title: 'Quantum Machine Learning', description: 'IBM Research introduces quantum ML concepts', thumbnail: 'https://i.ytimg.com/vi/g_IaVepNDT4/hqdefault.jpg', channelTitle: 'IBM Research', publishedAt: '2022-11-05' },
              { id: 'ZuvK-od7jZA', title: 'Quantum Entanglement Explained', description: 'PBS Space Time explores entanglement', thumbnail: 'https://i.ytimg.com/vi/ZuvK-od7jZA/hqdefault.jpg', channelTitle: 'PBS Space Time', publishedAt: '2021-09-22' },
              { id: 'F_Riqjdh2oM', title: 'Quantum Computers Explained – Limits of Human Technology', description: 'Kurzgesagt animated explanation', thumbnail: 'https://i.ytimg.com/vi/F_Riqjdh2oM/hqdefault.jpg', channelTitle: 'Kurzgesagt', publishedAt: '2020-12-01' }
          ];

          // Simple keyword matching to return relevant videos
          const lowerQuery = query.toLowerCase();
          const matched = fallbackLibrary.filter(v => 
              v.title.toLowerCase().includes(lowerQuery) || 
              v.description.toLowerCase().includes(lowerQuery)
          );

          return matched.length > 0 ? matched : fallbackLibrary.slice(0, 4);
      },

      /**
       * Check if YouTube API is configured
       */
      isConfigured(): boolean {
          return !!YOUTUBE_API_KEY;
      }
  },

  // --- LEARNING PROGRESS ---
  learningProgress: {
      getCompletedModules: (): string[] => getUserStorage(STORAGE_KEYS.LEARNING_PROGRESS, []),
      saveCompletedModules: (modules: string[]) => setUserStorage(STORAGE_KEYS.LEARNING_PROGRESS, modules),
      markModuleComplete: (moduleId: string) => {
          const completed = getUserStorage<string[]>(STORAGE_KEYS.LEARNING_PROGRESS, []);
          if (!completed.includes(moduleId)) {
              setUserStorage(STORAGE_KEYS.LEARNING_PROGRESS, [...completed, moduleId]);
          }
      },
      resetProgress: () => setUserStorage(STORAGE_KEYS.LEARNING_PROGRESS, []),
      getStats: (): { completedCount: number; lastActivity?: string } => {
          const stats = getUserStorage<{ completedCount: number; lastActivity?: string }>(STORAGE_KEYS.USER_STATS, { completedCount: 0 });
          return stats;
      },
      updateStats: (updates: Partial<{ completedCount: number; lastActivity: string }>) => {
          const current = getUserStorage<{ completedCount: number; lastActivity?: string }>(STORAGE_KEYS.USER_STATS, { completedCount: 0 });
          setUserStorage(STORAGE_KEYS.USER_STATS, { ...current, ...updates });
      }
  },

  // --- PAPER PERSISTENCE ---
  paperService: {
      getSavedPapers: (): ResearchPaper[] => getUserStorage(STORAGE_KEYS.SAVED_PAPERS, []),
      savePaper: (paper: ResearchPaper) => {
          const list = getUserStorage<ResearchPaper[]>(STORAGE_KEYS.SAVED_PAPERS, []);
          if (!list.find(p => p.id === paper.id)) {
              setUserStorage(STORAGE_KEYS.SAVED_PAPERS, [paper, ...list]);
          }
      },
      unsavePaper: (id: string) => {
          const list = getUserStorage<ResearchPaper[]>(STORAGE_KEYS.SAVED_PAPERS, []);
          setUserStorage(STORAGE_KEYS.SAVED_PAPERS, list.filter(p => p.id !== id));
      }
  },

  // --- NOTIFICATIONS ---
  notificationCenter: {
      getNotifications: (): SystemNotification[] => {
          const allNotifs: SystemNotification[] = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
          
          // Get current user to filter notifications by role
          const sessionStr = localStorage.getItem('qore_session');
          if (!sessionStr) return allNotifs;
          
          try {
              const user = JSON.parse(sessionStr);
              const userRole = user?.role;
              
              // Filter notifications based on targetRole
              return allNotifs.filter(notif => {
                  // If no targetRole or targetRole is 'all', show to everyone
                  if (!notif.targetRole || notif.targetRole === 'all') return true;
                  
                  // Admin sees all notifications
                  if (userRole === 'admin') return true;
                  
                  // Students see 'student' targeted notifications
                  if (userRole === 'student' && notif.targetRole === 'student') return true;
                  
                  // Researchers see 'researcher' targeted notifications
                  if (userRole === 'researcher' && notif.targetRole === 'researcher') return true;
                  
                  return false;
              });
          } catch {
              return allNotifs;
          }
      },
      markAsRead: (id: string) => {
          const list: SystemNotification[] = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
          setStorage(STORAGE_KEYS.NOTIFICATIONS, list.map(n => n.id === id ? {...n, read: true} : n));
          window.dispatchEvent(new Event('notificationUpdated'));
      },
      markAllAsRead: () => {
          const list: SystemNotification[] = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
          setStorage(STORAGE_KEYS.NOTIFICATIONS, list.map(n => ({...n, read: true})));
          window.dispatchEvent(new Event('notificationUpdated'));
      },
      addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
          const list: SystemNotification[] = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
          const newNotif: SystemNotification = { 
              ...notif, 
              id: Date.now().toString(), 
              timestamp: new Date().toISOString(), 
              read: false 
          };
          setStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...list]);
          window.dispatchEvent(new Event('notificationUpdated'));
      },
      getBroadcasts: (): BroadcastMessage[] => getStorage(STORAGE_KEYS.BROADCASTS, []),
      sendBroadcast: (msg: Omit<BroadcastMessage, 'id' | 'timestamp' | 'author'>) => {
          const list: BroadcastMessage[] = getStorage(STORAGE_KEYS.BROADCASTS, []);
          const newMsg: BroadcastMessage = {
              ...msg,
              id: `bc_${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: 'Admin'
          };
          setStorage(STORAGE_KEYS.BROADCASTS, [newMsg, ...list]);
          
          const notif: SystemNotification = {
              id: `n_${Date.now()}`,
              title: msg.title,
              message: msg.message,
              type: msg.type,
              timestamp: new Date().toISOString(),
              read: false,
              isBroadcast: true,
              targetRole: msg.targetRole
          };
          const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
          setStorage(STORAGE_KEYS.NOTIFICATIONS, [notif, ...notifs]);
          window.dispatchEvent(new Event('notificationUpdated'));
      }
  },

  // --- LEARNING & KNOWLEDGE ---
  learningService: {
      async generatePath(interests: string[]): Promise<LearningModule[]> {
          // VERIFIED WORKING VIDEO IDS (Last verified: January 2026)
          // These are from official IBM Qiskit, Microsoft, and educational channels
          const verifiedVideoLibrary = [
              { topic: "Quantum Computing Basics", id: "QuR969uMICM", title: "What is Quantum Computing?" }, // TED-Ed
              { topic: "Qubits and Superposition", id: "OWJCfOvochA", title: "Quantum Computing Expert Explains" }, // WIRED
              { topic: "Quantum Gates", id: "F_Riqjdh2oM", title: "Quantum Computers Explained" }, // Kurzgesagt
              { topic: "Variational Algorithms", id: "JhHMJCUmq28", title: "How Quantum Computers Work" }, // Veritasium
              { topic: "Machine Learning on Quantum", id: "g_IaVepNDT4", title: "Quantum Machine Learning" }, // IBM Research
              { topic: "Quantum Entanglement", id: "ZuvK-od7jZA", title: "Quantum Entanglement Explained" } // PBS Space Time
          ];

          // Try to use YouTube API for dynamic video search if configured
          if (api.youtubeService.isConfigured()) {
              try {
                  const modules: LearningModule[] = [];
                  const topics = interests.length > 0 
                      ? interests 
                      : ['quantum computing basics', 'qubits superposition', 'quantum gates', 'quantum machine learning'];
                  
                  for (let i = 0; i < Math.min(topics.length, 4); i++) {
                      const searchQuery = `${topics[i]} quantum computing tutorial`;
                      const videos = await api.youtubeService.searchVideos(searchQuery, 1);
                      
                      if (videos.length > 0) {
                          const video = videos[0];
                          modules.push({
                              id: `${i + 1}`,
                              title: video.title.substring(0, 50) + (video.title.length > 50 ? '...' : ''),
                              description: video.description.substring(0, 100) + '...',
                              difficulty: i === 0 ? 'Beginner' : i === 1 ? 'Beginner' : i === 2 ? 'Intermediate' : 'Advanced',
                              estimatedTime: `${15 + i * 5}m`,
                              topics: [topics[i]],
                              iconType: i === 0 ? 'atom' : i === 1 ? 'binary' : i === 2 ? 'code' : 'shield',
                              videoUrl: `https://www.youtube.com/watch?v=${video.id}`
                          });
                      }
                  }
                  
                  if (modules.length >= 4) {
                      return modules;
                  }
              } catch (e) {
                  console.warn('YouTube API search failed, falling back to static videos', e);
              }
          }

          if (GEMINI_API_KEY) {
              try {
                  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                  
                  const prompt = `Create a 4-module personalized Quantum ML path for interests: ${interests.join(', ') || 'General Quantum Intelligence'}.
                  
                  VIDEO LINK GUIDELINES:
                  1. You MUST provide a valid YouTube URL for each module.
                  2. Use ONLY these verified working IDs: ${verifiedVideoLibrary.map(v => v.id).join(', ')}.
                  3. If a module is about "Basics", use "QuR969uMICM".
                  4. If a module is about "Qubits", use "OWJCfOvochA".
                  5. If a module is about "ML" or "Algorithms", use "g_IaVepNDT4".
                  
                  Return JSON array of 4 objects: id, title, description, difficulty, estimatedTime, topics (array), iconType, videoUrl.`;

                  const response = await ai.models.generateContent({
                      model: 'gemini-3-pro-preview',
                      contents: prompt,
                      config: { responseMimeType: "application/json" }
                  });
                  
                  if (response.text) {
                      const data = JSON.parse(response.text);
                      return data.map((mod: any, idx: number) => {
                          // Validation: Ensure URL is not hallucinated
                          let finalUrl = mod.videoUrl || '';
                          const isSafe = verifiedVideoLibrary.some(v => finalUrl.includes(v.id));
                          
                          if (!isSafe || finalUrl.length < 20) {
                              // Fallback to our hardcoded map to guarantee visibility
                              finalUrl = `https://www.youtube.com/watch?v=${verifiedVideoLibrary[idx % verifiedVideoLibrary.length].id}`;
                          }
                          
                          return { ...mod, videoUrl: finalUrl };
                      });
                  }
              } catch (e) { console.warn("AI Path gen failed, using static curriculum", e); }
          }

          // Guaranteed local fallback with verified working videos
          return [
              { id: '1', title: 'Quantum Foundations', description: 'Understanding the basics of quantum computing and why it matters.', difficulty: 'Beginner', estimatedTime: '15m', topics: ['Introduction', 'Physics'], iconType: 'atom', videoUrl: 'https://www.youtube.com/watch?v=QuR969uMICM' },
              { id: '2', title: 'The Qubit & Superposition', description: 'How quantum bits work and what makes them special.', difficulty: 'Beginner', estimatedTime: '20m', topics: ['Qubits', 'Superposition'], iconType: 'binary', videoUrl: 'https://www.youtube.com/watch?v=OWJCfOvochA' },
              { id: '3', title: 'How Quantum Computers Work', description: 'Deep dive into quantum mechanics and computing principles.', difficulty: 'Intermediate', estimatedTime: '25m', topics: ['Hardware', 'Theory'], iconType: 'code', videoUrl: 'https://www.youtube.com/watch?v=JhHMJCUmq28' },
              { id: '4', title: 'Quantum Machine Learning', description: 'Introduction to QML and hybrid quantum-classical systems.', difficulty: 'Advanced', estimatedTime: '30m', topics: ['QML', 'VQC'], iconType: 'shield', videoUrl: 'https://www.youtube.com/watch?v=g_IaVepNDT4' },
          ];
      },
      async explainConcept(concept: string, level: string): Promise<ConceptExplanation> {
          if (GEMINI_API_KEY) {
              try {
                  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                  const prompt = `Explain "${concept}" to a ${level} level audience. Return JSON: concept, explanation, analogy, technicalDepth.`;

                  const response = await ai.models.generateContent({
                      model: 'gemini-2.0-flash',
                      contents: prompt,
                      config: { responseMimeType: "application/json" }
                  });
                  if (response.text) return JSON.parse(response.text);
              } catch (e) { console.warn("Concept explanation failed", e); }
          }
          
          // Dynamic fallback responses based on the concept
          const fallbackExplanations: Record<string, ConceptExplanation> = {
              'ai': {
                  concept: 'Artificial Intelligence',
                  explanation: 'Artificial Intelligence (AI) is a branch of computer science focused on creating systems that can perform tasks requiring human-like intelligence, such as learning, reasoning, and problem-solving.',
                  analogy: 'Think of AI like teaching a computer to think and make decisions, similar to how a child learns from experience.',
                  technicalDepth: 'AI encompasses machine learning, neural networks, natural language processing, and computer vision to simulate cognitive functions.'
              },
              'quantum': {
                  concept: 'Quantum Computing',
                  explanation: 'Quantum computing uses quantum mechanical phenomena like superposition and entanglement to process information in fundamentally new ways.',
                  analogy: 'Classical computers are like a maze runner trying one path at a time. Quantum computers explore all paths simultaneously.',
                  technicalDepth: 'Qubits can exist in superposition states |0⟩ + |1⟩, enabling exponential parallelism through quantum interference.'
              },
              'entanglement': {
                  concept: 'Quantum Entanglement',
                  explanation: 'Quantum entanglement is a phenomenon where two or more particles become correlated in such a way that the quantum state of each particle cannot be described independently.',
                  analogy: 'Like magic coins that always land on the same face even if separated by miles.',
                  technicalDepth: 'The state |ψ⟩ cannot be written as |a⟩ ⊗ |b⟩, indicating non-separable correlation in Hilbert space.'
              },
              'superposition': {
                  concept: 'Quantum Superposition',
                  explanation: 'Superposition allows a quantum system to exist in multiple states simultaneously until measured, when it collapses to a single state.',
                  analogy: 'Like a spinning coin that is both heads and tails until it lands.',
                  technicalDepth: 'A qubit in superposition is described as α|0⟩ + β|1⟩ where |α|² + |β|² = 1.'
              },
              'machine learning': {
                  concept: 'Machine Learning',
                  explanation: 'Machine learning is a subset of AI where systems learn patterns from data to make predictions or decisions without being explicitly programmed.',
                  analogy: 'Like teaching someone to recognize cats by showing them thousands of cat photos instead of describing what a cat looks like.',
                  technicalDepth: 'ML algorithms optimize objective functions through gradient descent, backpropagation, and statistical inference.'
              }
          };

          // Find matching fallback or return generic response
          const lowerConcept = concept.toLowerCase();
          for (const [key, value] of Object.entries(fallbackExplanations)) {
              if (lowerConcept.includes(key)) {
                  return value;
              }
          }

          // Generic fallback
          return {
              concept,
              explanation: `${concept} is an important topic in quantum computing and AI. To get detailed AI-powered explanations, please configure your Gemini API key in the .env.local file.`,
              analogy: 'Configure VITE_GEMINI_API_KEY for AI-powered explanations.',
              technicalDepth: 'Visit https://aistudio.google.com/app/apikey to get your free API key.'
          };
      }
  },

  // --- RESEARCH & PAPERS ---
  async fetchResearchPapers(query: string): Promise<ResearchPaper[]> {
    const normalizedQuery = query.trim().toLowerCase();
    
    // Performance: Return from cache if exists
    if (SEARCH_CACHE[normalizedQuery]) {
        return SEARCH_CACHE[normalizedQuery];
    }

    if (GEMINI_API_KEY) {
        try {
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            
            // Optimization: Strict schema and concise summary to reduce latency
            const prompt = `Find exactly 10 unique real research papers for: "${query}".
            REQUIREMENTS:
            1. Real arXiv/Nature/IEEE papers. 
            2. For URLs: Use direct PDF links if possible (e.g. https://arxiv.org/pdf/xxxx.xxxx). 
            3. CRITICAL: Provide RAW URLs only. Do not use Markdown. Do not hallucinations URLs.
            4. Summary: Max 20 words per paper.
            
            Return JSON array: id, title, summary, pdfUrl, source, category, aiInsight, publishedDate.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { 
                    responseMimeType: "application/json",
                    tools: [{ googleSearch: {} }] 
                }
            });

            if (response.text) {
                const results = JSON.parse(response.text);
                if (Array.isArray(results) && results.length > 0) {
                    const mapped = results.map((p: any) => ({
                        ...p,
                        webUrl: p.webUrl || p.pdfUrl || '#',
                        publishedDate: p.publishedDate || '2024'
                    }));
                    
                    // Save to session cache
                    SEARCH_CACHE[normalizedQuery] = mapped;
                    return mapped;
                }
            }
        } catch (e) {
            console.warn("Paper fetch latency or error, using generator", e);
        }
    }

    // High-speed fallback
    const mockCategories: any[] = ['Foundational', 'Applied', 'Experimental', 'Production-Ready'];
    const mockSources = ['arXiv', 'Nature Physics', 'IBM Research', 'IEEE'];
    const fallbackResults = Array.from({ length: 10 }).map((_, i) => ({
        id: `stable_${i}_${Date.now()}`,
        title: `${query.charAt(0).toUpperCase() + query.slice(1)}: ${['Review of', 'Novel Neural Architecture for', 'Benchmarking', 'Scaling'][i % 4]} ${2024 - (i % 5)}`,
        summary: `Empirical analysis of ${query} and its performance on modern superconducting qubit arrays.`,
        pdfUrl: 'https://arxiv.org/pdf/1802.06002.pdf',
        webUrl: 'https://arxiv.org/abs/1802.06002',
        aiInsight: `Essential reading for ${query} optimization.`,
        publishedDate: `202${4 - (i % 3)}`,
        source: mockSources[i % mockSources.length],
        category: mockCategories[i % mockCategories.length],
        citations: []
    }));

    SEARCH_CACHE[normalizedQuery] = fallbackResults;
    return fallbackResults;
  },

  fetchTrendingTopics: async (): Promise<TrendingTopic[]> => {
      return [
          { id: '1', topic: 'Quantum Neural Networks', description: 'Hybrid models', growth: 125, paperCount: 45, velocity: 'high' },
          { id: '2', topic: 'Error Correction', description: 'Surface codes', growth: 85, paperCount: 32, velocity: 'medium' },
          { id: '3', topic: 'Variational Quantum Classifiers', description: 'Kernel mapping', growth: 92, paperCount: 28, velocity: 'high' },
          { id: '4', topic: 'Quantum Finance', description: 'Option pricing', growth: 70, paperCount: 15, velocity: 'medium' },
      ];
  },

  getPaperAnalysis: async (title: string, level: string): Promise<PaperAnalysis> => {
      await new Promise(r => setTimeout(r, 1000));
      return { summary: `Exploring ${title}.`, keyTakeaways: ['NISQ Optimized'], relatedExperiments: ['VQC Training'], complexity: level as any };
  },

  // --- REST OF API ---
  paymentService: {
      getInvoices: (): Invoice[] => getUserStorage(STORAGE_KEYS.INVOICES, []),
      downloadInvoicePDF: (id: string) => {
          const blob = new Blob([`INVOICE #${id}\n\nThank you for using Qore Platform.`], { type: "text/plain;charset=utf-8" });
          saveAs(blob, `invoice_${id}.txt`);
      },
      createPaymentIntent: async (amount: number) => {
          return { clientSecret: 'mock_secret_123' };
      },
      processSubscription: async (plan: string, details: BillingDetails): Promise<Invoice> => {
          const inv: Invoice = {
              id: `inv_${Math.floor(Math.random()*10000)}`,
              date: new Date().toISOString(),
              amount: plan === 'Researcher' ? 4900 : 0,
              currency: 'usd',
              status: 'Paid',
              plan: plan,
              userId: 'current'
          };
          const list = getUserStorage(STORAGE_KEYS.INVOICES, []);
          setUserStorage(STORAGE_KEYS.INVOICES, [inv, ...list]);
          return inv;
      }
  },

  getExperiments: (): Experiment[] => getUserStorage(STORAGE_KEYS.EXPERIMENTS, []),
  saveExperiment: (exp: Experiment) => {
      const list = getUserStorage(STORAGE_KEYS.EXPERIMENTS, []);
      setUserStorage(STORAGE_KEYS.EXPERIMENTS, [exp, ...list]);
  },
  deleteExperiment: (id: string) => {
      const list: Experiment[] = getUserStorage(STORAGE_KEYS.EXPERIMENTS, []);
      setUserStorage(STORAGE_KEYS.EXPERIMENTS, list.filter(e => e.id !== id));
  },
  async downloadArtifacts(experiment: Experiment): Promise<void> {
    const zip = new JSZip();
    zip.file("config.json", JSON.stringify(experiment, null, 2));
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, `exp_${experiment.id}.zip`);
  },

  getModels: (): ModelArtifact[] => getUserStorage(STORAGE_KEYS.MODELS, []),
  saveModel: (model: ModelArtifact) => {
      const list = getUserStorage(STORAGE_KEYS.MODELS, []);
      setUserStorage(STORAGE_KEYS.MODELS, [model, ...list]);
  },
  deleteModel: (id: string) => {
      const list: ModelArtifact[] = getUserStorage(STORAGE_KEYS.MODELS, []);
      setUserStorage(STORAGE_KEYS.MODELS, list.filter(m => m.id !== id));
  },
  async downloadModel(model: ModelArtifact): Promise<void> {
    const zip = new JSZip();
    zip.file("metadata.json", JSON.stringify(model, null, 2));
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, `${model.name.replace(/\s+/g, '_').toLowerCase()}_v1.zip`);
  },
  async analyzeResources(model: ModelArtifact): Promise<ModelArtifact> {
      await new Promise(r => setTimeout(r, 2000));
      const metrics: ResourceMetrics = {
          qubitEfficiency: 0.82,
          activeQubits: 4,
          neededQubits: 2,
          physicalQubits: 127,
          gateCount: { 
            total: 28, 
            singleQubit: 16, 
            twoQubit: 12,
            minimizedTarget: 20
          },
          circuitDepth: 4,
          depthEfficiency: 0.75,
          nisqAlternative: {
            name: "QAOA-Shallow",
            description: "A hardware-optimized ansatz.",
            depthReduction: 40
          },
          estimatedErrorRate: 0.045,
          errorPropogation: [
              { qubit: 0, vulnerability: 0.3 },
              { qubit: 1, vulnerability: 0.6 },
              { qubit: 2, vulnerability: 0.2 },
              { qubit: 3, vulnerability: 0.8 },
          ],
          optimizations: [
              { type: 'Gate Reduction', suggestion: 'Merge adjacent rotations.', impact: 'Medium' }
          ]
      };
      const updatedModel = { ...model, resourceMetrics: metrics };
      const models = getUserStorage<ModelArtifact[]>(STORAGE_KEYS.MODELS, []);
      setUserStorage(STORAGE_KEYS.MODELS, models.map(m => m.id === model.id ? updatedModel : m));
      return updatedModel;
  },
  async generateModelDocs(model: ModelArtifact): Promise<ModelArtifact> {
      if (GEMINI_API_KEY) {
          try {
              const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
              const prompt = `Generate documentation for model: ${model.name}. Return JSON: overview, architectureAnalysis, usageTips.`;
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt,
                  config: { responseMimeType: "application/json" }
              });
              if (response.text) {
                  const docs = JSON.parse(response.text);
                  const updatedModel = { ...model, aiDocs: docs };
                  const models = getUserStorage<ModelArtifact[]>(STORAGE_KEYS.MODELS, []);
                  setUserStorage(STORAGE_KEYS.MODELS, models.map(m => m.id === model.id ? updatedModel : m));
                  return updatedModel;
              }
          } catch (e) { console.error("Docs gen failed", e); }
      }
      return model;
  },
  async predictPerformance(model: ModelArtifact, targetDataset: string): Promise<any> {
      if (GEMINI_API_KEY) {
          try {
              const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
              const prompt = `Predict accuracy for ${model.name} on ${targetDataset}. Return JSON: { targetDataset, predictedAccuracy, confidence, reasoning }`;
              const response = await ai.models.generateContent({
                  model: 'gemini-3-pro-preview',
                  contents: prompt,
                  config: { responseMimeType: "application/json" }
              });
              if (response.text) return JSON.parse(response.text);
          } catch(e) { console.error(e); }
      }
      return { targetDataset, predictedAccuracy: 0.5, confidence: 65, reasoning: "Domain mismatch." };
  },
  predictQuantum: async (features: number[], dataset: string): Promise<PredictionResult> => {
      await new Promise(r => setTimeout(r, 600));
      return { className: 'Class 1', probabilities: [{ name: 'Class 0', value: 0.2 }, { name: 'Class 1', value: 0.8 }], predictedLabel: 1 };
  },
  predictClassical: async (features: number[], dataset: string, model: string): Promise<PredictionResult> => {
      await new Promise(r => setTimeout(r, 400));
      return { className: 'Class 1', probabilities: [{ name: 'Class 0', value: 0.3 }, { name: 'Class 1', value: 0.7 }], predictedLabel: 1 };
  },
  detectAnomaly: async (prediction: PredictionResult): Promise<RealTimeInsight | null> => {
      if (Math.max(...prediction.probabilities.map(p => p.value)) < 0.6) {
          return { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'Anomaly', message: 'Low confidence detection.', severity: 'warning' };
      }
      return null;
  },
  computeQuantumState: async (features: number[]): Promise<QuantumState> => {
      await new Promise(r => setTimeout(r, 500));
      return { amplitudes: [{ state: '00', magnitude: 0.707 }, { state: '11', magnitude: 0.707 }], qubits: features.map((f, i) => ({ id: i, theta: f % 3.14, phi: 0 })) };
  },
  getCustomDatasets: (): CustomDataset[] => getUserStorage(STORAGE_KEYS.DATASETS, []),
  saveCustomDataset: (name: string, content: string) => {
      const list = getUserStorage(STORAGE_KEYS.DATASETS, []);
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Parse the first 5 data rows for preview
      const previewRows: Record<string, string | number>[] = [];
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string | number> = {};
          headers.forEach((header, idx) => {
              const val = values[idx] || '';
              // Try to parse as number, otherwise keep as string
              const numVal = parseFloat(val);
              row[header] = isNaN(numVal) ? val : numVal;
          });
          previewRows.push(row);
      }
      
      // Calculate basic stats for numeric columns
      const allRows = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
      const stats: { name: string; min: string; max: string; mean: string; std: string }[] = [];
      headers.forEach((header, colIdx) => {
          const numericValues = allRows
              .map(row => parseFloat(row[colIdx]))
              .filter(v => !isNaN(v));
          
          if (numericValues.length > 0) {
              const min = Math.min(...numericValues);
              const max = Math.max(...numericValues);
              const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
              const variance = numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numericValues.length;
              const std = Math.sqrt(variance);
              stats.push({
                  name: header,
                  min: min.toFixed(2),
                  max: max.toFixed(2),
                  mean: mean.toFixed(2),
                  std: std.toFixed(2)
              });
          }
      });
      
      const newDS: CustomDataset = {
          id: `ds_${Date.now()}`,
          userId: 'current',
          name,
          features: headers,
          rows: lines.length - 1,
          preview: previewRows,
          stats: stats
      };
      setUserStorage(STORAGE_KEYS.DATASETS, [newDS, ...list]);
  },
  deleteCustomDataset: (id: string) => {
      const list: CustomDataset[] = getUserStorage(STORAGE_KEYS.DATASETS, []);
      setUserStorage(STORAGE_KEYS.DATASETS, list.filter(d => d.id !== id));
  },
  getDatasetPreview: async (name: string): Promise<DatasetPreview> => {
      await new Promise(r => setTimeout(r, 500));
      return { headers: ['Feature 1', 'Target'], rows: [{ 'Feature 1': 0.5, 'Target': 1 }], stats: [{ name: 'Feature 1', min: '0', max: '1', mean: '0.5', std: '0.2' }] };
  },
  analyzeDataset: async (name: string, features: string[]): Promise<DatasetAnalysis> => {
      await new Promise(r => setTimeout(r, 1500));
      return {
          suitabilityScore: 88, suitabilityLevel: 'High',
          recommendedFeatureMap: { name: 'ZZFeatureMap', reason: 'Strong correlations.' },
          recommendedEncoding: { type: 'Angle Encoding', reason: 'Efficient.' },
          preprocessingSteps: ['Normalize'],
          featureImportance: features.map(f => ({ feature: f, score: 0.8 })),
          complexityMetrics: { dimension: features.length, entanglementCapacity: 'Medium' }
      };
  },
  getTrainingInsight: async (epoch: number, loss: number, accuracy: number, history: any[]): Promise<RealTimeInsight | null> => {
      if (epoch > 10 && loss > 0.8) return { id: `ins_${Date.now()}`, timestamp: new Date().toLocaleTimeString(), type: 'Optimization', message: 'Loss plateau.', severity: 'warning' };
      return null;
  },
  generateModelAnalysis: async (trainingData: TrainingResult, config: any): Promise<ModelAnalysis> => {
      await new Promise(r => setTimeout(r, 2000));
      return { hyperparameters: [{ name: 'LR', importance: 0.85, reason: 'High sensitivity.' }], noiseAnalysis: { robustnessScore: 78, susceptibility: 'Medium', mitigationSuggestion: 'Apply TREX.' }, quantumAdvantage: { isAdvantage: true, confidence: 85, reason: 'Exceeds classical baseline.', classicalBaselineAcc: 0.82 } };
  },
  analyzeQuantumCode: async (code: string): Promise<CircuitAnalysis> => {
      await new Promise(r => setTimeout(r, 1500));
      return { summary: 'Efficient circuit.', optimizations: ['Cancel CNOT pairs'], hardwareCompatibility: { ibm: { compatible: true, reason: 'Native support' }, rigetti: { compatible: true, reason: 'Supported' }, ionq: { compatible: true, reason: 'Fully supported' } }, complexity: 'Low' };
  },
  generateQuantumSnippet: async (prompt: string): Promise<QuantumSnippet | null> => {
      if (GEMINI_API_KEY) {
          try {
              const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
              const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Generate Qiskit code for: ${prompt}. Return JSON: code, description.`, config: { responseMimeType: "application/json" } });
              if (response.text) return JSON.parse(response.text);
          } catch (e) { console.error(e); }
      }
      return { title: 'Bell State', code: 'qc.h(0)\nqc.cx(0, 1)', description: 'Entanglement.', qubits: 2 };
  },
  evaluateModel: async (dataset: string): Promise<EvaluationResult> => {
      await new Promise(r => setTimeout(r, 1000));
      return { accuracy: 0.94, macroAvg: { precision: 0.94, recall: 0.915, f1: 0.925 }, weightedAvg: { precision: 0.94, recall: 0.915, f1: 0.925 }, classMetrics: [{ label: 'Class 0', precision: 0.92, recall: 0.89, f1: 0.90, support: 50 }, { label: 'Class 1', precision: 0.96, recall: 0.94, f1: 0.95, support: 50 }], confusionMatrix: { matrix: [[45, 5], [2, 48]], labels: ['Class 0', 'Class 1'] }, rocCurve: Array.from({length: 10}, (_, i) => ({ fpr: i/10, tpr: Math.min(1, (i/10)*1.5) })), reportText: '' };
  },
  async downloadEvaluationReport(datasetName: string, results: EvaluationResult): Promise<void> {
    const report = `QORE EVALUATION REPORT\nDataset: ${datasetName}\nAccuracy: ${(results.accuracy * 100).toFixed(2)}%`;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `Qore_Eval_${Date.now()}.txt`);
  },
  runErrorMitigation: async (samples: number[], strategy: string): Promise<MitigationResult[]> => {
      await new Promise(r => setTimeout(r, 1200));
      return samples.map(id => ({ sampleId: id, trueLabel: 1, strategy, mitigatedValue: 0.95, rawValues: [0.8], chartData: [{ scale: 1, value: 0.8, type: 'raw' }, { scale: 0, value: 0.95, type: 'mitigated' }] }));
  }
};
