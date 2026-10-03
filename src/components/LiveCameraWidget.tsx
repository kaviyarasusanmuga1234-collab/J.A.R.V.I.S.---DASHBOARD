import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, VideoOff, RefreshCw, Eye } from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

export const LiveCameraWidget: React.FC = () => {
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<'front' | 'lab' | 'drone'>('front');
  const [streamError, setStreamError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Clock for HUD timestamp
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web camera activation
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useRealCamera) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          setStreamError(null);
        })
        .catch((err) => {
          setStreamError('Permission not granted or camera busy. Showing simulated HUD feed.');
          setUseRealCamera(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useRealCamera]);

  const toggleRealCamera = () => {
    soundFx.playClick();
    setUseRealCamera(!useRealCamera);
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Live Camera
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={selectedFeed}
            onChange={(e) => {
              soundFx.playClick();
              setSelectedFeed(e.target.value as 'front' | 'lab' | 'drone');
            }}
            className="bg-[#051125] text-cyan-300 border border-cyan-500/30 rounded px-1.5 py-0.5 text-[10px] font-tech focus:outline-none"
          >
            <option value="front">Camera 01 - Front</option>
            <option value="lab">Camera 02 - Lab Rig</option>
            <option value="drone">Drone Recon 03</option>
          </select>

          <button
            onClick={toggleRealCamera}
            className={`p-1 rounded text-[10px] font-tech flex items-center gap-1 transition-all ${
              useRealCamera
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400'
                : 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
            title="Toggle user webcam vs simulated feed"
          >
            {useRealCamera ? <Video className="w-3 h-3 text-emerald-300" /> : <Eye className="w-3 h-3" />}
            <span className="hidden sm:inline">{useRealCamera ? 'Webcam' : 'Real Cam'}</span>
          </button>
        </div>
      </div>

      {/* Camera Viewport Frame */}
      <div className="relative w-full h-36 bg-[#020713] rounded-lg border border-cyan-500/40 overflow-hidden flex items-center justify-center">
        {/* Real Video or Simulated Sci-Fi HUD feed */}
        {useRealCamera ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="relative w-full h-full bg-[#051429] flex items-center justify-center">
            {/* Ambient surveillance background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/70 via-slate-900 to-blue-950/60" />

            {/* Room / Desk silhouette illustration */}
            <svg viewBox="0 0 300 150" className="w-full h-full opacity-60 text-cyan-400">
              {/* Perspective room lines */}
              <line x1="0" y1="0" x2="60" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              <line x1="300" y1="0" x2="240" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              <line x1="0" y1="150" x2="60" y2="110" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              <line x1="300" y1="150" x2="240" y2="110" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              {/* Back wall boundary */}
              <rect x="60" y="40" width="180" height="70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              {/* Desk with dual monitors */}
              <rect x="90" y="65" width="40" height="25" fill="#041228" stroke="currentColor" strokeWidth="1.5" />
              <rect x="135" y="60" width="55" height="30" fill="#041838" stroke="currentColor" strokeWidth="1.5" />
              <rect x="70" y="90" width="160" height="15" fill="#08224c" stroke="currentColor" strokeWidth="1" />
              {/* Chair */}
              <circle cx="160" cy="115" r="14" fill="#020918" stroke="currentColor" strokeWidth="1" />
            </svg>

            {/* Motion Detection Tracking Box */}
            <div className="absolute w-20 h-16 border-2 border-dashed border-cyan-400/80 rounded animate-pulse flex flex-col justify-between p-1 pointer-events-none">
              <span className="text-[7px] font-mono text-cyan-300 font-bold">TARGET: NODE_01</span>
              <span className="text-[7px] font-mono text-cyan-300 text-right">LOCK 99.8%</span>
            </div>
          </div>
        )}

        {/* HUD Crosshairs Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
          {/* Top row */}
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300/80">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400">REC [RAW]</span>
            </span>
            <span>{currentTime}</span>
          </div>

          {/* Center reticle */}
          <div className="w-8 h-8 mx-auto border border-cyan-400/40 rounded-full flex items-center justify-center opacity-60">
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-cyan-500/20">
            <span>
              {selectedFeed === 'front'
                ? 'Camera 01 - Front'
                : selectedFeed === 'lab'
                ? 'Camera 02 - Lab Rig'
                : 'Drone Recon 03'}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </span>
          </div>
        </div>
      </div>

      {streamError && (
        <div className="text-[10px] font-mono text-amber-300 mt-1">
          {streamError}
        </div>
      )}
    </div>
  );
};
