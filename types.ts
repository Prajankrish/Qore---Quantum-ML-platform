
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'researcher' | 'admin';
  actualRole?: 'student' | 'researcher' | 'admin'; // Original role when admin is viewing as another role
  avatar?: string;
  joinedAt: string;
  streak?: number;
  lastLoginDate?: string;
  progress?: {
    basics: 'locked' | 'in-progress' | 'completed';
    gates: 'locked' | 'in-progress' | 'completed';
    vqc: 'locked' | 'in-progress' | 'completed';
    mitigation: 'locked' | 'in-progress' | 'completed';
  };
  subscription?: Subscription;
  savedPaperIds?: string[];
}

export interface Subscription {
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    qpuSeconds: number;
    qpuLimit: number;
    storageUsedGB: number;
    storageLimitGB: number;
  };
}

export interface BillingDetails {
  name: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'system' | 'job' | 'alert' | 'message';
  link?: string;
  isBroadcast?: boolean;
  targetRole?: 'all' | 'student' | 'researcher';
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'job' | 'alert' | 'message';
  targetRole: 'all' | 'student' | 'researcher';
  timestamp: string;
  author: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Open';
  plan: string;
  userId: string;
  pdfUrl?: string;
}

export interface PredictionResult {
  className: string;
  probabilities: { name: string; value: number }[];
  predictedLabel: number;
}

export interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface TrainingResult {
  history: TrainingMetric[];
  finalLoss: number;
  finalAccuracy: number;
  weightsPath: string;
}

export interface ConfusionMatrix {
  matrix: number[][];
  labels: string[];
}

