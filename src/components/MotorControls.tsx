import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, RotateCw, RotateCcw, RefreshCcw, RefreshCw, Power, AlertOctagon, MoveHorizontal } from 'lucide-react';
import { SystemMode } from '../types';

interface MotorControlsProps {
  systemMode: SystemMode;
  onMove: (direction: 'UP' | 'DOWN', speed: number) => void;
  onStop: () => void;
  onTilt: (direction: 'FWD' | 'BACK', type: 'STEP' | 'CONTINUOUS') => void;
  onRoll: (direction: 'LEFT' | 'RIGHT', type: 'STEP' | 'CONTINUOUS') => void;
  onEmergencyStop: () => void;
  onResetHeight: () => void;
  onResetAttitude: () => void;
}

// Helper button that differentiates between a quick click (Step) and a hold (Continuous)
const JogButton = ({ 
  onStep, 
  onContinuousStart, 
  onContinuousStop, 
  disabled, 
  className,
  children 
}: { 
  onStep: () => void; 
  onContinuousStart: () => void; 
  onContinuousStop: () => void; 
  disabled: boolean; 
  className: string;
  children: React.ReactNode 
}) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isContinuous = useRef(false);

  const handleMouseDown = () => {
    if (disabled) return;
    isContinuous.current = false;
    timer.current = setTimeout(() => {
      isContinuous.current = true;
      onContinuousStart();
    }, 200); // 200ms threshold
  };

  const handleMouseUp = () => {
    if (timer.current) clearTimeout(timer.current);
    if (isContinuous.current) {
      onContinuousStop();
    } else if (!disabled) {
      onStep();
    }
    isContinuous.current = false;
  };

  const handleMouseLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    if (isContinuous.current) {
      onContinuousStop();
    }
    isContinuous.current = false;
  };

  return (
    <button
      className={className}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={(e) => { e.preventDefault(); handleMouseDown(); }}
      onTouchEnd={(e) => { e.preventDefault(); handleMouseUp(); }}
    >
      {children}
    </button>
  );
};

