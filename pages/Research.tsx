
import React, { useState, useEffect, useRef } from 'react';
import { Card, SectionTitle, Button, Input, Badge, Select, Modal } from '../components/UI';
import { CitationGraph } from '../components/CitationGraph';
import { api } from '../services/api';
import { ResearchPaper, TrendingTopic, PaperAnalysis } from '../types';
import { Search, FileText, Sparkles, ExternalLink, BookOpen, QrCode, Filter, Bookmark, BookmarkCheck, Network, List, TrendingUp, ArrowRight, Activity, Radar, ScanSearch, CheckCircle2, ChevronRight, Zap, Target, Loader2, Calendar } from 'lucide-react';
// @ts-ignore
import QRCode from 'react-qr-code';

export const Research: React.FC = () => {
  const [query, setQuery] = useState('quantum machine learning');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [qrOpenId, setQrOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [savedPapers, setSavedPapers] = useState<ResearchPaper[]>([]);
  
  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Trending State
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [lastScannedPaper, setLastScannedPaper] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // --- PAPER INTELLIGENCE STATE ---
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<PaperAnalysis | null>(null);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedPaperTitle, setSelectedPaperTitle] = useState('');

  useEffect(() => {
      // Initial Load of trends and saved papers
      api.fetchTrendingTopics().then(setTrends);
      setSavedPapers(api.paperService.getSavedPapers());

      // Simulation: Real-time tracking loop
      const interval = setInterval(() => {
          setScanning(true);
          const mockTitles = [
              "Optimizing Quantum Kernels with Genetic Algorithms",
              "Noise-Resilient VQC for Finance",
              "Geometric Deep Learning on Quantum Processors",
              "Transformer-based Qubit Routing",
              "Syndrome Decoding with Neural Networks"
          ];
          const scanned = mockTitles[Math.floor(Math.random() * mockTitles.length)];
          setLastScannedPaper(scanned);

          if (Math.random() > 0.6) {
              setTrends(prev => {
                  const idx = Math.floor(Math.random() * prev.length);
                  if (idx < 0 || idx >= prev.length) return prev;
                  const updated = [...prev];
                  const topic = updated[idx];
                  updated[idx] = { 
                      ...topic, 
                      paperCount: topic.paperCount + 1,
                      growth: Math.min(100, topic.growth + (Math.random() * 2))
                  };
                  return updated;
              });
          }
          setTimeout(() => setScanning(false), 1500);
      }, 8000);

      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (showAnalysisModal && selectedPaperTitle && !analyzingId) {
          handleAnalyze(selectedPaperTitle, true); 
      }
  }, [skillLevel]);

  const categories = ['All', 'Saved', 'Foundational', 'Applied', 'Experimental', 'Production-Ready'];

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setSelectedCategory('All');
    setQuery(searchQuery);
    
    // UI improvement: immediate scroll to signal search started
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try { 
        const res = await api.fetchResearchPapers(searchQuery); 
        setPapers(res); 
    } 
    catch (err) { 
        console.error(err); 
        if ((window as any).notify) (window as any).notify('error', 'Search failed. Please try again.');
    } 
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleAnalyze = async (title: string, isRefresh = false) => {
      setAnalyzingId(title);
      if (!isRefresh) {
          setShowAnalysisModal(true);
          setSelectedPaperTitle(title);
      }
      setAnalysisData(null);
      
      try {
          const result = await api.getPaperAnalysis(title, skillLevel);
          setAnalysisData(result);
      } catch (e) {
          console.error(e);
      } finally {
          setAnalyzingId(null);
      }
  };

  const toggleSavePaper = (paper: ResearchPaper) => {
      const isSaved = savedPapers.some(p => p.id === paper.id);
      if (isSaved) {
          api.paperService.unsavePaper(paper.id);
          const updated = savedPapers.filter(p => p.id !== paper.id);
          setSavedPapers(updated);
          if ((window as any).notify) (window as any).notify('info', 'Paper removed from library');
      } else {
          api.paperService.savePaper(paper);
          const updated = [paper, ...savedPapers];
          setSavedPapers(updated);
          if ((window as any).notify) (window as any).notify('success', 'Paper saved to library');
      }
  };

  /**
   * Hardened Link Opening Utility
   * Strips markdown remnants and Hallucinations
   */
  const openLink = (url: string) => {
      if (!url || url === '#' || url === 'undefined') {
          if ((window as any).notify) (window as any).notify('error', 'Link not available for this record.');
          return;
      }
      
      // Clean hallucinated markdown characters
      let clean = url.trim().replace(/[\[\]\(\)]/g, '');
      if (!clean.startsWith('http')) clean = 'https://' + clean;
      
      window.open(clean, '_blank', 'noopener,noreferrer');
  };

  const getSourceColor = (source: string) => {
    if (source.includes('Nature') || source.includes('Science')) return 'green';
    if (source.includes('IEEE')) return 'blue';
    if (source.includes('IBM')) return 'violet';
    if (source.includes('arXiv')) return 'violet';
    return 'gray';
  };

  const getCategoryColor = (cat?: string) => {
      switch(cat) {
          case 'Foundational': return 'blue';
          case 'Applied': return 'violet';
          case 'Experimental': return 'amber';
          case 'Production-Ready': return 'green';
          default: return 'gray';
      }
  };

  const getPapersForView = () => {
      if (selectedCategory === 'Saved') return savedPapers;
      const base = selectedCategory === 'All' ? papers : papers.filter(p => p.category === selectedCategory);
      return base;
  };

  const displayPapers = getPapersForView();

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionTitle 
        title="Research Lab" 
        subtitle="AI-curated insights from top journals & platforms" 
        rightElement={
            <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 rounded-full text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-200 dark:border-violet-800">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Tracker Active
            </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-l-4 border-l-violet-500 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Radar className="w-5 h-5 text-violet-500"/> Emerging Topics Radar
                  </h3>
                  {scanning && (
                      <span className="text-[10px] font-mono text-emerald-500 animate-pulse flex items-center gap-1">
                          <ScanSearch className="w-3 h-3"/> SCANNING...
                      </span>
                  )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  {trends.map(trend => (
                      <div 
                        key={trend.id} 
                        onClick={() => performSearch(trend.topic)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all cursor-pointer group flex flex-col h-full"
                      >
                          <div className="flex items-center gap-1 mb-2">
                              <TrendingUp className={`w-3 h-3 ${trend.velocity === 'high' ? 'text-red-500' : 'text-emerald-500'}`} />
                              <span className={`text-xs font-bold ${trend.velocity === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>+{trend.growth.toFixed(0)}%</span>
                          </div>
                          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs line-clamp-2 h-8 leading-tight mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{trend.topic}</h4>
                          <p className="text-[10px] text-slate-400 mb-2">{trend.paperCount} papers</p>
                      </div>
                  ))}
              </div>
          </Card>

          <Card className="bg-slate-900 text-slate-300 flex flex-col justify-between border-slate-800 shadow-lg">
              <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <Activity className="w-3 h-3"/> Extraction Engine
                  </h4>
                  <div className="space-y-3 font-mono text-[10px]">
                      {lastScannedPaper && (
                          <div className="flex gap-2 animate-fade-in bg-slate-800 p-2 rounded border-l-2 border-emerald-500">
                              <span className="text-emerald-400 font-bold">STREAM</span>
                              <span className="truncate">Indexing: "{lastScannedPaper}"</span>
                          </div>
                      )}
                      <div className="flex justify-between items-center opacity-50 mt-4">
                          <span>Connection:</span>
                          <span className="text-emerald-400">Stable</span>
                      </div>
                  </div>
              </div>
          </Card>
      </div>

      <div ref={resultsRef} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300 scroll-mt-24">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
             <Input className="pl-11 py-3 text-lg shadow-sm" value={query} onChange={e => setQuery(e.target.value)} placeholder="Topic e.g. 'VQC Optimization'..." />
          </div>
          <Button type="submit" isLoading={loading} className="px-8 py-3 text-base shadow-lg shadow-violet-200 dark:shadow-none">Search Databases</Button>
        </form>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {(papers.length > 0 || savedPapers.length > 0) && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                selectedCategory === cat 
                                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {cat === 'Saved' && <Bookmark className="w-3 h-3" />}
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {papers.length > 0 && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('graph')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}
                    >
                        <Network className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
      </div>

      {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 animate-fade-in">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              <div className="text-center">
                  <p className="font-black text-sm uppercase tracking-widest text-slate-600 dark:text-slate-300">Searching Repositories...</p>
                  <p className="text-xs font-medium opacity-60">Leveraging Gemini 3 for cross-referenced citation retrieval</p>
              </div>
          </div>
      ) : viewMode === 'graph' && displayPapers.length > 0 ? (
          <div className="animate-fade-in">
              <CitationGraph papers={displayPapers} />
          </div>
      ) : (
          <div className="space-y-6 pb-20">
            {displayPapers.length === 0 && searched ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No papers found</h3>
                    <p className="text-sm text-slate-500 mt-2">Try broad terms like "Quantum Circuits" or "ML".</p>
                </div>
            ) : displayPapers.map((paper, idx) => {
              const isSaved = savedPapers.some(p => p.id === paper.id);
              return (
                <Card key={paper.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${idx % 2 === 0 ? 'border-l-violet-500' : 'border-l-emerald-500'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge color={getCategoryColor(paper.category) as any}>{paper.category}</Badge>
                            <Badge color={getSourceColor(paper.source)}>{paper.source}</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight hover:text-violet-700 dark:hover:text-violet-400 transition-colors cursor-pointer" onClick={() => openLink(paper.webUrl || paper.pdfUrl)}>{paper.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                                <Calendar className="w-3 h-3"/> {paper.publishedDate}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button 
                            variant={isSaved ? 'soft' : 'outline'} 
                            className={`h-9 px-3 text-xs transition-all ${isSaved ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' : ''}`}
                            onClick={() => toggleSavePaper(paper)}
                            icon={isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        >
                            {isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => openLink(paper.pdfUrl)} icon={<FileText className="w-3.5 h-3.5"/>}>PDF</Button>
                        <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => openLink(paper.webUrl || paper.pdfUrl)} icon={<ExternalLink className="w-3.5 h-3.5"/>}>Source</Button>
                        <Button 
                                variant={qrOpenId === paper.id ? 'soft' : 'outline'} 
                                className="h-9 px-3 text-xs" 
                                onClick={() => setQrOpenId(qrOpenId === paper.id ? null : paper.id)} 
                                icon={<QrCode className="w-3.5 h-3.5"/>}
                        >
                                QR
                        </Button>
                    </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6 bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">{paper.summary}</p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 p-5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/50 flex gap-4 transition-colors w-full">
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm h-fit"><Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
                            <div><span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide">AI Insight</span><p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium">{paper.aiInsight}</p></div>
                        </div>
                    </div>

                    {qrOpenId === paper.id && (
                        <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center animate-fade-in relative overflow-hidden">
                            <div className="relative z-10 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                {paper.webUrl && paper.webUrl !== '#' ? (
                                    <QRCode value={paper.webUrl} size={128} viewBox={`0 0 256 256`} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                ) : (
                                    <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs italic">URL Not Available</div>
                                )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 uppercase tracking-wider flex items-center gap-2">
                                <QrCode className="w-3 h-3"/> Scan to open paper
                            </p>
                        </div>
                    )}
                </Card>
              );
            })}
          </div>
      )}
    </div>
  );
};
