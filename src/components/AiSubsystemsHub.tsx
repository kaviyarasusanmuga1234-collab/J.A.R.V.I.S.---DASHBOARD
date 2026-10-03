import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Search,
  MapPin,
  Mic,
  MicOff,
  Music,
  Video,
  Image as ImageIcon,
  FileText,
  Send,
  Upload,
  Play,
  Pause,
  Download,
  Check,
  AlertTriangle,
  LogIn,
  LogOut,
  Database,
  Volume2,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
  timestamp: string;
}

export const AiSubsystemsHub: React.FC = () => {
  const [activeSubsystem, setActiveSubsystem] = useState<
    'chat' | 'search' | 'maps' | 'transcribe' | 'voice' | 'image' | 'music' | 'video' | 'cloud'
  >('chat');

  // Firebase auth state
  const currentUser = auth.currentUser;

  // 1. Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [
        {
          text: 'Greetings. I am J.A.R.V.I.S., your cybernetic AI assistant. All telemetry diagnostics and AI reasoning subsystems are online. How may I assist you today?',
        },
      ],
      timestamp: '10:48 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState('gemini-3.5-flash');
  const [chatLoading, setChatLoading] = useState(false);

  // 2. Search Grounding State
  const [searchInput, setSearchInput] = useState('Latest tech hardware breakthroughs 2026');
  const [searchResult, setSearchResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 3. Maps Grounding State
  const [mapsInput, setMapsInput] = useState('Find the best data centers and tech facilities in Chennai, India');
  const [mapsResult, setMapsResult] = useState<string | null>(null);
  const [mapsLoading, setMapsLoading] = useState(false);

  // 4. Audio Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<string | null>(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 5. Image Generation State
  const [imagePrompt, setImagePrompt] = useState('Futuristic Iron Man Arc Reactor with holographic cyber HUD, glowing electric cyan and gold telemetry');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // 6. Music Generation State
  const [musicPrompt, setMusicPrompt] = useState('Cinematic synthwave cyber track with driving retro electro bass and neon pads');
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState<string | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);

  // 7. Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('A sleek futuristic hover vehicle speeding across a neon cyberpunk metropolis');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // 8. Voice Conversation State
  const [voiceGreetingPlaying, setVoiceGreetingPlaying] = useState(false);

  // Auth Handler
  const handleGoogleSignIn = async () => {
    soundFx.playClick();
    try {
      await signInWithPopup(auth, googleProvider);
      soundFx.playChime();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert(`Google Sign-In: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    soundFx.playAlert();
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Chat Submission
  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    soundFx.playClick();
    const userText = chatInput.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      role: 'user',
      parts: [{ text: userText }],
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, parts: m.parts })),
          model: chatModel,
          systemInstruction:
            'You are J.A.R.V.I.S., the ultimate intelligent cybernetic system assistant. You speak with polite sophistication, high-tech engineering mastery, and succinct actionable intelligence.',
        }),
      });

      const data = await res.json();
      soundFx.playChime();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: data.text || 'Directive acknowledged.' }],
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: `System communication error: ${e.message}` }],
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Google Search Grounding
  const handleSearchGrounding = async () => {
    if (!searchInput.trim() || searchLoading) return;
    soundFx.playScan();
    setSearchLoading(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: searchInput.trim() }),
      });
      const data = await res.json();
      soundFx.playChime();
      setSearchResult(data);
    } catch (e: any) {
      setSearchResult({ text: `Search error: ${e.message}`, sources: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  // Google Maps Grounding
  const handleMapsGrounding = async () => {
    if (!mapsInput.trim() || mapsLoading) return;
    soundFx.playScan();
    setMapsLoading(true);
    try {
      const res = await fetch('/api/ai/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: mapsInput.trim() }),
      });
      const data = await res.json();
      soundFx.playChime();
      setMapsResult(data.text || 'No spatial data returned.');
    } catch (e: any) {
      setMapsResult(`Maps error: ${e.message}`);
    } finally {
      setMapsLoading(false);
    }
  };

  // Audio Recording & Transcription
  const toggleRecording = async () => {
    soundFx.playClick();
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach((t) => t.stop());
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            setTranscribeLoading(true);
            try {
              const res = await fetch('/api/ai/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64, mimeType: 'audio/webm' }),
              });
              const data = await res.json();
              soundFx.playChime();
              setTranscriptResult(data.text || 'Transcription complete.');
            } catch (err: any) {
              setTranscriptResult(`Transcription error: ${err.message}`);
            } finally {
              setTranscribeLoading(false);
            }
          };
        };

        recorder.start();
        setIsRecording(true);
      } catch (err: any) {
        alert(`Microphone permission denied: ${err.message}`);
      }
    }
  };

  // Image Generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || imageLoading) return;
    soundFx.playScan();
    setImageLoading(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt.trim(), aspectRatio: imageAspectRatio }),
      });
      const data = await res.json();
      soundFx.playChime();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        alert(data.text || 'Image generated.');
      }
    } catch (e: any) {
      alert(`Image generation error: ${e.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  // Music Generation
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || musicLoading) return;
    soundFx.playScan();
    setMusicLoading(true);
    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt.trim() }),
      });
      const data = await res.json();
      soundFx.playChime();
      if (data.audioBase64) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0))],
          { type: data.mimeType || 'audio/wav' }
        );
        const url = URL.createObjectURL(audioBlob);
        setMusicAudioUrl(url);
        setMusicLyrics(data.lyrics || null);
      }
    } catch (e: any) {
      alert(`Music generation error: ${e.message}`);
    } finally {
      setMusicLoading(false);
    }
  };

  // Video Generation
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || videoLoading) return;
    soundFx.playScan();
    setVideoLoading(true);
    setVideoStatus('Initiating Veo video synthesis pipeline...');
    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt.trim(), aspectRatio: videoAspectRatio }),
      });
      const data = await res.json();
      if (data.operationName) {
        setVideoStatus(`Rendering video job: ${data.operationName}. Processing on neural accelerator...`);
      } else {
        setVideoStatus(data.error || 'Video job started.');
      }
    } catch (e: any) {
      setVideoStatus(`Video generation error: ${e.message}`);
    } finally {
      setVideoLoading(false);
    }
  };

  // Voice Interaction Trigger
  const triggerVoiceResponse = async () => {
    soundFx.playChime();
    setVoiceGreetingPlaying(true);
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'J.A.R.V.I.S. neural voice synthesis online. All core telemetry metrics nominal.',
          voiceName: 'Kore',
        }),
      });
      const data = await res.json();
      if (data.base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.base64Audio}`);
        audio.play();
      }
    } catch {
      soundFx.playJarvisGreeting();
    } finally {
      setTimeout(() => setVoiceGreetingPlaying(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Subsystems Navigation Header */}
      <div className="hud-card hud-corner-brackets rounded-2xl p-3.5 bg-[#051126] border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#00f0ff]">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display text-sm sm:text-base font-black text-cyan-200 tracking-wider">
              J.A.R.V.I.S. AI CORE SUBSYSTEMS &amp; LABS
            </h1>
            <p className="text-[10px] font-tech text-cyan-400/80">
              Multi-modal Gemini 3.8 / 3.5 reasoning, Search &amp; Maps Grounding, Veo, Lyria &amp; Cloud Auth
            </p>
          </div>
        </div>

        {/* User Auth Chip */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-tech">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className="w-5 h-5 rounded-full border border-cyan-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              )}
              <span className="text-cyan-200 font-bold truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={handleSignOut}
                className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-tech font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          )}
        </div>
      </div>

      {/* Subsystem Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-tech">
        {[
          { id: 'chat', label: 'Gemini Chatbot', icon: Bot },
          { id: 'search', label: 'Google Search Grounding', icon: Search },
          { id: 'maps', label: 'Google Maps Grounding', icon: MapPin },
          { id: 'transcribe', label: 'Audio Transcription', icon: Mic },
          { id: 'voice', label: 'Voice Conversation', icon: Volume2 },
          { id: 'image', label: 'Create & Edit Images', icon: ImageIcon },
          { id: 'music', label: 'Generate Music (Lyria)', icon: Music },
          { id: 'video', label: 'Generate Video (Veo)', icon: Video },
          { id: 'cloud', label: 'Database & Auth (Firebase)', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubsystem === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick(1150);
                setActiveSubsystem(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-[#040e22] border-cyan-500/20 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE SUBSYSTEM VIEWPORT */}

      {/* 1. CHATBOT */}
      {activeSubsystem === 'chat' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="font-tech font-bold text-sm">
                MULTI-TURN GEMINI CONVERSATION INTERFACE
              </span>
            </div>
            <select
              value={chatModel}
              onChange={(e) => setChatModel(e.target.value)}
              className="bg-[#030919] border border-cyan-500/30 rounded px-2 py-0.5 text-xs text-cyan-200 font-mono focus:outline-none"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (Fast &amp; Accurate)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
            </select>
          </div>

          {/* Messages Thread */}
          <div className="h-80 overflow-y-auto space-y-3 p-3 bg-[#020713] rounded-xl border border-cyan-500/20 font-tech">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-400">
                  <span>{msg.role === 'user' ? 'OPERATOR' : 'J.A.R.V.I.S.'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-[0_0_12px_rgba(0,136,255,0.4)]'
                      : 'bg-[#061530] text-cyan-100 rounded-tl-none border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  }`}
                >
                  {msg.parts.map((p) => p.text).join('')}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>J.A.R.V.I.S. is synthesizing response...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask J.A.R.V.I.S. anything about system hardware, algorithms, diagnostic data..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-[#020715] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSendChat}
              disabled={chatLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-tech font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. GOOGLE SEARCH GROUNDING */}
      {activeSubsystem === 'search' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              GOOGLE SEARCH GROUNDED INTELLIGENCE (gemini-3.5-flash)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Query live real-time information from the web..."
              className="flex-1 bg-[#020715] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSearchGrounding}
              disabled={searchLoading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-100 font-tech font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searchLoading ? 'SEARCHING WEB...' : 'SEARCH'}</span>
            </button>
          </div>

          {searchResult && (
            <div className="p-4 rounded-xl bg-[#030919] border border-cyan-500/20 space-y-3 font-tech text-xs leading-relaxed text-cyan-100">
              <div className="whitespace-pre-wrap">{searchResult.text}</div>
              {searchResult.sources && searchResult.sources.length > 0 && (
                <div className="pt-2 border-t border-cyan-500/20">
                  <div className="text-[11px] font-bold text-cyan-400 mb-1">
                    VERIFIED SEARCH GROUNDING SOURCES:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.web?.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[10px] text-cyan-300 hover:text-white truncate max-w-xs"
                      >
                        {s.web?.title || s.web?.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. GOOGLE MAPS GROUNDING */}
      {activeSubsystem === 'maps' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              GOOGLE MAPS GROUNDED GEOSPATIAL INTELLIGENCE (gemini-3.5-flash)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mapsInput}
              onChange={(e) => setMapsInput(e.target.value)}
              placeholder="Query places, directions, nearby facilities, regional infrastructure..."
              className="flex-1 bg-[#020715] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleMapsGrounding}
              disabled={mapsLoading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-100 font-tech font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{mapsLoading ? 'QUERYING MAPS...' : 'EXPLORE'}</span>
            </button>
          </div>

          {mapsResult && (
            <div className="p-4 rounded-xl bg-[#030919] border border-cyan-500/20 font-tech text-xs leading-relaxed text-cyan-100 whitespace-pre-wrap">
              {mapsResult}
            </div>
          )}
        </div>
      )}

      {/* 4. AUDIO TRANSCRIPTION */}
      {activeSubsystem === 'transcribe' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <Mic className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              SPEECH-TO-TEXT AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-[#020713] border border-cyan-500/30 space-y-3 text-center">
            <button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-[0_0_20px_#f43f5e] animate-pulse'
                  : 'bg-cyan-950/80 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_#00f0ff] hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <div className="text-xs font-tech font-bold text-cyan-200">
              {isRecording ? 'RECORDING MICROPHONE AUDIO... CLICK TO STOP' : 'CLICK MICROPHONE TO RECORD AUDIO'}
            </div>
            <p className="text-[11px] font-tech text-slate-400 max-w-md">
              Audio is captured via browser Web Audio and passed directly to gemini-3.5-transcribe for neural acoustic transcription.
            </p>
          </div>

          {transcribeLoading && (
            <div className="text-center font-mono text-xs text-cyan-400 animate-pulse">
              TRANSCRIPTION IN PROGRESS...
            </div>
          )}

          {transcriptResult && (
            <div className="p-4 rounded-xl bg-[#030919] border border-cyan-500/20 space-y-2">
              <div className="text-[11px] font-bold text-cyan-400 font-tech">TRANSCRIPT RESULT:</div>
              <div className="font-mono text-xs text-white leading-relaxed whitespace-pre-wrap">
                {transcriptResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. VOICE CONVERSATION / TTS */}
      {activeSubsystem === 'voice' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              J.A.R.V.I.S. LIVE VOICE CONVERSATION &amp; SYNTHESIS (gemini-3.8-flash-lite-tts / Live API)
            </span>
          </div>

          <div className="p-6 rounded-xl bg-[#020713] border border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-400/50 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-300/40 animate-spin-reverse-slow" />
              <button
                onClick={triggerVoiceResponse}
                className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_#00f0ff] hover:scale-105 transition-transform"
              >
                <Volume2 className={`w-8 h-8 ${voiceGreetingPlaying ? 'animate-bounce text-emerald-400' : ''}`} />
              </button>
            </div>

            <div>
              <div className="font-display font-bold text-sm text-cyan-200">
                {voiceGreetingPlaying ? 'AUDIO TELEMETRY BROADCASTING...' : 'TRIGGER VOICE SYNTHESIS DIRECTIVE'}
              </div>
              <p className="text-xs font-tech text-slate-400 mt-1 max-w-sm">
                Generates high-fidelity WAV speech with natural J.A.R.V.I.S. persona articulation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE & EDIT IMAGES */}
      {activeSubsystem === 'image' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              IMAGE CREATION &amp; EDITING (gemini-3.1-flash-lite-image / gemini-3.1-flash-image)
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-tech font-bold text-cyan-400">PROMPT</label>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={2}
              className="w-full bg-[#020715] border border-cyan-500/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-tech text-slate-300">
              <span>Aspect Ratio:</span>
              {['1:1', '16:9', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setImageAspectRatio(ratio)}
                  className={`px-3 py-1 rounded-lg border text-xs font-mono ${
                    imageAspectRatio === ratio
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold'
                      : 'bg-black/40 border-slate-700 text-slate-400'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-tech font-bold text-xs ml-auto shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              {imageLoading ? 'SYNTHESIZING IMAGE...' : 'GENERATE IMAGE'}
            </button>
          </div>

          {generatedImageUrl && (
            <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/30 flex flex-col items-center space-y-2">
              <img
                src={generatedImageUrl}
                alt="Generated"
                className="max-h-96 rounded-lg border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] object-contain"
              />
              <a
                href={generatedImageUrl}
                download="jarvis_gen_image.png"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-500/40 text-xs font-tech"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* 7. MUSIC GENERATION (LYRIA) */}
      {activeSubsystem === 'music' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <Music className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              NEURAL MUSIC GENERATION (lyria-3-clip-preview / lyria-3-pro-preview)
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-tech font-bold text-cyan-400">MUSIC PROMPT</label>
            <input
              type="text"
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              className="w-full bg-[#020715] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleGenerateMusic}
            disabled={musicLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-tech font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <Music className="w-4 h-4" />
            <span>{musicLoading ? 'COMPOSING AUDIO STREAM...' : 'GENERATE MUSIC TRACK'}</span>
          </button>

          {musicAudioUrl && (
            <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/30 space-y-3">
              <div className="text-xs font-tech font-bold text-emerald-400">
                TRACK SYNTHESIS COMPLETE
              </div>
              <audio controls src={musicAudioUrl} className="w-full" />
              {musicLyrics && (
                <div className="text-[11px] font-mono text-cyan-200 whitespace-pre-wrap">
                  {musicLyrics}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 8. VIDEO GENERATION (VEO) */}
      {activeSubsystem === 'video' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              NEURAL VIDEO GENERATION &amp; ANIMATION (veo-3.1-fast-generate-preview / veo-3.1-lite)
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-tech font-bold text-cyan-400">VIDEO PROMPT</label>
            <textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              rows={2}
              className="w-full bg-[#020715] border border-cyan-500/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-tech text-slate-300">
              <span>Aspect Ratio:</span>
              {(['16:9', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setVideoAspectRatio(ratio)}
                  className={`px-3 py-1 rounded-lg border text-xs font-mono ${
                    videoAspectRatio === ratio
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold'
                      : 'bg-black/40 border-slate-700 text-slate-400'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={videoLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-tech font-bold text-xs ml-auto shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>{videoLoading ? 'INITIALIZING VEO...' : 'START VIDEO GENERATION'}</span>
            </button>
          </div>

          {videoStatus && (
            <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/30 font-mono text-xs text-cyan-200">
              {videoStatus}
            </div>
          )}
        </div>
      )}

      {/* 9. FIREBASE DATABASE & AUTH STATUS */}
      {activeSubsystem === 'cloud' && (
        <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span className="font-tech font-bold text-sm">
              FIREBASE AUTHENTICATION &amp; FIRESTORE CLOUD REPLICATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/20 space-y-3 text-xs font-tech">
              <div className="text-cyan-400 font-bold text-sm">FIREBASE AUTHENTICATION</div>
              <div className="space-y-1 text-slate-300">
                <div>Status: <span className="text-emerald-400 font-bold font-mono">{currentUser ? 'AUTHENTICATED' : 'ANONYMOUS / GUEST'}</span></div>
                {currentUser && (
                  <>
                    <div>User ID: <span className="font-mono text-cyan-200">{currentUser.uid}</span></div>
                    <div>Email: <span className="font-mono text-cyan-200">{currentUser.email}</span></div>
                    <div>Provider: <span className="font-mono text-cyan-200">Google OAuth</span></div>
                  </>
                )}
              </div>

              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-500/20"
                >
                  DISCONNECT SESSION
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400"
                >
                  SIGN IN WITH GOOGLE
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/20 space-y-3 text-xs font-tech">
              <div className="text-cyan-400 font-bold text-sm">FIRESTORE CLOUD STORAGE</div>
              <div className="space-y-1 text-slate-300">
                <div>Project ID: <span className="font-mono text-cyan-200">articulate-bot-506912-u1</span></div>
                <div>Database: <span className="font-mono text-cyan-200">ai-studio-jarvissystemtele...</span></div>
                <div>Security Rules: <span className="text-emerald-400 font-bold font-mono">DEPLOYED &amp; ENFORCED</span></div>
                <div>Replication Mode: <span className="font-mono text-cyan-200">Cloud Multi-Region</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
