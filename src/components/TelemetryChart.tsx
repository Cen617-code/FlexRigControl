import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { TelemetryPoint } from '../types';

interface TelemetryChartProps {
  data: TelemetryPoint[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-industrial-800 p-4 rounded-xl border border-industrial-700 shadow-lg">
       <h3 className="text-industrial-accent font-semibold mb-2 uppercase tracking-wider text-sm">实时遥测 (Real-time Telemetry)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tick={false} />
          <YAxis yAxisId="left" stroke="#38bdf8" fontSize={10} />
          <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="height" 
            stroke="#38bdf8" 
            strokeWidth={2}
            dot={false}
            name="高度 Height (mm)"
            isAnimationActive={false}
          />
           <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="pitch" 
            stroke="#fbbf24" 
            strokeWidth={2}
            dot={false}
            name="俯仰 Pitch (deg)"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};