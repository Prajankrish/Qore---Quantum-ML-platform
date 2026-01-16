
import React, { useState, useEffect, useRef } from 'react';
import { Card, SectionTitle, Button, Badge, Select, Modal, Input } from '../components/UI';
import { CircuitVisualizer } from '../components/CircuitVisualizer';
import { BlochSphere } from '../components/BlochSphere';
import { CodeViewer } from '../components/CodeViewer';
import { api } from '../services/api';
import { PredictionResult, DatasetName, QuantumState, DatasetPreview, QuantumSnippet, RealTimeInsight } from '../types';
import { DATASET_CONFIGS, COLORS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Upload, FileUp, Layers, ChevronRight, Activity, Lightbulb, Eye, Sigma, TableProperties, Code, Sparkles, Loader2, BookTemplate, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface FeatureConfig {
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export const Playground: React.FC = () => {
  const [activeDataset, setActiveDataset] = useState<string>(DatasetName.IRIS);
  const [featureConfig, setFeatureConfig] = useState<FeatureConfig[]>(DATASET_CONFIGS[DatasetName.IRIS]);
  const [features, setFeatures] = useState<number[]>([]);
  const [quantumPred, setQuantumPred] = useState<PredictionResult | null>(null);
  const [classicalPred, setClassicalPred] = useState<PredictionResult | null>(null);
  const [classicalModel, setClassicalModel] = useState<string>('Logistic Regression');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStateVis, setShowStateVis] = useState(false);
  const [quantumState, setQuantumState] = useState<QuantumState | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  // Data Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<DatasetPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // AI Insight State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Real-Time Anomaly
  const [anomaly, setAnomaly] = useState<RealTimeInsight | null>(null);

  // Code Viewer State
  const [showCode, setShowCode] = useState(false);
  const [codeData, setCodeData] = useState<any>({ qubits: 4, circuit: [] });

  // AI Library State
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryPrompt, setLibraryPrompt] = useState('');
  const [generatingSnippet, setGeneratingSnippet] = useState(false);

  // Load config from Model Hub if present
  useEffect(() => {
    const savedConfig = localStorage.getItem('active_playground_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.dataset && DATASET_CONFIGS[parsed.dataset]) {
          setActiveDataset(parsed.dataset);
          setFeatureConfig(DATASET_CONFIGS[parsed.dataset]);
          
          if (parsed.modelName) {
              setActiveModel(parsed.modelName);
          }
          
          // Clear it so it doesn't persist forever
          localStorage.removeItem('active_playground_config');
        }
      } catch (e) { console.error("Failed to load config", e); }
    }
  }, []);

  useEffect(() => {
    if (featureConfig) {
      setFeatures(featureConfig.map(f => f.default));
      setQuantumPred(null);
      setClassicalPred(null);
      setQuantumState(null);
      setAiAnalysis(null);
      setAnomaly(null);
      setCodeData({ qubits: featureConfig.length, circuit: [] });
    }
  }, [featureConfig]);

  const handleDatasetChange = (dataset: string) => {
    setActiveDataset(dataset);
    setFileName(null);
    if (DATASET_CONFIGS[dataset]) setFeatureConfig(DATASET_CONFIGS[dataset]);
    // Clear active model if dataset changes manually
    setActiveModel(null);
  };

  const handleFeatureChange = (index: number, value: number) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) { alert("Invalid CSV."); setLoading(false); return; }

        const headers = lines[0].split(',');
        const dataRows = lines.slice(1, 51).map(line => line.split(',').map(parseFloat));
        const newConfigs = headers.slice(0, headers.length - 1).map((name, idx) => {
             const colValues = dataRows.map(row => row[idx]).filter(v => !isNaN(v));
             return {
                 name: name || `Feature ${idx + 1}`,
                 min: Math.floor(Math.min(...colValues)),
                 max: Math.ceil(Math.max(...colValues)),
                 step: 0.1,
                 default: colValues.reduce((a,b)=>a+b,0)/colValues.length
             };
        });

        if (newConfigs.length > 0) { setActiveDataset("Custom"); setFeatureConfig(newConfigs); }
        setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleViewData = async () => {
      setShowPreviewModal(true);
      setLoadingPreview(true);
      try {
          const data = await api.getDatasetPreview(activeDataset);
          setPreviewData(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingPreview(false);
      }
  };

  const runPrediction = async () => {
    setLoading(true);
    setAiAnalysis(null);
    setAnomaly(null);
    try {
      const [q, c] = await Promise.all([
        api.predictQuantum(features, activeDataset),
        api.predictClassical(features, activeDataset, classicalModel)
      ]);
      setQuantumPred(q);
      setClassicalPred(c);
      
      // Auto Anomaly Check
      const anomalyCheck = await api.detectAnomaly(q);
      if (anomalyCheck) setAnomaly(anomalyCheck);

    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const runAiAnalysis = async () => {
      if (!quantumPred || !classicalPred) return;
      setAnalyzing(true);
      
      try {
          if (process.env.API_KEY) {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const prompt = `Analyze this prediction comparison for a Quantum Machine Learning educational tool:
              Dataset: ${activeDataset}
              Features: ${features.join(', ')}
              
              Classical Model (${classicalModel}): Predicted Class ${classicalPred.className} (Conf: ${Math.max(...classicalPred.probabilities.map(p=>p.value)).toFixed(2)})
              Quantum VQC: Predicted Class ${quantumPred.className} (Conf: ${Math.max(...quantumPred.probabilities.map(p=>p.value)).toFixed(2)})
              
              Explain why the VQC might differ or agree. Mention things like "Linear separability vs Quantum Feature Maps" or "Kernel trick". Be concise (2-3 sentences).`;
              
              const response = await ai.models.generateContent({
                  model: 'gemini-3-pro-preview',
                  contents: prompt
              });
              setAiAnalysis(response.text || "Analysis complete.");
          } else {
              // Fallback
              await new Promise(r => setTimeout(r, 1000));
              setAiAnalysis("AI Analysis requires API Key. Generally, VQC models capture non-linear correlations better than simple linear classifiers.");
          }
      } catch (e) {
          setAiAnalysis("Failed to analyze.");
      } finally {
          setAnalyzing(false);
      }
  };

  const computeState = async () => {
    setLoadingState(true);
    try { const qs = await api.computeQuantumState(features); setQuantumState(qs); } 
    catch(e) { console.error(e); } 
    finally { setLoadingState(false); }
  };

  const generateFromLibrary = async () => {
      if (!libraryPrompt.trim()) return;
      setGeneratingSnippet(true);
      try {
          const snippet = await api.generateQuantumSnippet(libraryPrompt);
          if (snippet) {
              setCodeData({ ...codeData, isSnippet: true, snippetCode: snippet.code, snippetAnalysis: snippet.description });
              setShowLibrary(false);
              setShowCode(true);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setGeneratingSnippet(false);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle 
        title="Interactive Playground" 
        subtitle="Experiment with features and visualize quantum interference"
        rightElement={
            <div className="flex gap-2">
                <Button variant="soft" className="h-8 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300" onClick={() => setShowLibrary(true)} icon={<BookTemplate className="w-3 h-3"/>}>AI Circuit Library</Button>
                {activeModel && <Badge color="violet" className="animate-fade-in shadow-sm shadow-violet-200 dark:shadow-none">Active Model: {activeModel}</Badge>}
                <Button variant="outline" className="h-8 text-xs" onClick={() => setShowCode(true)} icon={<Code className="w-3 h-3"/>}>Export Code</Button>
            </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Data Configuration" subtitle="Select or upload a dataset">
            <div className="space-y-5">
                <div className="flex gap-2 items-end">
                    <Select label="Dataset Source" value={activeDataset} onChange={e => handleDatasetChange(e.target.value)} helpText="Choose a pre-loaded dataset or upload CSV." className="flex-grow">
                        {Object.keys(DATASET_CONFIGS).map(key => <option key={key} value={key}>{key}</option>)}
                        <option value="Custom">Custom (Upload CSV)</option>
                    </Select>
                    <Button variant="outline" className="h-[42px] px-3 mb-px" onClick={handleViewData} title="View Data Preview">
                        <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </Button>
                </div>

                <Select label="Classical Baseline" value={classicalModel} onChange={e => setClassicalModel(e.target.value)} helpText="Baseline for comparison.">
                    <option value="Logistic Regression">Logistic Regression</option>
                    <option value="SVM">Support Vector Machine</option>
                    <option value="Random Forest">Random Forest</option>
                </Select>

                <div 
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${fileName ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                    {fileName ? (
                        <div className="animate-pulse">
                            <FileUp className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{fileName}</p>
                        </div>
                    ) : (
                        <div className="group-hover:scale-105 transition-transform">
                            <Upload className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors mb-2" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Custom CSV</p>
                        </div>
                    )}
                </div>
            </div>
          </Card>

          <Card title="Feature Vectors" subtitle="Adjust input parameters">
             <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {featureConfig.map((feat, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate w-32">{feat.name}</span>
                      <span className="font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded text-xs">{features[idx]?.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min={feat.min}
                        max={feat.max}
                        step={feat.step}
                        value={features[idx] || feat.min}
                        onChange={(e) => handleFeatureChange(idx, parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>
                ))}
             </div>
             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
               <Button onClick={runPrediction} isLoading={loading} className="w-full py-3 shadow-lg shadow-violet-200 dark:shadow-none" icon={<Zap className="w-4 h-4" />}>Run Prediction</Button>
             </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card title="VQC Circuit Topology" subtitle={`Ansatz for ${featureConfig.length} qubits`} action={<Badge color="violet">Depth: 4</Badge>}>
             <div className="flex justify-center py-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <CircuitVisualizer qubits={featureConfig.length} layers={4} />
             </div>
          </Card>

           {/* Results */}
           {quantumPred && classicalPred && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <Card className="border-t-4 border-t-violet-500 relative">
                {anomaly && (
                    <div className="absolute top-2 right-2 p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg animate-pulse" title={anomaly.message}>
                        <AlertTriangle className="w-5 h-5"/>
                    </div>
                )}
                <div className="flex justify-between mb-6">
                    <div><h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Quantum VQC</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Variational Classifier</p></div>
                    <Badge color="violet">{quantumPred.className}</Badge>
                </div>
                {anomaly && (
                    <div className="mb-4 text-xs bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 p-2 rounded border border-amber-100 dark:border-amber-800">
                        <strong>AI Alert:</strong> {anomaly.message}
                    </div>
                )}
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quantumPred.probabilities}>
                      <XAxis dataKey="name" tick={{fontSize:12, fill: '#94a3b8'}} axisLine={false} tickLine={false}/>
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{borderRadius:'12px', border:'none', backgroundColor:'#1e293b'}} 
                        itemStyle={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                      <Bar dataKey="value" radius={[6,6,0,0]} barSize={40}>
                        <Cell fill={COLORS.quantum}/>
                        <Cell fill="#e2e8f0"/>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border-t-4 border-t-amber-400">
                <div className="flex justify-between mb-6">
                     <div><h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Classical Prediction</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{classicalModel}</p></div>
                   <Badge color="amber">{classicalPred.className}</Badge>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classicalPred.probabilities}>
                      <XAxis dataKey="name" tick={{fontSize:12, fill: '#94a3b8'}} axisLine={false} tickLine={false}/>
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{borderRadius:'12px', border:'none', backgroundColor:'#1e293b'}} 
                        itemStyle={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                      <Bar dataKey="value" radius={[6,6,0,0]} barSize={40}>
                        <Cell fill={COLORS.classical}/>
                        <Cell fill="#e2e8f0"/>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              {/* Educational Insight Card (Spans 2 columns) */}
              <div className="md:col-span-2">
                 <Card className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-l-4 border-l-blue-500">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow-sm"><Lightbulb className="w-5 h-5"/></div>
                           <div className="flex-grow">
                              <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Comparative Analysis</h4>
                                  <Button 
                                    variant="soft" 
                                    className="text-xs h-8 px-3" 
                                    onClick={runAiAnalysis} 
                                    isLoading={analyzing}
                                    icon={<Sparkles className="w-3 h-3"/>}
                                  >
                                      Analyze with AI
                                  </Button>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                  {aiAnalysis || "Click 'Analyze with AI' to get a deeper insight into why these models might differ."}
                              </p>
                           </div>
                        </div>
                    </div>
                 </Card>
              </div>
            </div>
           )}

          {/* State Inspector */}
          <Card>
             <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowStateVis(!showStateVis)}>
               <div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Quantum State Inspector</h3><p className="text-sm text-slate-500 dark:text-slate-400">Visualize amplitudes</p></div>
               <div className={`p-2 rounded-full bg-slate-50 dark:bg-slate-800 transition-transform ${showStateVis ? 'rotate-90' : ''}`}><ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" /></div>
             </div>
             {showStateVis && (
               <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                  {!quantumState ? (
                     <div className="text-center py-8"><p className="text-slate-500 dark:text-slate-400 mb-4">Requires simulation.</p><Button variant="soft" onClick={computeState} isLoading={loadingState} icon={<Activity className="w-4 h-4"/>}>Compute State</Button></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center"><Layers className="w-4 h-4 mr-2 text-violet-500"/> Amplitudes</h4>
                          <div className="h-48 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-2">
                             <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={quantumState.amplitudes}>
                                 <XAxis dataKey="state" tick={{fontSize:10, fill: '#94a3b8'}} interval={0} />
                                 <Tooltip 
                                   contentStyle={{borderRadius:'12px', backgroundColor:'#1e293b', border:'none'}} 
                                   itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                   labelStyle={{ color: '#94a3b8' }}
                                 />
                                 <Bar dataKey="magnitude" fill={COLORS.primary} radius={[4,4,0,0]} />
                               </BarChart>
                             </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">Student Tip: Taller bars represent higher probability states that the qubit system is likely to collapse into.</p>
                       </div>
                       <div>
                          <div className="flex justify-between items-center mb-4"><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center"><Activity className="w-4 h-4 mr-2 text-emerald-500"/> Bloch Sphere</h4><select className="text-xs border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900" value={selectedQubit} onChange={e => setSelectedQubit(parseInt(e.target.value))}>{quantumState.qubits.map(q => <option key={q.id} value={q.id}>Qubit {q.id}</option>)}</select></div>
                          <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                             <BlochSphere theta={quantumState.qubits[selectedQubit].theta} phi={quantumState.qubits[selectedQubit].phi} />
                          </div>
                       </div>
                    </div>
                  )}
               </div>
             )}
          </Card>
        </div>
      </div>

      {/* DATA PREVIEW MODAL */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title={`Dataset Preview: ${activeDataset}`}>
          {loadingPreview ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Scanning record clusters...</p>
              </div>
          ) : previewData ? (
              <div className="space-y-8">
                  {/* Statistics */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Sigma className="w-4 h-4 text-violet-500"/> Descriptive Statistics
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                          <table className="min-w-full text-xs text-left">
                              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                                  <tr>
                                      <th className="px-4 py-3">Feature</th>
                                      <th className="px-4 py-3">Mean</th>
                                      <th className="px-4 py-3">Std Dev</th>
                                      <th className="px-4 py-3">Min</th>
                                      <th className="px-4 py-3">Max</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {previewData.stats.map((s, i) => (
                                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{s.name}</td>
                                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{s.mean}</td>
                                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{s.std}</td>
                                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{s.min}</td>
                                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{s.max}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>

                  {/* Sample Rows */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <TableProperties className="w-4 h-4 text-emerald-500"/> Sample Distribution
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                          <table className="min-w-full text-xs text-left">
                              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                                  <tr>
                                      {previewData.headers.map((h, i) => (
                                          <th key={i} className="px-4 py-3">{h}</th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {previewData.rows.map((row, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                          {previewData.headers.map((h, i) => (
                                              <td key={i} className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                                                  {row[h]}
                                              </td>
                                          ))}
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          ) : null}
      </Modal>

      {/* AI CIRCUIT LIBRARY MODAL */}
      <Modal isOpen={showLibrary} onClose={() => setShowLibrary(false)} title="AI Circuit Generation Library">
          <div className="space-y-6">
              <div className="p-5 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800">
                  <h4 className="text-sm font-bold text-violet-800 dark:text-violet-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4"/> Natural Language Ansatz Designer
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      Describe your desired quantum circuit behavior, and our AI will generate the appropriate Qiskit code.
                  </p>
                  <div className="flex gap-2">
                      <Input 
                        className="flex-grow bg-white dark:bg-slate-800" 
                        placeholder="e.g., 'Generate a Bell state circuit', 'A ZZFeatureMap with 3 qubits'..." 
                        value={libraryPrompt}
                        onChange={e => setLibraryPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && generateFromLibrary()}
                      />
                      <Button onClick={generateFromLibrary} isLoading={generatingSnippet} icon={<Zap className="w-4 h-4"/>}>Generate</Button>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => { setLibraryPrompt('Bell State (Entanglement)'); generateFromLibrary(); }} className="p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 bg-slate-50 dark:bg-slate-800/50 group transition-all">
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 transition-colors">Bell State</h5>
                      <p className="text-[10px] text-slate-500 mt-1">Foundational 2-qubit entanglement</p>
                  </button>
                  <button onClick={() => { setLibraryPrompt('GHZ State (3 qubits)'); generateFromLibrary(); }} className="p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 bg-slate-50 dark:bg-slate-800/50 group transition-all">
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 transition-colors">GHZ State</h5>
                      <p className="text-[10px] text-slate-500 mt-1">Multi-qubit maximally entangled state</p>
                  </button>
                  <button onClick={() => { setLibraryPrompt('Quantum Teleportation Sketch'); generateFromLibrary(); }} className="p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 bg-slate-50 dark:bg-slate-800/50 group transition-all">
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 transition-colors">Teleportation</h5>
                      <p className="text-[10px] text-slate-500 mt-1">Protocol for state transmission</p>
                  </button>
                  <button onClick={() => { setLibraryPrompt('Hardware Efficient Ansatz (Depth 2)'); generateFromLibrary(); }} className="p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 bg-slate-50 dark:bg-slate-800/50 group transition-all">
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 transition-colors">HEA Template</h5>
                      <p className="text-[10px] text-slate-500 mt-1">Optimal for NISQ machine learning</p>
                  </button>
              </div>
          </div>
      </Modal>

      {/* CODE VIEW MODAL */}
      <CodeViewer isOpen={showCode} onClose={() => setShowCode(false)} mode="circuit" data={codeData} />
    </div>
  );
};
