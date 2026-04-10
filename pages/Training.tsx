
import React, { useState, useEffect, useRef } from 'react';
import { Card, SectionTitle, Button, Input, Select, Badge } from '../components/UI';
import { CircuitVisualizer } from '../components/CircuitVisualizer';
import { CodeViewer } from '../components/CodeViewer';
import { api } from '../services/api';
import { DatasetName, TrainingResult, PageView, TrainingMetric, ModelAnalysis, RealTimeInsight } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { COLORS } from '../constants';
import { Play, Settings, ChartBar, Terminal, Wand2, RefreshCw, Layers, Cpu, Activity, Clock, Cloud, Lock, ArrowRight, Zap, Code, Brain, Sparkles, Scale, ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TrainingProps {
  onNavigate?: (page: PageView) => void;
}

export const Training: React.FC<TrainingProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState({ 
    epochs: 50, 
    lr: 0.05, 
    layers: 4, 
    dataset: DatasetName.IRIS,
    backend: 'Simulator' 
  });
  const [liveHistory, setLiveHistory] = useState<TrainingMetric[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [lastModelName, setLastModelName] = useState<string | null>(null);

  const [isAutoDesigning, setIsAutoDesigning] = useState(false);
  const [architectReport, setArchitectReport] = useState<string | null>(null);

  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string>('--');
  
  const [liveRotations, setLiveRotations] = useState<number[][]>([]);
  const [showCode, setShowCode] = useState(false);

  const [modelAnalysis, setModelAnalysis] = useState<ModelAnalysis | null>(null);
  const [analyzingModel, setAnalyzingModel] = useState(false);
  
  const [insights, setInsights] = useState<RealTimeInsight[]>([]);

  const addLog = (msg: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
      if (consoleEndRef.current) {
          consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [logs]);

  const startTraining = async () => {
    setLoading(true);
    setLogs([]);
    setLiveHistory([]);
    setTrainingData(null);
    setModelAnalysis(null);
    setInsights([]);
    setCurrentEpoch(0);
    setLastModelName(null);
    setLiveRotations([]);
    
    const isRemote = config.backend === 'IBM Quantum';
    setEstimatedTime(isRemote ? 'Queuing...' : 'Calculating...');

    addLog(`Initializing ${isRemote ? 'Remote Session' : 'Local Backend'}...`);
    addLog(`Configuration: ${config.dataset}, Epochs: ${config.epochs}, Layers: ${config.layers}, LR: ${config.lr}`);
    
    await new Promise(r => setTimeout(r, 800));
    
    if (isRemote) {
        addLog("Authenticating with IBM Cloud...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("Connecting to provider: ibm-q/open/main...");
        await new Promise(r => setTimeout(r, 800));
        addLog("Job submitted to backend: ibm_osprey [127 qubits]");
        addLog("Status: QUEUED (Position: 3)");
        await new Promise(r => setTimeout(r, 2000));
        addLog("Status: RUNNING - Transpiling for Eagle r3 topology...");
    } else {
        addLog("Transpiling circuit to basis gates [CX, U3]...");
        await new Promise(r => setTimeout(r, 600));
        addLog("Allocating Qubits...");
    }
    
    addLog("Starting SPSA optimization loop...");

    const totalEpochs = config.epochs;
    const history: TrainingMetric[] = [];
    let currentLoss = 0.9;
    let currentAcc = 0.45;

    const startTime = Date.now();

    for (let i = 1; i <= totalEpochs; i++) {
        const stepTime = isRemote ? 400 : 150;
        await new Promise(r => setTimeout(r, stepTime)); 

        const decay = Math.exp(-i / (totalEpochs / 3));
        currentLoss = 0.2 + 0.7 * decay + (Math.random() * 0.05);
        currentAcc = Math.min(0.98, 0.95 - 0.5 * decay + (Math.random() * 0.02));
        
        if (isRemote) {
            currentLoss += (Math.random() * 0.05 - 0.02);
            currentAcc -= (Math.random() * 0.03);
        }
        
        const metric: TrainingMetric = { 
            epoch: i, 
            loss: parseFloat(currentLoss.toFixed(4)), 
            accuracy: parseFloat(currentAcc.toFixed(3)) 
        };
        
        history.push(metric);
        setLiveHistory(prev => [...prev, metric]);
        setCurrentEpoch(i);

        const newRotations = Array.from({ length: config.layers }, () => 
            Array.from({ length: 4 }, () => Math.random() * 6.28)
        );
        setLiveRotations(newRotations);

        if (i % 5 === 0) {
            try {
                const insight = await api.getTrainingInsight(i, metric.loss, metric.accuracy, history);
                if (insight) {
                    setInsights(prev => [insight, ...prev].slice(0, 3));
                    addLog(`[AI] ${insight.message}`);
                }
            } catch (e) {}
        }

        const elapsed = Date.now() - startTime;
        const avgTimePerEpoch = elapsed / i;
        const remaining = (totalEpochs - i) * avgTimePerEpoch;
        setEstimatedTime(`${(remaining / 1000).toFixed(1)}s`);

        if (i % 10 === 0 || i === 1) {
            addLog(`Epoch ${i}/${totalEpochs} - Loss: ${metric.loss} - Acc: ${(metric.accuracy*100).toFixed(1)}%`);
        }
        
        if (isRemote && i === Math.floor(totalEpochs / 2)) {
             addLog("[System] Recalibrating readout error mitigation...");
        }
    }

    const finalMetric = history[history.length - 1];
    const finalResult: TrainingResult = {
        history,
        finalLoss: finalMetric.loss,
        finalAccuracy: finalMetric.accuracy,
        weightsPath: `/models/vqc_${config.dataset.toLowerCase()}.pt`
    };

    setTrainingData(finalResult);
    setEstimatedTime('0.0s');
    addLog(`Training Complete. Final Loss: ${finalResult.finalLoss.toFixed(4)}`);
    addLog(`Weights saved to ${finalResult.weightsPath}`);
    
    const newId = `exp_${Date.now()}`;
    const generatedName = `VQC_${config.dataset}_${new Date().toLocaleTimeString()}`;
    setLastModelName(generatedName);
    
    api.saveExperiment({
      id: newId, 
      userId: 'current',
      name: `Train_${config.dataset}`, 
      timestamp: new Date().toISOString(), 
      dataset: config.dataset,
      parameters: { epochs: config.epochs, learningRate: config.lr, layers: config.layers },
      metrics: { finalLoss: finalResult.finalLoss, finalAccuracy: finalResult.finalAccuracy, history: finalResult.history }
    });
    
    api.saveModel({
      id: `model_${Date.now()}`, 
      userId: 'current',
      name: generatedName, 
      timestamp: new Date().toISOString(), 
      dataset: config.dataset, 
      type: 'Quantum VQC',
      parameters: { epochs: config.epochs, learningRate: config.lr, layers: config.layers, optimizer: 'SPSA' },
      metrics: { accuracy: finalResult.finalAccuracy, loss: finalResult.finalLoss, history: finalResult.history }, 
      weights: "mock",
      transferLearning: {
          isTransferable: finalResult.finalAccuracy > 0.8,
          compatibleDatasets: [DatasetName.IRIS, DatasetName.WINE, DatasetName.BREAST_CANCER].filter(d => d !== config.dataset)
      }
    });
    
    if ((window as any).notify) (window as any).notify('success', 'Model trained & saved to Registry');
    setLoading(false);
  };

  const runAutoDesign = () => {
      setIsAutoDesigning(true);
      setArchitectReport(null);
      addLog("Starting AI Architecture Search (CAS)...");
      
      setTimeout(() => {
          let bestLayers = 4;
          let reason = "";
          
          if (config.dataset === 'Wine') {
              bestLayers = 8;
              reason = "Selected deep ansatz (8 layers) to capture complex non-linear correlations in Wine dataset.";
          } else if (config.dataset === 'Breast Cancer') {
              bestLayers = 6;
              reason = "Selected moderate depth (6 layers) for optimal bias-variance tradeoff.";
          } else {
              bestLayers = 2;
              reason = "Selected shallow ansatz (2 layers) for Iris to prevent overfitting on simple features.";
          }
          
          setConfig(prev => ({ ...prev, layers: bestLayers }));
          setArchitectReport(reason);
          setIsAutoDesigning(false);
          addLog(`CAS Complete. Recommendation: ${bestLayers} Layers.`);
          if ((window as any).notify) (window as any).notify('info', 'AI updated circuit architecture');
      }, 2000);
  };

  const handleTestInPlayground = () => {
      const loadConfig = {
          dataset: config.dataset,
          modelName: lastModelName || `VQC_${config.dataset}`,
          timestamp: new Date().toISOString()
      };
      localStorage.setItem('active_playground_config', JSON.stringify(loadConfig));
      if (onNavigate) onNavigate(PageView.PLAYGROUND);
  };

  const runDeepAnalysis = async () => {
      if (!trainingData) return;
      setAnalyzingModel(true);
      addLog("Initializing AI Model Evaluation agent...");
      try {
          const report = await api.generateModelAnalysis(trainingData, config);
          setModelAnalysis(report);
          addLog("AI Analysis Complete: Benchmarks & Robustness generated.");
      } catch (e) {
          addLog("Error generating analysis.");
      } finally {
          setAnalyzingModel(false);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionTitle 
        title="Model Training" 
        subtitle="Train Variational Quantum Classifier (VQC)" 
        rightElement={
          <div className="flex space-x-2">
            <Button variant="outline" className="h-8 text-xs" onClick={() => setShowCode(true)} icon={<Code className="w-3 h-3"/>}>Export Script</Button>
            <Badge color="blue">SPSA Optimizer</Badge>
            <Badge color={config.backend === 'IBM Quantum' ? 'violet' : 'gray'}>
               {config.backend === 'IBM Quantum' ? 'IBM Osprey' : 'QasmSimulator'}
            </Badge>
          </div>
        } 
      />

      {/* Educational Introduction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* What is VQC */}
          <Card className="lg:col-span-2 border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-indigo-600"/>
                  <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Variational Quantum Classifier</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Hybrid quantum-classical learning</p>
                  </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  A VQC is a hybrid algorithm that combines quantum and classical computing. A quantum circuit (with tunable parameters) encodes data and makes predictions. A classical optimizer (SPSA) adjusts these parameters to minimize loss. This approach runs on today's noisy quantum devices without requiring full quantum state preparation.
              </p>
              <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <ArrowRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0"/>
                      <span><span className="font-bold">Quantum Part:</span> Parameterized circuit encodes features and creates quantum advantage</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <ArrowRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0"/>
                      <span><span className="font-bold">Classical Part:</span> Optimizer updates circuit parameters to reduce prediction error</span>
                  </div>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs text-indigo-800 dark:text-indigo-200 font-medium">
                      <span className="font-bold">💡 Why This Matters:</span> VQCs can learn non-linear patterns that classical algorithms struggle with, using exponentially fewer parameters.
                  </p>
              </div>
          </Card>

          {/* Training Process */}
          <Card className="border-l-4 border-l-violet-500">
              <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-violet-600"/>
                  <h3 className="font-bold text-slate-900 dark:text-white">Training Process</h3>
              </div>
              <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex-shrink-0">1</span>
                      <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Initialize</span> random circuit parameters</span>
                  </li>
                  <li className="flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex-shrink-0">2</span>
                      <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Forward pass</span> runs circuit on data</span>
                  </li>
                  <li className="flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex-shrink-0">3</span>
                      <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Compute loss</span> comparing prediction to truth</span>
                  </li>
                  <li className="flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex-shrink-0">4</span>
                      <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Update params</span> using SPSA optimizer</span>
                  </li>
                  <li className="flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex-shrink-0">5</span>
                      <span className="text-slate-700 dark:text-slate-300"><span className="font-bold">Repeat</span> for N epochs until convergence</span>
                  </li>
              </ol>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card title="Hyperparameters" subtitle="Configure training loop" action={<Settings className="w-5 h-5 text-slate-400"/>}>
            <div className="space-y-5">
              <Select label="Target Dataset" value={config.dataset} onChange={e => setConfig({...config, dataset: e.target.value as DatasetName})} helpText="Choose data to train on">{Object.values(DatasetName).map(d => <option key={d} value={d}>{d}</option>)}</Select>
              
              <Select 
                label="Quantum Backend" 
                value={config.backend} 
                onChange={e => setConfig({...config, backend: e.target.value})}
                helpText="Simulator = fast + deterministic. IBM Quantum = real hardware + noise"
              >
                  <option value="Simulator">QasmSimulator (Local, Fast)</option>
                  <option value="IBM Quantum">IBM Quantum (Real Hardware, ~5-30min queue)</option>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <div className="flex items-center gap-1 mb-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Epochs</label>
                          <div className="group relative">
                              <Sparkles className="w-3 h-3 text-slate-400 cursor-help"/>
                              <div className="hidden group-hover:block absolute z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs p-2 rounded whitespace-nowrap bottom-full mb-1 left-0">
                                  How many training iterations
                              </div>
                          </div>
                      </div>
                      <Input type="number" value={config.epochs} onChange={e => setConfig({...config, epochs: parseInt(e.target.value)})} className="!mb-0" />
                  </div>
                  <div>
                      <div className="flex items-center gap-1 mb-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Learning Rate</label>
                          <div className="group relative">
                              <Sparkles className="w-3 h-3 text-slate-400 cursor-help"/>
                              <div className="hidden group-hover:block absolute z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs p-2 rounded whitespace-nowrap bottom-full mb-1 right-0">
                                  Size of parameter update steps
                              </div>
                          </div>
                      </div>
                      <Input type="number" step="0.01" value={config.lr} onChange={e => setConfig({...config, lr: parseFloat(e.target.value)})} className="!mb-0" />
                  </div>
              </div>

              {/* Hyperparameter Education */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p><span className="font-bold">Epochs:</span> More = better learning but slower training (50-100 recommended)</p>
                  <p><span className="font-bold">Learning Rate:</span> Higher = faster but may miss optimal. Lower = accurate but slow (0.01-0.1 typical)</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-end mb-2">
                      <div className="flex-1">
                          <div className="flex items-center gap-1 mb-2">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Ansatz Layers</label>
                              <div className="group relative">
                                  <Sparkles className="w-3 h-3 text-slate-400 cursor-help"/>
                                  <div className="hidden group-hover:block absolute z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs p-2 rounded whitespace-nowrap bottom-full mb-1">
                                      Circuit depth. More layers = more expressive but prone to barren plateaus
                                  </div>
                              </div>
                          </div>
                          <Input className="!mb-0" type="number" value={config.layers} onChange={e => setConfig({...config, layers: parseInt(e.target.value)})} />
                      </div>
                      <Button variant="soft" className="ml-2 h-[42px] px-3" onClick={runAutoDesign} isLoading={isAutoDesigning} title="Auto-Design Circuit">
                          <Wand2 className="w-4 h-4 text-violet-600 dark:text-violet-400"/>
                      </Button>
                  </div>
                  {architectReport && (
                      <div className="mt-2 text-xs text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg border border-violet-100 dark:border-violet-800 animate-fade-in">
                          <span className="font-bold">✨ AI Insight:</span> {architectReport}
                      </div>
                  )}
              </div>

              <div className="pt-2">
                  <Button 
                    onClick={startTraining} 
                    isLoading={loading} 
                    className={`w-full py-3 shadow-lg ${config.backend === 'IBM Quantum' ? 'shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700' : 'shadow-violet-200 dark:shadow-none'}`} 
                    icon={config.backend === 'IBM Quantum' ? <Cloud className="w-4 h-4 text-white"/> : <Play className="w-4 h-4 fill-white"/>}
                  >
                      {config.backend === 'IBM Quantum' ? 'Submit Remote Job' : 'Start Simulation'}
                  </Button>
              </div>
            </div>
          </Card>
          
          <Card title="Topology Preview" className="bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex justify-center py-6">
                  <CircuitVisualizer 
                      qubits={4} 
                      layers={config.layers} 
                      rotations={liveRotations}
                  />
              </div>
              {liveRotations.length > 0 && (
                  <p className="text-center text-xs text-violet-600 dark:text-violet-400 animate-pulse font-mono mt-2">
                      Optimizing parameters...
                  </p>
              )}
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {insights.length > 0 && (
              <div className="grid gap-3 animate-fade-in">
                  {insights.map(insight => (
                      <div key={insight.id} className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm ${
                          insight.severity === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' :
                          insight.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' :
                          'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                      }`}>
                          {insight.severity === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"/> :
                           insight.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0"/> :
                           <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"/>}
                          <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                      insight.severity === 'success' ? 'text-emerald-700 dark:text-emerald-300' :
                                      insight.severity === 'warning' ? 'text-amber-700 dark:text-amber-300' :
                                      'text-blue-700 dark:text-blue-300'
                                  }`}>{insight.type} Detected</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{insight.timestamp}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{insight.message}</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          <Card 
            title="Training Dynamics" 
            subtitle="Real-time Loss & Accuracy" 
            className="relative"
            action={
                loading ? (
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3"/> ETA: {estimatedTime}
                        </span>
                        {config.backend === 'IBM Quantum' ? (
                            <Badge color="violet" className="animate-pulse flex items-center gap-1"><Cloud className="w-3 h-3"/> Remote Exec</Badge>
                        ) : (
                            <Badge color="blue" className="animate-pulse">Epoch {currentEpoch}/{config.epochs}</Badge>
                        )}
                    </div>
                ) : trainingData ? <Badge color="green">Completed</Badge> : <Badge>Idle</Badge>
            }
          >
             <div className="h-80 w-full px-2 pt-2 relative">
                {liveHistory.length > 0 && (
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm pointer-events-none transition-all duration-300">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
                            <span className="text-xl font-black text-emerald-500">{(liveHistory[liveHistory.length-1].accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loss</span>
                            <span className="text-xl font-black text-violet-500">{liveHistory[liveHistory.length-1].loss.toFixed(4)}</span>
                        </div>
                    </div>
                )}

                {liveHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveHistory}>
                            <defs>
                                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.loss} stopOpacity={0.2}/><stop offset="95%" stopColor={COLORS.loss} stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.accuracy} stopOpacity={0.2}/><stop offset="95%" stopColor={COLORS.accuracy} stopOpacity={0}/></linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="epoch" 
                                stroke="#94a3b8" 
                                type="number" 
                                domain={[1, config.epochs]} 
                                tick={{fontSize: 12, fill: '#64748b'}} 
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                domain={[0, 1]} 
                                tick={{fontSize: 12, fill: '#64748b'}} 
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                                labelFormatter={(label) => `Epoch ${label}`}
                            />
                            <Legend iconType="circle" />
                            <ReferenceLine y={0.95} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} label={{ value: "Target Acc", fill: "#10b981", fontSize: 10, position: 'insideRight' }} />
                            <Area type="monotone" dataKey="loss" name="Loss Function" stroke={COLORS.loss} fill="url(#colorLoss)" strokeWidth={3} isAnimationActive={false} />
                            <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke={COLORS.accuracy} fill="url(#colorAcc)" strokeWidth={3} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <ChartBar className="w-16 h-16 mb-4 opacity-50"/>
                        <p>Waiting for training job...</p>
                    </div>
                )}
             </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                 <Card className="flex flex-col justify-center text-center py-6 border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-emerald-100/50 dark:shadow-none shadow-sm">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-2">Current Accuracy</p>
                    <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {liveHistory.length > 0 ? `${(liveHistory[liveHistory.length-1].accuracy * 100).toFixed(1)}%` : '--'}
                    </p>
                 </Card>
                 <Card className="flex flex-col justify-center text-center py-6 border-violet-100 dark:border-violet-900 bg-violet-50/30 dark:bg-violet-900/10 shadow-violet-100/50 dark:shadow-none shadow-sm">
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider mb-2">Current Loss</p>
                    <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                        {liveHistory.length > 0 ? liveHistory[liveHistory.length-1].loss.toFixed(4) : '--'}
                    </p>
                 </Card>
              </div>

              <Card className="bg-slate-900 text-slate-300 font-mono text-xs overflow-hidden flex flex-col h-48 border-slate-800 shadow-xl">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700 text-slate-500 uppercase tracking-widest font-bold text-[10px]">
                      <Terminal className="w-3 h-3"/> System Output
                  </div>
                  <div className="overflow-y-auto flex-grow space-y-1 custom-scrollbar pr-2">
                      {logs.length === 0 && <span className="opacity-50 italic">Ready...</span>}
                      {logs.map((log, i) => (
                          <div key={i} className="break-words animate-fade-in">
                              <span className="text-slate-500 mr-2">{log.split(']')[0]}]</span>
                              <span className={log.includes('Error') ? 'text-red-400' : 'text-slate-300'}>{log.split(']')[1]}</span>
                          </div>
                      ))}
                      <div ref={consoleEndRef} />
                  </div>
              </Card>
          </div>
          
          {trainingData && !modelAnalysis && (
             <div className="flex justify-end gap-3 animate-fade-in">
                 <Button 
                    variant="soft" 
                    onClick={runDeepAnalysis}
                    isLoading={analyzingModel} 
                    icon={<Brain className="w-4 h-4"/>}
                    className="flex-grow bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                 >
                    Generate AI Intelligence Report
                 </Button>
                 <Button variant="outline" onClick={() => onNavigate && onNavigate(PageView.MODEL_HUB)}>Registry</Button>
                 <Button 
                    className="shadow-lg shadow-emerald-200 dark:shadow-none bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={handleTestInPlayground}
                    icon={<ArrowRight className="w-4 h-4"/>}
                 >
                    Playground
                 </Button>
             </div>
          )}

          {modelAnalysis && (
              <div className="animate-fade-in-up space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-violet-500"/> AI Model Intelligence
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card title="Hyperparameter Impact" className="md:col-span-2">
                          <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={modelAnalysis.hyperparameters} layout="vertical" margin={{ left: 20 }}>
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                      <XAxis type="number" domain={[0, 1]} hide />
                                      <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#64748b'}} width={100}/>
                                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', backgroundColor: '#1e293b', border: 'none', color: '#f8fafc' }} />
                                      <Bar dataKey="importance" radius={[0,4,4,0]} barSize={20}>
                                          {modelAnalysis.hyperparameters.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.importance > 0.7 ? COLORS.primary : COLORS.secondary} />
                                          ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                          <div className="mt-4 space-y-2">
                              {modelAnalysis.hyperparameters.map((h, i) => (
                                  <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-2">
                                      <span className="font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">{h.name}:</span> 
                                      <span>{h.reason}</span>
                                  </div>
                              ))}
                          </div>
                      </Card>

                      <div className="space-y-6">
                          <Card className={`text-center p-6 border-l-4 ${modelAnalysis.quantumAdvantage.isAdvantage ? 'border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10' : 'border-l-amber-500 bg-amber-50/20 dark:bg-amber-900/10'}`}>
                              <div className="flex justify-center mb-4">
                                  <div className={`p-3 rounded-full ${modelAnalysis.quantumAdvantage.isAdvantage ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                      <Scale className="w-8 h-8"/>
                                  </div>
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Quantum Advantage</h4>
                              <p className={`text-lg font-black ${modelAnalysis.quantumAdvantage.isAdvantage ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {modelAnalysis.quantumAdvantage.isAdvantage ? "DETECTED" : "NOT DETECTED"}
                              </p>
                              <div className="my-4 text-xs font-mono bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                  <div className="flex justify-between mb-1"><span>VQC Acc:</span> <strong>{(trainingData!.finalAccuracy * 100).toFixed(1)}%</strong></div>
                                  <div className="flex justify-between"><span>Classical:</span> <strong>{(modelAnalysis.quantumAdvantage.classicalBaselineAcc * 100).toFixed(1)}%</strong></div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                  {modelAnalysis.quantumAdvantage.reason}
                              </p>
                          </Card>

                          <Card className="text-center p-6 border-l-4 border-l-blue-500">
                              <div className="flex justify-center mb-2">
                                  <ShieldAlert className="w-6 h-6 text-blue-500 mb-2"/>
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Noise Resilience</h4>
                              <div className="flex items-center justify-center gap-2 mt-2 mb-3">
                                  <span className="text-2xl font-black text-blue-600">{modelAnalysis.noiseAnalysis.robustnessScore}</span>
                                  <span className="text-xs text-slate-400 uppercase">/ 100</span>
                              </div>
                              <p className="text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-1 px-2 rounded mb-2 inline-block">
                                  {modelAnalysis.noiseAnalysis.susceptibility} Susceptibility
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                  "{modelAnalysis.noiseAnalysis.mitigationSuggestion}"
                              </p>
                          </Card>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>

      <CodeViewer 
        isOpen={showCode} 
        onClose={() => setShowCode(false)} 
        mode="training" 
        data={config} 
      />
    </div>
  );
};
