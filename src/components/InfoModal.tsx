'use client';

import React from 'react';
import { X, Monitor, Workflow, Layers, ArrowUpCircle, Check, Terminal, ExternalLink } from 'lucide-react';
import { DEVELOPER_INFO } from '@/config/ai';

interface InfoModalProps {
  type: 'computer' | 'automations' | 'artefacts' | 'upgrade' | null;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export default function InfoModal({ type, onClose, onSelectPrompt }: InfoModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#202020] border border-[#2e2e2d] rounded-2xl p-6 text-[#ececec] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8f8f8f] hover:text-[#ececec] hover:bg-[#2c2c2c] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {type === 'computer' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#20b8cd]">
              <div className="p-2 rounded-lg bg-[#282828] border border-[#333333]">
                <Monitor className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#ececec]">Computer & Code Studio</h2>
            </div>
            <p className="text-xs text-[#8f8f8f] leading-relaxed">
              SAS AI can write, inspect, and explain code in Python, JavaScript, TypeScript, React, Next.js, and SQL.
            </p>
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-[#8f8f8f] uppercase tracking-wider">Quick prompts</p>
              {[
                'Write a Next.js server action for authentication',
                'Explain Dijkstra algorithm with Python code',
                'Create a responsive Tailwind navbar component',
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrompt?.(p);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-[#191919] hover:bg-[#282828] border border-[#2c2c2c] text-xs text-[#ececec] transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{p}</span>
                  <Terminal className="w-3.5 h-3.5 text-[#8f8f8f] group-hover:text-[#20b8cd] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'automations' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <div className="p-2 rounded-lg bg-[#282828] border border-[#333333]">
                <Workflow className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#ececec]">Automations</h2>
            </div>
            <p className="text-xs text-[#8f8f8f] leading-relaxed">
              Automate multi-step research, summarization, and task execution workflows with SAS AI.
            </p>
            <div className="space-y-2 pt-1">
              {[
                'Daily Tech News Digest (Summarize top AI news)',
                'Code Refactor Pipeline (Review & clean up messy code)',
                'Image Generation Flow (Prompt -> 1024x1024 FLUX.1 Art)',
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#191919] border border-[#2c2c2c] text-xs">
                  <p className="font-medium text-[#ececec]">{item.split(' (')[0]}</p>
                  <p className="text-[11px] text-[#737373] mt-0.5">{item.split(' (')[1]?.replace(')', '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'artefacts' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#20b8cd]">
              <div className="p-2 rounded-lg bg-[#282828] border border-[#333333]">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#ececec]">Artefacts Library</h2>
            </div>
            <p className="text-xs text-[#8f8f8f] leading-relaxed">
              Standalone code snippets, documents, and rendered visual components generated during your sessions.
            </p>
            <div className="p-4 rounded-xl bg-[#191919] border border-[#2c2c2c] text-center text-xs text-[#737373]">
              No standalone artefacts saved yet. Ask SAS AI to generate components, SVGs, or interactive code to save them here!
            </div>
          </div>
        )}

        {type === 'upgrade' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#20b8cd]">
              <div className="p-2 rounded-lg bg-[#282828] border border-[#333333]">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#ececec]">SAS AI Pro</h2>
            </div>
            <p className="text-xs text-[#8f8f8f] leading-relaxed">
              You are currently on the <strong className="text-[#ececec]">Free Plan</strong> powered by NVIDIA NIM & Meta Llama 3.2.
            </p>
            <div className="p-3.5 rounded-xl bg-[#191919] border border-[#2c2c2c] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span className="text-[#ececec]">Unlimited Llama 3.2 11B & 90B Chats</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span className="text-[#ececec]">FLUX.1 Schnell AI Image Generation</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span className="text-[#ececec]">Multimodal Photo & Vision Analysis</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-[#737373] text-center">
              Developed by <strong className="text-[#ececec]">{DEVELOPER_INFO.name}</strong> (@{DEVELOPER_INFO.handle})
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#2e2e2d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#ececec] hover:bg-white text-[#191919] font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
