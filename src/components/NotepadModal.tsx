import React, { useState } from 'react';
import { FileText, Download, Copy, Trash2, X, Check } from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface NotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotepadModal: React.FC<NotepadModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState(
`// J.A.R.V.I.S. HUD SCRATCHPAD & TELEMETRY NOTES
// Node: ELCOT | Host: HP Laptop 15s-eq0xxx | Time: 10:48 AM

[+] Diagnostic Checklist:
1. Verify JioFiber_5G bandwidth throughput (128.4 Mbps / 96.7 Mbps)
2. Monitor background python.exe script execution on PID 3612
3. Run weekly Kali Linux vulnerability audit with Nmap
4. Battery cycle test: 78% remaining, 3h 12m estimated runtime
`
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundFx.playClick();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_notes_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const charCount = content.length;
  const lineCount = content.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="hud-card hud-corner-brackets rounded-2xl w-full max-w-xl flex flex-col h-[520px] shadow-[0_0_35px_rgba(0,240,255,0.25)] border-2 border-cyan-400/60 bg-[#051126]">
        {/* Header */}
        <div className="p-3.5 border-b border-cyan-500/30 flex items-center justify-between bg-[#040d21]">
          <div className="flex items-center gap-2 text-cyan-300">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-bold text-xs tracking-wider">
              CYBER NOTEPAD - UNTITLED.TXT
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px]">Save</span>
            </button>

            <button
              onClick={() => {
                soundFx.playAlert();
                setContent('');
              }}
              className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-3 bg-[#030919]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none text-cyan-200 font-mono text-xs leading-relaxed resize-none focus:ring-0 p-1 selection:bg-cyan-500/30"
            placeholder="Type notes, execution scripts, or logs here..."
            spellCheck={false}
          />
        </div>

        {/* Footer info */}
        <div className="p-2 border-t border-cyan-500/20 bg-[#040e22] flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
          <div>UTF-8 · Windows (CRLF) · Markdown / Plain Text</div>
          <div>Lines: {lineCount} · Characters: {charCount}</div>
        </div>
      </div>
    </div>
  );
};
