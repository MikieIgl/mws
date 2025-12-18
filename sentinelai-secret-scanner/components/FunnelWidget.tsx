import React from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip } from 'recharts';

const data = [
  { value: 1000, name: 'Total Findings', fill: '#64748b' }, // Slate 500
  { value: 800, name: 'Heuristics Filter', fill: '#34d399' }, // Emerald 400
  { value: 150, name: 'AI Analyzed', fill: '#fbbf24' }, // Amber 400
  { value: 50, name: 'Critical Threats', fill: '#f43f5e' }, // Rose 500
];

export const FunnelWidget: React.FC = () => {
  return (
    <div className="h-full bg-slate-950/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden backdrop-blur-md shadow-sm ring-1 ring-white/5">
      <div className="mb-6 relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">Noise Reduction Pipeline</h2>
          <p className="text-slate-500 text-sm mt-1">Filtering efficiency overview</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-emerald-400 text-2xl font-bold tracking-tight">95%</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Reduction Rate</span>
        </div>
      </div>

      <div className="h-[220px] w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#020617', 
                borderColor: '#1e293b', 
                color: '#f8fafc',
                fontSize: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: '#e2e8f0', padding: 0 }}
              cursor={{ fill: 'transparent' }}
              separator=": "
            />
            <Funnel
              data={data}
              dataKey="value"
              isAnimationActive
              stroke="none"
            >
              <LabelList 
                position="right" 
                fill="#94a3b8" 
                stroke="none" 
                dataKey="name" 
                fontSize={12} 
                fontWeight={500}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      
      {/* Subtle sheen effect */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
    </div>
  );
};