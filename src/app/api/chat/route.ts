import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import {
  AI_CONFIG,
  DEFAULT_MODEL,
  AVAILABLE_MODELS,
  MODEL_CASCADE,
  GEMINI_CASCADE,
  NVIDIA_CASCADE,
} from '@/config/ai';
import { searchEntityPhotos } from '@/lib/photoSearch';
import { streamGeminiWithCascade, createGeminiReadableStream } from '@/lib/geminiStream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function resolveTargetEntity(
  messages: Array<{ role: string; content: string }>,
  nvidiaApiKey?: string,
  geminiApiKey?: string
): Promise<string> {
  const entityPrompt =
    'You are an entity extractor. The user is asking for a photo, image, or picture. Identify the subject based on the conversation history and latest user query. If it is a real person, celebrity, leader, company, place, or object (e.g., "Sam Altman", "Taj Mahal", "Elon Musk", "Narendra Modi"), reply with ONLY the exact name. If it is an imaginative/creative prompt (e.g., "flying car on mars", "cyberpunk cat"), reply with "GENERATE: <prompt>". Reply with ONLY the name or prompt. Do not add any punctuation or explanation.';

  // 1. Try Google Gemini first if key available
  if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const lastUser = messages.filter((m) => m.role === 'user').pop();
      const userText = lastUser?.content || '';

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: entityPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userText }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 40 },
          }),
          signal: controller.signal,
        }
      ).catch(() => null);

      clearTimeout(timeout);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {}
  }

  // 2. Try NVIDIA NIM
  if (nvidiaApiKey && nvidiaApiKey !== 'your_nvidia_nim_api_key_here') {
    try {
      const payload = JSON.stringify({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages: [
          {
            role: 'system',
            content: entityPrompt,
          },
          ...messages.slice(-6),
        ],
        temperature: 0.1,
        max_tokens: 40,
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaApiKey}`,
        },
        body: payload,
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.error('Error resolving entity via NVIDIA:', err);
    }
  }

  // Fallback to latest user message content
  const lastUser = messages.filter((m) => m.role === 'user').pop();
  return lastUser?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check API Keys on server
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.ANTHROPIC_API_KEY;
    const hasGeminiKey = Boolean(geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here');
    const hasNvidiaKey = Boolean(nvidiaApiKey && nvidiaApiKey !== 'your_nvidia_nim_api_key_here');

    if (!hasGeminiKey && !hasNvidiaKey) {
      return NextResponse.json(
        {
          error:
            'API Key configure nahi hai! Kripya .env.local file mein GEMINI_API_KEY ya NVIDIA_API_KEY set karein.',
          code: 'MISSING_API_KEY',
        },
        { status: 500 }
      );
    }

    // 2. Rate Limiting Check
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Rate limit exceed ho gaya hai! Kripya thoda intezar karein (Reset in ${Math.max(
            1,
            rateLimit.reset - Math.floor(Date.now() / 1000)
          )}s).`,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': '60',
          },
        }
      );
    }

    // 3. Parse and validate Request Body
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const { messages, model, temperature, languagePreference } = body;

    // Filter valid user and assistant messages
    const validMessages = messages.filter(
      (m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant'
    );

    // Dedicated FLUX.1 AI Image Generation Handler
    if (model === 'flux-image-gen') {
      const lastUserMsg = validMessages.filter((m: { role: string; content: string }) => m.role === 'user').pop();
      const userPrompt = lastUserMsg?.content || 'beautiful artistic wallpaper';

      const enhancedPrompt = `${userPrompt}, highly detailed, photorealistic 8k, cinematic lighting, masterpiece`;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const seed = Math.floor(Math.random() * 9999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

      const responseText = `### 🎨 AI Generated Image (FLUX.1)\n\n![${userPrompt}](${imageUrl})\n\n**Prompt**: *"${userPrompt}"*\n**Model**: FLUX.1 (1024x1024 High-Resolution)\n\nAap upar bani photo ko seedha **Bookmark** se Library mein save kar sakte hain ya **Download** button se save kar sakte hain! Agar koi specific changes chahiye toh batayein.`;

      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Model-Used': 'flux-image-gen',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
    }

    // Check last user message for special intents
    const lastUserMessage = validMessages.filter((m: { role: string }) => m.role === 'user').pop();
    const userContent = (lastUserMessage?.content || '').trim();

    // 1. SPECIFIC INTENT: User asks for Creator / Shashikant's photo
    const isCreatorPhotoQuery =
      /(?:shashikant|creator|developer|maker|owner).*(?:photo|image|tasveer|pic|picture)|(?:photo|image|tasveer|pic|picture).*(?:shashikant|creator|developer|maker|owner)/i.test(userContent);

    if (isCreatorPhotoQuery) {
      const responseText = `### 👨‍💻 SHASHIKANT RAJ (sashibitcode) — Creator & Developer\n\n![SHASHIKANT RAJ (sashibitcode) - Creator & Developer of SAS AI](/shashikant-raj.jpg)\n\n**Name**: SHASHIKANT RAJ\n**Role**: Lead AI Engineer & Developer\n**Handle**: sashibitcode\n\nYe rahe mere creator **SHASHIKANT RAJ**! Unhone hi mujhe (SAS AI) develop, design aur train kiya hai. Aap upar di gayi official photo ko **Bookmark** se Library mein save kar sakte hain ya **Download** button se save kar sakte hain! 🚀`;

      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Model-Used': 'creator-official-photo',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
    }

    // 2. SPECIFIC INTENT: Contextual & Direct Photo / Image Request
    const isPhotoQuery =
      /(?:photo|image|tasveer|picture|pic|photu)\s*(?:do|dikhao|banao|chahiye|de|bana|generate|send|le|dikhaye|lao)|(?:do|dikhao|banao|generate|send|show|give|fetch|find)\s*(?:an?\s+)?(?:photo|image|tasveer|picture|pic)|(?:photo\s+do\s+uska|uska\s+photo|uski\s+photo|iski\s+photo|inka\s+photo|unki\s+photo|iska\s+photo\s+do|unki\s+tasveer|uska\s+tasveer)/i.test(userContent) ||
      /^(?:mujhe\s+)?(?:ek\s+)?(?:photo|image|tasveer|picture)\s+(?:banao|dikhao|generate\s+karo|chahiye)|^(?:generate|create|draw)\s+(?:an?\s+)?(?:image|photo|picture)/i.test(userContent) ||
      /(?:ki|ka)\s+(?:photo|image|tasveer|pic)\s*(?:do|dikhao|banao|chahiye)?$/i.test(userContent) ||
      /^(?:photo|tasveer|image|pic)\s*(?:do|dikhao|chahiye)?$/i.test(userContent);

    if (isPhotoQuery) {
      // Intelligently resolve the entity from chat context
      const resolvedSubject = await resolveTargetEntity(validMessages, nvidiaApiKey, geminiApiKey);
      const isAiCreative = /^GENERATE:/i.test(resolvedSubject) || /(?:draw|banao|fantasy|anime|cyberpunk|robot|spacesuit|alien)/i.test(resolvedSubject);

      if (!isAiCreative && resolvedSubject && resolvedSubject.length >= 2) {
        const cleanEntity = resolvedSubject.replace(/^(?:photo of|image of|picture of)\s*/i, '').trim();
        const photos = await searchEntityPhotos(cleanEntity, 3);

        if (photos.length > 0) {
          const galleryJson = JSON.stringify({
            title: cleanEntity,
            images: photos.map((p) => p.url),
            captions: photos.map((p) => p.title),
            source: 'Verified Wikimedia / Wikipedia Photographs',
          });

          const hiddenMarkdown = photos
            .map((p) => `![${p.title}](${p.url})`)
            .join('\n');

          const responseText = `### 📸 Photographs: **${cleanEntity}**\n\n:::gallery\n${galleryJson}\n:::\n\n${hiddenMarkdown}\n\nYe rahe **${cleanEntity}** ke authentic high-resolution photographs! Aap kisi bhi photo par click karke full-screen zoom preview dekh sakte hain, **Bookmark** button se Library mein save kar sakte hain, ya circular **Download** button se save kar sakte hain. 🚀`;

          return new Response(responseText, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Model-Used': 'entity-photo-search',
              'X-RateLimit-Limit': rateLimit.limit.toString(),
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            },
          });
        }
      }

      // Creative AI generation fallback
      let promptToUse = resolvedSubject.replace(/^GENERATE:\s*/i, '').trim();
      if (!promptToUse || promptToUse.length < 2) promptToUse = userContent;

      const enhancedPrompt = `${promptToUse}, highly detailed, photorealistic 8k, cinematic lighting, masterpiece visual`;
      const encoded = encodeURIComponent(enhancedPrompt);
      const seed = Math.floor(Math.random() * 9999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

      const responseText = `### 🎨 AI Generated Image (FLUX.1)\n\n![${promptToUse}](${imageUrl})\n\n**Prompt**: *"${promptToUse}"*\n**Model**: FLUX.1 High-Resolution (1024x1024)\n\nAapki mangi hui photo generate ho chuki hai! Aap ise **Bookmark** button se Library mein save kar sakte hain ya circular **Download** button se download kar sakte hain.`;

      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Model-Used': 'flux-image-gen',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
    }

    let systemPrompt = AI_CONFIG.systemPrompt;
    if (languagePreference === 'hinglish') {
      systemPrompt += `\n\n[USER LANGUAGE PREFERENCE]: Roman Hinglish. Speak conversationally in natural Roman Hindi / Hinglish while maintaining high technical accuracy.`;
    } else if (languagePreference === 'english') {
      systemPrompt += `\n\n[USER LANGUAGE PREFERENCE]: English. Reply strictly in clear, articulate English.`;
    }

    const requestedModel = model || 'auto';

    const isSpecificNvidiaRequested =
      requestedModel.startsWith('meta/') || requestedModel.includes('llama');

    // =========================================================================
    // 4. PRIMARY ENGINE: Google Gemini (Primary for auto, gemini-flash, or default)
    // =========================================================================
    if (!isSpecificNvidiaRequested && hasGeminiKey) {
      console.log(`[Primary Engine] Attempting Google Gemini stream for model: "${requestedModel}" with temp: ${temperature ?? 'default'}...`);
      const geminiResult = await streamGeminiWithCascade(
        validMessages,
        geminiApiKey!,
        systemPrompt,
        requestedModel,
        typeof temperature === 'number' ? temperature : undefined
      );

      if (geminiResult.success && geminiResult.body) {
        console.log(`[Primary Engine] Google Gemini (${geminiResult.modelUsed}) connected and streaming.`);
        const geminiStream = createGeminiReadableStream(geminiResult.body);
        return new Response(geminiStream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Model-Used': geminiResult.modelUsed || 'gemini-flash',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      }

      console.warn(
        `[Auto-Failover Triggered] Google Gemini quota exhausted or unavailable (${geminiResult.status}: ${geminiResult.error}). Seamlessly switching to NVIDIA NIM Llama 3.2 cascade...`
      );
    }

    // =========================================================================
    // 5. SECONDARY / FAILOVER ENGINE: NVIDIA NIM Cascade (Llama 3.2 11B & 90B)
    // =========================================================================
    if (hasNvidiaKey) {
      let candidateNvidiaModels = [...NVIDIA_CASCADE];
      if (isSpecificNvidiaRequested) {
        candidateNvidiaModels = [
          requestedModel,
          ...NVIDIA_CASCADE.filter((m) => m !== requestedModel),
        ];
      }

      // Find the single latest user message that contains an image
      let latestImageIndex = -1;
      for (let i = validMessages.length - 1; i >= 0; i--) {
        if (validMessages[i].role === 'user' && validMessages[i].image) {
          latestImageIndex = i;
          break;
        }
      }

      // Build messages payload with System Prompt prepended
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...validMessages.map((m: { role: string; content: string; image?: string }, idx: number) => {
          if (m.role === 'user' && m.image && idx === latestImageIndex) {
            return {
              role: 'user',
              content: [
                { type: 'text', text: m.content || 'Please analyze this image in detail.' },
                { type: 'image_url', image_url: { url: m.image } },
              ],
            };
          }
          return {
            role: m.role as 'user' | 'assistant',
            content: m.content || '',
          };
        }),
      ];

      let activeResponse: Response | null = null;
      let modelUsed = '';
      let lastErrorDetails = 'All NVIDIA models exhausted';

      for (const currentModel of candidateNvidiaModels) {
        try {
          console.log(`[NVIDIA NIM Dispatch] Attempting model: ${currentModel}`);
          const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${nvidiaApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: currentModel,
              messages: formattedMessages,
              temperature: typeof temperature === 'number' ? temperature : AI_CONFIG.temperature,
              top_p: AI_CONFIG.topP,
              frequency_penalty: AI_CONFIG.frequencyPenalty,
              presence_penalty: AI_CONFIG.presencePenalty,
              max_tokens: AI_CONFIG.maxTokens,
              stream: true,
            }),
          });

          if (nvidiaResponse.ok && nvidiaResponse.body) {
            activeResponse = nvidiaResponse;
            modelUsed = currentModel;
            console.log(`[NVIDIA NIM Dispatch] Successfully connected to: ${currentModel}`);
            break;
          } else {
            const errorJson = await nvidiaResponse.json().catch(() => ({}));
            console.warn(
              `[NVIDIA Failover] Model ${currentModel} returned status ${nvidiaResponse.status}. Trying next...`,
              errorJson
            );
            lastErrorDetails =
              errorJson.detail || errorJson.message || `Status ${nvidiaResponse.status}`;
          }
        } catch (err: any) {
          console.warn(`[NVIDIA Failover] Network error on ${currentModel}:`, err?.message);
          lastErrorDetails = err?.message || 'Connection error';
        }
      }

      if (activeResponse && activeResponse.body) {
        // Transform SSE stream into plain text chunk stream for the client
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const upstreamReader = activeResponse.body.getReader();

        let isClosed = false;
        let accumulatedText = '';

        const customReadableStream = new ReadableStream({
          async start(controller) {
            let buffer = '';

            try {
              while (true) {
                const { done, value } = await upstreamReader.read();
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

                  const dataStr = trimmed.replace(/^data:\s*/, '');
                  if (dataStr === '[DONE]') {
                    if (!isClosed) {
                      isClosed = true;
                      controller.close();
                    }
                    return;
                  }

                  try {
                    const parsed = JSON.parse(dataStr);
                    const token = parsed.choices?.[0]?.delta?.content;
                    if (token && !isClosed) {
                      accumulatedText += token;

                      if (accumulatedText.length > 120) {
                        const tail = accumulatedText.slice(-40);
                        const occurrences = accumulatedText.split(tail).length - 1;
                        if (occurrences >= 3) {
                          console.warn('Repetition loop detected, safely terminating stream.');
                          isClosed = true;
                          upstreamReader.cancel().catch(() => {});
                          controller.close();
                          return;
                        }
                      }

                      controller.enqueue(encoder.encode(token));
                    }
                  } catch {}
                }
              }
            } catch (streamErr) {
              console.error('Error in streaming response:', streamErr);
              if (!isClosed) {
                isClosed = true;
                controller.error(streamErr);
              }
            }
          },
          cancel() {
            isClosed = true;
            upstreamReader.cancel().catch(() => {});
          },
        });

        const isFailover = !isSpecificNvidiaRequested;
        return new Response(customReadableStream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Model-Used': `${modelUsed}${isFailover ? ' (Failover)' : ''}`,
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      }
    }

    // =========================================================================
    // 6. FINAL FALLBACK: If user specifically requested NVIDIA, but NVIDIA failed, try Gemini
    // =========================================================================
    if (isSpecificNvidiaRequested && hasGeminiKey) {
      console.log('[Fallback to Gemini] Specific NVIDIA model failed. Attempting Google Gemini fallback...');
      const geminiResult = await streamGeminiWithCascade(
        validMessages,
        geminiApiKey!,
        systemPrompt
      );

      if (geminiResult.success && geminiResult.body) {
        const geminiStream = createGeminiReadableStream(geminiResult.body);
        return new Response(geminiStream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Model-Used': `${geminiResult.modelUsed} (Failover)`,
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      }
    }

    return NextResponse.json(
      {
        error:
          'Saare AI models (Google Gemini aur NVIDIA NIM) filhal busy ya quota limit reach kar chuke hain. Kripya thodi der baad koshish karein.',
        code: 'ALL_MODELS_UNAVAILABLE',
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Chat API Route Error:', error);
    const errorMessage =
      error?.message || 'Server par anapekshit truti (unexpected error) aayi hai.';

    return NextResponse.json(
      {
        error: errorMessage,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
