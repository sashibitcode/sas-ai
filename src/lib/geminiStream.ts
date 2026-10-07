import { GEMINI_CASCADE } from '@/config/ai';

interface ChatMessageInput {
  role: string;
  content: string;
  image?: string;
}

export interface GeminiStreamResult {
  success: boolean;
  body?: ReadableStream<Uint8Array>;
  modelUsed?: string;
  status?: number;
  error?: string;
}

/**
 * Parses data URI to inlineData object for Gemini multimodal vision
 */
function parseImageDataUri(imageUri: string): { mimeType: string; data: string } | null {
  if (!imageUri.startsWith('data:')) return null;
  const match = imageUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

/**
 * Formats messages into Gemini API format with strict turn-alternation guarantees
 */
export function formatGeminiContents(messages: ChatMessageInput[]) {
  const contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  }> = [];

  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Add image if available (only user role can contain images in Gemini API)
    if (m.image && role === 'user') {
      const inlineData = parseImageDataUri(m.image);
      if (inlineData) {
        parts.push({ inlineData });
      }
    }

    // Add text content
    if (m.content && m.content.trim()) {
      parts.push({ text: m.content });
    } else if (parts.length === 0) {
      parts.push({ text: '...' });
    }

    if (parts.length === 0) continue;

    // Gemini requirement: First content must be role 'user'
    if (contents.length === 0 && role !== 'user') {
      continue;
    }

    // Gemini requirement: Consecutive messages cannot share the same role
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) {
      prev.parts.push(...parts);
    } else {
      contents.push({ role, parts });
    }
  }

  // Ensure there is at least one user message
  if (contents.length === 0) {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
    contents.push({
      role: 'user',
      parts: [{ text: lastUserMsg?.content || 'Hello' }],
    });
  }

  return contents;
}

/**
 * Attempts streaming response from Google Gemini across available cascade models
 */
export async function streamGeminiWithCascade(
  messages: ChatMessageInput[],
  apiKey: string,
  systemPrompt: string,
  preferredModel?: string,
  temperature?: number
): Promise<GeminiStreamResult> {
  const candidateModels = preferredModel && preferredModel !== 'auto' && preferredModel !== 'gemini-flash'
    ? [preferredModel, ...GEMINI_CASCADE]
    : GEMINI_CASCADE;

  const contents = formatGeminiContents(messages);

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: typeof temperature === 'number' ? temperature : 0.6,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  };

  let lastStatus = 500;
  let lastError = 'All Gemini models exhausted';

  for (const model of candidateModels) {
    try {
      console.log(`[Gemini Dispatch] Attempting model: ${model}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok && res.body) {
        console.log(`[Gemini Dispatch] Successfully connected to Gemini: ${model}`);
        return {
          success: true,
          body: res.body,
          modelUsed: model,
          status: res.status,
        };
      }

      lastStatus = res.status;
      const errorJson = await res.json().catch(() => ({}));
      lastError = errorJson?.error?.message || `Status ${res.status}`;

      console.warn(
        `[Gemini Failover] Model ${model} returned status ${res.status}: ${lastError}. Checking next...`
      );

      // If quota exhausted (429), or capacity issue (503), immediately try next Gemini model or fallback to NVIDIA NIM
    } catch (err: any) {
      console.warn(`[Gemini Failover] Network/Abort on ${model}:`, err?.message);
      lastError = err?.message || 'Connection error';
    }
  }

  return {
    success: false,
    status: lastStatus,
    error: lastError,
  };
}

/**
 * Transforms Gemini SSE stream into plain text chunks for client
 */
export function createGeminiReadableStream(upstreamBody: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstreamBody.getReader();

  let isClosed = false;
  let accumulatedText = '';

  return new ReadableStream({
    async start(controller) {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (!isClosed) {
              isClosed = true;
              controller.close();
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const data = JSON.parse(jsonStr);
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;

              if (textChunk && !isClosed) {
                accumulatedText += textChunk;

                // Loop detector
                if (accumulatedText.length > 120) {
                  const tail = accumulatedText.slice(-40);
                  const occurrences = accumulatedText.split(tail).length - 1;
                  if (occurrences >= 3) {
                    isClosed = true;
                    reader.cancel().catch(() => {});
                    controller.close();
                    return;
                  }
                }

                controller.enqueue(encoder.encode(textChunk));
              }
            } catch {
              // Skip malformed chunk
            }
          }
        }
      } catch (err) {
        console.error('Gemini SSE parsing error:', err);
        if (!isClosed) {
          isClosed = true;
          controller.error(err);
        }
      }
    },
    cancel() {
      isClosed = true;
      reader.cancel().catch(() => {});
    },
  });
}
