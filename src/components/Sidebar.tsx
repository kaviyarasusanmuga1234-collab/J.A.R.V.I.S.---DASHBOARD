import React from 'react';
import {
  Home,
  Info,
  Cpu,
  Wifi,
  HardDrive,
  ShieldCheck,
  Activity,
  Users,
  Camera,
  CloudSun,
  Terminal,
  FileText,
  Sliders,
  Radio,
  MapPin,
  Sparkles,
  Usb,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCustomizer: () => void;
  onTriggerJarvisVoice: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCustomizer,
  onTriggerJarvisVoice,
  collapsed,
}) => {
  const navItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'devices', label: 'Connected Devices', icon: Usb },
    { id: 'radar', label: 'Wi-Fi Radar Tracker', icon: Radio },
    { id: 'location', label: 'Live Location & Time', icon: MapPin },
    { id: 'ai_hub', label: 'AI Subsystems & Labs', icon: Sparkles },
    { id: 'system', label: 'System Info', icon: Info },
    { id: 'hardware', label: 'Hardware', icon: Cpu },
    { id: 'network', label: 'Network', icon: Wifi },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'processes', label: 'Processes', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'cmd', label: 'CMD Terminal', icon: Terminal },
    { id: 'kali', label: 'Kali Terminal', icon: Terminal },
    { id: 'logs', label: 'User Logs', icon: FileText },
    { id: 'customizer', label: 'Settings', icon: Sliders },
  ];

  const handleSelect = (id: string) => {
    soundFx.playClick(1050);
    if (id === 'customizer') {
      onOpenCustomizer();
    } else {
      setActiveTab(id);
    }
  };

  return (
    <aside
      className={`bg-[#050e21]/90 border-r border-cyan-500/25 flex flex-col justify-between transition-all duration-300 relative z-20 ${
        collapsed ? 'w-16' : 'w-56 lg:w-60'
      } shrink-0 backdrop-blur-md`}
    >
      {/* Navigation List */}
      <div className="py-3 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-tech font-semibold tracking-wider transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/20 text-cyan-200 border border-cyan-400/70 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-transparent'
              }`}
            >
              {/* Active neon left notch */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-400 rounded-r shadow-[0_0_8px_#00f0ff]" />
              )}
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]' : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Holographic J.A.R.V.I.S. Core Avatar & Voice Pulse */}
      <div className="p-3 border-t border-cyan-500/25 bg-[#030917]/80">
        <button
          onClick={() => {
            soundFx.playJarvisGreeting();
            onTriggerJarvisVoice();
          }}
          className="w-full text-left group focus:outline-none"
          title="Click to hear J.A.R.V.I.S. status report"
        >
          <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 to-slate-950/60 shadow-[0_0_15px_rgba(0,229,255,0.15)] group-hover:border-cyan-400 transition-all">
            {/* Holographic helmet / Arc reactor with circular rotating HUD rings */}
            <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/50 animate-spin-slow pointer-events-none" />
              {/* Counter-rotating ring */}
              <div className="absolute inset-1 rounded-full border border-cyan-500/30 animate-spin-reverse-slow pointer-events-none" />
              {/* Concentric rings */}
              <div className="absolute inset-2 rounded-full border border-cyan-400/20" />
              {/* Holographic Helmet / Visor SVG */}
              <div className="w-10 h-10 rounded-full bg-cyan-950/70 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.6)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.9)] transition-shadow">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]">
                  {/* Stylized Iron Man helmet / HUD visor outline */}
                  <path
                    d="M 50,10 C 65,10 78,22 80,40 C 82,58 72,75 66,85 C 60,92 55,95 50,95 C 45,95 40,92 34,85 C 28,75 18,58 20,40 C 22,22 35,10 50,10 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  {/* Visor eyes glowing */}
                  <polygon points="30,48 45,50 42,56 28,52" fill="#00f0ff" opacity="0.9" />
                  <polygon points="70,48 55,50 58,56 72,52" fill="#00f0ff" opacity="0.9" />
                  {/* Face plate lines */}
                  <path d="M 38,28 L 50,38 L 62,28" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M 50,56 L 50,75" stroke="currentColor" strokeWidth="2" />
                  <path d="M 40,75 L 50,82 L 60,75" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {!collapsed && (
              <div className="text-center w-full">
                <div className="font-display font-bold text-sm tracking-wider text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  J.A.R.V.I.S.
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-tech text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                  <span>Online</span>
                </div>
                <p className="text-[10px] text-cyan-300/70 italic mt-1 font-tech leading-tight px-1">
                  “I am J.A.R.V.I.S. Your personal system assistant.”
                </p>
              </div>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
};
