'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import CustomiseModal from '@/components/CustomiseModal';
import InfoModal from '@/components/InfoModal';
import AuthModal from '@/components/AuthModal';
import LibraryModal from '@/components/LibraryModal';
import ImageStudioModal from '@/components/ImageStudioModal';
import ImagesView from '@/components/ImagesView';
import AuroraBackground from '@/components/AuroraBackground';
import ProfileModal from '@/components/ProfileModal';
import HelpModal from '@/components/HelpModal';
import { Conversation, Message } from '@/lib/types';
import { DEFAULT_MODEL, AVAILABLE_MODELS } from '@/config/ai';
import { extractAndSaveImagesFromText, getLibraryItems } from '@/lib/libraryStorage';
import {
  getStoredUser,
  getGuestChatCount,
  incrementGuestChatCount,
  resetGuestChatCount,
  isGuestLimitReached,
  MAX_GUEST_CHATS,
  GUEST_LIMIT_EVENT,
  SasUser,
} from '@/lib/authStorage';
import {
  getSavedConversations,
  saveConversation,
  deleteConversation as deleteStoredConversation,
  clearAllConversations as clearStoredConversations,
  getActiveConversationId,
  setActiveConversationId,
  createNewConversation,
  generateTitleFromPrompt,
} from '@/lib/storage';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCustomiseOpen, setIsCustomiseOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'images'>('chat');
  const [infoModalType, setInfoModalType] = useState<'computer' | 'automations' | 'artefacts' | 'upgrade' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SasUser | null>(null);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [authToast, setAuthToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem('sas_user');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('sas_settings_changed'));
    } catch {}
    setCurrentUser(null);
    setAuthToast('Logged out successfully.');
    setTimeout(() => setAuthToast(null), 3000);
  };

  const handleUpdateUser = (updated: SasUser) => {
    try {
      localStorage.setItem('sas_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('sas_settings_changed'));
    } catch {}
    setCurrentUser(updated);
    setAuthToast(`Profile updated: ${updated.username}`);
    setTimeout(() => setAuthToast(null), 3000);
  };

  const getValidModel = (modelId?: string) => {
    return AVAILABLE_MODELS.some((m) => m.id === modelId) ? (modelId as string) : DEFAULT_MODEL;
  };

  // Initialize conversations from localStorage on mount
  useEffect(() => {
    const saved = getSavedConversations();
    setConversations(saved);

    const savedActiveId = getActiveConversationId();
    if (savedActiveId && saved.some((c) => c.id === savedActiveId)) {
      const active = saved.find((c) => c.id === savedActiveId);
      setActiveConvId(savedActiveId);
      setMessages(active?.messages || []);
      setSelectedModel(getValidModel(active?.model));
    } else if (saved.length > 0) {
      setActiveConvId(saved[0].id);
      setMessages(saved[0].messages || []);
      setSelectedModel(getValidModel(saved[0].model));
    } else {
      const newConv = createNewConversation(DEFAULT_MODEL);
      setConversations([newConv]);
      setActiveConvId(newConv.id);
      setMessages([]);
      saveConversation(newConv);
      setActiveConversationId(newConv.id);
    }

    // Adjust sidebar on small screens
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Ensure dark mode class is set
    document.documentElement.classList.add('dark');

    // Initialize theme and density from settings
    const applySettings = () => {
      try {
        const savedTheme = localStorage.getItem('sas_theme_mode');
        if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
        const savedDensity = localStorage.getItem('sas_font_density');
        if (savedDensity) document.documentElement.setAttribute('data-density', savedDensity);
      } catch {}
    };

    applySettings();

    // Sync Auth user and guest limit
    const syncAuthAndLimit = () => {
      const user = getStoredUser();
      setCurrentUser(user);
      setGuestLimitReached(isGuestLimitReached());
    };

    syncAuthAndLimit();
    window.addEventListener('storage', syncAuthAndLimit);
    window.addEventListener(GUEST_LIMIT_EVENT, syncAuthAndLimit);
    window.addEventListener('sas_settings_changed', applySettings);

    setMounted(true);

    return () => {
      window.removeEventListener('storage', syncAuthAndLimit);
      window.removeEventListener(GUEST_LIMIT_EVENT, syncAuthAndLimit);
      window.removeEventListener('sas_settings_changed', applySettings);
    };
  }, []);

  // Update localStorage whenever messages change in active conversation
  const persistConversationMessages = (convId: string, updatedMessages: Message[], model: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: updatedMessages,
            updatedAt: Date.now(),
            model: model,
          };
        }
        return c;
      });

      const current = updated.find((c) => c.id === convId);
      if (current) {
        saveConversation(current);
      }
      return updated;
    });
  };

  // Switch to another conversation
  const handleSelectConversation = (id: string) => {
    if (isLoading) {
      handleStopGeneration();
    }
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentView('chat');
      setActiveConvId(id);
      setMessages(conv.messages || []);
      if (conv.model) setSelectedModel(getValidModel(conv.model));
      setActiveConversationId(id);

      // Close sidebar on mobile upon selection
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  // Create a brand new chat
  const handleNewChat = () => {
    if (isLoading) {
      handleStopGeneration();
    }
    setCurrentView('chat');
    const newConv = createNewConversation(selectedModel);
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setMessages([]);
    saveConversation(newConv);
    setActiveConversationId(newConv.id);

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Delete a specific chat
  const handleDeleteConversation = (id: string) => {
    deleteStoredConversation(id);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);

    if (activeConvId === id) {
      if (remaining.length > 0) {
        setActiveConvId(remaining[0].id);
        setMessages(remaining[0].messages || []);
        setActiveConversationId(remaining[0].id);
      } else {
        const newConv = createNewConversation(selectedModel);
        setConversations([newConv]);
        setActiveConvId(newConv.id);
        setMessages([]);
        saveConversation(newConv);
        setActiveConversationId(newConv.id);
      }
    }
  };

  // Clear all chats
  const handleClearAll = () => {
    clearStoredConversations();
    const newConv = createNewConversation(selectedModel);
    setConversations([newConv]);
    setActiveConvId(newConv.id);
    setMessages([]);
    saveConversation(newConv);
    setActiveConversationId(newConv.id);
  };

  // Rename chat title
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const mod = { ...c, title: newTitle, updatedAt: Date.now() };
          saveConversation(mod);
          return mod;
        }
        return c;
      });
      return updated;
    });
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Send Message & Stream AI Response
  const handleSendMessage = async (
    customPrompt?: string,
    customHistory?: Message[],
    customImage?: string | null
  ) => {
    const promptText = (customPrompt !== undefined ? customPrompt : input).trim();
    const imageToSend = customImage !== undefined ? customImage : selectedImage;
    if ((!promptText && !imageToSend) || isLoading) return;

    // Check if unauthenticated guest user has reached max chat limit (1-2 chats)
    const isUserLoggedIn = Boolean(getStoredUser());
    const currentGuestCount = getGuestChatCount();

    if (!isUserLoggedIn && currentGuestCount >= MAX_GUEST_CHATS) {
      // Guest limit reached! Show Auth Modal and append Sign In notification message
      setIsAuthModalOpen(true);
      setGuestLimitReached(true);

      const userMessage: Message = {
        id: `msg_${Date.now()}_u`,
        role: 'user',
        content: promptText || (imageToSend ? 'Is photo ko analyze karein.' : ''),
        image: imageToSend || undefined,
        createdAt: Date.now(),
      };

      const baseHistory = customHistory !== undefined ? customHistory : messages;
      const limitMessage: Message = {
        id: `msg_${Date.now()}_limit`,
        role: 'assistant',
        content: `### 🔒 Sign In Required (Sign In Karein)\n\nAapne bina sign in kiye **${MAX_GUEST_CHATS} free preview chats** poori kar li hain.\n\nSAS AI ke sath aage baatcheet jari rakhne ke liye kripya **Sign In** karein!\n\n✨ **Sign In karne ke baad aapko milenge:**\n- 🚀 **Unlimited High-Speed AI Chat** (Google Gemini & Meta Llama)\n- 🎨 **FLUX.1 High-Resolution AI Image Generation**\n- 📚 **Library & Cloud Saved Sessions**\n- 📄 **Export Documents & PDFs**`,
        createdAt: Date.now(),
      };

      const newMessages = [...baseHistory, userMessage, limitMessage];
      setMessages(newMessages);
      if (activeConvId) {
        persistConversationMessages(activeConvId, newMessages, selectedModel);
      }
      return;
    }

    // Increment guest count if user is not logged in
    if (!isUserLoggedIn) {
      const nextCount = incrementGuestChatCount();
      if (nextCount >= MAX_GUEST_CHATS) {
        setGuestLimitReached(true);
      }
    }

    setInput('');
    setSelectedImage(null);

    // Ensure active conversation exists
    let targetConvId = activeConvId;
    let targetConv = conversations.find((c) => c.id === targetConvId);

    if (!targetConv || !targetConvId) {
      const freshConv = createNewConversation(selectedModel);
      targetConvId = freshConv.id;
      targetConv = freshConv;
      setConversations((prev) => [freshConv, ...prev]);
      setActiveConvId(freshConv.id);
      setActiveConversationId(freshConv.id);
      saveConversation(freshConv);
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: promptText || (imageToSend ? 'Is photo ko analyze karein.' : ''),
      image: imageToSend || undefined,
      createdAt: Date.now(),
    };

    const baseHistory = customHistory !== undefined ? customHistory : messages;
    const newMessages = [...baseHistory, userMessage];
    setMessages(newMessages);

    // Auto title generation if first user message
    if (baseHistory.length === 0 && targetConv) {
      const titleSource = promptText || 'Image Analysis';
      const generatedTitle = generateTitleFromPrompt(titleSource);
      targetConv.title = generatedTitle;
      setConversations((prev) =>
        prev.map((c) => (c.id === targetConvId ? { ...c, title: generatedTitle } : c))
      );
    }

    // AI placeholder message
    const assistantMessageId = `msg_${Date.now()}_a`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    };

    const currentMsgListWithAi = [...newMessages, initialAssistantMessage];
    setMessages(currentMsgListWithAi);
    setMessages(currentMsgListWithAi);
    setIsLoading(true);

    // Prepare AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Read AI creativity and language preferences
    let creativityTemp: number | undefined = undefined;
    try {
      const c = localStorage.getItem('sas_ai_creativity');
      if (c === 'precise') creativityTemp = 0.2;
      else if (c === 'creative') creativityTemp = 0.95;
      else if (c === 'balanced') creativityTemp = 0.7;
    } catch {}
    const langPref = typeof window !== 'undefined' ? localStorage.getItem('sas_lang_pref') || 'auto' : 'auto';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
          model: selectedModel,
          temperature: creativityTemp,
          languagePreference: langPref,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText =
          errorData.error ||
          `Server Error (${response.status}): Jawab prapt nahi ho saka.`;

        const errorMsgList = currentMsgListWithAi.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: errorText, error: true }
            : m
        );
        setMessages(errorMsgList);
        if (targetConvId) {
          persistConversationMessages(targetConvId, errorMsgList, selectedModel);
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error('Response stream not available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const modelUsedHeader = response.headers.get('X-Model-Used') || undefined;
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: accumulatedText, modelUsed: modelUsedHeader }
              : m
          )
        );
      }

      // Final save to localStorage
      const finalMsgList = currentMsgListWithAi.map((m) =>
        m.id === assistantMessageId
          ? { ...m, content: accumulatedText, modelUsed: modelUsedHeader }
          : m
      );
      if (targetConvId) {
        persistConversationMessages(targetConvId, finalMsgList, selectedModel);
      }

      // Play completion chime if sound enabled
      try {
        const soundOn = localStorage.getItem('sas_sound_enabled') !== 'false';
        if (soundOn) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
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
          }
        }
      } catch {}

      // Notify failover status if auto-switched to NVIDIA NIM
      if (
        modelUsedHeader &&
        (modelUsedHeader.includes('llama') || modelUsedHeader.includes('meta')) &&
        localStorage.getItem('sas_failover_alerts') !== 'false'
      ) {
        setAuthToast(`⚡ Gemini capacity reached: Active on NVIDIA NIM (${modelUsedHeader})`);
        setTimeout(() => setAuthToast(null), 4000);
      }

      // Automatically harvest and save generated images to the Library (if enabled)
      if (localStorage.getItem('sas_autosave_images') !== 'false') {
        extractAndSaveImagesFromText(accumulatedText, promptText, targetConvId, selectedModel);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation was stopped by user.');
      } else {
        console.error('Chat stream error:', err);
        const errorMsgList = currentMsgListWithAi.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  err?.message ||
                  'Network error: Server se judne mein dikkat aayi.',
                error: true,
              }
            : m
        );
        setMessages(errorMsgList);
        if (targetConvId) {
          persistConversationMessages(targetConvId, errorMsgList, selectedModel);
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handle editing a user message
  const handleEditMessage = (messageId: string, newContent: string) => {
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    if (isLoading) {
      handleStopGeneration();
    }

    const historyBefore = messages.slice(0, msgIndex);
    handleSendMessage(newContent, historyBefore);
  };

  // Handle regenerating an AI response
  const handleRegenerateResponse = (aiMessageId: string) => {
    const msgIndex = messages.findIndex((m) => m.id === aiMessageId);
    if (msgIndex === -1 || msgIndex === 0) return;

    if (isLoading) {
      handleStopGeneration();
    }

    const priorUser = messages[msgIndex - 1];
    if (priorUser && priorUser.role === 'user') {
      const historyBefore = messages.slice(0, msgIndex - 1);
      handleSendMessage(priorUser.content, historyBefore, priorUser.image);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-[100dvh] w-full max-w-full items-center justify-center bg-[#080b12] text-[#ededed]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#20b8cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#8f8f8f]">Loading SAS AI...</p>
        </div>
      </div>
    );
  }

  const currentConv = conversations.find((c) => c.id === activeConvId) || null;

  return (
    <div className="relative flex h-[100dvh] w-full max-w-full overflow-hidden bg-transparent text-[#ededed] antialiased">
      {/* Premium Aurora & Cyber Grid Atmosphere */}
      <AuroraBackground />

      <Sidebar
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAll={handleClearAll}
        onRenameConversation={handleRenameConversation}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenCustomise={() => setIsCustomiseOpen(true)}
        onOpenInfoModal={(type) => setInfoModalType(type)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenImageStudio={() => setCurrentView('images')}
        currentView={currentView}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsCustomiseOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onLogout={handleLogout}
      />

      {currentView === 'images' ? (
        <ImagesView
          onBackToChat={() => setCurrentView('chat')}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onSendToChat={(prompt, imageUrl) => {
            setCurrentView('chat');
            handleSendMessage(
              `### 🎨 AI Generated Image (FLUX.1)\n\n![${prompt}](${imageUrl})\n\n**Prompt**: *"${prompt}"*\n**Model**: FLUX.1 High-Resolution\n\nAap upar bani photo ko seedha **Download** button se save kar sakte hain! Agar koi specific changes chahiye toh batayein.`
            );
          }}
        />
      ) : (
        <ChatArea
          currentConversation={currentConv}
          messages={messages}
          input={input}
          setInput={setInput}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onOpenUpgradeModal={() => setInfoModalType('upgrade')}
          onOpenComputerModal={() => setInfoModalType('computer')}
          onOpenImageStudio={() => setCurrentView('images')}
          onEditMessage={handleEditMessage}
          onRegenerateResponse={handleRegenerateResponse}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          isGuestLimitReached={guestLimitReached}
          currentUser={currentUser}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsCustomiseOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Interactive Settings & Customise Modal */}
      <CustomiseModal
        isOpen={isCustomiseOpen}
        onClose={() => setIsCustomiseOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        currentUser={currentUser}
        conversations={conversations}
        onClearAll={handleClearAll}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          conversationCount={conversations.length}
          libraryCount={(() => {
            try {
              return getLibraryItems().length;
            } catch {
              return 0;
            }
          })()}
        />
      )}

      {/* Help & Support Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Feature & Upgrade Modals */}
      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
        onSelectPrompt={(prompt) => {
          setInput(prompt);
        }}
      />

      {/* Sleek Dark Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          resetGuestChatCount();
          setGuestLimitReached(false);
          setIsAuthModalOpen(false);
          setAuthToast(`Welcome, ${user.username}! Signed in as ${user.email}. Unlimited chats unlocked!`);
          setTimeout(() => setAuthToast(null), 4500);
        }}
      />

      {/* AI Generated Images Gallery Library */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPrompt={(prompt) => {
          setInput(prompt);
          handleSendMessage(prompt);
        }}
      />

      {/* AI Image Studio Modal (FLUX.1) */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onSendToChat={(prompt, imageUrl) => {
          handleSendMessage(
            `### 🎨 AI Generated Image (FLUX.1)\n\n![${prompt}](${imageUrl})\n\n**Prompt**: *"${prompt}"*\n**Model**: FLUX.1 High-Resolution\n\nAap upar bani photo ko seedha **Download** button se save kar sakte hain! Agar koi specific changes chahiye toh batayein.`
          );
        }}
      />

      {/* Success Notification Toast */}
      {authToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#0c162d]/95 border border-blue-500/40 text-white text-xs sm:text-sm font-medium shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-md animate-slide-down">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{authToast}</span>
        </div>
      )}
    </div>
  );
}
