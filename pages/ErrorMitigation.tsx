
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Select } from '../components/UI';
import { api } from '../services/api';
import { MitigationResult } from '../types';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, Legend } from 'recharts';
import { COLORS } from '../constants';
import { Settings2, SlidersHorizontal, Server } from 'lucide-react';

export const ErrorMitigation: React.FC = () => {
  const [selectedSamples] = useState<string[]>(['1']);
  const [strategy, setStrategy] = useState('ZNE');
  const [results, setResults] = useState<MitigationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runMitigation = async () => {
    setLoading(true);
    try { const res = await api.runErrorMitigation(selectedSamples.map(s => parseInt(s)), strategy); setResults(res); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle title="Error Mitigation" subtitle="Correct hardware noise with Zero Noise Extrapolation (ZNE)" />
      <Card title="Mitigation Configuration" className="mb-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <Select label="Quantum Backend" disabled helpText="Currently running in simulation mode."><option>Noisy Simulator (Qasm)</option></Select>
            <div className="w-full"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400"/> Strategy</label><select className="bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 block w-full border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-sm border focus:ring-2 focus:ring-violet-500 outline-none transition-all" value={strategy} onChange={e => setStrategy(e.target.value)}><option value="ZNE">Zero Noise Extrapolation</option><option value="CDR">Clifford Data Regression</option></select></div>
            <Button onClick={runMitigation} isLoading={loading} className="h-[46px]" icon={<Settings2 className="w-4 h-4"/>}>Execute Mitigation</Button>
         </div>
      </Card>
      <div className="space-y-8">
         {results.map((res) => (
           <Card key={res.sampleId} title={`Sample #${res.sampleId} Analysis`} subtitle="Extrapolation to zero noise limit">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="col-span-2 h-72 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-2">
                 <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={res.chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                     <XAxis dataKey="scale" type="number" domain={[0, 6]} stroke="#94a3b8" />
                     <YAxis stroke="#94a3b8" />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }} />
                     <Legend />
                     <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                     <Scatter dataKey="value" fill={COLORS.primary} />
                     <Scatter data={res.chartData.filter(d => d.type === 'mitigated')} fill={COLORS.secondary} shape="star" r={10} />
                   </ComposedChart>
                 </ResponsiveContainer>
               </div>
               <div className="space-y-4 flex flex-col justify-center">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">True Label</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{res.trueLabel}</p>
                  </div>
                  <div className="p-5 bg-violet-50/50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-900/30 text-center">
                    <p className="text-xs text-violet-500 dark:text-violet-400 uppercase font-bold tracking-wider mb-1">Raw Noise</p>
                    <p className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">{res.rawValues[0].toFixed(4)}</p>
                  </div>
                  <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center shadow-sm">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider mb-1">Mitigated Result</p>
                    <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{res.mitigatedValue.toFixed(4)}</p>
                  </div>
               </div>
             </div>
           </Card>
         ))}
         {results.length === 0 && !loading && ( 
           <div className="text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/30">
             <Server className="w-12 h-12 mx-auto mb-4 opacity-50"/>
             <p className="font-medium">Run a mitigation job to view extrapolation curves.</p>
           </div> 
         )}
      </div>
    </div>
  );
};
