import React, { useState } from 'react';
import { Laptop, Edit3, Check, Download, CheckCircle2, Sparkles } from 'lucide-react';
import {
  SystemInfo,
  HardwareMetrics,
  ProcessItem,
  StorageDrive,
  NetworkMetrics,
  BatteryStatus,
  ConnectedDevice,
  ChargingPortInfo,
  UserLogEntry,
} from '../types';
import { soundFx } from '../utils/audioEffects';

interface SystemInfoWidgetProps {
  systemInfo: SystemInfo;
  onUpdateSystemInfo: (updated: Partial<SystemInfo>) => void;
  uptimeFormatted: string;
  hardware?: HardwareMetrics;
  processes?: ProcessItem[];
  storage?: StorageDrive[];
  network?: NetworkMetrics;
  battery?: BatteryStatus;
  connectedDevices?: ConnectedDevice[];
  chargingPort?: ChargingPortInfo;
  onAddLog?: (
    action: string,
    severity?: UserLogEntry['severity'],
    category?: UserLogEntry['category'],
    details?: string
  ) => void;
}

export const SystemInfoWidget: React.FC<SystemInfoWidgetProps> = ({
  systemInfo,
  onUpdateSystemInfo,
  uptimeFormatted,
  hardware,
  processes,
  storage,
  network,
  battery,
  connectedDevices,
  chargingPort,
  onAddLog,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SystemInfo>(systemInfo);
  const [snapshotSaved, setSnapshotSaved] = useState(false);

  const handleSave = () => {
    soundFx.playClick(1000);
    onUpdateSystemInfo(editData);
    setIsEditing(false);
  };

  const handleTakeSnapshot = () => {
    soundFx.playScan();

    const now = new Date();
    const timestampIso = now.toISOString();
    const fileDateStr = timestampIso.slice(0, 19).replace(/[:T]/g, '-');

    const telemetrySnapshot = {
      $schema: 'https://jarvis.stark.telemetry/v1/snapshot.json',
      snapshotMetadata: {
        snapshotId: `SNAP-${Date.now().toString(36).toUpperCase()}`,
        exportedAt: timestampIso,
        localTime: now.toLocaleString(),
        hostname: systemInfo.computerName,
        os: systemInfo.osName,
        kernelVersion: systemInfo.version,
        architecture: systemInfo.architecture,
        systemUptime: uptimeFormatted,
        generator: 'J.A.R.V.I.S. Core Diagnostic Telemetry System',
        purpose: 'Offline Hardware & System Telemetry Analysis',
      },
      systemInformation: systemInfo,
      telemetryState: {
        cpu: hardware?.cpu || {
          model: 'Intel(R) Core(TM) i5-1135G7',
          usagePercent: 12,
          cores: 4,
          threads: 8,
          tempCelsius: 47,
          maxSpeedGhz: 4.2,
          historySample: [11, 14, 18, 12, 16, 12, 9, 15, 12, 13, 11, 12],
        },
        ram: hardware?.ram || {
          totalGb: 15.8,
          usedGb: 7.6,
          freeGb: 8.2,
          percent: 48,
        },
        gpu: hardware?.gpu || {
          model: 'Intel(R) Iris(R) Xe Graphics',
          usagePercent: 9,
          tempCelsius: 43,
        },
        processes:
          processes && processes.length > 0
            ? processes
            : [
                { pid: 1420, name: 'chrome.exe', cpu: 4.8, memoryMb: 1120, status: 'Running', user: 'ELCOT' },
                { pid: 3892, name: 'python.exe', cpu: 3.2, memoryMb: 680, status: 'Running', user: 'ELCOT' },
                { pid: 884, name: 'code.exe', cpu: 2.1, memoryMb: 940, status: 'Running', user: 'ELCOT' },
                { pid: 2104, name: 'node.exe', cpu: 1.5, memoryMb: 420, status: 'Running', user: 'ELCOT' },
                { pid: 512, name: 'explorer.exe', cpu: 0.4, memoryMb: 240, status: 'Running', user: 'SYSTEM' },
              ],
        storage: storage || [],
        network: network || {},
        battery: battery || {},
        connectedDevices: connectedDevices || [],
        chargingPort: chargingPort || {},
      },
      diagnosticStatus: {
        integrity: 'NOMINAL',
        cpuThermalThrottled: false,
        memoryPressure: (hardware?.ram?.percent ?? 48) > 90 ? 'CRITICAL' : 'HEALTHY',
        powerDeliveryProtocol: 'USB-PD 3.1 EPR (100W)',
        telemetryValid: true,
      },
    };

    // Convert to downloadable JSON blob
    const jsonStr = JSON.stringify(telemetrySnapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `telemetry-snapshot-${systemInfo.computerName.toLowerCase()}-${fileDateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // User log notification
    onAddLog?.(
      `Telemetry Snapshot Exported: ${filename}`,
      'success',
      'SYSTEM',
      `Saved current telemetry state: CPU (${telemetrySnapshot.telemetryState.cpu.usagePercent}%), RAM (${telemetrySnapshot.telemetryState.ram.percent}%), Processes (${telemetrySnapshot.telemetryState.processes.length}) to local JSON for offline analysis.`
    );

    setSnapshotSaved(true);
    setTimeout(() => {
      setSnapshotSaved(false);
    }, 2800);
  };


  const handleSwitchOS = (os: 'win' | 'kali' | 'mac') => {
    soundFx.playScan();
    if (os === 'win') {
      const updated = {
        osName: 'Microsoft Windows 11 Pro',
        version: '10.0.26100 Build 26100',
        architecture: '64-bit',
        computerName: 'ELCOT',
        manufacturer: 'HP',
        model: 'HP Laptop 15s-eq0xxx',
      };
      setEditData((prev) => ({ ...prev, ...updated }));
      onUpdateSystemInfo(updated);
    } else if (os === 'kali') {
      const updated = {
        osName: 'Kali Linux Rolling 2025.2',
        version: 'Kernel 6.7.0-kali-amd64',
        architecture: 'x86_64',
        computerName: 'kali-sec-node',
        manufacturer: 'Dell Alienware',
        model: 'm16 R2 Cybersec Rig',
      };
      setEditData((prev) => ({ ...prev, ...updated }));
      onUpdateSystemInfo(updated);
    } else {
      const updated = {
        osName: 'macOS Sequoia 15.1',
        version: 'Darwin Kernel 24.1.0',
        architecture: 'ARM64 (Apple Silicon)',
        computerName: 'MacBook-Pro-ELCOT',
        manufacturer: 'Apple Inc.',
        model: 'MacBook Pro (16-inch, M3 Max)',
      };
      setEditData((prev) => ({ ...prev, ...updated }));
      onUpdateSystemInfo(updated);
    }
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          {/* Windows / OS Icon */}
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5 text-cyan-400">
            <span className="bg-cyan-400 rounded-[1px] shadow-[0_0_6px_#00f0ff]" />
            <span className="bg-cyan-400 rounded-[1px] shadow-[0_0_6px_#00f0ff]" />
            <span className="bg-cyan-400 rounded-[1px] shadow-[0_0_6px_#00f0ff]" />
            <span className="bg-cyan-400 rounded-[1px] shadow-[0_0_6px_#00f0ff]" />
          </div>
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            System Information
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-cyan-950/40 p-0.5 rounded border border-cyan-500/30 text-[10px] font-tech">
            <button
              onClick={() => handleSwitchOS('win')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                systemInfo.osName.includes('Windows') ? 'bg-cyan-500/40 text-cyan-200 font-bold' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Win
            </button>
            <button
              onClick={() => handleSwitchOS('kali')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                systemInfo.osName.includes('Kali') ? 'bg-cyan-500/40 text-cyan-200 font-bold' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Kali
            </button>
            <button
              onClick={() => handleSwitchOS('mac')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                systemInfo.osName.includes('macOS') ? 'bg-cyan-500/40 text-cyan-200 font-bold' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Mac
            </button>
          </div>

          {/* Snapshot Trigger Button */}
          <button
            onClick={handleTakeSnapshot}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-tech font-bold transition-all border cursor-pointer ${
              snapshotSaved
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                : 'bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
            }`}
            title="Save current telemetry state (CPU, RAM, Processes) to local downloadable JSON file for offline analysis"
          >
            {snapshotSaved ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>SAVED ✓</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-cyan-400" />
                <span>SNAPSHOT</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
            title={isEditing ? 'Save configuration' : 'Edit system specs'}
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Holographic Laptop Wireframe Diagram */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2 relative">
          <div className="relative w-28 h-20 flex items-center justify-center">
            {/* Hologram projection field */}
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent blur-md rounded-lg pointer-events-none" />
            {/* Laptop graphic SVG */}
            <svg viewBox="0 0 120 90" className="w-full h-full text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
              {/* Laptop Screen with perspective */}
              <polygon points="20,15 100,15 90,65 30,65" fill="#04122c" stroke="currentColor" strokeWidth="2" />
              {/* Screen grid lines */}
              <line x1="35" y1="28" x2="85" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
              <line x1="32" y1="42" x2="88" y2="42" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
              <line x1="30" y1="56" x2="90" y2="56" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
              {/* Screen radar circle */}
              <circle cx="60" cy="40" r="12" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
              <circle cx="60" cy="40" r="4" fill="#00f0ff" opacity="0.9" />
              {/* Laptop Base / Keyboard deck */}
              <polygon points="10,68 110,68 95,82 25,82" fill="#082046" stroke="currentColor" strokeWidth="2" />
              {/* Trackpad */}
              <polygon points="50,72 70,72 68,78 52,78" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
            </svg>
          </div>
          <div className="text-[10px] font-mono text-cyan-300/80 tracking-wider flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>PRIMARY HOST NODE</span>
          </div>
        </div>

        {/* Specifications List */}
        <div className="md:col-span-8 space-y-1.5 text-xs font-tech">
          {isEditing ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-400 text-[11px]">Computer Name:</span>
                <input
                  type="text"
                  value={editData.computerName}
                  onChange={(e) => setEditData({ ...editData, computerName: e.target.value })}
                  className="bg-black/60 border border-cyan-500/40 rounded px-2 py-0.5 text-cyan-200 text-xs w-full focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-400 text-[11px]">Model:</span>
                <input
                  type="text"
                  value={editData.model}
                  onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                  className="bg-black/60 border border-cyan-500/40 rounded px-2 py-0.5 text-cyan-200 text-xs w-full focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-400 text-[11px]">Manufacturer:</span>
                <input
                  type="text"
                  value={editData.manufacturer}
                  onChange={(e) => setEditData({ ...editData, manufacturer: e.target.value })}
                  className="bg-black/60 border border-cyan-500/40 rounded px-2 py-0.5 text-cyan-200 text-xs w-full focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-y-1 text-xs">
              <div className="sm:col-span-4 text-slate-400">OS Name</div>
              <div className="sm:col-span-8 text-cyan-200 font-medium font-mono">: {systemInfo.osName}</div>

              <div className="sm:col-span-4 text-slate-400">Version</div>
              <div className="sm:col-span-8 text-cyan-200 font-mono">: {systemInfo.version}</div>

              <div className="sm:col-span-4 text-slate-400">Architecture</div>
              <div className="sm:col-span-8 text-cyan-200 font-mono">: {systemInfo.architecture}</div>

              <div className="sm:col-span-4 text-slate-400">Computer Name</div>
              <div className="sm:col-span-8 text-cyan-200 font-mono">: {systemInfo.computerName}</div>

              <div className="sm:col-span-4 text-slate-400">Manufacturer</div>
              <div className="sm:col-span-8 text-cyan-200 font-mono">: {systemInfo.manufacturer}</div>

              <div className="sm:col-span-4 text-slate-400">Model</div>
              <div className="sm:col-span-8 text-cyan-200 font-mono">: {systemInfo.model}</div>

              <div className="sm:col-span-4 text-slate-400">Last Boot</div>
              <div className="sm:col-span-8 text-cyan-200 font-mono">: {systemInfo.lastBoot}</div>

              <div className="sm:col-span-4 text-cyan-400 font-semibold">Uptime</div>
              <div className="sm:col-span-8 text-cyan-300 font-mono font-bold tracking-wide">
                : {uptimeFormatted}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Telemetry Snapshot Action Bar */}
      <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-tech">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            TELEMETRY SNAPSHOT
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline font-mono text-slate-400">
            CPU: {hardware?.cpu.usagePercent ?? 12}% | RAM: {hardware?.ram.percent ?? 48}% | {processes?.length ?? 5} Processes
          </span>
        </div>

        <button
          onClick={handleTakeSnapshot}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-tech font-bold transition-all border cursor-pointer ${
            snapshotSaved
              ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
              : 'bg-cyan-950/60 hover:bg-cyan-900/50 text-cyan-300 border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
          }`}
        >
          {snapshotSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              <span>SAVED (JSON EXPORTED)</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>SAVE SNAPSHOT (OFFLINE JSON)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
