import React from 'react';
import { MAX_PITCH_DEG, MIN_PITCH_DEG, MAX_ROLL_DEG, MIN_ROLL_DEG } from '../constants';

interface InclinometerProps {
  pitch: number;
  roll: number;
}

export const Inclinometer: React.FC<InclinometerProps> = ({ pitch, roll }) => {
  // SVG Calculations for the Artificial Horizon
  const radius = 90;
  const center = 100;
  
  // Convert pitch to vertical offset
  // Enhanced sensitivity for visual display since limits are small (-5 to +5)
  // Multiply by 10 to make 5 degrees look like 50px offset
  const pitchOffset = Math.max(-60, Math.min(60, pitch * 10)); 

  return (
    <div className="flex flex-col items-center bg-industrial-800 p-4 rounded-xl border border-industrial-700 shadow-lg">
      <h3 className="text-industrial-accent font-semibold mb-2 uppercase tracking-wider text-sm">平台姿态 (Attitude)</h3>
      
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
          {/* Outer Bezel */}
          <circle cx={center} cy={center} r={radius + 5} fill="#1e293b" stroke="#475569" strokeWidth="4" />
          
          <defs>
            <clipPath id="horizon-clip">
              <circle cx={center} cy={center} r={radius} />
            </clipPath>
          </defs>

          {/* Rotating Group (Roll) */}
          <g transform={`rotate(${-roll}, ${center}, ${center})`} clipPath="url(#horizon-clip)">
            {/* Sky */}
            <rect x="0" y="0" width="200" height="200" fill="#0ea5e9" opacity="0.8" />
            
            {/* Ground (moves up/down with pitch) */}
            <rect 
              x="-50" 
              y={center + pitchOffset} 
              width="300" 
              height="300" 
              fill="#a78bfa" // Light purple/brown ground
              stroke="#fff"
              strokeWidth="2"
            />
            
            {/* Pitch Ladder Lines */}
            <line x1="70" y1={center - 30 + pitchOffset} x2="130" y2={center - 30 + pitchOffset} stroke="white" strokeWidth="1" opacity="0.5" />
            <line x1="70" y1={center + 30 + pitchOffset} x2="130" y2={center + 30 + pitchOffset} stroke="white" strokeWidth="1" opacity="0.5" />
          </g>

          {/* Fixed Aircraft Reference */}
          <path d="M 60 100 L 90 100 L 100 110 L 110 100 L 140 100" stroke="#fbbf24" strokeWidth="4" fill="none" />
          <circle cx={center} cy={center} r="2" fill="#fbbf24" />

          {/* Ticks */}
          <line x1={center} y1="10" x2={center} y2="20" stroke="white" strokeWidth="2" />
          <line x1={center} y1="180" x2={center} y2="190" stroke="white" strokeWidth="2" />
          <line x1="10" y1={center} x2="20" y2={center} stroke="white" strokeWidth="2" />
          <line x1="180" y1={center} x2="190" y2={center} stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        <div className="bg-industrial-900 rounded p-2 text-center border border-industrial-700">
          <div className="text-xs text-slate-400">俯仰角 (PITCH)</div>
          <div className="text-xl font-mono font-bold text-white">{pitch.toFixed(1)}°</div>
          <div className="text-[10px] text-slate-500">{MIN_PITCH_DEG}° ~ {MAX_PITCH_DEG}°</div>
        </div>
        <div className="bg-industrial-900 rounded p-2 text-center border border-industrial-700">
          <div className="text-xs text-slate-400">横滚角 (ROLL)</div>
          <div className="text-xl font-mono font-bold text-white">{roll.toFixed(1)}°</div>
          <div className="text-[10px] text-slate-500">{MIN_ROLL_DEG}° ~ {MAX_ROLL_DEG}°</div>
        </div>
      </div>
    </div>
  );
};