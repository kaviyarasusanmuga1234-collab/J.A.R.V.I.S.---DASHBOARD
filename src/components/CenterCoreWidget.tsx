import React, { useState } from 'react';
import { soundFx } from '../utils/audioEffects';

interface CenterCoreWidgetProps {
  onTriggerPulse?: () => void;
  systemHealthPercent?: number;
}

export const CenterCoreWidget: React.FC<CenterCoreWidgetProps> = ({
  onTriggerPulse,
  systemHealthPercent = 99.4,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  const handleClick = () => {
    soundFx.playChime();
    setPulseCount((c) => c + 1);
    if (onTriggerPulse) onTriggerPulse();
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hud-card hud-corner-brackets rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer h-full min-h-[200px]"
      title="Click to pulse J.A.R.V.I.S. Core"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.18)_0%,transparent_75%)] pointer-events-none" />

      {/* Main Circular HUD Assembly */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer Ring 1: Gear teeth with slow clockwise spin */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin-slow pointer-events-none" />

        {/* Outer Ring 2: Arc segments & degree ticks */}
        <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Circular dial ticks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <line
                key={i}
                x1="80"
                y1="4"
                x2="80"
                y2={i % 6 === 0 ? '12' : '8'}
                stroke="#00f0ff"
                strokeWidth={i % 6 === 0 ? '2' : '1'}
                strokeOpacity={i % 2 === 0 ? '0.8' : '0.3'}
                transform={`rotate(${angle} 80 80)`}
              />
            );
          })}
        </svg>

        {/* Counter-rotating inner ring */}
        <div className="absolute inset-3 rounded-full border border-cyan-300/30 animate-spin-reverse-slow pointer-events-none" />

        {/* Glowing concentric circle with radar sweep */}
        <div className="absolute inset-6 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center bg-cyan-950/40 backdrop-blur-sm">
          {/* Holographic Iron Man Helmet / Core */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">
              {/* Outer Helmet Outline */}
              <path
                d="M 50,8 C 68,8 82,22 84,42 C 86,60 76,78 68,88 C 62,94 56,96 50,96 C 44,96 38,94 32,88 C 24,78 14,60 16,42 C 18,22 32,8 50,8 Z"
                fill="#041838"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              {/* Brow line */}
              <path d="M 30,26 L 50,36 L 70,26" fill="none" stroke="currentColor" strokeWidth="2" />
              {/* Eye slits glowing cyan */}
              <polygon points="26,45 42,47 40,53 25,50" fill="#00f0ff" opacity="0.95" />
              <polygon points="74,45 58,47 60,53 75,50" fill="#00f0ff" opacity="0.95" />
              {/* Jaw plate */}
              <path d="M 38,72 L 50,80 L 62,72" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="53" x2="50" y2="70" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Pulse wave ring on click */}
        {pulseCount > 0 && (
          <div
            key={pulseCount}
            className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping opacity-75 pointer-events-none"
          />
        )}
      </div>

      {/* Core Status Caption & Vital Wave */}
      <div className="text-center mt-1.5 z-10">
        <div className="font-display font-black text-sm tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
          J.A.R.V.I.S.
        </div>
        <div className="text-[11px] font-tech font-bold text-cyan-400 tracking-wider flex items-center justify-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        {/* Vital Oscilloscope Sine Wave */}
        <div className="w-24 h-4 mx-auto mt-1 flex items-center justify-center">
          <svg viewBox="0 0 100 20" className="w-full h-full text-cyan-400">
            <path
              d="M 0,10 L 25,10 L 32,2 L 40,18 L 48,6 L 56,14 L 62,10 L 100,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="drop-shadow-[0_0_6px_#00f0ff]"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
