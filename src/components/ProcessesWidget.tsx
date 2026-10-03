import React, { useState } from 'react';
import { Activity, X, Plus } from 'lucide-react';
import { ProcessItem } from '../types';
import { soundFx } from '../utils/audioEffects';

interface ProcessesWidgetProps {
  processes: ProcessItem[];
  onKillProcess: (pid: number) => void;
  onSpawnProcess?: () => void;
}

export const ProcessesWidget: React.FC<ProcessesWidgetProps> = ({
  processes,
  onKillProcess,
  onSpawnProcess,
}) => {
  const [filter, setFilter] = useState<'cpu' | 'memory'>('cpu');

  const sorted = [...processes].sort((a, b) =>
    filter === 'cpu' ? b.cpu - a.cpu : b.memoryMb - a.memoryMb
  );

  const getProcessIcon = (name: string) => {
    if (name.includes('chrome')) return '🌐';
    if (name.includes('python')) return '🐍';
    if (name.includes('explorer')) return '📁';
    if (name.includes('dwm')) return '🪟';
    if (name.includes('code')) return '⚡';
    return '⚙️';
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Running Processes (Top {Math.min(processes.length, 5)})
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-tech">
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('cpu');
            }}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              filter === 'cpu' ? 'bg-cyan-500/40 text-cyan-200 font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            By CPU
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('memory');
            }}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              filter === 'memory' ? 'bg-cyan-500/40 text-cyan-200 font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            By RAM
          </button>
        </div>
      </div>

      {/* Process Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cyan-500/20 text-[10px] font-tech text-slate-400 uppercase tracking-wider">
              <th className="py-1 px-1.5">Name</th>
              <th className="py-1 px-1.5">CPU</th>
              <th className="py-1 px-1.5">Memory</th>
              <th className="py-1 px-1.5">PID</th>
              <th className="py-1 px-1.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/10 text-xs font-mono">
            {sorted.slice(0, 5).map((proc) => (
              <tr
                key={proc.pid}
                className="hover:bg-cyan-500/10 transition-colors group"
              >
                <td className="py-1.5 px-1.5 font-sans font-medium text-cyan-100 flex items-center gap-1.5">
                  <span className="text-xs">{getProcessIcon(proc.name)}</span>
                  <span className="truncate max-w-[100px]">{proc.name}</span>
                </td>
                <td className="py-1.5 px-1.5 text-cyan-300 tabular-nums">
                  {proc.cpu.toFixed(1)}%
                </td>
                <td className="py-1.5 px-1.5 text-slate-300 tabular-nums">
                  {proc.memoryMb >= 1 ? `${Math.round(proc.memoryMb)} MB` : `${Math.round(proc.memoryMb * 1024)} KB`}
                </td>
                <td className="py-1.5 px-1.5 text-slate-400 tabular-nums">
                  {proc.pid}
                </td>
                <td className="py-1.5 px-1.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[11px] font-tech font-bold text-emerald-400">
                      {proc.status}
                    </span>
                    {proc.pid !== 0 && (
                      <button
                        onClick={() => {
                          soundFx.playAlert();
                          onKillProcess(proc.pid);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-rose-400 hover:bg-rose-500/20 transition-opacity"
                        title={`Terminate ${proc.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
