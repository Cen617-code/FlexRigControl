import React from 'react';
import { MAX_HEIGHT_MM, MIN_HEIGHT_MM } from '../constants';

interface HeightGaugeProps {
  height: number;
}

export const HeightGauge: React.FC<HeightGaugeProps> = ({ height }) => {
  const range = MAX_HEIGHT_MM - MIN_HEIGHT_MM;
  const percentage = Math.min(100, Math.max(0, ((height - MIN_HEIGHT_MM) / range) * 100));

  return (
    <div className="h-full bg-industrial-800 p-4 rounded-xl border border-industrial-700 shadow-lg flex flex-col">
      <h3 className="text-industrial-accent font-semibold mb-4 uppercase tracking-wider text-sm text-center">升降高度 (Lift Height)</h3>
      
      <div className="flex-1 flex flex-row items-stretch justify-center gap-4">
        {/* The Bar */}
        <div className="relative w-16 bg-industrial-900 rounded-full border border-industrial-700 overflow-hidden">
          {/* Fill */}
          <div 
            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-300 ease-out opacity-80"
            style={{ height: `${percentage}%` }}
          />
          
          {/* Ticks */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
            {[...Array(11)].map((_, i) => {
              const tickPercentage = 100 - (i * 10);
              const tickValue = Math.round(MIN_HEIGHT_MM + (range * (tickPercentage / 100)));
              return (
                <div key={i} className="w-full border-b border-slate-600/30 text-[10px] text-right pr-1 text-slate-500 flex justify-between items-center">
                   <span className="opacity-0">.</span> {/* Spacer */}
                   <span>{tickValue}</span>
                </div>
              );
            })}
          </div>

          {/* Current Marker */}
          <div 
            className="absolute w-full border-t-2 border-white drop-shadow-md z-10"
            style={{ bottom: `${percentage}%` }}
          />
        </div>

        {/* Digital Readout */}
        <div className="flex flex-col justify-end pb-4">
             <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                {Math.round(height)}
                <span className="text-sm text-slate-400 ml-1 font-sans font-normal">mm</span>
             </div>
             <div className="text-xs text-slate-500 mt-1">U10 编码器读数</div>
        </div>
      </div>
    </div>
  );
};