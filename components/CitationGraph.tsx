
import React, { useMemo, useState } from 'react';
import { ResearchPaper } from '../types';
import { BookOpen, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

interface CitationGraphProps {
  papers: ResearchPaper[];
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  r: number;
  paper: ResearchPaper;
  year: number;
  categoryIndex: number;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
}

export const CitationGraph: React.FC<CitationGraphProps> = ({ papers }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const categories = ['Foundational', 'Applied', 'Experimental', 'Production-Ready'];
  const height = 500;
  const width = 800; // SVG internal width
  const paddingX = 60;
  const headerHeight = 40;
  const laneHeight = (height - headerHeight) / categories.length;

  const { nodes, links, yearRange } = useMemo(() => {
    // 1. Sort and Extract Years
    const sortedPapers = [...papers].sort((a, b) => {
        const yearA = parseInt(a.publishedDate.split(' ')[1]) || 2020;
        const yearB = parseInt(b.publishedDate.split(' ')[1]) || 2020;
        return yearA - yearB;
    });

    const years = sortedPapers.map(p => parseInt(p.publishedDate.split(' ')[1]) || 2020);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const span = Math.max(2, maxYear - minYear);

    // 2. Create Nodes
    const graphNodes: GraphNode[] = sortedPapers.map((paper, idx) => {
        const year = parseInt(paper.publishedDate.split(' ')[1]) || 2020;
        
        // Normalize Year to X (add padding)
        const normalizedX = (year - minYear) / span;
        
        // Add jitter based on index to prevent total overlap in same year
        // We use a "slot" system based on index to distribute them within the year column
        const yearGroup = sortedPapers.filter(p => (parseInt(p.publishedDate.split(' ')[1]) || 2020) === year);
        const indexInYear = yearGroup.indexOf(paper);
        const jitterX = (indexInYear - (yearGroup.length - 1) / 2) * 40; 

        let x = paddingX + normalizedX * (width - 2 * paddingX) + jitterX;
        
        // Normalize Category to Y (Center of swimlane)
        // Order: Foundational (Bottom) -> Production (Top) or vice versa?
        // Let's do: Foundational (Top) to Production (Bottom) to show "Application" flow?
        // Or specific tiers. Let's map strict index.
        const catIndex = categories.indexOf(paper.category || 'Applied');
        // Center in lane
        let y = headerHeight + (catIndex * laneHeight) + (laneHeight / 2);
        
        // Add slight vertical jitter so lines don't perfectly overlap
        const jitterY = (idx % 2 === 0 ? 1 : -1) * 10;
        y += jitterY;

        return {
            id: paper.id,
            x: Math.max(paddingX, Math.min(width - paddingX, x)),
            y,
            r: 14, // Fixed readable size
            paper,
            year,
            categoryIndex: catIndex
        };
    });

    // 3. Create Links
    const graphLinks: GraphLink[] = [];
    graphNodes.forEach(sourceNode => {
        if (sourceNode.paper.citations) {
            sourceNode.paper.citations.forEach(targetId => {
                // Find node by ID or partial title match for mock data robustness
                const targetNode = graphNodes.find(n => n.id === targetId || n.paper.title.includes(targetId) || targetId.includes(n.paper.id));
                if (targetNode) {
                    graphLinks.push({ source: sourceNode, target: targetNode });
                }
            });
        }
    });

    return { nodes: graphNodes, links: graphLinks, yearRange: { min: minYear, max: maxYear } };
  }, [papers]);

  // Interaction State Helpers
  const activeId = hoveredNode || selectedNodeId;
  const selectedNode = nodes.find(n => n.id === activeId);

  // Helper colors
  const getCategoryColor = (index: number) => {
      const colors = [
          '#3b82f6', // Foundational (Blue)
          '#8b5cf6', // Applied (Violet)
          '#f59e0b', // Experimental (Amber)
          '#10b981'  // Production (Green)
      ];
      return colors[index] || '#94a3b8';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        
        {/* GRAPH AREA */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden relative flex flex-col">
            
            {/* Graph Header / Timeline Axis */}
            <div className="absolute top-0 left-0 w-full h-[40px] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 justify-between text-xs font-mono text-slate-400 pointer-events-none z-10">
                <span>{yearRange.min}</span>
                <span>Research Timeline</span>
                <span>{yearRange.max}</span>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" className="dark:fill-slate-600" />
                        </marker>
                        {/* Glow Filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Swimlane Backgrounds */}
                    {categories.map((cat, i) => (
                        <g key={cat}>
                            <rect 
                                x="0" 
                                y={headerHeight + i * laneHeight} 
                                width={width} 
                                height={laneHeight} 
                                fill={i % 2 === 0 ? 'var(--bg-lane-odd, rgba(248,250,252, 0.5))' : 'transparent'} 
                                className="dark:fill-slate-800/30"
                            />
                            {/* Lane Label */}
                            <text 
                                x="10" 
                                y={headerHeight + i * laneHeight + 20} 
                                className="text-[10px] font-bold uppercase fill-slate-300 dark:fill-slate-600 pointer-events-none"
                            >
                                {cat}
                            </text>
                            {/* Lane Divider */}
                            <line 
                                x1="0" y1={headerHeight + (i+1) * laneHeight} 
                                x2={width} y2={headerHeight + (i+1) * laneHeight} 
                                stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4"
                                className="dark:stroke-slate-800"
                            />
                        </g>
                    ))}

                    {/* Connections (Bezier Curves) */}
                    {links.map((link, i) => {
                        const isRelated = activeId && (link.source.id === activeId || link.target.id === activeId);
                        const isDimmed = activeId && !isRelated;
                        
                        // Curve Logic: Sigmoid curve
                        const midX = (link.source.x + link.target.x) / 2;
                        const path = `M ${link.source.x} ${link.source.y} C ${midX} ${link.source.y}, ${midX} ${link.target.y}, ${link.target.x} ${link.target.y}`;

                        return (
                            <path 
                                key={i}
                                d={path}
                                fill="none"
                                stroke={isRelated ? getCategoryColor(link.target.categoryIndex) : '#cbd5e1'}
                                strokeWidth={isRelated ? 2 : 1}
                                strokeOpacity={isDimmed ? 0.1 : 0.6}
                                markerEnd={isRelated ? "url(#arrowhead)" : ""}
                                className="transition-all duration-300 dark:stroke-slate-600"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => {
                        const isActive = activeId === node.id;
                        const isRelated = activeId && links.some(l => (l.source.id === activeId && l.target.id === node.id) || (l.target.id === activeId && l.source.id === node.id));
                        const isDimmed = activeId && !isActive && !isRelated;

                        return (
                            <g 
                                key={node.id}
                                onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                className="cursor-pointer transition-all duration-300"
                                style={{ opacity: isDimmed ? 0.3 : 1 }}
                            >
                                {/* Outer Glow Ring for Active */}
                                <circle 
                                    cx={node.x} cy={node.y} r={node.r + 6}
                                    fill="none"
                                    stroke={getCategoryColor(node.categoryIndex)}
                                    strokeWidth={2}
                                    opacity={isActive ? 0.3 : 0}
                                    className="transition-all duration-300 animate-pulse"
                                />
                                
                                {/* Main Circle */}
                                <circle 
                                    cx={node.x} cy={node.y} r={node.r}
                                    fill={getCategoryColor(node.categoryIndex)}
                                    stroke="white" strokeWidth={2}
                                    className="dark:stroke-slate-900 drop-shadow-md transition-transform duration-200"
                                    style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                                />

                                {/* Icon inside circle (optional, simplified to just Year or Initials) */}
                                <text 
                                    x={node.x} y={node.y + 4} 
                                    textAnchor="middle" 
                                    fill="white" 
                                    fontSize="10" 
                                    fontWeight="bold"
                                    pointerEvents="none"
                                >
                                    {node.year.toString().slice(2)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>

        {/* DETAILS PANEL (Right Side) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm h-full overflow-y-auto">
            {selectedNode ? (
                <div className="animate-fade-in space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span 
                                className="text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider"
                                style={{ backgroundColor: getCategoryColor(selectedNode.categoryIndex) }}
                            >
                                {selectedNode.paper.category}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{selectedNode.year}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {selectedNode.paper.title}
                        </h3>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                            <BookOpen className="w-3 h-3"/> Abstract
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedNode.paper.summary}
                        </p>
                    </div>

                    {/* Citations / Lineage Info */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Research Lineage</h4>
                        <div className="space-y-2">
                            {links.filter(l => l.source.id === selectedNode.id).map(l => (
                                <div key={l.target.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <ArrowRight className="w-3 h-3 text-slate-400"/>
                                    <span className="truncate">Cites: {l.target.paper.title}</span>
                                </div>
                            ))}
                            {links.filter(l => l.target.id === selectedNode.id).map(l => (
                                <div key={l.source.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    <span className="truncate">Cited By: {l.source.paper.title}</span>
                                </div>
                            ))}
                            {links.filter(l => l.source.id === selectedNode.id || l.target.id === selectedNode.id).length === 0 && (
                                <p className="text-xs text-slate-400 italic">No connections in this dataset.</p>
                            )}
                        </div>
                    </div>

                    <a 
                        href={selectedNode.paper.webUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full mt-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                        Read Paper <ExternalLink className="w-4 h-4"/>
                    </a>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 opacity-60">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm font-medium">Select a node to view research details.</p>
                </div>
            )}
        </div>
    </div>
  );
};
