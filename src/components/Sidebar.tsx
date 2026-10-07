'use client';

import React, { useState, useEffect } from 'react';
import { Conversation } from '@/lib/types';
import SasAiWordmark from './SasAiWordmark';
import UserAccountMenu from './UserAccountMenu';
import {
  Search,
  Bell,
  PanelLeftClose,
  Plus,
  Monitor,
  Workflow,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpCircle,
  Images,
  Palette,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  User,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { getLibraryItems, LIBRARY_UPDATE_EVENT } from '@/lib/libraryStorage';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenCustomise?: () => void;
  onOpenInfoModal?: (type: 'computer' | 'automations' | 'artefacts' | 'upgrade') => void;
  onOpenAuthModal?: () => void;
  onOpenLibrary?: () => void;
  onOpenImageStudio?: () => void;
  currentView?: 'chat' | 'images';
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onLogout?: () => void;
}

// Geometric woven asterisk icon matching Perplexity's logo
function PerplexityLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v20" />
      <path d="M4 8l16 8" />
      <path d="M4 16l16-8" />
      <path d="M8 3.5l8 17" />
      <path d="M16 3.5l-8 17" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
  onRenameConversation,
  isOpen,
  onToggleOpen,
  onOpenCustomise,
  onOpenInfoModal,
  onOpenAuthModal,
  onOpenLibrary,
  onOpenImageStudio,
  currentView = 'chat',
  onOpenProfile,
  onOpenSettings,
  onOpenHelp,
  onLogout,
}: SidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string; provider: string } | null>(null);
  const [libraryCount, setLibraryCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem('sas_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            const rawName = parsed.username || parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'User');
            setCurrentUser({
              username: String(rawName || 'User'),
              email: String(parsed.email || ''),
              provider: String(parsed.provider || 'demo'),
            });
            return;
          }
        }
        setCurrentUser(null);
      } catch {
        setCurrentUser(null);
      }
    };

    const updateLibCount = () => {
      try {
        setLibraryCount(getLibraryItems().length);
      } catch {}
    };

    loadUser();
    updateLibCount();

    window.addEventListener('storage', loadUser);
    window.addEventListener(LIBRARY_UPDATE_EVENT, updateLibCount);

    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener(LIBRARY_UPDATE_EVENT, updateLibCount);
    };
  }, []);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedSessions = showAllSessions
    ? filteredConversations
    : filteredConversations.slice(0, 6);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-[82vw] max-w-[280px] md:w-[240px] h-full bg-[#060910]/95 md:bg-[#060910]/85 backdrop-blur-2xl border-r border-white/[0.06] transition-transform duration-200 ease-in-out select-none text-[#ececec] pt-safe ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${!isOpen ? 'md:hidden' : 'md:flex'}`}
      >
        {/* Top Header: Brand & Action Icons */}
        <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
          {/* Brand */}
          <div
            onClick={onNewChat}
            className="flex items-center cursor-pointer text-[#ececec] hover:opacity-85 transition-opacity px-0.5"
            title="SAS AI Home"
          >
            <SasAiWordmark size="sm" />
          </div>

          {/* Action Icon on the right: Toggle */}
          <div className="flex items-center text-[#8f8f8f]">
            <button
              onClick={onToggleOpen}
              type="button"
              title="Collapse sidebar"
              className="p-2 sm:p-1.5 rounded-xl hover:text-[#ececec] hover:bg-[#252525] transition-colors active:scale-95"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Search Input (collapsible) */}
        {searchOpen && (
          <div className="px-3 py-1 animate-fade-in">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#222222] border border-[#303030] text-[#ececec] placeholder-[#6e6e6e] focus:outline-none focus:border-[#444444]"
            />
          </div>
        )}

        {/* Primary Navigation Buttons */}
        <div className="px-2.5 py-2 space-y-0.5">
          {/* + New Button */}
          <button
            onClick={onNewChat}
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#ececec] hover:bg-[#252525] transition-colors group"
          >
            <Plus className="w-4 h-4 text-[#ececec] stroke-[2.2]" />
            <span>New</span>
          </button>

          {/* Computer */}
          <button
            onClick={() => onOpenInfoModal?.('computer')}
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#ececec] hover:bg-[#252525] transition-colors"
          >
            <Monitor className="w-4 h-4 text-[#8f8f8f]" />
            <span>Computer</span>
          </button>

          {/* Image Gen */}
          <button
            onClick={onOpenImageStudio}
            type="button"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group ${
              currentView === 'images'
                ? 'bg-pink-500/15 text-white border border-pink-500/30 shadow-sm'
                : 'text-[#ececec] hover:bg-[#252525]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Palette className={`w-4 h-4 ${currentView === 'images' ? 'text-pink-300' : 'text-pink-400'}`} />
              <span>Image Gen</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/15 text-pink-300 font-semibold border border-pink-500/25">
              FLUX.1
            </span>
          </button>

          {/* Library */}
          <button
            onClick={onOpenLibrary}
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#ececec] hover:bg-[#252525] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Images className="w-4 h-4 text-[#20b8cd]" />
              <span>Library</span>
            </div>
            {libraryCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#20b8cd]/15 text-[#20b8cd] font-semibold border border-[#20b8cd]/25">
                {libraryCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4 scrollbar-thin text-xs">
          {/* Projects Section */}
          <div>
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              type="button"
              className="w-full flex items-center justify-between px-3 py-1 text-xs text-[#8f8f8f] hover:text-[#ececec] transition-colors"
            >
              <span className="font-medium">Projects</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#737373] transition-transform duration-200 ${
                  projectsExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>

            {projectsExpanded && (
              <div className="px-3 py-1.5 text-xs text-[#5c5c5c]">
                No projects
              </div>
            )}
          </div>

          {/* Sessions Section */}
          <div>
            <button
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
              type="button"
              className="w-full flex items-center justify-between px-3 py-1 text-xs text-[#8f8f8f] hover:text-[#ececec] transition-colors"
            >
              <span className="font-medium">Sessions</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#737373] transition-transform duration-200 ${
                  sessionsExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>

            {sessionsExpanded && (
              <div className="mt-1 space-y-0.5">
                {displayedSessions.length === 0 ? (
                  <div className="px-3 py-1.5 text-xs text-[#5c5c5c]">
                    {searchQuery ? 'No matching sessions' : 'No recent sessions'}
                  </div>
                ) : (
                  displayedSessions.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    const isEditing = editingId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`group relative flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-white/[0.08] text-white font-medium border border-white/[0.06] shadow-sm'
                            : 'text-[#a3a3a3] hover:text-[#ececec] hover:bg-white/[0.04]'
                        }`}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => saveRename(conv.id, e)}
                            className="flex items-center gap-1 flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              autoFocus
                              className="w-full px-1.5 py-0.5 text-xs bg-[#191919] rounded border border-[#444444] text-[#ececec] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => saveRename(conv.id, e)}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelRename}
                              className="p-1 text-[#8f8f8f] hover:text-[#ececec]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className="truncate flex-1 pr-2">{conv.title}</span>

                            {/* Actions on hover: rename / delete */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => startRename(conv, e)}
                                type="button"
                                title="Rename"
                                className="p-1 rounded text-[#737373] hover:text-[#ececec] hover:bg-[#2c2c2c]"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conv.id);
                                }}
                                type="button"
                                title="Delete"
                                className="p-1 rounded text-[#737373] hover:text-red-400 hover:bg-[#2c2c2c]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}

                {/* View All Toggle */}
                {filteredConversations.length > 6 && (
                  <button
                    onClick={() => setShowAllSessions(!showAllSessions)}
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-xs text-[#737373] hover:text-[#ececec] transition-colors"
                  >
                    {showAllSessions ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Sign In / Interactive Account Menu */}
        <div className="relative p-3 pb-safe border-t border-white/[0.06]">
          {currentUser ? (
            <>
              {/* User Account Popover Menu (bottom-up placement) */}
              <UserAccountMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                user={currentUser}
                onOpenProfile={() => {
                  setIsUserMenuOpen(false);
                  onOpenProfile?.();
                }}
                onOpenSettings={() => {
                  setIsUserMenuOpen(false);
                  if (onOpenSettings) onOpenSettings();
                  else onOpenCustomise?.();
                }}
                onOpenHelp={() => {
                  setIsUserMenuOpen(false);
                  onOpenHelp?.();
                }}
                onLogout={() => {
                  setIsUserMenuOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    try {
                      localStorage.removeItem('sas_user');
                      window.dispatchEvent(new Event('storage'));
                    } catch {}
                    setCurrentUser(null);
                  }
                }}
                placement="bottom-up"
                className="mb-2 left-1 right-1 w-auto"
              />

              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-[#ececec] transition-all group ${
                  isUserMenuOpen
                    ? 'bg-white/[0.1] border border-white/[0.15] shadow-lg'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06]'
                }`}
                title="Account menu (Profile, Settings, Help, Log out)"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1fd5f0] to-[#3b82f6] flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
                    {((currentUser.username || 'U').trim().charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-semibold text-[#ececec] truncate" title={currentUser.username || 'User'}>
                      {currentUser.username || 'User'}
                    </span>
                    {currentUser.email && (
                      <span className="text-[10px] text-[#737373] truncate">
                        {currentUser.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-1 rounded text-[#737373] group-hover:text-white transition-colors">
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180 text-[#20b8cd]' : ''
                    }`}
                  />
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuthModal}
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-[#ececec] hover:bg-white/[0.04] transition-colors group"
              title="Sign In"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full border border-[#20b8cd] flex items-center justify-center text-[#20b8cd]">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium text-[#ececec]">Sign In</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-[#ececec] transition-colors" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
