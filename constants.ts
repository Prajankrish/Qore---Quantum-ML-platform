
import { 
  LayoutDashboard, BookOpen, Database, 
  Cpu, Sliders, Zap, Activity, ShieldCheck, 
  Box, Archive, GraduationCap, PlayCircle, HelpCircle, FileText
} from 'lucide-react';

export const COLORS = {
  primary: '#7c3aed', // Violet 600
  primarySoft: '#f5f3ff', // Violet 50
  secondary: '#10b981', // Emerald 500
  secondarySoft: '#ecfdf5', // Emerald 50
  accent: '#6366f1', // Indigo 500
  textPrimary: '#1e293b', // Slate 800
  textSecondary: '#64748b', // Slate 500
  background: '#f8fafc', // Slate 50
  card: '#ffffff',
  border: '#e2e8f0', // Slate 200
  
  // Chart Colors (Pastel-ish)
  quantum: '#8b5cf6', // Violet 500
  classical: '#f59e0b', // Amber 500
  loss: '#f43f5e', // Rose 500
  accuracy: '#10b981', // Emerald 500
};

export const MOCK_DELAY = 800; // ms to simulate API call

// Grouped Navigation for Sidebar
export const RESEARCHER_SIDEBAR = [
  {
    group: "Dashboard",
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard }
    ]
  },
  {
    group: "Discovery & Data",
    items: [
      { id: 'research', label: 'Research Lab', icon: BookOpen },
      { id: 'doc_insight', label: 'Doc Intelligence', icon: FileText },
      { id: 'datasets', label: 'Datasets', icon: Database }
    ]
  },
  {
    group: "Studio",
    items: [
      { id: 'playground', label: 'Playground', icon: Cpu },
      { id: 'sweep', label: 'HP Sweep', icon: Sliders }
    ]
  },
  {
    group: "Execution",
    items: [
      { id: 'training', label: 'Training', icon: Zap },
      { id: 'evaluation', label: 'Evaluation', icon: Activity },
      { id: 'mitigation', label: 'Mitigation', icon: ShieldCheck }
    ]
  },
  {
    group: "Assets",
    items: [
      { id: 'model_hub', label: 'Model Hub', icon: Box },
      { id: 'experiments', label: 'Experiments', icon: Archive }
    ]
  },
  {
    group: "Support",
    items: [
      { id: 'user_guide', label: 'User Guide', icon: HelpCircle }
    ]
  }
];

export const STUDENT_NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'doc_insight', label: 'Study Aid', icon: FileText },
  { id: 'playground', label: 'Playground', icon: PlayCircle },
  { id: 'user_guide', label: 'Guide', icon: HelpCircle },
];

