import React, { useState } from 'react';
import { Cpu, Maximize2, Minimize2, HardDrive, Monitor } from 'lucide-react';
import { HardwareMetrics } from '../types';
import { soundFx } from '../utils/audioEffects';

interface HardwareWidgetProps {
  hardware: HardwareMetrics;
}

export const HardwareWidget: React.FC<HardwareWidgetProps> = ({ hardware }) => {
  const [expanded, setExpanded] = useState(false);

  // SVG Circular Radial Progress Gauge helper
  const renderRadialGauge = (percent: number, color: string = '#00f0ff') => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90">
          {/* Background Track */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="#0a2540"
            strokeWidth="4"
          />
          {/* Foreground Progress */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out',
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-cyan-200 tabular-nums">
          {Math.round(percent)}%
        </div>
      </div>
    );
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Hardware Overview
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundFx.playClick();
              setExpanded(!expanded);
            }}
            className="p-1 rounded text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-500/20 transition-colors"
            title={expanded ? 'Compact view' : 'Detailed view'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Hardware Items List */}
      <div className="space-y-2.5">
        {/* CPU */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#071733]/70 border border-cyan-500/20 hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-cyan-500/40 bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)] shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-tech font-bold text-cyan-100 flex items-center gap-2">
                <span>CPU</span>
                <span className="text-[10px] font-mono text-cyan-400 font-normal">
                  {hardware.cpu.model}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {hardware.cpu.cores} Cores | {hardware.cpu.threads} Threads · Max {hardware.cpu.maxSpeedGhz.toFixed(2)} GHz
              </div>
              {expanded && (
                <div className="text-[10px] font-mono text-cyan-300/80 mt-0.5">
                  Temp: {hardware.cpu.tempCelsius}°C · Voltage: 1.18V
                </div>
              )}
            </div>
          </div>
          {renderRadialGauge(hardware.cpu.usagePercent, '#00f0ff')}
        </div>

        {/* RAM */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#071733]/70 border border-cyan-500/20 hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-cyan-500/40 bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)] shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-tech font-bold text-cyan-100">
                RAM
              </div>
              <div className="text-[11px] font-mono text-cyan-300 font-medium tabular-nums">
                {hardware.ram.usedGb.toFixed(1)} GB / {hardware.ram.totalGb.toFixed(1)} GB
              </div>
              {expanded && (
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Type: DDR4 3200MHz · Speed: 3200 MT/s
                </div>
              )}
            </div>
          </div>
          {renderRadialGauge(hardware.ram.percent, '#00d4ff')}
        </div>

        {/* GPU */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#071733]/70 border border-cyan-500/20 hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-cyan-500/40 bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)] shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-tech font-bold text-cyan-100 flex items-center gap-2">
                <span>GPU</span>
                <span className="text-[10px] font-mono text-cyan-400 font-normal">
                  {hardware.gpu.model}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                VRAM: {hardware.gpu.memoryMb} MB · Clock: 1300 MHz
              </div>
              {expanded && (
                <div className="text-[10px] font-mono text-cyan-300/80 mt-0.5">
                  Temp: {hardware.gpu.tempCelsius}°C · PCIe Gen4 x4
                </div>
              )}
            </div>
          </div>
          {renderRadialGauge(hardware.gpu.usagePercent, '#00b4d8')}
        </div>
      </div>
    </div>
  );
};
