
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Button, Badge } from '../components/UI';
import { api } from '../services/api';
import { Experiment } from '../types';
import { Trash2, Download, Eye, X, Archive, Calendar, Layers, TriangleAlert, Hash } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../constants';

export const Experiments: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { setExperiments(api.getExperiments()); }, []);
  const loadData = () => { setExperiments(api.getExperiments()); };
  
  const confirmDelete = () => { 
      if (deleteId) { 
          api.deleteExperiment(deleteId); 
          loadData(); 
          if (selectedExp?.id === deleteId) setSelectedExp(null); 
          setDeleteId(null); 
          if ((window as any).notify) (window as any).notify('success', 'Experiment deleted');
      } 
  };

  const handleDownload = (exp: Experiment) => {
      api.downloadArtifacts(exp);
      if ((window as any).notify) (window as any).notify('success', 'Download started');
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <SectionTitle title="Experiment Tracker" subtitle="Manage and benchmark past training runs" />
      <Card className="overflow-hidden border-0 shadow-md">
        {experiments.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500"><div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 mb-4"><Archive className="h-10 w-10 text-slate-300 dark:text-slate-600" /></div><h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No experiments yet</h3></div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800"><thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dataset</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accuracy</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">{experiments.map((exp) => (<tr key={exp.id} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors group"><td className="px-6 py-4 whitespace-nowrap"><span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2"></span><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span></span></td><td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">{exp.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color="blue">{exp.dataset}</Badge></td><td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 dark:text-slate-300">{(exp.metrics.finalAccuracy * 100).toFixed(1)}%</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date(exp.timestamp).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex justify-end gap-2"><Button variant="ghost" className="!p-0 h-8 w-8 rounded-lg flex items-center justify-center" onClick={() => setSelectedExp(exp)}><Eye className="w-4 h-4 text-violet-600 dark:text-violet-400" /></Button><Button variant="ghost" className="!p-0 h-8 w-8 rounded-lg flex items-center justify-center" onClick={() => handleDownload(exp)}><Download className="w-4 h-4 text-slate-600 dark:text-slate-400" /></Button><Button variant="ghost" className="!p-0 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteId(exp.id)}><Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" /></Button></div></td></tr>))}</tbody></table></div>
        )}
      </Card>
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"><div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-slate-200 dark:border-slate-800"><div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full mb-6"><TriangleAlert className="w-7 h-7 text-red-500" /></div><h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Delete Experiment?</h3><p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Permanently remove the record.</p><div className="flex justify-center gap-4"><Button variant="ghost" onClick={() => setDeleteId(null)} className="w-full">Cancel</Button><Button variant="danger" onClick={confirmDelete} className="w-full shadow-red-200 dark:shadow-none">Delete</Button></div></div></div>
      )}
      {selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"><div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col border border-slate-200 dark:border-slate-800"><div className="flex justify-between items-start p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"><div><h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedExp.name}</h3><div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(selectedExp.timestamp).toLocaleString()}</span><span className="flex items-center gap-1"><Hash className="w-4 h-4" /> {selectedExp.id.substring(0,8)}</span></div></div><button onClick={() => setSelectedExp(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button></div><div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8"><div className="space-y-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Configuration</h4><div className="space-y-3 text-sm"><div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700"><span className="text-slate-500 dark:text-slate-400 font-medium">Dataset</span><span className="font-bold text-slate-800 dark:text-slate-200">{selectedExp.dataset}</span></div><div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700"><span className="text-slate-500 dark:text-slate-400 font-medium">Epochs</span><span className="font-bold text-slate-800 dark:text-slate-200">{selectedExp.parameters.epochs}</span></div></div></div></div><div className="md:col-span-2 space-y-6"><div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 h-80 shadow-sm"><h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Convergence History</h4><ResponsiveContainer width="100%" height="100%"><LineChart data={selectedExp.metrics.history}><Line type="monotone" dataKey="loss" stroke={COLORS.primary} dot={false} strokeWidth={3} /><Line type="monotone" dataKey="accuracy" stroke={COLORS.secondary} dot={false} strokeWidth={3} /></LineChart></ResponsiveContainer></div></div></div></div></div>
      )}
    </div>
  );
};
