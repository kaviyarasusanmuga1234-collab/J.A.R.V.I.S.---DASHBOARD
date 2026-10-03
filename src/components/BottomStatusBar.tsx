import React from 'react';
import {
  Globe,
  Cpu,
  HardDrive,
  Activity,
  Power,
  Layers,
} from 'lucide-react';
import { HardwareMetrics, StorageDrive, NetworkMetrics } from '../types';
import { soundFx } from '../utils/audioEffects';

interface BottomStatusBarProps {
  hardware: HardwareMetrics;
  storage: StorageDrive[];
  network: NetworkMetrics;
  osName: string;
  onOpenPower: () => void;
  onOpenCustomizer: () => void;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  hardware,
  storage,
  network,
  osName,
  onOpenPower,
  onOpenCustomizer,
}) => {
  const avgStoragePercent = Math.round(
    storage.reduce((acc, d) => acc + d.percent, 0) / (storage.length || 1)
  );

  return (
    <footer className="w-full bg-[#040c1e]/95 border-t border-cyan-500/25 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-tech z-30 shadow-[0_-4px_15px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {/* Left Quote */}
      <div className="flex items-center gap-2 text-cyan-300/90 italic font-medium">
        <div className="w-5 h-5 rounded-full border border-cyan-400/50 bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-[0_0_6px_#00f0ff] shrink-0">
          <Globe className="w-3 h-3 animate-spin-slow" />
        </div>
        <span className="text-[11px] sm:text-xs">
          “The best technology is the one that works for you.”
        </span>
        <span className="text-cyan-400 font-bold not-italic text-[11px]">— J.A.R.V.I.S.</span>
      </div>

      {/* Center & Right Telemetry Indicators */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* CPU */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">CPU</span>
          <span className="font-mono text-cyan-200 font-bold tabular-nums">
            {Math.round(hardware.cpu.usagePercent)}%
          </span>
        </div>

        {/* RAM */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">RAM</span>
          <span className="font-mono text-cyan-200 font-bold tabular-nums">
            {Math.round(hardware.ram.percent)}%
          </span>
        </div>

        {/* Storage */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">Storage</span>
          <span className="font-mono text-cyan-200 font-bold tabular-nums">
            {avgStoragePercent}%
          </span>
        </div>

        {/* Network */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">Network</span>
          <span className="font-mono text-cyan-200 font-bold tabular-nums">
            {network.downloadMbps.toFixed(1)} / {network.uploadMbps.toFixed(1)} Mbps
          </span>
        </div>

        {/* OS Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#071936] border border-cyan-500/30 text-cyan-200 font-mono text-[11px] font-semibold">
          <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5 text-cyan-400 shrink-0">
            <span className="bg-cyan-400 rounded-[0.5px]" />
            <span className="bg-cyan-400 rounded-[0.5px]" />
            <span className="bg-cyan-400 rounded-[0.5px]" />
            <span className="bg-cyan-400 rounded-[0.5px]" />
          </div>
          <span>{osName.replace('Microsoft ', '')}</span>
        </div>

        {/* Power button */}
        <button
          onClick={() => {
            soundFx.playAlert();
            onOpenPower();
          }}
          className="p-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-500/20 transition-all shadow-[0_0_8px_rgba(244,63,94,0.25)] cursor-pointer"
          title="System Power Options"
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
