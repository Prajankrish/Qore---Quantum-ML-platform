
import React from 'react';

interface BlochSphereProps {
  theta: number;
  phi: number;
  size?: number;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({ theta, phi, size = 200 }) => {
  const radius = size / 2 - 20;
  const center = size / 2;
  
  // Calculate vector tip position based on theta (polar angle) and phi (azimuthal angle)
  // We project the 3D sphere onto 2D.
  // Standard quantum visualization:
  // Z-axis is vertical (|0> up, |1> down)
  // X/Y plane is horizontal.
  
  // For the 2D SVG projection:
  // cy (vertical) corresponds to -z
  // cx (horizontal) corresponds to projection of x and y
  
  // x = r * sin(theta) * cos(phi)
  // y = r * sin(theta) * sin(phi)
  // z = r * cos(theta)
  
  // Simple projection:
  // tipX = center + radius * sin(theta) * sin(phi) (Using Y component for width)
  // tipY = center - radius * cos(theta) (Using Z component for height, inverted)
  // This is a simplified view where we look primarily at the Y-Z plane
  
  const tipX = center + radius * Math.sin(theta) * Math.sin(phi);
  const tipY = center - radius * Math.cos(theta);
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Background Sphere Circle */}
      <circle cx={center} cy={center} r={radius} fill="url(#sphereGradient)" stroke="#e2e8f0" strokeWidth="1" />
      
      <defs>
        <radialGradient id="sphereGradient" cx="0.4" cy="0.4" r="0.8">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </radialGradient>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
        </marker>
      </defs>

      {/* Equator (dashed ellipse) */}
      <ellipse cx={center} cy={center} rx={radius} ry={radius/4} fill="none" stroke="#cbd5e1" strokeDasharray="3 3" />
      
      {/* Meridian (dashed ellipse) */}
      <ellipse cx={center} cy={center} rx={radius/4} ry={radius} fill="none" stroke="#cbd5e1" strokeDasharray="3 3" />
      
      {/* Axes Lines */}
      {/* Z-Axis */}
      <line x1={center} y1={center-radius} x2={center} y2={center+radius} stroke="#e2e8f0" strokeWidth="1" />
      
      {/* Labels */}
      <text x={center-6} y={center-radius-5} fontSize="12" fontWeight="bold" fill="#64748b">|0⟩</text>
      <text x={center-6} y={center+radius+15} fontSize="12" fontWeight="bold" fill="#64748b">|1⟩</text>
      
      {/* State Vector - Animated */}
      <line 
        x1={center} 
        y1={center} 
        x2={tipX} 
        y2={tipY} 
        stroke="#ef4444" 
        strokeWidth="2.5" 
        markerEnd="url(#arrow)" 
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
      
      {/* Center Point */}
      <circle cx={center} cy={center} r={3} fill="#94a3b8" />
    </svg>
  );
};
