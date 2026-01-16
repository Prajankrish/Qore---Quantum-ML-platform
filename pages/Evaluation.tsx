
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Button, Select, Badge } from '../components/UI';
import { api } from '../services/api';
import { DatasetName, EvaluationResult, CustomDataset } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { COLORS } from '../constants';
import { ChartBar, FileText, Activity, ShieldCheck, Target, Layers, Info } from 'lucide-react';

export const Evaluation: React.FC = () => {
  const [dataset, setDataset] = useState<string>(DatasetName.IRIS);
  const [results, setResults] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [customDatasets, setCustomDatasets] = useState<CustomDataset[]>([]);

  useEffect(() => {
    setCustomDatasets(api.getCustomDatasets());
  }, []);

  const runEval = async () => {
    setLoading(true);
    try { 
        const res = await api.evaluateModel(dataset); 
        setResults(res); 
    } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleExport = async () => {
      if (!results) return;
      setExporting(true);
      try {
          await api.downloadEvaluationReport(dataset, results);
          if ((window as any).notify) (window as any).notify('success', 'Performance report exported successfully.');
      } catch (err) {
          if ((window as any).notify) (window as any).notify('error', 'Failed to generate report.');
          console.error(err);
      } finally {
          setExporting(false);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <SectionTitle 
        title="Model Evaluation" 
        subtitle="Benchmark quantum classifier performance across multi-dimensional metrics" 
      />
      
      <Card className="mb-8 overflow-visible">
        <div className="flex flex-col sm:flex-row gap-6 items-end">
          <Select 
            label="Select Evaluation Set" 
            value={dataset} 
            onChange={e => setDataset(e.target.value)} 
            className="w-full sm:w-80"
            helpText="Standard datasets provide known ground truths for benchmarking."
          >
            <optgroup label="Standard Benchmarks">
              {Object.values(DatasetName).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </optgroup>
            {customDatasets.length > 0 && (
              <optgroup label="My Uploaded Datasets">
                {customDatasets.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </optgroup>
            )}
          </Select>
          <Button onClick={runEval} isLoading={loading} className="w-full sm:w-auto px-10 py-3 shadow-lg shadow-violet-200 dark:shadow-none" icon={<Activity className="w-4 h-4"/>}>
            Compute Global Metrics
          </Button>
        </div>
      </Card>
      
      {results && (
        <div className="space-y-8 animate-fade-in">
          
          {/* TOP SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricSummaryCard title="Accuracy" value={results.accuracy} color="emerald" icon={<Target className="w-4 h-4" />} />
              <MetricSummaryCard title="Macro F1" value={results.macroAvg.f1} color="violet" icon={<Layers className="w-4 h-4" />} />
              <MetricSummaryCard title="Macro Precision" value={results.macroAvg.precision} color="blue" icon={<ShieldCheck className="w-4 h-4" />} />
              <MetricSummaryCard title="Macro Recall" value={results.macroAvg.recall} color="indigo" icon={<Activity className="w-4 h-4" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confusion Matrix */}
            <Card title="Confusion Matrix" subtitle="Inter-class Correlation Analysis">
               <div className="flex flex-col items-center justify-center p-6">
                  <div className="grid grid-cols-3 gap-3">
                     <div className="p-2"></div>
                     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-center text-[10px] uppercase tracking-wider text-slate-500">Pred: {results.confusionMatrix.labels[0]}</div>
                     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-center text-[10px] uppercase tracking-wider text-slate-500">Pred: {results.confusionMatrix.labels[1]}</div>
                     
                     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-[10px] flex items-center justify-end uppercase tracking-wider text-slate-500">True: {results.confusionMatrix.labels[0]}</div>
                     <div className="w-28 h-24 flex flex-col items-center justify-center bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 rounded-2xl border border-violet-200 dark:border-violet-800 shadow-sm">
                        <span className="text-3xl font-black">{results.confusionMatrix.matrix[0][0]}</span>
                     </div>
                     <div className="w-28 h-24 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <span className="text-2xl font-bold">{results.confusionMatrix.matrix[0][1]}</span>
                     </div>
                     
                     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-[10px] flex items-center justify-end uppercase tracking-wider text-slate-500">True: {results.confusionMatrix.labels[1]}</div>
                     <div className="w-28 h-24 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <span className="text-2xl font-bold">{results.confusionMatrix.matrix[1][0]}</span>
                     </div>
                     <div className="w-28 h-24 flex flex-col items-center justify-center bg-violet-600 text-white rounded-2xl shadow-xl shadow-violet-200 dark:shadow-none">
                        <span className="text-3xl font-black">{results.confusionMatrix.matrix[1][1]}</span>
                     </div>
                  </div>
                  <div className="mt-8 flex gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-600"></div> TP/TN</span>
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800"></div> FP/FN</span>
                  </div>
               </div>
            </Card>

            {/* ROC Curve */}
            <Card title="Sensitivity (ROC)" subtitle="True Positive vs False Positive Rates">
              <div className="h-72 w-full px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.rocCurve}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                    <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#94a3b8" tick={{fontSize: 12}} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="#94a3b8" tick={{fontSize: 12}} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b' }} 
                      itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="tpr" stroke={COLORS.secondary} strokeWidth={4} dot={false} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* CLASSIFICATION REPORT TABLE */}
          <Card 
            title="Classification Performance Metrics" 
            subtitle="Deep-dive into per-label precision, recall, and f1-score"
            action={
              <Button 
                variant="outline" 
                className="h-9 px-4 text-xs" 
                onClick={handleExport} 
                isLoading={exporting}
                icon={<FileText className="w-4 h-4"/>}
              >
                Export Report
              </Button>
            }
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Class Label</th>
                    <th className="px-6 py-4">Precision</th>
                    <th className="px-6 py-4">Recall</th>
                    <th className="px-6 py-4">F1-Score</th>
                    <th className="px-6 py-4">Support</th>
                    <th className="px-6 py-4 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.classMetrics.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5 font-black text-slate-800 dark:text-slate-200">{row.label}</td>
                      <td className="px-6 py-5">
                          <MetricCell value={row.precision} />
                      </td>
                      <td className="px-6 py-5">
                          <MetricCell value={row.recall} />
                      </td>
                      <td className="px-6 py-5">
                          <MetricCell value={row.f1} bold />
                      </td>
                      <td className="px-6 py-5 font-mono text-xs text-slate-500">{row.support}</td>
                      <td className="px-6 py-5 text-right">
                          <Badge color={row.f1 > 0.9 ? 'green' : 'amber'}>
                              {row.f1 > 0.9 ? 'High' : 'Medium'}
                          </Badge>
                      </td>
                    </tr>
                  ))}
                  {/* Aggregates */}
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 font-bold text-slate-600 dark:text-slate-300">
                    <td className="px-6 py-5">Macro Average</td>
                    <td className="px-6 py-5 font-mono">{(results.macroAvg.precision * 100).toFixed(1)}%</td>
                    <td className="px-6 py-5 font-mono">{(results.macroAvg.recall * 100).toFixed(1)}%</td>
                    <td className="px-6 py-5 font-mono">{(results.macroAvg.f1 * 100).toFixed(1)}%</td>
                    <td className="px-6 py-5">--</td>
                    <td className="px-6 py-5 text-right">Avg</td>
                  </tr>
                  <tr className="bg-violet-50/20 dark:bg-violet-900/10 font-black text-violet-700 dark:text-violet-400">
                    <td className="px-6 py-5">Weighted Average</td>
                    <td className="px-6 py-5 font-mono">{(results.weightedAvg.precision * 100).toFixed(1)}%</td>
                    <td className="px-6 py-5 font-mono">{(results.weightedAvg.recall * 100).toFixed(1)}%</td>
                    <td className="px-6 py-5 font-mono">{(results.weightedAvg.f1 * 100).toFixed(1)}%</td>
                    <td className="px-6 py-5 font-mono text-xs opacity-60">100</td>
                    <td className="px-6 py-5 text-right">Global</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <strong>Quantum Interpretation:</strong> Per-class variance in F1-score often indicates specific feature-encoding mapping inefficiencies. Consider re-mapping "Class 0" if recall remains below 0.90 after noise mitigation.
                </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const MetricSummaryCard: React.FC<{ title: string; value: number; color: 'emerald' | 'violet' | 'blue' | 'indigo'; icon: React.ReactNode }> = ({ title, value, color, icon }) => {
    const colorClasses = {
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        violet: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400 border-violet-100 dark:border-violet-800',
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    };

    return (
        <Card className={`!p-5 border-l-4 ${color === 'emerald' ? 'border-l-emerald-500' : color === 'violet' ? 'border-l-violet-500' : color === 'blue' ? 'border-l-blue-500' : 'border-l-indigo-500'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]} border shadow-sm`}>
                    {icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${color === 'emerald' ? 'text-emerald-600' : color === 'violet' ? 'text-violet-600' : color === 'blue' ? 'text-blue-600' : 'text-indigo-600'}`}>
                    {(value * 100).toFixed(1)}%
                </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color === 'emerald' ? 'bg-emerald-500' : color === 'violet' ? 'bg-violet-500' : color === 'blue' ? 'bg-blue-500' : 'bg-indigo-500'} transition-all duration-1000`} style={{ width: `${value * 100}%` }}></div>
            </div>
        </Card>
    );
};

const MetricCell: React.FC<{ value: number; bold?: boolean }> = ({ value, bold }) => {
    const isGood = value >= 0.9;
    const isMid = value >= 0.7 && value < 0.9;
    
    return (
        <div className="flex items-center gap-3">
            <span className={`font-mono text-sm ${bold ? 'font-black' : 'font-medium'} ${isGood ? 'text-emerald-600 dark:text-emerald-400' : isMid ? 'text-amber-600 dark:text-amber-400' : 'text-red-600'}`}>
                {value.toFixed(3)}
            </span>
            <div className="hidden sm:block w-16 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{ width: `${value * 100}%` }}
                ></div>
            </div>
        </div>
    );
};
