import React, { useState } from 'react';
import {
  Terminal,
  Info,
  Radio,
  FileText,
  Power,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface QuickCommandsWidgetProps {
  onRunCmd: () => void;
  onRunKali: () => void;
  onShowSysInfo: () => void;
  onNetworkScan: () => void;
  onOpenNotepad: () => void;
  onOpenPower: () => void;
}

export const QuickCommandsWidget: React.FC<QuickCommandsWidgetProps> = ({
  onRunCmd,
  onRunKali,
  onShowSysInfo,
  onNetworkScan,
  onOpenNotepad,
  onOpenPower,
}) => {
  const [selectedTab, setSelectedTab] = useState<'CMD' | 'Kali'>('CMD');

  const commands = [
    {
      label: 'Run CMD Terminal',
      icon: Terminal,
      shortcut: '(R/) >',
      onClick: () => {
        soundFx.playClick();
        onRunCmd();
      },
    },
    {
      label: 'Run Kali Terminal',
      icon: Terminal,
      shortcut: '(R/) >',
      onClick: () => {
        soundFx.playClick();
        onRunKali();
      },
    },
    {
      label: 'System Information',
      icon: Info,
      shortcut: 'i',
      onClick: () => {
        soundFx.playClick();
        onShowSysInfo();
      },
    },
    {
      label: 'Network Scan',
      icon: Radio,
      shortcut: '⚡',
      onClick: () => {
        soundFx.playScan();
        onNetworkScan();
      },
    },
    {
      label: 'Open Notepad',
      icon: FileText,
      shortcut: '📝',
      onClick: () => {
        soundFx.playClick();
        onOpenNotepad();
      },
    },
    {
      label: 'Power Options',
      icon: Power,
      shortcut: '⏻',
      onClick: () => {
        soundFx.playAlert();
        onOpenPower();
      },
    },
  ];

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
          Quick Commands
        </h2>

        {/* Tab switcher: CMD / Kali */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#040e24] border border-cyan-500/30 text-[10px] font-tech font-bold">
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedTab('CMD');
            }}
            className={`px-3 py-0.5 rounded transition-all ${
              selectedTab === 'CMD'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            CMD
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedTab('Kali');
            }}
            className={`px-3 py-0.5 rounded transition-all ${
              selectedTab === 'Kali'
                ? 'bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/50 shadow-[0_0_8px_rgba(232,121,249,0.3)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Kali
          </button>
        </div>
      </div>

      {/* Commands List */}
      <div className="space-y-1.5">
        {commands.map((cmd, idx) => {
          const Icon = cmd.icon;
          return (
            <button
              key={idx}
              onClick={cmd.onClick}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#071735]/80 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/60 transition-all text-xs font-tech group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-cyan-100 group-hover:text-cyan-300">
                <Icon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">{cmd.label}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                <span>{cmd.shortcut}</span>
                <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
