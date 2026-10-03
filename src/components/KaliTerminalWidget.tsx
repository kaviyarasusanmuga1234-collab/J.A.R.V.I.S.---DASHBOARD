import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Minus, Square, X } from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface KaliTerminalWidgetProps {
  onAddLog?: (action: string, details?: string) => void;
}

export const KaliTerminalWidget: React.FC<KaliTerminalWidgetProps> = ({ onAddLog }) => {
  const [history, setHistory] = useState<
    Array<{ type: 'prompt' | 'output' | 'neofetch'; content?: string }>
  >([
    { type: 'prompt', content: 'neofetch' },
    { type: 'neofetch' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, { type: 'prompt', content: '' }]);
      return;
    }

    soundFx.playClick(1350);
    const parts = trimmed.split(' ');
    const op = parts[0].toLowerCase();

    const nextHistory = [...history, { type: 'prompt', content: trimmed } as const];

    switch (op) {
      case 'clear':
      case 'cls':
        setHistory([]);
        return;

      case 'neofetch':
        nextHistory.push({ type: 'neofetch' });
        if (onAddLog) onAddLog('Kali neofetch executed', 'Kernel: 6.7.0-kali-amd64');
        break;

      case 'uname':
        nextHistory.push({
          type: 'output',
          content: 'Linux kali-sec-node 6.7.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.7.1-1kali1 (2025-09-12) x86_64 GNU/Linux',
        });
        break;

      case 'whoami':
        nextHistory.push({ type: 'output', content: 'kali (uid=1000 gid=1000 groups=1000,sudo,docker)' });
        break;

      case 'nmap':
        const target = parts[1] || '192.168.1.1';
        nextHistory.push({
          type: 'output',
          content: `Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-09-30 10:48 EDT\nNmap scan report for gateway (${target})\nHost is up (0.0024s latency).\nPORT     STATE SERVICE\n22/tcp   open  ssh\n53/tcp   open  domain\n80/tcp   open  http\n443/tcp  open  https\nNmap done: 1 IP address (1 host up) scanned in 1.48 seconds`,
        });
        if (onAddLog) onAddLog(`Nmap port scan on ${target}`, 'Discovered open ports: 22, 53, 80, 443');
        break;

      case 'ls':
        nextHistory.push({
          type: 'output',
          content: 'Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos  wordlists  exploits',
        });
        break;

      case 'help':
        nextHistory.push({
          type: 'output',
          content: 'Commands: neofetch, uname -a, whoami, nmap <ip>, ls, clear, cat /etc/os-release',
        });
        break;

      case 'cat':
        if (parts[1] && parts[1].includes('os-release')) {
          nextHistory.push({
            type: 'output',
            content: 'PRETTY_NAME="Kali GNU/Linux Rolling"\nNAME="Kali GNU/Linux"\nVERSION="2025.2"\nID=kali\nID_LIKE=debian\nHOME_URL="https://www.kali.org/"',
          });
        } else {
          nextHistory.push({ type: 'output', content: `cat: ${parts[1] || ''}: No such file or directory` });
        }
        break;

      default:
        nextHistory.push({
          type: 'output',
          content: `bash: ${op}: command not found. Type "help" for command list.`,
        });
        break;
    }

    setHistory(nextHistory);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    }
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3 flex flex-col justify-between h-full bg-[#030919]/95 font-mono text-xs">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="font-tech text-xs font-bold text-fuchsia-300">Kali Linux Terminal</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <button className="hover:text-fuchsia-300 p-0.5"><Minus className="w-3 h-3" /></button>
          <button className="hover:text-fuchsia-300 p-0.5"><Square className="w-2.5 h-2.5" /></button>
          <button className="hover:text-rose-400 p-0.5"><X className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="h-44 overflow-y-auto space-y-1 text-slate-300 text-[11px] leading-tight pr-1 select-text">
        {history.map((item, idx) => {
          if (item.type === 'prompt') {
            return (
              <div key={idx} className="flex items-center gap-1 text-emerald-400">
                <span className="text-emerald-400 font-bold">kali@kali</span>
                <span className="text-slate-400">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-slate-300">$</span>
                <span className="text-white ml-1">{item.content}</span>
              </div>
            );
          }

          if (item.type === 'output') {
            return (
              <pre key={idx} className="text-slate-300 font-mono whitespace-pre-wrap">
                {item.content}
              </pre>
            );
          }

          if (item.type === 'neofetch') {
            return (
              <div key={idx} className="grid grid-cols-12 gap-2 my-1 items-center">
                {/* Kali Dragon ASCII */}
                <div className="col-span-5 text-fuchsia-400 text-[9px] font-mono leading-[1.05] tracking-tight">
                  <pre className="text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]">
{`    ...............
   /               \\
  /   .-"'"-.       \\
 /   /       \\       \\
|   /   ___   \\   |   |
|  |   /   \\   |  |   |
|   \\  \\___/  /   |   |
 \\   \\       /   /   /
  \\   '-...-'   /   /
   \\               /
    '.............'`}
                  </pre>
                </div>

                {/* Neofetch System specs */}
                <div className="col-span-7 space-y-0.5 text-[10px] font-mono">
                  <div className="text-cyan-300 font-bold">kali@kali</div>
                  <div className="text-slate-500">------------------</div>
                  <div><span className="text-cyan-400 font-semibold">OS:</span> Kali Linux 2025.2</div>
                  <div><span className="text-cyan-400 font-semibold">Kernel:</span> 6.7.0-kali-amd64</div>
                  <div><span className="text-cyan-400 font-semibold">Uptime:</span> 2 mins</div>
                  <div><span className="text-cyan-400 font-semibold">Packages:</span> 2847 (dpkg)</div>
                  <div><span className="text-cyan-400 font-semibold">Shell:</span> bash 5.2.21</div>
                  <div><span className="text-cyan-400 font-semibold">Resolution:</span> 1920x1080</div>
                  <div><span className="text-cyan-400 font-semibold">DE:</span> Xfce 4.20</div>
                  <div><span className="text-cyan-400 font-semibold">WM:</span> Xfwm4</div>
                  <div><span className="text-cyan-400 font-semibold">Theme:</span> Kali-Dark</div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Input prompt */}
        <div className="flex items-center text-emerald-400 font-bold">
          <span>kali@kali</span>
          <span className="text-slate-400">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-slate-300">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white ml-1.5 font-mono text-[11px] focus:ring-0 p-0"
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
