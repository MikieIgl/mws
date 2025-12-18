import React from 'react';

interface CodeViewerProps {
  snippet: string;
  highlightLine: number;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ snippet, highlightLine }) => {
  const lines = snippet.split('\n');

  return (
    <div className="bg-[#0D1117] border border-slate-800 rounded-lg overflow-hidden font-mono text-sm shadow-xl flex flex-col h-full ring-1 ring-white/5">
      {/* Editor Header / Tabs */}
      <div className="flex items-center px-4 h-10 bg-[#010409] border-b border-slate-800 select-none">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        </div>
        <div className="flex items-center h-full px-4 bg-[#0D1117] border-r border-l border-slate-800 text-xs text-slate-300 relative top-[1px] border-t-2 border-t-rose-500">
          <span className="mr-2">📄</span>
          source_file.ts
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto py-3">
        {lines.map((line, i) => {
          const lineNumber = i + 1;
          const isTarget = lineNumber === highlightLine;
          
          return (
            <div 
              key={i} 
              className={`flex w-full group ${isTarget ? 'bg-rose-500/10' : 'hover:bg-slate-800/20'}`}
            >
              <div 
                className={`w-12 flex-shrink-0 text-right pr-4 select-none py-0.5 text-[11px] leading-6 ${isTarget ? 'text-slate-200 font-bold' : 'text-slate-600'}`}
              >
                {lineNumber}
              </div>
              <div className="flex-1 py-0.5 pr-4 pl-2 border-l border-slate-800/50">
                <code className={`font-mono text-[13px] leading-6 ${isTarget ? 'text-slate-100' : 'text-slate-400'} whitespace-pre`}>
                  {line}
                </code>
              </div>
              {isTarget && (
                <div className="w-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};