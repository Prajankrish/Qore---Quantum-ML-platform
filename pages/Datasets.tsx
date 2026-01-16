
import React, { useState, useEffect, useRef } from 'react';
import { Card, SectionTitle, Button, Badge, Modal } from '../components/UI';
import { api } from '../services/api';
import { CustomDataset, DatasetPreview, DatasetAnalysis } from '../types';
import { Upload, Trash2, FileSpreadsheet, Eye, Database, Search, Sigma, TableProperties, Sparkles, Wand2, Scale, Binary, Brain } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { COLORS } from '../constants';

export const Datasets: React.FC = () => {
  const [datasets, setDatasets] = useState<CustomDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<DatasetPreview | null>(null);
  const [previewName, setPreviewName] = useState('');
  
  // AI Analysis State
  const [analysisResult, setAnalysisResult] = useState<DatasetAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analyzedDatasetName, setAnalyzedDatasetName] = useState('');

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    setDatasets(api.getCustomDatasets());
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        api.saveCustomDataset(file.name, text);
        loadDatasets();
      }
      setLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      api.deleteCustomDataset(id);
      loadDatasets();
    }
  };

  const handlePreview = (ds: CustomDataset) => {
      setSelectedPreview({
          headers: ds.features,
          rows: ds.preview,
          stats: ds.stats
      });
      setPreviewName(ds.name);
      setShowPreview(true);
  };

  const handleAnalyze = async (ds: CustomDataset) => {
      setAnalyzing(true);
      setShowAnalysisModal(true);
      setAnalyzedDatasetName(ds.name);
      setAnalysisResult(null);
      
      try {
          const result = await api.analyzeDataset(ds.name, ds.features);
          setAnalysisResult(result);
      } catch (e) {
          console.error(e);
      } finally {
          setAnalyzing(false);
      }
  };

  const filteredDatasets = datasets.filter(ds => 
    ds.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle title="Dataset Manager" subtitle="Upload and manage custom CSV datasets" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Card */}
        <div className="md:col-span-1">
          <Card title="Upload Data" subtitle="CSV format required">
            <div 
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
              <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-violet-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Click to Upload</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supported: .csv (max 5MB)</p>
            </div>
          </Card>
        </div>

        {/* Dataset List */}
        <div className="md:col-span-2">
          <Card title="My Library" action={<Badge color="blue">{filteredDatasets.length} Found</Badge>}>
            
            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                    type="text" 
                    placeholder="Search your datasets..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
            </div>

            {filteredDatasets.length === 0 ? (
               <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                  <Database className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium">
                    {searchQuery ? 'No matching datasets found.' : 'No custom datasets uploaded yet.'}
                  </p>
               </div>
            ) : (
              <div className="space-y-4">
                {filteredDatasets.map(ds => (
                  <div key={ds.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{ds.name}</h4>
                        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>{ds.rows} Rows</span>
                          <span>{ds.features.length} Features</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => handlePreview(ds)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                      </Button>
                      <Button variant="soft" className="h-9 px-3 text-xs" onClick={() => handleAnalyze(ds)} icon={<Wand2 className="w-3.5 h-3.5" />}>
                        Analyze
                      </Button>
                      <Button variant="danger" className="h-9 px-3 text-xs" onClick={() => handleDelete(ds.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ENHANCED PREVIEW MODAL */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title={`Preview: ${previewName}`}>
          {selectedPreview && (
              <div className="space-y-8">
                  {/* Stats Section */}
                  {selectedPreview.stats.length > 0 && (
                      <div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                              <Sigma className="w-4 h-4 text-violet-500"/> Statistical Summary
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                              <table className="min-w-full text-xs text-left">
                                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                      <tr>
                                          <th className="px-4 py-2">Column</th>
                                          <th className="px-4 py-2">Mean</th>
                                          <th className="px-4 py-2">Std Dev</th>
                                          <th className="px-4 py-2">Min</th>
                                          <th className="px-4 py-2">Max</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {selectedPreview.stats.map((s, i) => (
                                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                              <td className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300">{s.name}</td>
                                              <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{s.mean}</td>
                                              <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{s.std}</td>
                                              <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{s.min}</td>
                                              <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{s.max}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  )}

                  {/* Rows Section */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <TableProperties className="w-4 h-4 text-emerald-500"/> Raw Data (First 5 Rows)
                      </h4>
                      {selectedPreview.rows.length === 0 ? (
                          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                              <Database className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                              <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">Preview data not available</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">Delete and re-upload this dataset to see row preview.</p>
                          </div>
                      ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                              <table className="min-w-full text-xs text-left">
                                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                      <tr>
                                          {selectedPreview.headers.map((h, i) => (
                                              <th key={i} className="px-4 py-3">{h}</th>
                                          ))}
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {selectedPreview.rows.map((row, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                              {selectedPreview.headers.map((h, i) => (
                                                  <td key={i} className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                                                      {row[h] !== undefined ? String(row[h]) : '-'}
                                                  </td>
                                              ))}
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </Modal>

      {/* AI INTELLIGENCE MODAL */}
      <Modal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} title={`QML Readiness: ${analyzedDatasetName}`}>
          {analyzing ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-violet-100 dark:border-slate-800 border-t-violet-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
                      </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Analyzing dimensionality & feature correlation...</p>
              </div>
          ) : analysisResult ? (
              <div className="space-y-8 animate-fade-in">
                  {/* Top Score Card */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl text-white shadow-lg">
                      <div>
                          <h4 className="text-2xl font-black mb-1">{analysisResult.suitabilityScore}/100</h4>
                          <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Suitability Score</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/30 backdrop-blur-sm`}>
                          {analysisResult.suitabilityLevel} Potential
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Encoding Recommendation */}
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Binary className="w-4 h-4 text-emerald-500"/> Recommended Encoding
                          </h5>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{analysisResult.recommendedEncoding.type}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{analysisResult.recommendedEncoding.reason}</p>
                      </div>

                      {/* Feature Map Recommendation */}
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Brain className="w-4 h-4 text-violet-500"/> Optimal Feature Map
                          </h5>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{analysisResult.recommendedFeatureMap.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{analysisResult.recommendedFeatureMap.reason}</p>
                      </div>
                  </div>

                  {/* Preprocessing Steps */}
                  <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-blue-500"/> Suggested Preprocessing
                      </h5>
                      <div className="space-y-2">
                          {analysisResult.preprocessingSteps.map((step, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                  <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Feature Importance Chart */}
                  <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sigma className="w-4 h-4 text-amber-500"/> Quantum Kernel Relevance
                      </h5>
                      <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analysisResult.featureImportance} layout="vertical" margin={{ left: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                  <XAxis type="number" domain={[0, 1]} hide />
                                  <YAxis dataKey="feature" type="category" width={80} tick={{fontSize: 11, fill: '#94a3b8'}} />
                                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', backgroundColor: '#1e293b', border: 'none', color: '#f8fafc' }} />
                                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20} fill={COLORS.primary} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          ) : null}
      </Modal>
    </div>
  );
};
