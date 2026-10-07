import { getSavedConversations } from './storage';

export type LibraryItemType = 'image' | 'pdf' | 'code' | 'file';

export interface LibraryItem {
  id: string;
  title: string;
  type: LibraryItemType;
  url?: string;
  content?: string;
  language?: string;
  fileName?: string;
  fileSize?: string;
  prompt?: string;
  createdAt: number;
  model?: string;
  conversationId?: string;
}

// Backwards compatibility
export type LibraryImage = LibraryItem;

const UNIVERSAL_LIBRARY_KEY = 'sas_ai_universal_library_v1';
const LEGACY_IMAGE_KEY = 'sas_ai_image_library_v1';
export const LIBRARY_UPDATE_EVENT = 'sas_library_updated';

/**
 * Extension map for code languages
 */
function getExtensionForLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  switch (normalized) {
    case 'python':
    case 'py':
      return '.py';
    case 'typescript':
    case 'ts':
      return '.ts';
    case 'tsx':
      return '.tsx';
    case 'javascript':
    case 'js':
      return '.js';
    case 'jsx':
      return '.jsx';
    case 'html':
      return '.html';
    case 'css':
      return '.css';
    case 'json':
      return '.json';
    case 'sql':
      return '.sql';
    case 'csv':
      return '.csv';
    case 'markdown':
    case 'md':
      return '.md';
    case 'c':
      return '.c';
    case 'cpp':
    case 'c++':
      return '.cpp';
    case 'java':
      return '.java';
    case 'go':
      return '.go';
    case 'rust':
    case 'rs':
      return '.rs';
    case 'bash':
    case 'sh':
    case 'shell':
      return '.sh';
    default:
      return '.txt';
  }
}

/**
 * Format bytes to readable size
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Scan conversations and harvest all images, code files, and documents
 */
function harvestAllFromConversations(): LibraryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const convs = getSavedConversations();
    const harvested: LibraryItem[] = [];
    const seenSignatures = new Set<string>();

    for (const conv of convs) {
      if (!conv.messages) continue;

      let lastUserPrompt = '';

      for (const msg of conv.messages) {
        if (msg.role === 'user') {
          lastUserPrompt = msg.content;
          // Attached image
          if (msg.image && !seenSignatures.has(msg.image)) {
            seenSignatures.add(msg.image);
            harvested.push({
              id: `item_${msg.id}_user_img`,
              title: msg.content.slice(0, 30) || 'Uploaded Image',
              type: 'image',
              url: msg.image,
              prompt: msg.content || 'User Uploaded Image',
              createdAt: msg.createdAt || conv.updatedAt,
              model: 'Upload',
              conversationId: conv.id,
            });
          }
          continue;
        }

        // Assistant Message Parsing
        if (msg.role === 'assistant' && msg.content) {
          // 1. HARVEST IMAGES
          const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
          let imgMatch: RegExpExecArray | null;
          while ((imgMatch = imgRegex.exec(msg.content)) !== null) {
            const alt = imgMatch[1] || 'AI Generated Image';
            const url = imgMatch[2];
            if (url && !seenSignatures.has(url)) {
              seenSignatures.add(url);
              harvested.push({
                id: `item_${msg.id}_img_${harvested.length}`,
                title: alt,
                type: 'image',
                url,
                prompt: alt,
                createdAt: msg.createdAt || conv.updatedAt,
                model: conv.model || 'FLUX.1',
                conversationId: conv.id,
              });
            }
          }

          // 2. HARVEST CODE BLOCKS & DATA FILES
          const codeRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
          let codeMatch: RegExpExecArray | null;
          let codeIndex = 1;
          while ((codeMatch = codeRegex.exec(msg.content)) !== null) {
            const lang = codeMatch[1] || 'code';
            const codeContent = codeMatch[2]?.trim();
            if (codeContent && codeContent.length > 20) {
              const signature = `code_${codeContent.slice(0, 60)}`;
              if (!seenSignatures.has(signature)) {
                seenSignatures.add(signature);
                const ext = getExtensionForLanguage(lang);
                const safePromptTitle = lastUserPrompt
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')
                  .slice(0, 20)
                  .replace(/-+$/, '');
                const fileName = `${safePromptTitle || lang || 'file'}${ext}`;

                harvested.push({
                  id: `item_${msg.id}_code_${codeIndex++}`,
                  title: `${lang.toUpperCase()} Script (${fileName})`,
                  type: 'code',
                  content: codeContent,
                  language: lang || 'text',
                  fileName,
                  fileSize: formatBytes(new Blob([codeContent]).size),
                  prompt: lastUserPrompt || 'Generated Code Snippet',
                  createdAt: msg.createdAt || conv.updatedAt,
                  model: conv.model || 'SAS AI',
                  conversationId: conv.id,
                });
              }
            }
          }

          // 3. HARVEST PDFS & DOCUMENTS
          const isDocIntent =
            /(?:pdf|report|resume|notes|document|guide|essay|summary|letter|tasveer|contract)/i.test(lastUserPrompt) ||
            msg.content.includes('# ') ||
            msg.content.includes('## ');

          if (isDocIntent && msg.content.length > 150) {
            const docSig = `doc_${msg.content.slice(0, 60)}`;
            if (!seenSignatures.has(docSig)) {
              seenSignatures.add(docSig);
              const firstHeading = (msg.content.match(/^#{1,3}\s+(.*$)/m)?.[1] || lastUserPrompt || 'Document Report')
                .replace(/[#*`_]/g, '')
                .trim();
              const fileName = `${firstHeading.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25)}.pdf`;

              harvested.push({
                id: `item_${msg.id}_doc`,
                title: firstHeading || 'AI Document Report',
                type: 'pdf',
                content: msg.content,
                fileName,
                fileSize: formatBytes(new Blob([msg.content]).size),
                prompt: lastUserPrompt || firstHeading,
                createdAt: msg.createdAt || conv.updatedAt,
                model: conv.model || 'SAS AI Document',
                conversationId: conv.id,
              });
            }
          }
        }
      }
    }

    return harvested;
  } catch (err) {
    console.error('Failed to harvest library items:', err);
    return [];
  }
}

/**
 * Load all items (images, pdfs, code, files) from universal library
 */
export function getLibraryItems(): LibraryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    let items: LibraryItem[] = [];

    // Load universal library
    const raw = localStorage.getItem(UNIVERSAL_LIBRARY_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed;
      } catch {}
    }

    // Migrate old image library if present
    const legacyRaw = localStorage.getItem(LEGACY_IMAGE_KEY);
    if (legacyRaw) {
      try {
        const legacyImgs = JSON.parse(legacyRaw);
        if (Array.isArray(legacyImgs)) {
          const existingIds = new Set(items.map((i) => i.id));
          for (const img of legacyImgs) {
            if (!existingIds.has(img.id)) {
              items.push({
                id: img.id,
                title: img.prompt || 'Generated Image',
                type: 'image',
                url: img.url,
                prompt: img.prompt,
                createdAt: img.createdAt || Date.now(),
                model: img.model,
                conversationId: img.conversationId,
              });
            }
          }
        }
      } catch {}
    }

    // Merge harvested items from conversations
    const harvested = harvestAllFromConversations();
    const existingSignatures = new Set(
      items.map((i) => (i.url ? i.url : `${i.title}_${i.type}_${(i.content || '').slice(0, 40)}`))
    );

    let hasNew = false;
    for (const h of harvested) {
      const sig = h.url ? h.url : `${h.title}_${h.type}_${(h.content || '').slice(0, 40)}`;
      if (!existingSignatures.has(sig)) {
        items.push(h);
        existingSignatures.add(sig);
        hasNew = true;
      }
    }

    if (hasNew) {
      try {
        localStorage.setItem(UNIVERSAL_LIBRARY_KEY, JSON.stringify(items));
      } catch {}
    }

    return items.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Failed to get library items:', err);
    return [];
  }
}

