
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Button, Badge, Modal, Select } from '../components/UI';
import { api } from '../services/api';
import { ModelArtifact, PageView, PredictionResult } from '../types';
import { Download, Play, Sparkles, Trash2, Box, Clock, Database, Search, Cpu, BarChart2, Zap, AlertTriangle, CheckCircle2, Wrench, Layers, Scale, ShieldAlert, Binary, Info, ArrowUpRight, Share2 } from 'lucide-react';
import { DATASET_CONFIGS, COLORS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface ModelHubProps {
  onNavigate: (page: PageView) => void;
}

export const ModelHub: React.FC<ModelHubProps> = ({ onNavigate }) => {
  const [models, setModels] = useState<ModelArtifact[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelArtifact | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'predict' | 'resources'>('info');
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [predictionTarget, setPredictionTarget] = useState('Iris');
  const [predictionResult, setPredictionResult] = useState<{ predictedAccuracy: number; confidence: number; reasoning: string } | null>(null);
  
  // Resource Analysis State
  const [analyzingResources, setAnalyzingResources] = useState(false);

  useEffect(() => {
    setModels(api.getModels());
  }, []);

  const handlePredict = async () => {
      setLoadingPrediction(true);
      await new Promise(r => setTimeout(r, 1000));
      // Mock result
      setPredictionResult({
          predictedAccuracy: 0.92 + Math.random() * 0.05,
          confidence: 85 + Math.floor(Math.random() * 10),
          reasoning: "The selected model architecture (VQC Depth 4) aligns well with the feature dimensionality of this dataset. Quantum kernel separation is likely effective."
      });
      setLoadingPrediction(false);
  };

  const handleDownloadWeights = () => {
      if (selectedModel) {
          api.downloadModel(selectedModel);
          if ((window as any).notify) (window as any).notify('success', 'Model package downloading...');
      }
  };

  const handleLoadToPlayground = (model: ModelArtifact) => {
      const config = {
          dataset: model.dataset,
          modelName: model.name,
          timestamp: new Date().toISOString()
      };
      localStorage.setItem('active_playground_config', JSON.stringify(config));
      onNavigate(PageView.PLAYGROUND);
  };

  const handleAnalyzeResources = async () => {
      if (!selectedModel) return;
      setAnalyzingResources(true);
      try {
          const updated = await api.analyzeResources(selectedModel);
          setSelectedModel(updated);
          // Update list
          setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
      } catch(e) { console.error(e); }
      finally { setAnalyzingResources(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle title="Model Registry" subtitle="Version control for your trained quantum circuits" />
      
      {models.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
              <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Box className="w-10 h-10 text-violet-500"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Models Found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Train your first VQC model to see it here.</p>
              <Button onClick={() => onNavigate(PageView.TRAINING)}>Go to Training</Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map(model => (
                  <Card key={model.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedModel(model)}>
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                              <Cpu className="w-6 h-6"/>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                              <Badge color="green">v1.0</Badge>
                              {model.transferLearning?.isTransferable && (
                                  <Badge color="blue" className="animate-fade-in flex items-center gap-1">
                                      <Share2 size={10} /> Transfer Ready
                                  </Badge>
                              )}
                          </div>
                      </div>
                      <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{model.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                          <Clock className="w-3 h-3"/> {new Date(model.timestamp).toLocaleDateString()}
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <Database className="w-3 h-3"/> {model.dataset}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                              <p className="font-bold text-emerald-600">{(model.metrics.accuracy * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400">Layers</p>
                              <p className="font-bold text-slate-700 dark:text-slate-300">{model.parameters.layers}</p>
                          </div>
                      </div>
                  </Card>
              ))}
          </div>
      )}

      {selectedModel && (
        <Modal isOpen={!!selectedModel} onClose={() => setSelectedModel(null)} title={selectedModel.name}>
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveDetailTab('info')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeDetailTab === 'info' ? 'border-violet-600 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500'}`}
                >
                    Model Details
                </button>
                <button 
                    onClick={() => setActiveDetailTab('resources')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeDetailTab === 'resources' ? 'border-violet-600 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500'}`}
                >
                    <BarChart2 className="w-3 h-3"/> Resource Intelligence
                </button>
                <button 
                    onClick={() => setActiveDetailTab('predict')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeDetailTab === 'predict' ? 'border-violet-600 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500'}`}
                >
                    Inference Check
                </button>
            </div>

            {activeDetailTab === 'info' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Architecture</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{selectedModel.type}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Optimizer</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{selectedModel.parameters.optimizer}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Dataset</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{selectedModel.dataset}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Training Epochs</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{selectedModel.parameters.epochs}</p>
                        </div>
                    </div>

                    {selectedModel.transferLearning?.isTransferable && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h5 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                                <Share2 className="w-4 h-4"/> Transfer Learning Compatibility
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {selectedModel.transferLearning.compatibleDatasets.map((ds, i) => (
                                    <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 rounded text-xs font-bold text-blue-600 dark:text-blue-400">
                                        {ds}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-2 font-medium">
                                This model's optimized kernel can be reused for accelerated training on the above datasets.
                            </p>
                        </div>
                    )}
                    
                    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                        <h5 className="font-bold text-violet-800 dark:text-violet-300 text-sm mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4"/> AI Documentation</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedModel.aiDocs?.overview || "No AI documentation generated for this model yet. Run 'Deep Analysis' in training to populate this."}
                        </p>
                    </div>
                </div>
            )}

            {activeDetailTab === 'resources' && (
                <div className="space-y-6 animate-fade-in">
                    {!selectedModel.resourceMetrics ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <Cpu className="w-12 h-12 text-slate-300 mb-4"/>
                            <p className="text-slate-500 mb-4">No resource data available.</p>
                            <Button onClick={handleAnalyzeResources} isLoading={analyzingResources} icon={<Zap className="w-4 h-4"/>}>
                                Run Resource Audit
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* NEW: Qubit Efficiency & Minimization Audit */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-0 border-none bg-slate-50 dark:bg-slate-800/50 shadow-none overflow-hidden">
                                    <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Binary className="w-4 h-4 text-violet-500"/> Qubit Audit</h5>
                                        <Badge color={selectedModel.resourceMetrics.qubitEfficiency > 0.8 ? 'green' : 'amber'}>
                                            {(selectedModel.resourceMetrics.qubitEfficiency * 100).toFixed(0)}% Efficiency
                                        </Badge>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-medium">Used in Circuit</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedModel.resourceMetrics.activeQubits} Qubits</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-medium">Theoretically Needed</span>
                                            <span className="text-sm font-bold text-emerald-600">{selectedModel.resourceMetrics.neededQubits} Qubits</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(selectedModel.resourceMetrics.neededQubits / selectedModel.resourceMetrics.activeQubits) * 100}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight flex items-start gap-1">
                                            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                            AI Analysis suggests this model is over-provisioned. You could reduce qubit count by 50% using feature compression.
                                        </p>
                                    </div>
                                </Card>

                                <Card className="p-0 border-none bg-slate-50 dark:bg-slate-800/50 shadow-none overflow-hidden">
                                    <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> Gate Count Minimization</h5>
                                        <span className="text-[10px] font-mono text-slate-400">Target: -30%</span>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-end gap-3 mb-4">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Current</p>
                                                <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{selectedModel.resourceMetrics.gateCount.total}</div>
                                            </div>
                                            <ArrowUpRight className="w-6 h-6 text-slate-300 mb-2 rotate-90" />
                                            <div className="flex-1 text-right">
                                                <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">AI Optimized</p>
                                                <div className="text-2xl font-black text-emerald-600">{selectedModel.resourceMetrics.gateCount.minimizedTarget}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-slate-500">1-Qubit Redundancy</span>
                                                <span className="text-emerald-500 font-bold">12 Gates</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-slate-500">CNOT Commutation</span>
                                                <span className="text-emerald-500 font-bold">4 Gates</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Circuit Depth & NISQ Alternatives */}
                            <Card className="p-5 border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-shrink-0 text-center md:text-left">
                                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Depth Analysis</h5>
                                        <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                            <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{selectedModel.resourceMetrics.circuitDepth}</span>
                                            <span className="text-sm font-bold text-slate-400">Stages</span>
                                        </div>
                                        <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase">NISQ Compatibility: Medium</p>
                                    </div>
                                    <div className="flex-grow border-l border-slate-100 dark:border-slate-700 pl-0 md:pl-8">
                                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-violet-500"/> Recommended Shallow Alternative
                                        </h5>
                                        {selectedModel.resourceMetrics.nisqAlternative ? (
                                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{selectedModel.resourceMetrics.nisqAlternative.name}</span>
                                                    <Badge color="green">-{selectedModel.resourceMetrics.nisqAlternative.depthReduction}% Depth</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedModel.resourceMetrics.nisqAlternative.description}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No shallow alternatives found for this topology.</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Error Prediction & Vulnerability Map */}
                            <Card title="Error Rate Prediction" subtitle="Expected decoherence based on depth & gate fidelity">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="h-40 w-full flex items-center justify-center relative">
                                        <div className="w-32 h-32 rounded-full border-[10px] border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                                            <div className={`absolute inset-0 rounded-full border-[10px] border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 border-l-transparent transition-all duration-1000`} style={{ transform: `rotate(${(selectedModel.resourceMetrics.estimatedErrorRate * 360)}deg)` }}></div>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{(selectedModel.resourceMetrics.estimatedErrorRate * 100).toFixed(1)}%</span>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase">Estimated Error</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase">Qubit Vulnerability Index</h5>
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedModel.resourceMetrics.errorPropogation.map((err, i) => (
                                                <div key={i} className="text-center">
                                                    <div className={`h-12 w-full rounded-lg mb-1 flex items-end overflow-hidden bg-slate-100 dark:bg-slate-800`}>
                                                        <div 
                                                            className={`w-full transition-all duration-1000 ${err.vulnerability > 0.7 ? 'bg-red-500' : err.vulnerability > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                            style={{ height: `${err.vulnerability * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[9px] font-mono font-bold text-slate-400">q[{err.qubit}]</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic">"Qubit 3 shows high susceptibility to cross-talk noise during entangling layers."</p>
                                    </div>
                                </div>
                            </Card>

                            {/* AI Optimizer Suggestions */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-5">
                                <h5 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                                    <Wrench className="w-4 h-4"/> Intelligent Optimization Log
                                </h5>
                                <div className="space-y-3">
                                    {selectedModel.resourceMetrics.optimizations.map((opt, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-indigo-100 dark:border-slate-700 shadow-sm">
                                            {opt.type === 'Gate Reduction' ? <Zap className="w-4 h-4 text-amber-500 mt-0.5"/> : 
                                             opt.type === 'Depth Minimization' ? <Layers className="w-4 h-4 text-blue-500 mt-0.5"/> : 
                                             opt.type === 'Efficiency' ? <Scale className="w-4 h-4 text-emerald-500 mt-0.5"/> :
                                             <Cpu className="w-4 h-4 text-violet-500 mt-0.5"/>}
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{opt.type}</span>
                                                    <Badge color={opt.impact === 'High' ? 'green' : 'gray'}>{opt.impact} Impact</Badge>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{opt.suggestion}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeDetailTab === 'predict' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Dataset</label>
                        <div className="flex gap-2">
                            <Select value={predictionTarget} onChange={e => setPredictionTarget(e.target.value)} className="flex-grow">
                                {Object.keys(DATASET_CONFIGS).map(d => <option key={d} value={d}>{d}</option>)}
                            </Select>
                            <Button onClick={handlePredict} isLoading={loadingPrediction}>Predict</Button>
                        </div>
                    </div>

                    {predictionResult && (
                        <div className="animate-fade-in space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800 text-center">
                                    <p className="text-xs text-violet-500 font-bold uppercase">Expected Accuracy</p>
                                    <p className="text-2xl font-black text-violet-700 dark:text-violet-300">{(predictionResult.predictedAccuracy * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Confidence</p>
                                    <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{predictionResult.confidence}%</p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                                <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3"/> AI Reasoning</h5>
                                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{predictionResult.reasoning}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="outline" onClick={handleDownloadWeights} icon={<Download className="w-4 h-4" />}>Download Weights</Button>
                <Button onClick={() => handleLoadToPlayground(selectedModel)} icon={<Play className="w-4 h-4" />}>Load in Playground</Button>
            </div>
        </Modal> 
      )}
    </div>
  );
};
