import React, { useState, useEffect } from 'react';
import { Wifi, Bluetooth, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { NetworkMetrics } from '../types';
import { soundFx } from '../utils/audioEffects';

interface NetworkWidgetProps {
  network: NetworkMetrics;
}

export const NetworkWidget: React.FC<NetworkWidgetProps> = ({ network }) => {
  const [wavePoints, setWavePoints] = useState<number[]>([15, 25, 20, 35, 28, 42, 38, 45, 30, 20, 35, 48, 25]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Fluctuating waveform simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWavePoints((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.48) * 16;
        const newVal = Math.max(10, Math.min(55, last + delta));
        next.push(newVal);
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const runSpeedTest = () => {
    soundFx.playScan();
    setTesting(true);
    setTestResult('Calibrating link...');
    setTimeout(() => {
      soundFx.playChime();
      setTesting(false);
      setTestResult(`Latency: 12ms · Jitter: 1.4ms · Packet Loss: 0%`);
    }, 2000);
  };

  // Convert points to SVG path
  const svgPath = wavePoints
    .map((pt, i) => {
      const x = (i / (wavePoints.length - 1)) * 260;
      const y = 60 - pt;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Network & Internet
          </h2>
        </div>
        <button
          onClick={runSpeedTest}
          disabled={testing}
          className="text-[10px] font-tech text-cyan-300 bg-cyan-950/60 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
        >
          <Activity className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
          <span>{testing ? 'Probing...' : 'Speed Test'}</span>
        </button>
      </div>

      {/* Grid of Network details & Signal Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Left: Network specs */}
        <div className="md:col-span-7 space-y-1.5 text-xs font-tech">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span>Connected to Wi-Fi</span>
          </div>

          <div className="grid grid-cols-12 gap-y-0.5 text-xs">
            <div className="col-span-5 text-slate-400">Network Name</div>
            <div className="col-span-7 text-cyan-200 font-mono">: {network.networkName}</div>

            <div className="col-span-5 text-slate-400">IP Address</div>
            <div className="col-span-7 text-cyan-200 font-mono">: {network.ipAddress}</div>

            <div className="col-span-5 text-slate-400">Download</div>
            <div className="col-span-7 text-cyan-300 font-mono font-bold flex items-center gap-1">
              : {network.downloadMbps.toFixed(1)} Mbps
              <ArrowDown className="w-3 h-3 text-cyan-400" />
            </div>

            <div className="col-span-5 text-slate-400">Upload</div>
            <div className="col-span-7 text-blue-300 font-mono font-bold flex items-center gap-1">
              : {network.uploadMbps.toFixed(1)} Mbps
              <ArrowUp className="w-3 h-3 text-blue-400" />
            </div>
          </div>

          {/* Real-time Oscilloscope Telemetry Line */}
          <div className="w-full h-12 bg-[#030d1e] rounded border border-cyan-500/30 p-1 relative overflow-hidden mt-1">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
            <svg viewBox="0 0 260 60" className="w-full h-full relative z-10">
              <path
                d={svgPath}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                className="drop-shadow-[0_0_6px_#00f0ff]"
              />
            </svg>
            <span className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400/80">
              LIVE TELEMETRY
            </span>
          </div>

          {testResult && (
            <div className="text-[10px] font-mono text-emerald-300 mt-1 animate-fadeIn">
              {testResult}
            </div>
          )}
        </div>

        {/* Right: Signal Strengths */}
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] font-tech text-cyan-400/90 font-bold uppercase tracking-wider">
            Signal Strength
          </div>

          {/* Wi-Fi dBm */}
          <div className="p-2 rounded-lg bg-[#071733]/80 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <div className="text-xs font-tech font-bold text-cyan-100">Wi-Fi</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-300">
              <span>{network.wifiSignalDbm} dBm</span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-cyan-400 rounded-sm" />
                <span className="w-0.5 h-2 bg-cyan-400 rounded-sm" />
                <span className="w-0.5 h-2.5 bg-cyan-400 rounded-sm" />
                <span className="w-0.5 h-3 bg-cyan-400 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Bluetooth dBm */}
          <div className="p-2 rounded-lg bg-[#071733]/80 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bluetooth className="w-4 h-4 text-blue-400" />
              <div className="text-xs font-tech font-bold text-blue-100">Bluetooth</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-blue-300">
              <span>{network.bluetoothSignalDbm} dBm</span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-blue-400 rounded-sm" />
                <span className="w-0.5 h-2.5 bg-blue-400 rounded-sm" />
                <span className="w-0.5 h-3 bg-blue-400 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
