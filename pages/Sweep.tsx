
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Button, Input, Select, Badge } from '../components/UI';
import { Play, Settings, Cpu, Trophy, Zap, Timer, TrendingUp, Activity, Award } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { COLORS } from '../constants';

interface TrialResult {
  id: number;
  lr: number;
  layers: number;
  epochs: number;
  acc: number;
  loss: number;
  duration: number;
  status: 'completed' | 'running' | 'pending';
}

export const Sweep: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [strategy, setStrategy] = useState('Grid Search');
  const [progress, setProgress] = useState(0);
  const [activeWorkers, setActiveWorkers] = useState([false, false, false, false]); // 4 Simulated GPUs/CPUs

  // Config State
  const [config, setConfig] = useState({
    lrStr: "0.01, 0.05, 0.1, 0.001",
    layersStr: "2, 4, 6, 8",
    epochs: 30,
    trials: 20 // For random/bayesian
  });

  const generateSweeps = () => {
    setLoading(true);
    setResults([]);
    setProgress(0);
    
    // Parse inputs
    const lrs = config.lrStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const layers = config.layersStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    let trials: TrialResult[] = [];

    if (strategy === 'Grid Search') {
       // Cartesian Product
       let id = 1;
       lrs.forEach(lr => {
          layers.forEach(l => {
              trials.push({
                 id: id++, lr, layers: l, epochs: config.epochs, 
                 acc: 0, loss: 0, duration: 0, status: 'pending'
              });
          });
       });
    } else {
       // Random / Bayesian Generation
       for(let i=1; i<=config.trials; i++) {
          const lr = lrs[Math.floor(Math.random() * lrs.length)] || 0.01;
          const l = layers[Math.floor(Math.random() * layers.length)] || 4;
          trials.push({
             id: i, lr, layers: l, epochs: config.epochs, 
             acc: 0, loss: 0, duration: 0, status: 'pending'
          });
       }
    }

    // Simulation Loop
    let completed = 0;
    const total = trials.length;
    
    const interval = setInterval(() => {
        // Activate random workers
        setActiveWorkers(prev => prev.map(() => Math.random() > 0.2));

        // Process batch
        const batchSize = Math.floor(Math.random() * 3) + 1;
        
        for(let i=0; i<batchSize; i++) {
           if (completed >= total) break;
           
           const currentTrial = trials[completed];
           
           // Logic to mock results based on strategy
           let baseAcc = 0.85;
           
           // Mock: Mid LR and Mid Layers are better
           if (currentTrial.lr >= 0.01 && currentTrial.lr <= 0.05) baseAcc += 0.05;
           if (currentTrial.layers === 4) baseAcc += 0.04;

           // Bayesian Mock: Later trials get better stats as "optimizer" learns
           if (strategy === 'Bayesian Optimization') {
               const progressFactor = (completed / total) * 0.08; // Improve up to 8% over time
               baseAcc += progressFactor;
           }

           // Random noise
           const finalAcc = Math.min(0.99, Math.max(0.6, baseAcc + (Math.random() * 0.06 - 0.03)));
           const finalLoss = Math.max(0.1, (1 - finalAcc) + (Math.random() * 0.1));

           trials[completed] = {
               ...currentTrial,
               acc: finalAcc,
               loss: parseFloat(finalLoss.toFixed(4)),
               duration: Math.floor(Math.random() * 5) + 2,
               status: 'completed'
           };
           completed++;
        }

        setResults([...trials.slice(0, completed)]);
        setProgress((completed / total) * 100);

        if (completed >= total) {
            clearInterval(interval);
            setLoading(false);
            setActiveWorkers([false, false, false, false]);
        }
    }, 800); // Update every 800ms
  };

  const getBestTrial = () => {
      if (results.length === 0) return null;
      return [...results].sort((a,b) => b.acc - a.acc)[0];
  };

  const bestTrial = getBestTrial();

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle 
        title="Hyperparameter Optimization" 
        subtitle="Automated Architecture Search & Tuning" 
        rightElement={
            <div className="flex gap-2">
                <Badge color="violet">Parallel Execution</Badge>
                {strategy === 'Bayesian Optimization' && <Badge color="blue">Gaussian Process</Badge>}
            </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONFIGURATION PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Search Configuration" subtitle="Define search space and strategy">
            <div className="space-y-5">
              <Select 
                label="Search Strategy" 
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                helpText="Grid: Exhaustive. Random: Stochastic. Bayesian: Probabilistic improvement."
              >
                <option>Grid Search</option>
                <option>Random Search</option>
                <option>Bayesian Optimization</option>
              </Select>

              <Input 
                label="Learning Rates" 
                value={config.lrStr}
                onChange={(e) => setConfig({...config, lrStr: e.target.value})} 
                helpText="Comma separated list of float values"
              />
              <Input 
                label="Layer Depths" 
                value={config.layersStr}
                onChange={(e) => setConfig({...config, layersStr: e.target.value})} 
                helpText="Comma separated integers"
              />
              
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Epochs / Trial" 
                    type="number" 
                    value={config.epochs}
                    onChange={(e) => setConfig({...config, epochs: parseInt(e.target.value)})} 
                  />
                  {(strategy !== 'Grid Search') && (
                      <Input 
                        label="Max Trials" 
                        type="number" 
                        value={config.trials}
                        onChange={(e) => setConfig({...config, trials: parseInt(e.target.value)})} 
                      />
                  )}
              </div>

              <div className="pt-2">
                <Button onClick={generateSweeps} isLoading={loading} className="w-full py-3 shadow-lg shadow-violet-200" icon={<Play className="w-4 h-4 fill-white"/>}>
                    Start {strategy}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Worker Status */}
          <Card title="Compute Resources" subtitle="Parallel Workers (4 vCPUs)">
             <div className="grid grid-cols-4 gap-2 text-center">
                 {activeWorkers.map((active, i) => (
                     <div key={i} className={`p-3 rounded-xl border transition-all duration-300 ${active ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                         <Cpu className={`w-6 h-6 mx-auto mb-1 ${active ? 'text-emerald-500 animate-pulse' : 'text-slate-300'}`} />
                         <span className={`text-[10px] font-bold uppercase ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                             {active ? 'Busy' : 'Idle'}
                         </span>
                     </div>
                 ))}
             </div>
             {loading && (
                 <div className="mt-4">
                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                         <span>Sweep Progress</span>
                         <span>{Math.round(progress)}%</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                         <div className="bg-violet-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                     </div>
                 </div>
             )}
          </Card>
        </div>

        {/* MAIN VISUALIZATION AREA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Scatter Plot - Landscape Analysis */}
          <Card 
            title="Parameter Landscape" 
            subtitle="Accuracy vs. Learning Rate distribution"
            action={bestTrial ? <Badge color="green">Best: {(bestTrial.acc*100).toFixed(1)}%</Badge> : undefined}
          >
            {results.length > 0 ? (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="lr" name="Learning Rate" unit="" label={{ value: 'Learning Rate', position: 'insideBottom', offset: -10 }} />
                            <YAxis type="number" dataKey="acc" name="Accuracy" unit="" domain={[0.6, 1]} />
                            <ZAxis type="number" dataKey="layers" range={[60, 400]} name="Layers" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-xl">
                                    <p className="font-bold text-slate-800 mb-1">Trial #{data.id}</p>
                                    <p className="text-xs text-slate-500">LR: {data.lr} | Layers: {data.layers}</p>
                                    <p className="text-sm font-bold text-emerald-600 mt-1">Acc: {(data.acc * 100).toFixed(1)}%</p>
                                    </div>
                                );
                                }
                                return null;
                            }} />
                            <Legend />
                            <Scatter name="Trials" data={results} fill={COLORS.primary}>
                                {results.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.acc > 0.93 ? COLORS.secondary : COLORS.primary} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                    <Activity className="w-12 h-12 mb-3 opacity-50" />
                    <p>Run a sweep to visualize the hyperparameter landscape.</p>
                </div>
            )}
          </Card>

          {/* LEADERBOARD */}
          <Card title="Leaderboard" subtitle="Top performing configurations">
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                 <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                       <tr>
                          <th className="px-6 py-4 text-left">Rank</th>
                          <th className="px-6 py-4 text-left">Config</th>
                          <th className="px-6 py-4 text-left">Time</th>
                          <th className="px-6 py-4 text-left text-emerald-600">Accuracy</th>
                          <th className="px-6 py-4 text-left text-red-500">Loss</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {[...results].sort((a,b) => b.acc - a.acc).slice(0, 8).map((r, idx) => (
                          <tr key={r.id} className={`group hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-yellow-50/50' : ''}`}>
                             <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                                 {idx === 0 && <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                 {idx === 1 && <Award className="w-4 h-4 text-slate-400" />}
                                 {idx === 2 && <Award className="w-4 h-4 text-amber-600" />}
                                 <span className="w-6">{idx + 1}</span>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex gap-2">
                                     <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600">lr: {r.lr}</span>
                                     <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600">L: {r.layers}</span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                                 <Timer className="w-3 h-3" /> {r.duration}s
                             </td>
                             <td className="px-6 py-4 font-bold text-emerald-600 text-base">
                                 {(r.acc * 100).toFixed(1)}%
                             </td>
                             <td className="px-6 py-4 font-bold text-red-500">
                                 {r.loss}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            ) : (
               <div className="py-12 text-center text-slate-400 italic">No trials completed yet.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