export interface ClassMetric {
  label: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface EvaluationResult {
  accuracy: number;
  macroAvg: { precision: number; recall: number; f1: number };
  weightedAvg: { precision: number; recall: number; f1: number };
  classMetrics: ClassMetric[];
  confusionMatrix: ConfusionMatrix;
  rocCurve: { fpr: number; tpr: number }[];
  reportText: string; // Kept for legacy/fallback
}

export interface MitigationPoint {
  scale: number;
  value: number;
  type: 'raw' | 'mitigated';
}

export interface MitigationResult {
  sampleId: number;
  trueLabel: number;
  strategy: string;
  mitigatedValue: number;
  rawValues: number[];
  chartData: MitigationPoint[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  summary: string;
  pdfUrl: string;
  webUrl: string;
  aiInsight: string;
  publishedDate: string;
  source: string;
  category?: 'Foundational' | 'Applied' | 'Experimental' | 'Production-Ready';
  citations?: string[];
}

export interface TrendingTopic {
  id: string;
  topic: string;
  description: string;
  growth: number;
  paperCount: number;
  velocity: 'high' | 'medium' | 'low';
}

export interface Experiment {
  id: string;
  userId: string;
  name: string;
  timestamp: string;
  dataset: string;
  parameters: {
    epochs: number;
    learningRate: number;
    layers: number;
  };
  metrics: {
    finalLoss: number;
    finalAccuracy: number;
    history: TrainingMetric[];
  };
}

export interface ResourceMetrics {
  qubitEfficiency: number;
  activeQubits: number;
  neededQubits: number;
  physicalQubits: number;
  gateCount: {
    total: number;
    singleQubit: number;
    twoQubit: number;
    minimizedTarget?: number;
  };
  circuitDepth: number;
  depthEfficiency: number;
  nisqAlternative?: {
    name: string;
    description: string;
    depthReduction: number;
  };
  estimatedErrorRate: number;
  errorPropogation: {
    qubit: number;
    vulnerability: number;
  }[];
  optimizations: {
    type: 'Gate Reduction' | 'Depth Minimization' | 'Qubit Routing' | 'Efficiency';
    suggestion: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
}

export interface ModelArtifact {
  id: string;
  userId: string;
  name: string;
  timestamp: string;
  dataset: string;
  type: 'Quantum VQC' | 'Hybrid' | 'Classical';
  parameters: {
    epochs: number;
    learningRate: number;
    layers: number;
    optimizer: string;
  };
  metrics: {
    accuracy: number;
    loss: number;
    history?: TrainingMetric[];
  };
  weights: string;
  aiDocs?: {
    overview: string;
    architectureAnalysis: string;
    usageTips: string;
  };
  transferLearning?: {
    compatibleDatasets: string[];
    isTransferable: boolean;
  };
  resourceMetrics?: ResourceMetrics;
}

export interface PerformancePrediction {
  targetDataset: string;
  predictedAccuracy: number;
  confidence: number;
  reasoning: string;
}

export interface QuantumState {
  amplitudes: { state: string; magnitude: number; phase?: number }[];
  qubits: { id: number; theta: number; phi: number }[];
}

export interface DatasetColumnStats {
  name: string;
  min: string;
  max: string;
  mean: string;
  std: string;
}

export interface CustomDataset {
  id: string;
  userId: string;
  name: string;
  features: string[];
  rows: number;
  preview: Record<string, any>[];
  stats: DatasetColumnStats[];
}

export interface DatasetPreview {
  headers: string[];
  rows: Record<string, any>[];
  stats: DatasetColumnStats[];
}

export enum DatasetName {
  IRIS = "Iris",
  WINE = "Wine",
  BREAST_CANCER = "Breast Cancer",
  DIABETES = "Diabetes (Pima)",
  HEART_DISEASE = "Heart Disease",
  BANK_NOTE = "Bank Note Auth",
  SONAR = "Sonar (Mines vs Rocks)",
  TITANIC = "Titanic Survival",
  WHEAT_SEEDS = "Wheat Seeds",
  GLASS = "Glass Identification",
  CALIFORNIA = "California Housing (Class)",
  STELLAR = "Stellar Classification (SDSS)",
  IONOSPHERE = "Ionosphere"
}

export enum PageView {
  LANDING = "landing",
  AUTH = "auth",
  PROFILE = "profile",
  OVERVIEW = "overview",
  LEARN = "learn",
  PLAYGROUND = "playground",
  TRAINING = "training",
  EVALUATION = "evaluation",
  MITIGATION = "mitigation",
  RESEARCH = "research",
  DOC_INSIGHT = "doc_insight",
  EXPERIMENTS = "experiments",
  MODEL_HUB = "model_hub",
  DATASETS = "datasets",
  SWEEP = "sweep",
  BILLING = "billing",
  ADMIN = "admin",
  USER_GUIDE = "user_guide"
}

export interface DocumentAnalysis {
  title: string;
  summary: string;
  field: string;
  complexity: 'Low' | 'Medium' | 'High';
  keyConcepts: string[];
  suggestedQuestions: string[];
}

export interface SweepConfig {
  learningRates: number[];
  layerCounts: number[];
  epochs: number[];
  trials: number;
  type: 'grid' | 'random';
}

export interface SweepResult {
  config: { lr: number; layers: number; epochs: number };
  finalAccuracy: number;
  finalLoss: number;
  experimentId: string;
}

export interface CircuitAnalysis {
  summary: string;
  optimizations: string[];
  hardwareCompatibility: {
    ibm: { compatible: boolean; reason: string };
    rigetti: { compatible: boolean; reason: string };
    ionq: { compatible: boolean; reason: string };
  };
  complexity: 'Low' | 'Medium' | 'High';
}

export interface QuantumSnippet {
  title: string;
  code: string;
  description: string;
  qubits: number;
}

export interface ModelAnalysis {
  hyperparameters: {
    name: string;
    importance: number;
    reason: string;
  }[];
  noiseAnalysis: {
    robustnessScore: number;
    susceptibility: 'Low' | 'Medium' | 'High';
    mitigationSuggestion: string;
  };
  quantumAdvantage: {
    isAdvantage: boolean;
    confidence: number;
    reason: string;
    classicalBaselineAcc: number;
  };
}

export interface PaperAnalysis {
  summary: string;
  keyTakeaways: string[];
  implementationSketch?: string;
  relatedExperiments: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface DatasetAnalysis {
  suitabilityScore: number;
  suitabilityLevel: 'Low' | 'Medium' | 'High';
  recommendedFeatureMap: {
    name: string;
    reason: string;
  };
  recommendedEncoding: {
    type: 'Angle Encoding' | 'Amplitude Encoding' | 'Basis Encoding';
    reason: string;
  };
  preprocessingSteps: string[];
  featureImportance: {
    feature: string;
    score: number;
  }[];
  complexityMetrics: {
    dimension: number;
    entanglementCapacity: 'Low' | 'Medium' | 'High';
  };
}

export interface RealTimeInsight {
  id: string;
  timestamp: string;
  type: 'Convergence' | 'Anomaly' | 'Optimization' | 'Mitigation';
  message: string;
  severity: 'info' | 'warning' | 'success';
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  topics: string[];
  iconType: 'atom' | 'binary' | 'code' | 'shield';
  videoUrl?: string;
  relatedResources?: { title: string; url: string }[];
}

export interface ConceptExplanation {
  concept: string;
  explanation: string;
  analogy: string;
  technicalDepth: string;
}
