import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Radio,
  RefreshCw,
  Shield,
  Smartphone,
  Laptop,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface WifiNode {
  id: string;
  ssid: string;
  bssid: string;
  signalDbm: number; // e.g. -42
  distanceMeters: number; // 1 to 25
  angleDeg: number; // 0 to 360
  band: '5GHz' | '2.4GHz' | '6GHz';
  channel: number;
  security: string;
  linkSpeedMbps: number;
  type: 'router' | 'mesh' | 'mobile' | 'iot';
  connected?: boolean;
}

const initialNodes: WifiNode[] = [
  {
    id: 'node-1',
    ssid: 'JioFiber_5G',
    bssid: 'A4:C3:61:9D:82:1F',
    signalDbm: -42,
    distanceMeters: 2.8,
    angleDeg: 45,
    band: '5GHz',
    channel: 48,
    security: 'WPA3 / WPA2-Personal',
    linkSpeedMbps: 866.7,
    type: 'router',
    connected: true,
  },
  {
    id: 'node-2',
    ssid: 'ELCOT_Lab_Mesh_Ext',
    bssid: '2C:56:DC:12:44:0B',
    signalDbm: -56,
    distanceMeters: 7.2,
    angleDeg: 140,
    band: '5GHz',
    channel: 149,
    security: 'WPA2-Enterprise',
    linkSpeedMbps: 433.3,
    type: 'mesh',
  },
  {
    id: 'node-3',
    ssid: 'Xiaomi 14 Ultra (Hotspot)',
    bssid: '90:35:6E:7A:B1:9C',
    signalDbm: -61,
    distanceMeters: 10.5,
    angleDeg: 220,
    band: '6GHz',
    channel: 69,
    security: 'WPA3-Personal',
    linkSpeedMbps: 1200,
    type: 'mobile',
  },
  {
    id: 'node-4',
    ssid: 'Airtel_Xstream_2.4G',
    bssid: 'E0:D5:5E:88:21:43',
    signalDbm: -72,
    distanceMeters: 16.0,
    angleDeg: 310,
    band: '2.4GHz',
    channel: 6,
    security: 'WPA2-Personal',
    linkSpeedMbps: 144.4,
    type: 'router',
  },
  {
    id: 'node-5',
    ssid: 'Smart_Office_IoT_Net',
    bssid: '18:66:DA:4F:90:3A',
    signalDbm: -79,
    distanceMeters: 21.0,
    angleDeg: 185,
    band: '2.4GHz',
    channel: 11,
    security: 'WPA2-Personal',
    linkSpeedMbps: 72.2,
    type: 'iot',
  },
];