/**
 * Compatibility wrapper for images
 */
export function getLibraryImages(): LibraryItem[] {
  return getLibraryItems().filter((item) => item.type === 'image');
}

/**
 * Save an item to universal Library
 */
export function saveLibraryItem(
  item: Omit<LibraryItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
): LibraryItem {
  const items = getLibraryItems();

  const newItem: LibraryItem = {
    id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: item.title || item.fileName || item.prompt || 'Saved Item',
    type: item.type || 'file',
    url: item.url,
    content: item.content,
    language: item.language,
    fileName: item.fileName,
    fileSize: item.fileSize || (item.content ? formatBytes(new Blob([item.content]).size) : undefined),
    prompt: item.prompt,
    createdAt: item.createdAt || Date.now(),
    model: item.model || 'SAS AI',
    conversationId: item.conversationId,
  };

  const updated = [newItem, ...items.filter((i) => i.id !== newItem.id)];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(UNIVERSAL_LIBRARY_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(LIBRARY_UPDATE_EVENT));
    } catch (err) {
      console.error('Failed to save item to library:', err);
    }
  }

  return newItem;
}

/**
 * Compatibility helper to save image
 */
export function saveLibraryImage(
  item: { url: string; prompt?: string; model?: string; conversationId?: string }
): LibraryItem {
  return saveLibraryItem({
    title: item.prompt || 'AI Generated Image',
    type: 'image',
    url: item.url,
    prompt: item.prompt,
    model: item.model || 'FLUX.1',
    conversationId: item.conversationId,
  });
}

/**
 * Delete a specific item
 */
export function deleteLibraryItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const items = getLibraryItems().filter((item) => item.id !== id);
    localStorage.setItem(UNIVERSAL_LIBRARY_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(LIBRARY_UPDATE_EVENT));
  } catch (err) {
    console.error('Failed to delete library item:', err);
  }
}

export function deleteLibraryImage(id: string): void {
  deleteLibraryItem(id);
}

/**
 * Clear library items by optional type filter
 */
export function clearLibrary(typeFilter?: LibraryItemType): void {
  if (typeof window === 'undefined') return;
  try {
    if (!typeFilter) {
      localStorage.removeItem(UNIVERSAL_LIBRARY_KEY);
      localStorage.removeItem(LEGACY_IMAGE_KEY);
    } else {
      const items = getLibraryItems().filter((item) => item.type !== typeFilter);
      localStorage.setItem(UNIVERSAL_LIBRARY_KEY, JSON.stringify(items));
    }
    window.dispatchEvent(new Event(LIBRARY_UPDATE_EVENT));
  } catch (err) {
    console.error('Failed to clear library:', err);
  }
}

/**
 * Extract and save markdown images from text
 */
export function extractAndSaveImagesFromText(
  text: string,
  promptText = 'AI Generated Image',
  convId?: string,
  model = 'FLUX.1'
): void {
  if (!text) return;
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(text)) !== null) {
    const alt = match[1] || promptText;
    const url = match[2];
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      saveLibraryImage({
        url,
        prompt: alt || promptText,
        model,
        conversationId: convId,
      });
    }
  }
}
