
import React from 'react';

interface CircuitVisualizerProps {
  qubits?: number;
  layers?: number;
  rotations?: number[][]; // [layer][qubit] -> angle value (radians)
}

export const CircuitVisualizer: React.FC<CircuitVisualizerProps> = ({ qubits = 4, layers = 3, rotations }) => {
  const rowHeight = 50;
  const colWidth = 60;
  const paddingX = 40;
  const paddingY = 30;

  const width = (layers + 1) * colWidth + paddingX * 2;
  const height = qubits * rowHeight + paddingY * 2;

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-6 flex justify-center transition-colors">
      <svg width={width} height={height} className="min-w-full">
        <defs>
            {/* Standard Qubit Line Gradient */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity="1" />
            </linearGradient>
        </defs>

        {/* Qubit Lines */}
        {Array.from({ length: qubits }).map((_, i) => (
          <g key={`line-${i}`}>
            <text x={10} y={paddingY + i * rowHeight + 5} className="text-xs font-mono font-bold fill-slate-400 dark:fill-slate-500">q[{i}]</text>
            <line
              x1={paddingX}
              y1={paddingY + i * rowHeight}
              x2={width - paddingX}
              y2={paddingY + i * rowHeight}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              className="dark:stroke-slate-700"
            />
          </g>
        ))}

        {/* Layers & Gates */}
        {Array.from({ length: layers }).map((_, l) => (
          <g key={`layer-${l}`}>
            
            {/* Single Qubit Gates (Ry) */}
            {Array.from({ length: qubits }).map((_, q) => {
              const x = paddingX + (l + 0.5) * colWidth;
              const y = paddingY + q * rowHeight;
              
              // Dynamic visualization based on rotation prop
              const rotationVal = rotations?.[l]?.[q];
              // Normalize rotation for opacity (0 to 2PI roughly map to 0.2 to 1.0 opacity)
              const opacity = rotationVal !== undefined 
                ? 0.2 + (Math.abs(rotationVal % 6.28) / 6.28) * 0.8 
                : 0.1;
              
              const displayVal = rotationVal !== undefined ? rotationVal.toFixed(2) : null;

              return (
                <g key={`gate-group-${l}-${q}`}>
                    <rect
                      x={x - 15}
                      y={y - 15}
                      width={30}
                      height={30}
                      rx={6}
                      fill={`rgba(124, 58, 237, ${rotationVal !== undefined ? 1 : 0.1})`} // Violet base
                      stroke={rotationVal !== undefined ? '#7c3aed' : '#ddd6fe'}
                      strokeWidth="1.5"
                      className="transition-all duration-300 ease-in-out dark:stroke-violet-800"
                    />
                    <text 
                        x={x} 
                        y={y + 4} 
                        textAnchor="middle" 
                        className={`text-[10px] font-bold pointer-events-none ${rotationVal !== undefined ? 'fill-white' : 'fill-violet-300 dark:fill-violet-800'}`}
                    >
                        Ry
                    </text>
                    {/* Live Parameter Value Label */}
                    {displayVal && (
                        <text
                            x={x}
                            y={y + 28}
                            textAnchor="middle"
                            className="text-[8px] font-mono font-bold fill-violet-600 dark:fill-violet-400"
                        >
                            {displayVal}
                        </text>
                    )}
                </g>
              );
            })}
            
            {/* Entangling Layers (CNOTs) - Realistic Notation */}
            {l % 2 === 0 && Array.from({ length: Math.floor(qubits / 2) }).map((_, q) => {
               const x = paddingX + (l + 0.5) * colWidth + 25; // Shifted right slightly
               const yControl = paddingY + (2*q) * rowHeight;
               const yTarget = paddingY + (2*q + 1) * rowHeight;
               return (
                   <g key={`cnot-${l}-${q}`}>
                        {/* Connection Line */}
                        <line 
                            x1={x} y1={yControl} x2={x} y2={yTarget} 
                            stroke="#64748b" strokeWidth="2"
                            className="dark:stroke-slate-500"
                        />
                        
                        {/* Control Dot (Solid) */}
                        <circle cx={x} cy={yControl} r={4} fill="#64748b" className="dark:fill-slate-500" />
                        
                        {/* Target (Circle Plus) */}
                        <circle cx={x} cy={yTarget} r={8} fill="none" stroke="#64748b" strokeWidth="2" className="dark:stroke-slate-500 bg-white dark:bg-slate-800"/>
                        <line x1={x} y1={yTarget-8} x2={x} y2={yTarget+8} stroke="#64748b" strokeWidth="2" className="dark:stroke-slate-500"/>
                        <line x1={x-8} y1={yTarget} x2={x+8} y2={yTarget} stroke="#64748b" strokeWidth="2" className="dark:stroke-slate-500"/>
                   </g>
               )
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};