export const RoundWifiTracker: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [nodes, setNodes] = useState<WifiNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<WifiNode>(initialNodes[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [radarAngle, setRadarAngle] = useState(0);

  // Radar beam rotation animation
  useEffect(() => {
    let animId: number;
    let start = performance.now();
    const rotate = (now: number) => {
      const elapsed = (now - start) / 1000;
      setRadarAngle((elapsed * 90) % 360); // 90 deg/sec = 4s per rotation
      animId = requestAnimationFrame(rotate);
    };
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const triggerScan = () => {
    soundFx.playScan();
    setIsScanning(true);
    setTimeout(() => {
      soundFx.playChime();
      setIsScanning(false);
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          signalDbm: n.connected
            ? -40 - Math.floor(Math.random() * 6)
            : n.signalDbm + Math.floor((Math.random() - 0.5) * 6),
        }))
      );
    }, 1800);
  };

  // Radar size: 300px
  const size = compact ? 260 : 320;
  const center = size / 2;
  const maxRadius = center - 18;

  // Map signal dBm (-30 to -90) to radius
  const getRadiusForDbm = (dbm: number) => {
    // -30 dBm is near center (radius = 35)
    // -90 dBm is near edge (radius = maxRadius)
    const clamped = Math.max(-90, Math.min(-30, dbm));
    const factor = (-clamped - 30) / 60; // 0 (strongest) to 1 (weakest)
    return 35 + factor * (maxRadius - 35);
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-2xl p-4 flex flex-col justify-between h-full bg-[#030919] border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-cyan-500/25">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg border border-cyan-400 bg-cyan-950/60 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_#00f0ff]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display text-sm sm:text-base font-bold text-cyan-300 tracking-wider flex items-center gap-2">
              <span>XIAOMI / SHAREME WI-FI RADAR TRACKER</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                CIRCULAR HUD
              </span>
            </h2>
            <p className="text-[10px] font-tech text-cyan-400/80">
              360° Omnidirectional RF signal strength detector &amp; channel mapping
            </p>
          </div>
        </div>

        <button
          onClick={triggerScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-tech font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isScanning ? 'SWEEPING...' : 'RADAR SCAN'}</span>
        </button>
      </div>

      {/* Main Container: Round Radar Left, Node Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center flex-1">
        {/* Radar Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-2 relative">
          <div
            className="relative rounded-full border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.25)] bg-[#040e24] overflow-hidden"
            style={{ width: size, height: size }}
          >
            {/* Radar Background Conic Sweep Line */}
            <div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: `conic-gradient(from ${radarAngle}deg, rgba(0, 240, 255, 0.45) 0deg, rgba(0, 240, 255, 0.08) 45deg, transparent 75deg)`,
              }}
            />

            {/* Radar Sweeping Beam Edge */}
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-white origin-left pointer-events-none shadow-[0_0_8px_#00f0ff]"
              style={{ transform: `rotate(${radarAngle}deg)` }}
            />

            {/* Concentric Range Rings */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Outer boundary */}
              <circle
                cx={center}
                cy={center}
                r={maxRadius}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                opacity="0.5"
              />
              {/* -70 dBm ring */}
              <circle
                cx={center}
                cy={center}
                r={maxRadius * 0.72}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1"
                opacity="0.35"
              />
              {/* -50 dBm ring */}
              <circle
                cx={center}
                cy={center}
                r={maxRadius * 0.45}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1"
                opacity="0.45"
              />
              {/* -30 dBm ring */}
              <circle
                cx={center}
                cy={center}
                r={maxRadius * 0.22}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.6"
              />

              {/* Crosshair Axes */}
              <line x1={center} y1="0" x2={center} y2={size} stroke="#00f0ff" strokeWidth="0.8" opacity="0.3" />
              <line x1="0" y1={center} x2={size} y2={center} stroke="#00f0ff" strokeWidth="0.8" opacity="0.3" />

              {/* Ring Labels */}
              <text x={center + 5} y={center - maxRadius * 0.22 + 9} fill="#00f0ff" fontSize="8" fontFamily="monospace" opacity="0.8">
                -30dBm
              </text>
              <text x={center + 5} y={center - maxRadius * 0.45 + 9} fill="#00f0ff" fontSize="8" fontFamily="monospace" opacity="0.8">
                -50dBm
              </text>
              <text x={center + 5} y={center - maxRadius * 0.72 + 9} fill="#00f0ff" fontSize="8" fontFamily="monospace" opacity="0.8">
                -70dBm
              </text>
              <text x={center + 5} y={center - maxRadius + 12} fill="#00f0ff" fontSize="8" fontFamily="monospace" opacity="0.8">
                -90dBm
              </text>
            </svg>

            {/* Center Node (Host Device) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-950/90 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_#00f0ff] z-20">
              <Laptop className="w-4 h-4" />
            </div>

            {/* Plotted Radar Nodes / Devices */}
            {nodes.map((node) => {
              const r = getRadiusForDbm(node.signalDbm);
              const rad = (node.angleDeg * Math.PI) / 180;
              const x = center + r * Math.cos(rad);
              const y = center + r * Math.sin(rad);
              const isSelected = selectedNode?.id === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => {
                    soundFx.playClick(1100);
                    setSelectedNode(node);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 transition-all duration-500 cursor-pointer group focus:outline-none ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  title={`${node.ssid} (${node.signalDbm} dBm)`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-shadow ${
                      node.connected
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_#10b981]'
                        : isSelected
                        ? 'bg-cyan-950 border-cyan-300 text-cyan-200 shadow-[0_0_12px_#00f0ff]'
                        : 'bg-blue-950/80 border-cyan-500/50 text-cyan-300'
                    }`}
                  >
                    {node.type === 'mobile' ? (
                      <Smartphone className="w-3 h-3" />
                    ) : node.type === 'mesh' ? (
                      <Layers className="w-3 h-3" />
                    ) : (
                      <Wifi className="w-3 h-3" />
                    )}
                  </div>

                  {/* Pulsing ring around connected node */}
                  {node.connected && (
                    <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Mini SSID label */}
                  <span className="absolute left-1/2 -translate-x-1/2 top-7 whitespace-nowrap bg-black/80 px-1 py-0.2 rounded border border-cyan-500/30 text-[8px] font-mono text-cyan-300 pointer-events-none opacity-80 group-hover:opacity-100">
                    {node.ssid.slice(0, 10)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-2 text-[10px] font-tech text-cyan-300/80">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Current Link</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Nearby APs</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Mobile Hotspots</span>
            </span>
          </div>
        </div>

        {/* Node Inspection Card (5 cols) */}
        <div className="lg:col-span-5 p-3 rounded-xl bg-[#06122c] border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/25 pb-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-tech font-bold text-sm text-cyan-200">
                  {selectedNode.ssid}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  BSSID: {selectedNode.bssid}
                </div>
              </div>
            </div>

            {selectedNode.connected && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[10px] font-bold">
                CONNECTED
              </span>
            )}
          </div>

          {/* Metric telemetry chips */}
          <div className="grid grid-cols-2 gap-2 text-xs font-tech">
            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
              <div className="text-[10px] text-slate-400">Signal Strength</div>
              <div className="font-mono text-base font-bold text-cyan-200 flex items-center gap-1">
                <span>{selectedNode.signalDbm} dBm</span>
                <span className="text-[10px] font-normal text-emerald-400">
                  ({Math.round(((selectedNode.signalDbm + 100) / 70) * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
              <div className="text-[10px] text-slate-400">Est. Distance</div>
              <div className="font-mono text-base font-bold text-cyan-200">
                {selectedNode.distanceMeters.toFixed(1)} m
              </div>
            </div>

            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
              <div className="text-[10px] text-slate-400">Frequency Band</div>
              <div className="font-mono text-xs font-bold text-cyan-300">
                {selectedNode.band} · Ch {selectedNode.channel}
              </div>
            </div>

            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
              <div className="text-[10px] text-slate-400">Link Rate</div>
              <div className="font-mono text-xs font-bold text-cyan-300">
                {selectedNode.linkSpeedMbps} Mbps
              </div>
            </div>
          </div>

          {/* Security & Protocol */}
          <div className="p-2 rounded bg-[#030d22] border border-cyan-500/20 flex items-center justify-between text-xs font-tech">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedNode.security}</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              802.11ax (Wi-Fi 6)
            </div>
          </div>

          {/* Signal Quality Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
              <span>RF Link Quality</span>
              <span className="text-cyan-300 font-mono">
                {selectedNode.signalDbm > -50
                  ? 'EXCELLENT'
                  : selectedNode.signalDbm > -65
                  ? 'GOOD'
                  : 'FAIR'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${Math.max(10, Math.min(100, ((selectedNode.signalDbm + 100) / 70) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