export const DATASET_CONFIGS: Record<string, { name: string; min: number; max: number; step: number; default: number }[]> = {
  "Iris": [
    { name: 'Sepal length', min: 4.3, max: 7.9, step: 0.1, default: 5.1 },
    { name: 'Sepal width', min: 2.0, max: 4.4, step: 0.1, default: 3.5 },
    { name: 'Petal length', min: 1.0, max: 6.9, step: 0.1, default: 1.4 },
    { name: 'Petal width', min: 0.1, max: 2.5, step: 0.1, default: 0.2 },
  ],
  "Wine": [
    { name: 'Alcohol', min: 11.0, max: 15.0, step: 0.1, default: 13.0 },
    { name: 'Malic Acid', min: 0.7, max: 6.0, step: 0.1, default: 2.3 },
    { name: 'Ash', min: 1.3, max: 3.3, step: 0.1, default: 2.4 },
    { name: 'Alcalinity', min: 10, max: 30, step: 0.5, default: 19.5 },
    { name: 'Magnesium', min: 70, max: 162, step: 1, default: 98 },
  ],
  "Breast Cancer": [
    { name: 'Mean Radius', min: 6.0, max: 28.0, step: 0.1, default: 14.0 },
    { name: 'Mean Texture', min: 9.0, max: 40.0, step: 0.1, default: 19.0 },
    { name: 'Mean Perimeter', min: 40, max: 190, step: 1, default: 90 },
    { name: 'Mean Area', min: 140, max: 2500, step: 10, default: 650 },
    { name: 'Mean Smoothness', min: 0.05, max: 0.2, step: 0.001, default: 0.1 },
  ],
  "Diabetes (Pima)": [
    { name: 'Pregnancies', min: 0, max: 17, step: 1, default: 1 },
    { name: 'Glucose', min: 0, max: 199, step: 1, default: 110 },
    { name: 'Blood Pressure', min: 0, max: 122, step: 1, default: 72 },
    { name: 'BMI', min: 0, max: 67, step: 0.1, default: 25 },
    { name: 'Age', min: 21, max: 81, step: 1, default: 30 }
  ],
  "Heart Disease": [
    { name: 'Age', min: 29, max: 77, step: 1, default: 55 },
    { name: 'Resting BP', min: 94, max: 200, step: 1, default: 130 },
    { name: 'Cholesterol', min: 126, max: 564, step: 1, default: 240 },
    { name: 'Max Heart Rate', min: 71, max: 202, step: 1, default: 150 }
  ],
  "Bank Note Auth": [
    { name: 'Variance', min: -7.0, max: 6.8, step: 0.1, default: 0.5 },
    { name: 'Skewness', min: -13.7, max: 12.9, step: 0.1, default: -2.0 },
    { name: 'Curtosis', min: -5.3, max: 17.9, step: 0.1, default: 2.5 },
    { name: 'Entropy', min: -8.5, max: 2.4, step: 0.1, default: -0.5 }
  ],
  "Sonar (Mines vs Rocks)": [
    { name: 'PCA Comp 1', min: -2.0, max: 2.0, step: 0.01, default: 0.2 },
    { name: 'PCA Comp 2', min: -2.0, max: 2.0, step: 0.01, default: -0.1 },
    { name: 'PCA Comp 3', min: -2.0, max: 2.0, step: 0.01, default: 0.05 },
    { name: 'PCA Comp 4', min: -2.0, max: 2.0, step: 0.01, default: 0.12 }
  ],
  "Titanic Survival": [
    { name: 'Class (1-3)', min: 1, max: 3, step: 1, default: 3 },
    { name: 'Age', min: 0, max: 80, step: 1, default: 25 },
    { name: 'Siblings/Spouse', min: 0, max: 8, step: 1, default: 0 },
    { name: 'Fare', min: 0, max: 512, step: 1, default: 15 }
  ],
  "Wheat Seeds": [
    { name: 'Area', min: 10, max: 22, step: 0.1, default: 15 },
    { name: 'Perimeter', min: 12, max: 18, step: 0.1, default: 14 },
    { name: 'Compactness', min: 0.8, max: 1.0, step: 0.01, default: 0.87 },
    { name: 'Kernel Length', min: 4.5, max: 6.7, step: 0.1, default: 5.5 }
  ],
  "Glass Identification": [
    { name: 'Refractive Index', min: 1.51, max: 1.54, step: 0.001, default: 1.518 },
    { name: 'Sodium (Na)', min: 10, max: 18, step: 0.1, default: 13.5 },
    { name: 'Magnesium (Mg)', min: 0, max: 4.5, step: 0.1, default: 3.0 },
    { name: 'Aluminum (Al)', min: 0, max: 3.5, step: 0.1, default: 1.5 }
  ],
  "California Housing (Class)": [
    { name: 'Med Income', min: 0, max: 15, step: 0.1, default: 3.5 },
    { name: 'House Age', min: 1, max: 52, step: 1, default: 25 },
    { name: 'Ave Rooms', min: 1, max: 10, step: 0.1, default: 5.4 },
    { name: 'Latitude', min: 32, max: 42, step: 0.1, default: 34 }
  ],
  "Stellar Classification (SDSS)": [
    { name: 'Alpha (RA)', min: 0, max: 360, step: 1, default: 180 },
    { name: 'Delta (Dec)', min: -90, max: 90, step: 1, default: 45 },
    { name: 'Redshift', min: -0.01, max: 7, step: 0.01, default: 0.5 },
    { name: 'u-Band Filter', min: 15, max: 30, step: 0.1, default: 22 },
    { name: 'g-Band Filter', min: 15, max: 30, step: 0.1, default: 20 }
  ],
  "Ionosphere": [
    { name: 'Pulse 1', min: -1, max: 1, step: 0.1, default: 1 },
    { name: 'Pulse 2', min: -1, max: 1, step: 0.1, default: 0 },
    { name: 'Pulse 3', min: -1, max: 1, step: 0.1, default: 0.5 },
    { name: 'Pulse 4', min: -1, max: 1, step: 0.1, default: -0.2 }
  ]
};
