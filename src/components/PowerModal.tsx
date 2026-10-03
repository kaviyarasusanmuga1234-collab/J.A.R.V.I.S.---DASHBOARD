import React, { useState, useEffect } from 'react';
import { Power, RotateCcw, Moon, Lock, X, AlertTriangle } from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface PowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogAction?: (action: string) => void;
}

export const PowerModal: React.FC<PowerModalProps> = ({
  isOpen,
  onClose,
  onLogAction,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (onLogAction && activeAction) {
        onLogAction(`System power event executed: ${activeAction}`);
      }
      setCountdown(null);
      setActiveAction(null);
      onClose();
      return;
    }
    const timer = setTimeout(() => {
      soundFx.playClick(600);
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, activeAction, onClose, onLogAction]);

  if (!isOpen) return null;

  const triggerPowerSequence = (name: string) => {
    soundFx.playAlert();
    setActiveAction(name);
    setCountdown(5);
  };

  const cancelSequence = () => {
    soundFx.playClick();
    setCountdown(null);
    setActiveAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="hud-card hud-corner-brackets rounded-2xl w-full max-w-md p-5 border-2 border-rose-500/50 bg-[#060e22] shadow-[0_0_40px_rgba(244,63,94,0.3)]">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Power className="w-5 h-5 animate-pulse" />
            <span className="font-display font-bold text-sm tracking-wider text-rose-200">
              SYSTEM POWER DIRECTIVE
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {countdown !== null ? (
          <div className="py-6 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
            <div className="font-display font-bold text-xl text-rose-300">
              EXECUTING {activeAction?.toUpperCase()}
            </div>
            <div className="text-3xl font-mono font-black text-rose-400">
              T-MINUS 00:0{countdown}
            </div>
            <p className="text-xs font-tech text-slate-400">
              Diagnostic cache syncing to persistent flash storage...
            </p>
            <button
              onClick={cancelSequence}
              className="mt-4 px-6 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 font-tech font-bold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              ABORT SEQUENCE
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              onClick={() => triggerPowerSequence('Restart Node')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 font-tech transition-all cursor-pointer group"
            >
              <RotateCcw className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
              <div className="text-left">
                <div className="font-bold text-xs">Restart Subsystem</div>
                <div className="text-[10px] text-slate-400">Reboot kernel &amp; clear volatile caches</div>
              </div>
            </button>

            <button
              onClick={() => triggerPowerSequence('Workstation Lock')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 hover:border-blue-400 text-blue-200 font-tech transition-all cursor-pointer group"
            >
              <Lock className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-bold text-xs">Lock Workstation</div>
                <div className="text-[10px] text-slate-400">Arm cryptographic screen security lock</div>
              </div>
            </button>

            <button
              onClick={() => triggerPowerSequence('Hibernation Sleep')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 text-indigo-200 font-tech transition-all cursor-pointer group"
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <div className="text-left">
                <div className="font-bold text-xs">Sleep / Standby</div>
                <div className="text-[10px] text-slate-400">Low-power state with RAM preservation</div>
              </div>
            </button>

            <button
              onClick={() => triggerPowerSequence('Full Shutdown')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 text-rose-200 font-tech transition-all cursor-pointer group"
            >
              <Power className="w-5 h-5 text-rose-400" />
              <div className="text-left">
                <div className="font-bold text-xs">Full System Shutdown</div>
                <div className="text-[10px] text-slate-400">De-energize all primary host bus hardware</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
