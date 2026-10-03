import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { SecurityStatus } from '../types';
import { soundFx } from '../utils/audioEffects';

interface SecurityWidgetProps {
  security: SecurityStatus;
  onRunScan: () => void;
}

export const SecurityWidget: React.FC<SecurityWidgetProps> = ({
  security,
  onRunScan,
}) => {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    soundFx.playScan();
    setScanning(true);
    setTimeout(() => {
      soundFx.playChime();
      setScanning(false);
      onRunScan();
    }, 2200);
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (security.scorePercent / 100) * circumference;

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Security Level
          </h2>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="text-[10px] font-tech text-cyan-300 bg-cyan-950/60 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Run Scan'}</span>
        </button>
      </div>

      {/* Grid: Left checklist, Right radial gauge */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Checklist */}
        <div className="col-span-7 space-y-1 text-xs font-tech">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-slate-400">System Security</span>
            <span className="text-cyan-200 font-mono font-medium">: {security.overallLevel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-slate-400">Firewall</span>
            <span className="text-cyan-200 font-mono font-medium">
              : {security.firewall ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-slate-400">Antivirus</span>
            <span className="text-cyan-200 font-mono font-medium">
              : {security.antivirus ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="text-slate-400">BitLocker</span>
            <span className="text-slate-300 font-mono font-medium">
              : {security.bitlocker ? 'Active' : 'Off'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-slate-400">UAC</span>
            <span className="text-cyan-200 font-mono font-medium">
              : {security.uac ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-slate-400">Threats Found</span>
            <span className="text-emerald-400 font-mono font-bold">: {security.threatsFound}</span>
          </div>
        </div>

        {/* Right Radial Security Meter */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="#092543"
                strokeWidth="5"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="#00f0ff"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out',
                  filter: 'drop-shadow(0 0 6px #00f0ff)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-black text-lg text-cyan-200 tabular-nums">
                {security.scorePercent}%
              </span>
            </div>
          </div>
          <span className="text-[9px] font-tech font-bold text-cyan-400/90 tracking-widest mt-1 text-center leading-tight">
            SECURITY LEVEL
          </span>
        </div>
      </div>
    </div>
  );
};
