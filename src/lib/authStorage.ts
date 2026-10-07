export interface SasUser {
  username: string;
  email: string;
  provider: string;
}

const GUEST_CHAT_KEY = 'sas_guest_chat_count';
const USER_KEY = 'sas_user';

export const MAX_GUEST_CHATS = 2;
export const GUEST_LIMIT_EVENT = 'sas_guest_limit_change';

/**
 * Retrieves the currently logged in user from localStorage
 */
export function getStoredUser(): SasUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      const rawName = parsed.username || parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'User');
      return {
        username: String(rawName || 'User'),
        email: String(parsed.email || ''),
        provider: String(parsed.provider || 'demo'),
      };
    }
  } catch {}
  return null;
}

/**
 * Gets the number of chats sent by the guest user
 */
export function getGuestChatCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const count = localStorage.getItem(GUEST_CHAT_KEY);
    return count ? parseInt(count, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Increments the guest chat count by 1 and dispatches an update event
 */
export function incrementGuestChatCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getGuestChatCount();
    const next = current + 1;
    localStorage.setItem(GUEST_CHAT_KEY, next.toString());
    window.dispatchEvent(new Event(GUEST_LIMIT_EVENT));
    return next;
  } catch {
    return 0;
  }
}

/**
 * Resets the guest chat count (e.g. upon user login)
 */
export function resetGuestChatCount(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_CHAT_KEY);
    window.dispatchEvent(new Event(GUEST_LIMIT_EVENT));
  } catch {}
}

/**
 * Checks if the guest user has reached the maximum allowed chats
 */
export function isGuestLimitReached(): boolean {
  const user = getStoredUser();
  if (user) return false; // Logged-in users have unlimited access
  return getGuestChatCount() >= MAX_GUEST_CHATS;
}