export const MotorControls: React.FC<MotorControlsProps> = ({ systemMode, onMove, onStop, onTilt, onRoll, onEmergencyStop, onResetHeight, onResetAttitude }) => {
  const isEstop = systemMode === SystemMode.ESTOP;

  return (
    <div className="bg-industrial-800 p-6 rounded-xl border border-industrial-700 shadow-lg flex flex-col gap-6 relative overflow-hidden">
      
      {/* Background Warning Stripe if Estop */}
      {isEstop && (
        <div className="absolute inset-0 bg-red-900/20 pointer-events-none z-0 flex items-center justify-center">
            <div className="text-red-800/20 text-9xl font-black uppercase rotate-[-15deg]">STOPPED</div>
        </div>
      )}

      {/* --- Main Drive Section --- */}
      <div className="flex justify-between items-center border-b border-industrial-700 pb-2 z-10">
        <h3 className="text-white font-semibold uppercase tracking-wider text-lg flex items-center gap-2">
          <Power className="w-5 h-5 text-industrial-success" />
          主驱动控制 (Main Drive)
        </h3>
        {/* Reset Height Button */}
        <button 
            onClick={onResetHeight}
            disabled={isEstop}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded border border-slate-600 flex items-center gap-1 disabled:opacity-50"
        >
            <RefreshCcw className="w-3 h-3" />
            升降复位
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 z-10">
        <button 
          disabled={isEstop}
          onMouseDown={() => onMove('UP', 50)}
          onMouseUp={onStop}
          onMouseLeave={onStop}
          className={`
            group flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all active:scale-95
            ${isEstop ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800' : 'bg-slate-700 border-slate-600 hover:border-industrial-accent hover:bg-slate-600 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]'}
          `}
        >
          <ArrowUp className="w-10 h-10 text-industrial-accent mb-2 group-hover:text-white transition-colors" />
          <span className="font-bold text-white tracking-widest text-lg">上升 (UP)</span>
        </button>

        <button 
          disabled={isEstop}
          onMouseDown={() => onMove('DOWN', 50)}
          onMouseUp={onStop}
          onMouseLeave={onStop}
          className={`
            group flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all active:scale-95
            ${isEstop ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800' : 'bg-slate-700 border-slate-600 hover:border-industrial-accent hover:bg-slate-600 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]'}
          `}
        >
          <ArrowDown className="w-10 h-10 text-industrial-accent mb-2 group-hover:text-white transition-colors" />
          <span className="font-bold text-white tracking-widest text-lg">下降 (DOWN)</span>
        </button>
      </div>

      {/* --- Posture Section --- */}
      <div className="z-10">
         <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                姿态微调 (Posture Adjustment)
            </div>
            {/* Reset Attitude Button */}
            <button 
                onClick={onResetAttitude}
                disabled={isEstop}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded border border-slate-600 flex items-center gap-1 disabled:opacity-50"
            >
                <RefreshCcw className="w-3 h-3" />
                姿态复位
            </button>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
            {/* Pitch Controls */}
            <div className="flex gap-2">
                <JogButton 
                  disabled={isEstop}
                  onStep={() => onTilt('FWD', 'STEP')}
                  onContinuousStart={() => onTilt('FWD', 'CONTINUOUS')}
                  onContinuousStop={onStop}
                  className="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white py-3 px-2 rounded flex flex-col items-center justify-center gap-1 active:bg-slate-600 disabled:opacity-50 select-none"
                >
                    <RotateCcw className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs">俯仰前倾 (0.1°)</span>
                </JogButton>
                
                <JogButton 
                  disabled={isEstop}
                  onStep={() => onTilt('BACK', 'STEP')}
                  onContinuousStart={() => onTilt('BACK', 'CONTINUOUS')}
                  onContinuousStop={onStop}
                  className="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white py-3 px-2 rounded flex flex-col items-center justify-center gap-1 active:bg-slate-600 disabled:opacity-50 select-none"
                >
                    <RotateCw className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs">俯仰后倾 (0.1°)</span>
                </JogButton>
            </div>

            {/* Roll Controls */}
            <div className="flex gap-2">
                <JogButton 
                  disabled={isEstop}
                  onStep={() => onRoll('LEFT', 'STEP')}
                  onContinuousStart={() => onRoll('LEFT', 'CONTINUOUS')}
                  onContinuousStop={onStop}
                  className="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white py-3 px-2 rounded flex flex-col items-center justify-center gap-1 active:bg-slate-600 disabled:opacity-50 select-none"
                >
                    <MoveHorizontal className="w-5 h-5 text-blue-400 rotate-[-15deg]" />
                    <span className="text-xs">横滚左倾 (0.1°)</span>
                </JogButton>

                <JogButton 
                  disabled={isEstop}
                  onStep={() => onRoll('RIGHT', 'STEP')}
                  onContinuousStart={() => onRoll('RIGHT', 'CONTINUOUS')}
                  onContinuousStop={onStop}
                  className="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white py-3 px-2 rounded flex flex-col items-center justify-center gap-1 active:bg-slate-600 disabled:opacity-50 select-none"
                >
                    <MoveHorizontal className="w-5 h-5 text-blue-400 rotate-[15deg]" />
                    <span className="text-xs">横滚右倾 (0.1°)</span>
                </JogButton>
            </div>
         </div>
      </div>

       {/* Prominent Emergency Stop */}
       <button 
         onClick={onEmergencyStop}
         className={`
           z-10 w-full py-4 rounded-lg font-black tracking-widest text-xl shadow-lg border-2 transition-all flex items-center justify-center gap-3
           ${isEstop 
             ? 'bg-red-600 text-white border-red-400 animate-pulse ring-4 ring-red-500/50' 
             : 'bg-red-950 text-red-500 border-red-700 hover:bg-red-900 hover:border-red-500 hover:text-red-100'}
         `}
       >
          <AlertOctagon className="w-8 h-8" />
          {isEstop ? '系统已急停 (STOPPED)' : '紧急停止 (E-STOP)'}
       </button>

       {/* Motor Status Grid */}
       <div className="mt-1 bg-industrial-900 rounded-lg p-3 border border-industrial-700 z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">CAN 驱动状态 (U4)</span>
            <RefreshCw className="w-3 h-3 text-industrial-accent animate-spin" />
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
             {['M1', 'M2', 'M3', 'M4', 'M5'].map(m => (
                <div key={m} className="bg-industrial-800 py-1 rounded border border-industrial-700">
                   <div className="text-[10px] text-slate-400">{m}</div>
                   <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${isEstop ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]'}`}></div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};