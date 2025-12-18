import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Cloud, Hash, Database, Key, 
  ChevronRight, AlertTriangle, FileCode, Sliders, Bell, Sparkles, Command
} from 'lucide-react';
import { MOCK_INCIDENTS } from './constants';
import { Incident, TriageAction, ToastNotification } from './types';
import { FunnelWidget } from './components/FunnelWidget';
import { DetailDrawer } from './components/DetailDrawer';

// Helper for Icons based on type
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'AWS': return <Cloud className="w-3.5 h-3.5 text-amber-400" />;
    case 'Slack': return <Hash className="w-3.5 h-3.5 text-blue-400" />;
    case 'DB': return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    default: return <Key className="w-3.5 h-3.5 text-slate-400" />;
  }
};

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const addToast = (message: string, type: ToastNotification['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleTriage = (id: string, action: TriageAction) => {
    setSelectedIncident(null);
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    const message = action === 'confirm' 
      ? "Incident Confirmed. Ticket #SEC-204 created." 
      : "Marked as False Positive. AI model updated.";
    addToast(message, action === 'confirm' ? 'success' : 'info');
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
    if (score >= 50) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-rose-500/30 overflow-x-hidden relative">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.15] pointer-events-none fixed" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none fixed" />

      {/* --- Navbar --- */}
      <nav className="border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
            </div>
            <h1 className="font-semibold text-sm tracking-tight text-slate-100">
              Sentinel<span className="text-slate-500 font-normal">AI</span>
            </h1>
            <span className="mx-2 text-slate-800">/</span>
            <span className="text-sm text-slate-400 font-medium">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Command Menu Mockup */}
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900/50 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all group">
              <span className="flex items-center gap-1">Search...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 group-hover:text-slate-300">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <div className="h-4 w-px bg-slate-800" />

            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950" />
            </button>
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 ring-2 ring-transparent hover:ring-slate-700 cursor-pointer transition-all">
              JD
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* --- Header Actions --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">Security Overview</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time secret detection and AI triage.</p>
          </div>
          <div className="flex gap-3">
             <button className="h-9 px-4 bg-slate-900/50 border border-slate-800 text-slate-300 rounded-md text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors focus:ring-2 focus:ring-slate-700">
               <Sliders className="w-3.5 h-3.5" />
               Filter View
             </button>
             {/* Magic UI Shimmer Button */}
             <button className="relative inline-flex h-9 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312e81_50%,#E2E8F0_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                  Run Smart Scan
                </span>
             </button>
          </div>
        </div>

        {/* --- Widgets Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px]">
            <FunnelWidget />
          </div>

          {/* KPI Card with Border Beam Effect */}
          <div className="group relative h-[300px] bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center overflow-hidden">
             {/* Gradient Orb */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-rose-500/30 transition-all duration-500" />
             
             <div className="relative z-10 w-20 h-20 rounded-2xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
               <AlertTriangle className="w-8 h-8 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
             </div>
             <div className="relative z-10 text-6xl font-sans font-bold text-white tracking-tighter mb-2 tabular-nums">
               {incidents.filter(i => i.risk_score > 80).length}
             </div>
             <div className="relative z-10 text-rose-400 text-xs font-bold uppercase tracking-widest border border-rose-900/50 bg-rose-950/30 px-3 py-1 rounded-full">
               Critical Actions
             </div>
          </div>
        </div>

        {/* --- Incidents Table Container --- */}
        <div className="space-y-4">
          
          {/* Table Filters */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                  activeFilter === filter 
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/30' 
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Table Toolbar */}
            <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
              <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-slate-300">Incidents</span>
                 <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono border border-slate-700/50">
                   {incidents.length}
                 </span>
              </div>
              
              <div className="relative group">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by file or ID..." 
                  className="h-8 bg-slate-900 border border-slate-800 rounded-md pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all placeholder:text-slate-600" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  <tr>
                    <th className="h-10 px-6 align-middle border-b border-slate-800/50">Risk</th>
                    <th className="h-10 px-6 align-middle border-b border-slate-800/50">Type</th>
                    <th className="h-10 px-6 align-middle border-b border-slate-800/50">Location</th>
                    <th className="h-10 px-6 align-middle border-b border-slate-800/50">Verdict</th>
                    <th className="h-10 px-6 align-middle border-b border-slate-800/50 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center text-slate-500">
                        <div className="flex flex-col items-center">
                           <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3 border border-slate-800">
                             <ShieldCheck className="w-6 h-6 text-emerald-500/50" />
                           </div>
                           <p className="text-sm font-medium text-slate-300">All Clear</p>
                           <p className="text-xs text-slate-500 mt-1">No active secrets detected.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    incidents.map((incident) => (
                      <tr 
                        key={incident.id} 
                        onClick={() => setSelectedIncident(incident)}
                        className="group cursor-pointer hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-6 py-3 w-48">
                          <div className="flex flex-col gap-1.5">
                            <span className={`text-[11px] font-mono font-bold ${incident.risk_score > 80 ? 'text-rose-400' : 'text-slate-400'}`}>
                              {incident.risk_score} / 100
                            </span>
                            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${incident.risk_score}%` }} 
                                className={`h-full rounded-full ${getRiskColor(incident.risk_score)} transition-all duration-1000 ease-out`}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                            <TypeIcon type={incident.type} />
                            {incident.type}
                          </div>
                        </td>

                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2 group/link">
                            <FileCode className="w-3.5 h-3.5 text-slate-600 group-hover/link:text-indigo-400 transition-colors" />
                            <span className="font-mono text-xs text-slate-400 group-hover/link:text-indigo-400 group-hover/link:underline transition-colors truncate max-w-[240px]">
                              {incident.file}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            incident.risk_score > 80 
                              ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' 
                              : incident.verdict.includes('False') 
                                ? 'bg-slate-500/5 text-slate-400 border-slate-600/30' 
                                : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                          }`}>
                            {incident.verdict.split(':')[0]}
                          </span>
                        </td>

                        <td className="px-6 py-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors ml-auto" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- Detail Drawer --- */}
      <DetailDrawer 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)} 
        onTriage={handleTriage}
      />

      {/* --- Toast Container --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border animate-fade-in backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' 
                : 'bg-slate-900/80 border-slate-600/50 text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}