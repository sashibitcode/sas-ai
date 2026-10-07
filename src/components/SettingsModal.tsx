'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Palette,
  Sliders,
  Bell,
  Cpu,
  Sparkles,
  Database,
  Info,
  Check,
  ShieldCheck,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  Globe,
  CornerDownLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  HardDrive,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { DEVELOPER_INFO, AVAILABLE_MODELS } from '@/config/ai';
import { Conversation } from '@/lib/types';
import SasAiWordmark from './SasAiWordmark';

export type SettingsSection =
  | 'account'
  | 'appearance'
  | 'behavior'
  | 'notifications'
  | 'models'
  | 'studio'
  | 'datacontrols'
  | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
  currentUser?: {
    username: string;
    email: string;
    provider: string;
  } | null;
  conversations?: Conversation[];
  onClearAll?: () => void;
  onOpenProfile?: () => void;
  onOpenAuthModal?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModel = 'gemini-1.5-flash',
  onSelectModel,
  currentUser,
  conversations = [],
  onClearAll,
  onOpenProfile,
  onOpenAuthModal,
}: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  // Appearance states
  const [themeMode, setThemeMode] = useState<'obsidian' | 'midnight' | 'cyber'>('obsidian');
  const [fontDensity, setFontDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');

  // Behavior states
  const [streamSpeed, setStreamSpeed] = useState<'turbo' | 'natural'>('turbo');
  const [sendKey, setSendKey] = useState<'enter' | 'cmd_enter'>('enter');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [langPreference, setLangPreference] = useState<'auto' | 'hinglish' | 'english'>('auto');

  // Notifications states
  const [toastAlerts, setToastAlerts] = useState(true);
  const [failoverAlerts, setFailoverAlerts] = useState(true);

  // Model & Studio states
  const [modelCreativity, setModelCreativity] = useState<'precise' | 'balanced' | 'creative'>('balanced');
  const [autoSaveImages, setAutoSaveImages] = useState(true);

  // Data control states
  const [storageSizeKB, setStorageSizeKB] = useState(0);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('sas_theme_mode');
      if (savedTheme) setThemeMode(savedTheme as any);

      const savedDensity = localStorage.getItem('sas_font_density');
      if (savedDensity) setFontDensity(savedDensity as any);

      const savedSpeed = localStorage.getItem('sas_stream_speed');
      if (savedSpeed) setStreamSpeed(savedSpeed as any);

      const savedSendKey = localStorage.getItem('sas_send_key');
      if (savedSendKey) setSendKey(savedSendKey as any);

      const savedSound = localStorage.getItem('sas_sound_enabled');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const savedLang = localStorage.getItem('sas_lang_pref');
      if (savedLang) setLangPreference(savedLang as any);

      const savedToasts = localStorage.getItem('sas_toast_alerts');
      if (savedToasts !== null) setToastAlerts(savedToasts === 'true');

      const savedFailover = localStorage.getItem('sas_failover_alerts');
      if (savedFailover !== null) setFailoverAlerts(savedFailover === 'true');

      const savedCreativity = localStorage.getItem('sas_ai_creativity');
      if (savedCreativity) setModelCreativity(savedCreativity as any);

      const savedAutoSave = localStorage.getItem('sas_autosave_images');
      if (savedAutoSave !== null) setAutoSaveImages(savedAutoSave === 'true');

      // Calculate approximate storage usage
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sas_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2;
        }
      }
      setStorageSizeKB(Math.round(totalBytes / 1024));
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const updatePreference = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      window.dispatchEvent(new Event('sas_settings_changed'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // Export conversations to JSON file
  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `sas_ai_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('All conversations exported successfully!');
    } catch {
      showToast('Export failed.');
    }
  };

  // Export conversations to Markdown file
  const handleExportMarkdown = () => {
    try {
      let mdContent = `# SAS AI Conversations Export\nGenerated on: ${new Date().toLocaleString()}\n\n---\n\n`;
      conversations.forEach((c) => {
        mdContent += `## ${c.title || 'Conversation'}\n*Date: ${new Date(c.createdAt).toLocaleDateString()}*\n\n`;
        c.messages.forEach((m) => {
          mdContent += `### **${m.role === 'user' ? 'User' : 'SAS AI'}**:\n${m.content}\n\n`;
        });
        mdContent += `---\n\n`;
      });

      const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `sas_ai_chats_${new Date().toISOString().slice(0, 10)}.md`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported formatted Markdown file!');
    } catch {
      showToast('Markdown export failed.');
    }
  };

  const handleClearAllConfirm = () => {
    if (onClearAll) onClearAll();
    setClearConfirmOpen(false);
    showToast('All conversations cleared.');
  };

  const userInitial = ((currentUser?.username || 'U').trim().charAt(0) || 'U').toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[88dvh] max-h-[720px] bg-[#121212] border border-white/[0.08] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col md:flex-row overflow-hidden text-[#ececec] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ====================================================
            LEFT SIDEBAR NAVIGATION (Desktop & Tablet)
            ==================================================== */}
        <aside className="w-full md:w-64 bg-[#0d0d0d]/90 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col shrink-0">
          {/* Top Brand / Title Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#20b8cd]/20 to-blue-500/20 border border-[#20b8cd]/30 text-[#20b8cd]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Settings</h2>
                <p className="text-[10px] text-[#737373] font-mono">SAS AI Studio</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              type="button"
              className="md:hidden p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Categories (Scrollable) */}
          <nav className="p-2 md:p-3 space-y-4 overflow-x-auto md:overflow-y-auto flex md:flex-col scrollbar-thin">
            {/* GROUP 1: General */}
            <div className="shrink-0 md:shrink">
              <span className="hidden md:block px-2.5 mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#636363]">
                General
              </span>
              <div className="flex md:flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSection('account')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'account'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <User className="w-4 h-4 text-[#20b8cd]" />
                  <span>Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('appearance')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'appearance'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Appearance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('behavior')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'behavior'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <CornerDownLeft className="w-4 h-4 text-amber-400" />
                  <span>Behavior</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('notifications')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'notifications'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span>Notifications</span>
                </button>
              </div>
            </div>

            {/* GROUP 2: SAS AI Intelligence */}
            <div className="shrink-0 md:shrink">
              <span className="hidden md:block px-2.5 mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#636363]">
                SAS AI Intelligence
              </span>
              <div className="flex md:flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSection('models')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'models'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Model & Failover</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('studio')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'studio'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>FLUX.1 Studio</span>
                </button>
              </div>
            </div>

            {/* GROUP 3: Data & Privacy */}
            <div className="shrink-0 md:shrink">
              <span className="hidden md:block px-2.5 mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#636363]">
                Data & Privacy
              </span>
              <div className="flex md:flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSection('datacontrols')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'datacontrols'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Data Controls</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('about')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'about'
                      ? 'bg-white/[0.1] text-white shadow-sm font-semibold'
                      : 'text-[#949494] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Info className="w-4 h-4 text-rose-400" />
                  <span>About & Creator</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer with SAS AI Status */}
          <div className="hidden md:block mt-auto p-3.5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-[#737373]">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini + NIM
              </span>
              <span>v2.0</span>
            </div>
          </div>
        </aside>

        {/* ====================================================
            RIGHT CONTENT PANEL (Active Section Details)
            ==================================================== */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden">
          {/* Top Desktop Header with Close */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-white capitalize">
                {activeSection === 'datacontrols'
                  ? 'Data Controls & Storage'
                  : activeSection === 'models'
                  ? 'Model & Inference Engine'
                  : activeSection === 'studio'
                  ? 'FLUX.1 Neural Studio'
                  : activeSection}
              </h3>
              <p className="text-[11px] text-[#7c7c7c]">Configure your personal experience & environment</p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-[#8e8e8e] hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95"
              title="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Notification Banner */}
          {actionNotice && (
            <div className="mx-6 mt-3 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Dynamic Section Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
            {/* 1. ACCOUNT SECTION */}
            {activeSection === 'account' && (
              <div className="space-y-4">
                {currentUser ? (
                  <>
                    <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1fd5f0] to-[#3b82f6] flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                          <p className="text-xs text-[#888888] font-mono truncate">{currentUser.email}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Google Account
                          </span>
                        </div>
                      </div>
                      {onOpenProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenProfile();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all shrink-0"
                        >
                          View Full Profile
                        </button>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#888888]">Subscription Tier</span>
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          SAS AI Free Tier (Unlimited Access)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                        <span className="text-[#888888]">Chat Quota</span>
                        <span className="font-semibold text-emerald-400 font-mono">Unlimited Chats</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                        <span className="text-[#888888]">Dual AI Engine Access</span>
                        <span className="font-medium text-blue-400 font-mono">Gemini Flash + NVIDIA NIM</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#171717] border border-white/[0.06] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Guest Session</h4>
                      <p className="text-xs text-[#888888] max-w-sm mx-auto mt-1">
                        Sign in with your Google account to unlock unlimited chats, personalized history, and cloud sync.
                      </p>
                    </div>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAuthModal();
                        }}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-[#eaeaea] text-black text-xs font-bold transition-all"
                      >
                        Sign in with Google
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. APPEARANCE SECTION */}
            {activeSection === 'appearance' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white">Color Palette & Workspace Theme</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'obsidian', name: 'Obsidian Cyber', desc: 'Dark graphite with cyan highlights', color: '#161a22' },
                      { id: 'midnight', name: 'AMOLED Midnight', desc: 'Pure black for OLED displays', color: '#000000' },
                      { id: 'cyber', name: 'Aurora Matrix', desc: 'Deep navy with ambient glow', color: '#090e1a' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setThemeMode(theme.id as any);
                          updatePreference('sas_theme_mode', theme.id);
                          document.documentElement.setAttribute('data-theme', theme.id);
                          showToast(`Theme changed to ${theme.name}`);
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          themeMode === theme.id
                            ? 'border-[#20b8cd] bg-[#20b8cd]/10 text-white shadow-sm'
                            : 'border-white/[0.06] bg-[#171717] text-[#8e8e8e] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white">{theme.name}</span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.color }}
                          />
                        </div>
                        <p className="text-[10px] text-[#787878] leading-tight">{theme.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <span className="text-xs font-semibold text-white">Message Bubble Spacing</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['compact', 'standard', 'relaxed'] as const).map((density) => (
                      <button
                        key={density}
                        type="button"
                        onClick={() => {
                          setFontDensity(density);
                          updatePreference('sas_font_density', density);
                          document.documentElement.setAttribute('data-density', density);
                          showToast(`Message density set to ${density}`);
                        }}
                        className={`py-2 rounded-xl capitalize border text-center transition-all ${
                          fontDensity === density
                            ? 'border-blue-500 bg-blue-500/15 text-white font-semibold'
                            : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                        }`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. BEHAVIOR SECTION */}
            {activeSection === 'behavior' && (
              <div className="space-y-4">
                {/* Streaming Speed */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white">Streaming Delivery Pace</span>
                      <p className="text-[11px] text-[#7a7a7a]">Speed at which AI tokens render on screen</p>
                    </div>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStreamSpeed('turbo');
                        updatePreference('sas_stream_speed', 'turbo');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        streamSpeed === 'turbo'
                          ? 'border-[#20b8cd] bg-[#20b8cd]/10 text-white font-semibold'
                          : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                      }`}
                    >
                      <p className="font-semibold text-white">Turbo Instant</p>
                      <p className="text-[10px] text-[#7a7a7a]">Streams tokens instantaneously</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStreamSpeed('natural');
                        updatePreference('sas_stream_speed', 'natural');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        streamSpeed === 'natural'
                          ? 'border-[#20b8cd] bg-[#20b8cd]/10 text-white font-semibold'
                          : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                      }`}
                    >
                      <p className="font-semibold text-white">Natural Pace</p>
                      <p className="text-[10px] text-[#7a7a7a]">Smooth natural typing cadence</p>
                    </button>
                  </div>
                </div>

                {/* Enter Key Action */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <div>
                    <span className="text-xs font-semibold text-white">Send Message Key Trigger</span>
                    <p className="text-[11px] text-[#7a7a7a]">Choose which keyboard shortcut sends the prompt</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSendKey('enter');
                        updatePreference('sas_send_key', 'enter');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        sendKey === 'enter'
                          ? 'border-blue-500 bg-blue-500/15 text-white font-semibold'
                          : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                      }`}
                    >
                      <p className="font-semibold text-white">Enter to Send</p>
                      <p className="text-[10px] text-[#7a7a7a]">Shift + Enter inserts new line</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSendKey('cmd_enter');
                        updatePreference('sas_send_key', 'cmd_enter');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        sendKey === 'cmd_enter'
                          ? 'border-blue-500 bg-blue-500/15 text-white font-semibold'
                          : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                      }`}
                    >
                      <p className="font-semibold text-white">Ctrl / ⌘ + Enter to Send</p>
                      <p className="text-[10px] text-[#7a7a7a]">Enter alone inserts new line</p>
                    </button>
                  </div>
                </div>

                {/* Language Preference */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#20b8cd]" />
                    <span className="text-xs font-semibold text-white">Language Understanding & Reply Style</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'auto', label: 'Auto-Detect' },
                      { id: 'hinglish', label: 'Hinglish (Hindi+Eng)' },
                      { id: 'english', label: 'English Only' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLangPreference(item.id as any);
                          updatePreference('sas_lang_pref', item.id);
                        }}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          langPreference === item.id
                            ? 'border-purple-500 bg-purple-500/15 text-white font-semibold'
                            : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS SECTION */}
            {activeSection === 'notifications' && (
              <div className="space-y-3">
                {/* Audio Tones */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.05] text-[#b0b0b0]">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-[#20b8cd]" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Audio Completion Tone</p>
                      <p className="text-[11px] text-[#787878]">Play a gentle audio ping when long responses complete</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      updatePreference('sas_sound_enabled', String(next));
                      if (next) playChime();
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      soundEnabled ? 'bg-[#20b8cd]' : 'bg-white/[0.15]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* System Toasts */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Toast Notification Popups</p>
                    <p className="text-[11px] text-[#787878]">Show visual banner toasts on profile updates, saves & actions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !toastAlerts;
                      setToastAlerts(next);
                      updatePreference('sas_toast_alerts', String(next));
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      toastAlerts ? 'bg-blue-600' : 'bg-white/[0.15]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${toastAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Failover Status Alerts */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Auto-Failover Status Alert</p>
                    <p className="text-[11px] text-[#787878]">Notify when switching between Gemini and NVIDIA NIM engines</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !failoverAlerts;
                      setFailoverAlerts(next);
                      updatePreference('sas_failover_alerts', String(next));
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      failoverAlerts ? 'bg-emerald-600' : 'bg-white/[0.15]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${failoverAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* 5. MODEL & FAILOVER (SAS AI INTELLIGENCE) */}
            {activeSection === 'models' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#20b8cd]" />
                      Dual-Inference Engine Status
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active & Healthy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">Google Gemini</span>
                        <span className="text-[10px] text-emerald-400 font-mono">PRIMARY</span>
                      </div>
                      <p className="text-[11px] text-[#7f7f7f]">Gemini 1.5 Flash streaming with multimodal context</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">NVIDIA NIM</span>
                        <span className="text-[10px] text-[#20b8cd] font-mono">FAILOVER</span>
                      </div>
                      <p className="text-[11px] text-[#7f7f7f]">Llama 3.2 3B Instruct on high-throughput NVIDIA cloud</p>
                    </div>
                  </div>
                </div>

                {/* Creativity Preset */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <span className="text-xs font-semibold text-white">Response Creativity & Tone</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'precise', label: 'Precise', desc: 'Accurate & concise' },
                      { id: 'balanced', label: 'Balanced', desc: 'Standard SAS AI style' },
                      { id: 'creative', label: 'Creative', desc: 'Expressive & detailed' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setModelCreativity(item.id as any);
                          updatePreference('sas_ai_creativity', item.id);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          modelCreativity === item.id
                            ? 'border-blue-500 bg-blue-500/15 text-white font-semibold'
                            : 'border-white/[0.06] bg-white/[0.02] text-[#888888] hover:text-white'
                        }`}
                      >
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-[#767676] mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. FLUX.1 STUDIO SECTION */}
            {activeSection === 'studio' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      FLUX.1 Neural Image Diffusion
                    </span>
                    <span className="text-[10px] font-mono text-pink-400">1024x1024 High-Res</span>
                  </div>
                  <p className="text-xs text-[#8e8e8e]">
                    Integrated Black Forest Labs FLUX.1 model generates photorealistic imagery directly from prompt keywords or Hindi descriptions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Auto-Save Generated Images to Library</p>
                    <p className="text-[11px] text-[#787878]">Automatically persist images to local browser library gallery</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoSaveImages;
                      setAutoSaveImages(next);
                      updatePreference('sas_autosave_images', String(next));
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      autoSaveImages ? 'bg-pink-600' : 'bg-white/[0.15]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoSaveImages ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* 7. DATA CONTROLS SECTION */}
            {activeSection === 'datacontrols' && (
              <div className="space-y-4">
                {/* Storage usage */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      Browser Storage Utilization
                    </span>
                    <span className="font-mono text-cyan-400">{storageSizeKB} KB / 5120 KB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(3, (storageSizeKB / 5120) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#757575]">
                    {conversations.length} total conversations saved locally in your browser sandbox.
                  </p>
                </div>

                {/* Export Options */}
                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2.5">
                  <span className="text-xs font-semibold text-white">Export & Backup Conversations</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-left transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          Export as JSON
                        </p>
                        <p className="text-[10px] text-[#777777]">Full chat backup with metadata</p>
                      </div>
                      <Download className="w-4 h-4 text-[#888888] group-hover:text-cyan-400 transition-colors" />
                    </button>

                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-left transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          Export as Markdown
                        </p>
                        <p className="text-[10px] text-[#777777]">Formatted document for reading</p>
                      </div>
                      <Download className="w-4 h-4 text-[#888888] group-hover:text-blue-400 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Danger zone: Clear all */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2.5">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Danger Zone</span>
                  <p className="text-xs text-[#a3a3a3]">
                    Permanently wipe all conversation sessions stored in this browser. This cannot be undone.
                  </p>

                  {clearConfirmOpen ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 animate-fade-in">
                      <span className="text-xs text-red-300 font-semibold">Are you sure? All chats will be deleted.</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleClearAllConfirm}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                        >
                          Confirm Wipe
                        </button>
                        <button
                          type="button"
                          onClick={() => setClearConfirmOpen(false)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] text-xs text-[#8e8e8e]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setClearConfirmOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All Saved Chats
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 8. ABOUT & CREATOR SECTION */}
            {activeSection === 'about' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-purple-950/30 to-[#171717] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                      Creator & Developer
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#20b8cd]/10 text-[#20b8cd] border border-[#20b8cd]/20">
                      Lead AI Engineer
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-white">{DEVELOPER_INFO.name}</p>
                      <p className="text-xs text-[#888888] font-mono">@{DEVELOPER_INFO.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white font-medium">SAS AI Studio</p>
                      <p className="text-[11px] text-[#888888]">Version 2.0 (Next.js 14)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171717] border border-white/[0.06] space-y-2 text-xs text-[#888888]">
                  <p className="text-white font-semibold">About SAS AI Studio</p>
                  <p className="leading-relaxed">
                    SAS AI is an advanced, high-performance artificial intelligence platform crafted with a resilient Dual-Inference Auto-Failover architecture (Google Gemini Flash + NVIDIA NIM Llama 3.2), native Roman Hinglish & Hindi fluency, and FLUX.1 neural image generation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions */}
          <div className="p-4 border-t border-white/[0.06] flex items-center justify-between bg-[#0e0e0e]/80">
            <span className="text-xs text-[#6e6e6e]">Changes are saved automatically</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#ededed] text-black text-xs font-semibold transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
