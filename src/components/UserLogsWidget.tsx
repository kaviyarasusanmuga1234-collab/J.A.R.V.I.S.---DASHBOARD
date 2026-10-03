import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Shield,
  PlusCircle,
} from 'lucide-react';
import { UserLogEntry } from '../types';
import { soundFx } from '../utils/audioEffects';

interface UserLogsWidgetProps {
  logs: UserLogEntry[];
  onClearLogs: () => void;
  onAddCustomLog: (action: string, severity: UserLogEntry['severity'], category: UserLogEntry['category']) => void;
}

export const UserLogsWidget: React.FC<UserLogsWidgetProps> = ({
  logs,
  onClearLogs,
  onAddCustomLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isDetailedView, setIsDetailedView] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSev = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesCat && matchesSev;
  });

  const exportLogsAsJson = () => {
    soundFx.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jarvis_system_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportLogsAsCsv = () => {
    soundFx.playClick();
    const headers = 'ID,Timestamp,Category,Severity,Action,Details\n';
    const rows = logs
      .map((l) => `"${l.id}","${l.timestamp}","${l.category}","${l.severity}","${l.action.replace(/"/g, '""')}","${(l.details || '').replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jarvis_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getSeverityIcon = (sev: UserLogEntry['severity']) => {
    switch (sev) {
      case 'error':
        return <AlertOctagon className="w-3 h-3 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'audit':
        return <Shield className="w-3 h-3 text-cyan-400" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />;
    }
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Recent Activity &amp; Detailed Logs
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsDetailedView(!isDetailedView);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold transition-all ${
              isDetailedView
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
                : 'bg-cyan-950/40 text-slate-400 hover:text-cyan-300 border border-cyan-500/20'
            }`}
          >
            {isDetailedView ? 'Compact' : 'Detailed'}
          </button>

          <button
            onClick={exportLogsAsCsv}
            className="p-1 rounded bg-cyan-950/60 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundFx.playAlert();
              onClearLogs();
            }}
            className="p-1 rounded bg-rose-950/30 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
            title="Clear All Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar when in detailed view */}
      {isDetailedView && (
        <div className="space-y-1.5 mb-2 pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3 h-3 text-cyan-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search log messages or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#030919] border border-cyan-500/30 rounded pl-7 pr-2 py-1 text-xs text-cyan-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={() => {
                soundFx.playScan();
                onAddCustomLog('Diagnostic routine initiated by user', 'info', 'SYSTEM');
              }}
              className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-400/50 text-[10px] font-tech font-bold flex items-center gap-1 shrink-0"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Simulate Event</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-tech text-slate-400">
            <span>Category:</span>
            {['ALL', 'SYSTEM', 'NETWORK', 'SECURITY', 'TERMINAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  categoryFilter === cat
                    ? 'bg-cyan-500/40 text-cyan-100 font-bold'
                    : 'bg-cyan-950/30 hover:text-cyan-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logs Stream (Exact look as in reference image) */}
      <div className="space-y-2 overflow-y-auto max-h-56 pr-1 font-tech">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-tech">
            No activity logs match the selected filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 p-1.5 rounded hover:bg-cyan-500/10 transition-colors group"
            >
              {/* Timestamp */}
              <div className="flex items-center gap-1.5 min-w-[76px] font-mono text-[11px] text-cyan-400 font-bold shrink-0">
                {getSeverityIcon(log.severity)}
                <span>{log.timestamp}</span>
              </div>

              {/* Action Description */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-cyan-100 font-medium leading-tight">
                  {log.action}
                </div>
                {isDetailedView && log.details && (
                  <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    [{log.category}] {log.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
