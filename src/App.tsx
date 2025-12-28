import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Battery, Wifi, AlertTriangle, Settings, Cpu } from 'lucide-react';
import { Inclinometer } from './components/Inclinometer';
import { HeightGauge } from './components/HeightGauge';
import { MotorControls } from './components/MotorControls';
import { TelemetryChart } from './components/TelemetryChart';
import { SystemMode } from './types';
import type { SensorData, TelemetryPoint } from './types'; // Explicit type import
import { UPDATE_INTERVAL_MS, CHART_HISTORY_POINTS, MOTOR_CONFIG, MAX_HEIGHT_MM, MIN_HEIGHT_MM, MAX_PITCH_DEG, MIN_PITCH_DEG, MAX_ROLL_DEG, MIN_ROLL_DEG } from './constants';

export default function App() {
  // --- System State ---
  const [mode, setMode] = useState<SystemMode>(SystemMode.IDLE);
  const [sensors, setSensors] = useState<SensorData>({
    height: 350, // Start at Min Height
    pitch: 0,
    roll: 0,
    batteryVoltage: 24.2
  });
  
  // Historical data for chart
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);

  // Simulation State for "Movement"
  const [targetHeight, setTargetHeight] = useState<number | null>(null);
  const [targetPitch, setTargetPitch] = useState<number | null>(null);
  const [targetRoll, setTargetRoll] = useState<number | null>(null);

  // --- Handlers ---

  const handleEstop = useCallback(() => {
    const newMode = mode === SystemMode.ESTOP ? SystemMode.IDLE : SystemMode.ESTOP;
    setMode(newMode);
    
    // Clear targets so it stops trying to move
    setTargetHeight(null);
    setTargetPitch(null);
    setTargetRoll(null);
  }, [mode]);

  // Reset Height Only (M1)
  const handleResetHeight = useCallback(() => {
    if (mode === SystemMode.ESTOP) return;
    setMode(SystemMode.MOVING);
    setTargetHeight(MIN_HEIGHT_MM); // Return to 350mm
  }, [mode]);

  // Reset Attitude Only (M2-M5)
  const handleResetAttitude = useCallback(() => {
    if (mode === SystemMode.ESTOP) return;
    setMode(SystemMode.MOVING);
    setTargetPitch(0);
    setTargetRoll(0);
  }, [mode]);

  const handleMove = (direction: 'UP' | 'DOWN', _speed: number) => { // Rename speed to _speed or remove usage
    if (mode === SystemMode.ESTOP) return;
    setMode(SystemMode.MOVING);
    // Simulating target setting for Lift
    if (direction === 'UP') setTargetHeight(MAX_HEIGHT_MM);
    if (direction === 'DOWN') setTargetHeight(MIN_HEIGHT_MM);
  };

  const handleStop = useCallback(() => {
    if (mode === SystemMode.ESTOP) return;
    setMode(SystemMode.IDLE);
    setTargetHeight(null);
    setTargetPitch(null);
    setTargetRoll(null);
  }, [mode]);

  // Updated to support STEP (0.1 deg) and CONTINUOUS (Jog)
  const handleTilt = (direction: 'FWD' | 'BACK', type: 'STEP' | 'CONTINUOUS') => {
    if (mode === SystemMode.ESTOP) return;
    setMode(SystemMode.MOVING);

    if (type === 'STEP') {
        setSensors(prev => {
            const delta = direction === 'FWD' ? 0.1 : -0.1;
            const next = Math.max(MIN_PITCH_DEG, Math.min(MAX_PITCH_DEG, prev.pitch + delta));
            // Ensure we clear target so physics loop doesn't override step
            setTargetPitch(null); 
            return { ...prev, pitch: next };
        });
    } else {
        // Continuous: Set target to limit
        if (direction === 'FWD') setTargetPitch(MAX_PITCH_DEG);
        if (direction === 'BACK') setTargetPitch(MIN_PITCH_DEG);
    }
  };

  // Updated to support STEP (0.1 deg) and CONTINUOUS (Jog)
  const handleRoll = (direction: 'LEFT' | 'RIGHT', type: 'STEP' | 'CONTINUOUS') => {
    if (mode === SystemMode.ESTOP) return;
    setMode(SystemMode.MOVING);

    if (type === 'STEP') {
        setSensors(prev => {
            const delta = direction === 'RIGHT' ? 0.1 : -0.1;
            const next = Math.max(MIN_ROLL_DEG, Math.min(MAX_ROLL_DEG, prev.roll + delta));
            // Ensure we clear target so physics loop doesn't override step
            setTargetRoll(null); 
            return { ...prev, roll: next };
        });
    } else {
        // Continuous: Set target to limit
        if (direction === 'LEFT') setTargetRoll(MIN_ROLL_DEG);
        if (direction === 'RIGHT') setTargetRoll(MAX_ROLL_DEG);
    }
  };

  // --- Simulation Loop (Simulating STM32 Serial Stream) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't update physics if in ESTOP (Freeze State)
      if (mode === SystemMode.ESTOP) return;

      setSensors(prev => {
        let newHeight = prev.height;
        let newPitch = prev.pitch;
        let newRoll = prev.roll;
        
        // Simulate Height Movement (M1)
        if (targetHeight !== null) {
          const diff = targetHeight - prev.height;
          // Simple P-controllerish movement
          if (Math.abs(diff) > 2) {
             newHeight += diff > 0 ? 5 : -5;
          } else {
             newHeight = targetHeight; // Snap to target if close
          }
        }

        // Simulate Pitch Movement (M2-M5)
        if (targetPitch !== null) {
           const diff = targetPitch - prev.pitch;
           if (Math.abs(diff) > 0.05) {
              newPitch += diff > 0 ? 0.2 : -0.2; // Speed for continuous jog
           } else {
             newPitch = targetPitch;
           }
        }

        // Simulate Roll Movement (M2-M5)
        if (targetRoll !== null) {
           const diff = targetRoll - prev.roll;
           if (Math.abs(diff) > 0.05) {
              newRoll += diff > 0 ? 0.2 : -0.2;
           } else {
              newRoll = targetRoll;
           }
        }

        // Add sensor noise (ADC jitter)
        const voltageDrop = mode === SystemMode.MOVING ? 0.1 : 0.0;
        
        return {
          height: Math.max(MIN_HEIGHT_MM, Math.min(MAX_HEIGHT_MM, newHeight)),
          pitch: Math.max(MIN_PITCH_DEG, Math.min(MAX_PITCH_DEG, newPitch)),
          roll: Math.max(MIN_ROLL_DEG, Math.min(MAX_ROLL_DEG, newRoll)),
          batteryVoltage: Math.max(21, Math.min(25.2, prev.batteryVoltage - 0.001 - voltageDrop)) // Slowly draining
        };
      });
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [targetHeight, targetPitch, targetRoll, mode]);

  // --- Chart Data Update Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const newPoint = {
          time: timeStr,
          height: sensors.height,
          pitch: sensors.pitch
        };
        const newHist = [...prev, newPoint];
        if (newHist.length > CHART_HISTORY_POINTS) newHist.shift();
        return newHist;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sensors]);


  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-industrial-accent selection:text-white flex flex-col">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-industrial-700 px-6 py-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="bg-industrial-accent/10 p-2 rounded-lg border border-industrial-accent/20">
             <Cpu className="w-6 h-6 text-industrial-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">柔性工装控制系统 <span className="text-industrial-accent">(FLEX RIG)</span></h1>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === SystemMode.ESTOP ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></span>
              STM32 已连接 (CONNECTED)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           {/* Telemetry Pills */}
           <div className="hidden md:flex items-center gap-4 bg-slate-800 py-2 px-4 rounded-full border border-slate-700">
              <div className="flex items-center gap-2 text-sm font-mono text-industrial-accent">
                 <Wifi className="w-4 h-4" />
                 <span>-42dBm</span>
              </div>
              <div className="w-px h-4 bg-slate-600"></div>
              <div className="flex items-center gap-2 text-sm font-mono text-green-400">
                 <Battery className="w-4 h-4" />
                 <span>{sensors.batteryVoltage.toFixed(1)}V</span>
              </div>
           </div>

           {/* E-Stop Button (Top Right) */}
           <button 
             onClick={handleEstop}
             className={`
               flex items-center gap-2 px-6 py-2 rounded-md font-bold text-white shadow-lg transition-all
               ${mode === SystemMode.ESTOP 
                 ? 'bg-red-600 animate-pulse ring-4 ring-red-900' 
                 : 'bg-red-600/20 text-red-500 border border-red-500 hover:bg-red-600 hover:text-white'}
             `}
           >
             <AlertTriangle className="w-5 h-5" />
             {mode === SystemMode.ESTOP ? '紧急停止已激活' : '紧急停止 (E-STOP)'}
           </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Col: Visuals (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="flex-1 min-h-[300px]">
                <HeightGauge height={sensors.height} />
             </div>
             <div>
                <Inclinometer pitch={sensors.pitch} roll={sensors.roll} />
             </div>
          </div>

          {/* Center Col: Control & Charts (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             {/* Primary Controls */}
             <MotorControls 
               systemMode={mode} 
               onMove={handleMove} 
               onStop={handleStop}
               onTilt={handleTilt}
               onRoll={handleRoll}
               onEmergencyStop={handleEstop}
               onResetHeight={handleResetHeight}
               onResetAttitude={handleResetAttitude}
             />
             
             {/* Chart */}
             <div className="flex-1">
                <TelemetryChart data={telemetryHistory} />
             </div>
          </div>

          {/* Right Col: Detailed Status (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             
             {/* System Diagnostics */}
             <div className="bg-industrial-800 p-5 rounded-xl border border-industrial-700 shadow-lg">
                <h3 className="text-industrial-accent font-semibold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                   <Activity className="w-4 h-4" /> 
                   系统诊断 (System Diagnostics)
                </h3>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                      <span className="text-sm text-slate-400">MCU 运行时间</span>
                      <span className="font-mono text-green-400">00:42:15</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                      <span className="text-sm text-slate-400">CAN 总线负载</span>
                      <span className="font-mono text-blue-400">12%</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                      <span className="text-sm text-slate-400">驱动温度</span>
                      <span className="font-mono text-yellow-400">45°C</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                      <span className="text-sm text-slate-400">IMU 状态</span>
                      <span className="font-mono text-green-400 text-xs">CALIBRATED</span>
                   </div>
                </div>
             </div>

             {/* Individual Motor List */}
             <div className="bg-industrial-800 p-5 rounded-xl border border-industrial-700 shadow-lg flex-1">
                <h3 className="text-industrial-accent font-semibold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                   <Settings className="w-4 h-4" /> 
                   执行器阵列 (Actuators)
                </h3>
                
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                   {MOTOR_CONFIG.map((motor) => (
                      <div key={motor.id} className="p-3 bg-slate-700/50 rounded border border-slate-600 flex flex-col gap-1">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-white text-sm">{motor.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${motor.type === 'MAIN' ? 'bg-blue-900 text-blue-200' : 'bg-slate-600 text-slate-300'}`}>
                               {motor.type}
                            </span>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-400">电流 (Current)</span>
                            <div className="flex items-center gap-2">
                               <div className="w-16 h-1 bg-slate-600 rounded-full overflow-hidden">
                                  <div className={`h-full w-[30%] ${mode === SystemMode.ESTOP ? 'bg-red-500' : 'bg-green-500'}`}></div>
                               </div>
                               <span className="text-xs font-mono text-slate-300">{mode === SystemMode.ESTOP ? '0.0A' : '1.2A'}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}