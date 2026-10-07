import { Conversation, Message } from './types';
import { DEFAULT_MODEL } from '@/config/ai';

const CONVERSATIONS_KEY = 'sas_ai_conversations_v1';
const ACTIVE_CONV_KEY = 'sas_ai_active_conv_id';
const THEME_KEY = 'sas_ai_theme';

/**
 * Generate a short, clean title from the user prompt
 */
export function generateTitleFromPrompt(prompt: string): string {
  const clean = prompt.trim().replace(/\s+/g, ' ');
  if (!clean) return 'New Chat';

  // Take first 5-6 words or up to 35 characters
  const words = clean.split(' ');
  let title = words.slice(0, 6).join(' ');
  if (title.length > 35) {
    title = title.substring(0, 35) + '...';
  } else if (words.length > 6) {
    title += '...';
  }
  return title;
}

/**
 * Load all saved conversations from localStorage
 */
export function getSavedConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage', err);
    return [];
  }
}

/**
 * Save or update a single conversation in localStorage
 */
export function saveConversation(conversation: Conversation): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getSavedConversations();
    const existingIndex = all.findIndex((c) => c.id === conversation.id);

    if (existingIndex >= 0) {
      all[existingIndex] = conversation;
    } else {
      all.unshift(conversation);
    }

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save conversation to localStorage', err);
  }
}

/**
 * Delete a specific conversation
 */
export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getSavedConversations().filter((c) => c.id !== id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));
    
    if (getActiveConversationId() === id) {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  } catch (err) {
    console.error('Failed to delete conversation from localStorage', err);
  }
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(ACTIVE_CONV_KEY);
  } catch (err) {
    console.error('Failed to clear conversations', err);
  }
}

/**
 * Active conversation tracking
 */
export function getActiveConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CONV_KEY);
}

export function setActiveConversationId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CONV_KEY);
  }
}

/**
 * Create a fresh new conversation object
 */
export function createNewConversation(model: string = DEFAULT_MODEL): Conversation {
  const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    id,
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model,
  };
}

/**
 * Theme persistence
 */
export function getStoredTheme(): 'dark' | 'light' {
  return 'dark';
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, 'dark');
}
