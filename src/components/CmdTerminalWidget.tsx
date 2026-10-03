import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Minus, Square, X } from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface CmdTerminalWidgetProps {
  onAddLog?: (action: string, details?: string) => void;
}

export const CmdTerminalWidget: React.FC<CmdTerminalWidgetProps> = ({ onAddLog }) => {
  const [history, setHistory] = useState<string[]>([
    'Microsoft Windows [Version 10.0.26100.6584]',
    '(c) Microsoft Corporation. All rights reserved.',
    '',
    'C:\\Users\\ELCOT>systeminfo',
    'Host Name:                 ELCOT',
    'OS Name:                   Microsoft Windows 11 Pro',
    'OS Version:                10.0.26100 Build 26100',
    'System Manufacturer:       HP',
    'System Model:              HP Laptop 15s-eq0xxx',
    'Total Physical Memory:     8,124 MB',
    '',
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>(['systeminfo']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, 'C:\\Users\\ELCOT>']);
      return;
    }

    soundFx.playClick(1200);
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const op = parts[0].toLowerCase();

    const newLines = [`C:\\Users\\ELCOT>${trimmed}`];

    switch (op) {
      case 'cls':
      case 'clear':
        setHistory([]);
        return;

      case 'help':
        newLines.push(
          'Available Commands:',
          '  systeminfo  - Display detailed configuration information',
          '  ipconfig    - View current IP and network adapter configuration',
          '  tasklist    - Display running tasks and memory usage',
          '  ping <host> - Ping target server or gateway',
          '  dir         - List directory files in C:\\Users\\ELCOT',
          '  ver         - View Windows OS kernel build',
          '  echo <text> - Print text to console',
          '  cls         - Clear terminal screen'
        );
        break;

      case 'systeminfo':
        newLines.push(
          'Host Name:                 ELCOT',
          'OS Name:                   Microsoft Windows 11 Pro',
          'OS Version:                10.0.26100 Build 26100',
          'System Manufacturer:       HP',
          'System Model:              HP Laptop 15s-eq0xxx',
          'Processor:                 Intel(R) Core(TM) i5-1135G7 @ 2.40GHz',
          'BIOS Version:              Insyde F.28, 14-04-2024',
          'Total Physical Memory:     16,212 MB',
          'Available Physical Memory: 8,088 MB'
        );
        if (onAddLog) onAddLog('CMD systeminfo executed', 'Host: ELCOT, OS: Win11');
        break;

      case 'ipconfig':
        newLines.push(
          'Windows IP Configuration',
          '',
          'Wireless LAN adapter Wi-Fi:',
          '   Connection-specific DNS Suffix  . : lan',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.7',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1'
        );
        break;

      case 'tasklist':
        newLines.push(
          'Image Name                     PID Session Name        Mem Usage',
          '========================= ======== ================ ============',
          'System Idle Process              0 Services                 24 K',
          'System                           4 Services                180 K',
          'dwm.exe                       1340 Console              98,420 K',
          'explorer.exe                  2184 Console             152,800 K',
          'chrome.exe                    4820 Console             412,300 K',
          'python.exe                    3612 Console             286,400 K'
        );
        break;

      case 'dir':
        newLines.push(
          ' Volume in drive C has no label.',
          ' Volume Serial Number is 4C28-98F1',
          ' Directory of C:\\Users\\ELCOT',
          '',
          '09/30/2025  07:12 AM    <DIR>          .',
          '09/30/2025  07:12 AM    <DIR>          ..',
          '09/30/2025  08:15 AM    <DIR>          Desktop',
          '09/30/2025  08:15 AM    <DIR>          Documents',
          '09/30/2025  09:20 AM    <DIR>          Downloads',
          '09/30/2025  09:40 AM    <DIR>          Source',
          '09/30/2025  10:22 AM             1,420 jarvis_config.json',
          '               1 File(s)          1,420 bytes',
          '               6 Dir(s)  199,420,442,624 bytes free'
        );
        break;

      case 'ping':
        const target = parts[1] || '8.8.8.8';
        newLines.push(
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=12ms TTL=118`,
          `Reply from ${target}: bytes=32 time=11ms TTL=118`,
          `Reply from ${target}: bytes=32 time=14ms TTL=118`,
          `Reply from ${target}: bytes=32 time=12ms TTL=118`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`
        );
        break;

      case 'ver':
        newLines.push('Microsoft Windows [Version 10.0.26100.6584]');
        break;

      case 'echo':
        newLines.push(parts.slice(1).join(' '));
        break;

      default:
        newLines.push(
          `'${op}' is not recognized as an internal or external command,`,
          'operable program or batch file. Type "help" for command list.'
        );
        break;
    }

    setHistory((prev) => [...prev, ...newLines, '']);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3 flex flex-col justify-between h-full bg-[#030a18]/95 font-mono text-xs">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-tech text-xs font-bold text-cyan-300">CMD Terminal</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <button className="hover:text-cyan-300 p-0.5"><Minus className="w-3 h-3" /></button>
          <button className="hover:text-cyan-300 p-0.5"><Square className="w-2.5 h-2.5" /></button>
          <button className="hover:text-rose-400 p-0.5"><X className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="h-44 overflow-y-auto space-y-0.5 text-slate-300 text-[11px] leading-tight pr-1 select-text">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`${
              line.startsWith('C:\\') ? 'text-cyan-300 font-semibold' : 'text-slate-300'
            }`}
          >
            {line}
          </div>
        ))}

        {/* Input prompt line */}
        <div className="flex items-center text-cyan-300 font-semibold">
          <span>C:\Users\ELCOT&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white ml-1 font-mono text-[11px] focus:ring-0 p-0"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
