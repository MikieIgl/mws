import React from 'react';
import { X, ShieldAlert, CheckCircle, Activity, ExternalLink, Copy, Check } from 'lucide-react';
import { Incident } from '../types';
import { CodeViewer } from './CodeViewer';

interface DetailDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onTriage: (id: string, action: 'confirm' | 'dismiss') => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ incident, onClose, onTriage }) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className="relative w-[85vw] max-w-6xl h-full bg-[#020617] border-l border-slate-800 shadow-2xl flex flex-col animate-slide-in-right ring-1 ring-white/10">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-[#020617]/95 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${
              incident.risk_score > 80 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
              {incident.risk_score > 80 ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Incident Analysis
                <span className="font-mono text-slate-500 font-normal ml-2">#{incident.id}</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{incident.file}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Code Context */}
          <div className="w-7/12 p-6 bg-[#020617] border-r border-slate-800 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Context</h3>
              <div className="flex items-center gap-2">
                <button className="text-[10px] font-medium px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                  View Blame
                </button>
                <button className="text-[10px] font-medium px-2 py-1 bg-slate-900 border border-slate-800 rounded text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  Open in Repo
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
               <CodeViewer snippet={incident.snippet} highlightLine={incident.line_number} />
            </div>
          </div>

          {/* Right: AI Analysis */}
          <div className="w-5/12 flex flex-col bg-slate-900/30 relative">
             <div className="flex-1 overflow-y-auto p-8">
                
                {/* AI Verdict Card */}
                <div className="mb-8 p-1 rounded-xl bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent">
                  <div className="bg-slate-950/80 backdrop-blur-xl rounded-lg p-5 border border-indigo-500/20 shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10" />
                     
                     <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">AI Reasoning</span>
                     </div>
                     
                     <h1 className="text-lg font-semibold text-slate-100 mb-2">{incident.verdict}</h1>
                     <p className="text-sm text-slate-400 leading-relaxed">
                        {incident.ai_reasoning}
                     </p>
                     
                     <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs font-mono">
                        <div className="flex flex-col">
                           <span className="text-slate-500">Confidence</span>
                           <span className="text-emerald-400 font-bold">98.4%</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-slate-500">Entropy</span>
                           <span className="text-slate-300">5.2</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident Metadata</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                      <span className="block text-[10px] text-slate-500 uppercase mb-1">Secret Type</span>
                      <span className="text-sm text-slate-200 font-medium flex items-center gap-2">
                        {incident.type}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                      <span className="block text-[10px] text-slate-500 uppercase mb-1">Line Number</span>
                      <span className="text-sm text-slate-200 font-medium">Line {incident.line_number}</span>
                    </div>
                     <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors col-span-2">
                      <span className="block text-[10px] text-slate-500 uppercase mb-1">File Path</span>
                      <span className="text-sm text-slate-200 font-medium font-mono truncate" title={incident.file}>{incident.file}</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-6 border-t border-slate-800 bg-[#020617] backdrop-blur absolute bottom-0 w-full z-20">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onTriage(incident.id, 'dismiss')}
                    className="h-10 px-4 rounded-md border border-slate-700 bg-transparent text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                    False Positive
                  </button>
                  <button 
                    onClick={() => onTriage(incident.id, 'confirm')}
                    className="h-10 px-4 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-950 focus:outline-none"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Confirm Secret
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};