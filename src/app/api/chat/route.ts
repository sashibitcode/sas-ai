import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { AI_CONFIG, DEFAULT_MODEL, AVAILABLE_MODELS, MODEL_CASCADE } from '@/config/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Check NVIDIA API Key on server
    const apiKey = process.env.NVIDIA_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_nvidia_nim_api_key_here') {
      return NextResponse.json(
        {
          error:
            'NVIDIA NIM API Key configure nahi hai! Kripya .env.local file mein NVIDIA_API_KEY set karein.',
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

    const { messages, model } = body;

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
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux`;

      const responseText = `### 🎨 AI Generated Image (FLUX.1)\n\n![${userPrompt}](${imageUrl})\n\n**Prompt**: *"${userPrompt}"*\n**Model**: FLUX.1 (1024x1024 High-Resolution)\n\nAap upar bani photo ko seedha **Download** button se save kar sakte hain! Agar koi specific changes chahiye toh batayein.`;

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
      const responseText = `### 👨‍💻 SHASHIKANT RAJ (sashibitcode) — Creator & Developer\n\n![SHASHIKANT RAJ (sashibitcode) - Creator & Developer of SAS AI](/shashikant-raj.jpg)\n\n**Name**: SHASHIKANT RAJ\n**Role**: Lead AI Engineer & Developer\n**Handle**: sashibitcode\n\nYe rahe mere creator **SHASHIKANT RAJ**! Unhone hi mujhe (SAS AI) develop, design aur train kiya hai. Aap upar di gayi official photo ko **Download** button par click karke save kar sakte hain! 🚀`;

      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Model-Used': 'creator-official-photo',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
    }

    // 2. SPECIFIC INTENT: Direct Image / Photo Generation Request in natural language
    const isDirectPhotoRequest =
      /^(?:mujhe\s+)?(?:ek\s+)?(?:photo|image|tasveer|picture)\s+(?:banao|dikhao|generate\s+karo|chahiye)|(?:generate|create|draw)\s+(?:an?\s+)?(?:image|photo|picture)/i.test(userContent) ||
      /(?:ki\s+)?(?:photo|image|tasveer)\s+(?:generate\s+karke\s+do|banao|bana\s+do|chahiye)/i.test(userContent);

    if (isDirectPhotoRequest) {
      let cleanSubject = userContent
        .replace(/^(?:mujhe\s+)?(?:ek\s+)?(?:photo|image|tasveer|picture)\s+(?:banao|dikhao|generate\s+karo|chahiye)[:\s]*/i, '')
        .replace(/(?:ki\s+)?(?:photo|image|tasveer)\s+(?:generate\s+karke\s+do|banao|bana\s+do|chahiye)/i, '')
        .replace(/^(?:generate|create|draw)\s+(?:an?\s+)?(?:image|photo|picture)\s+(?:of\s+)?/i, '')
        .trim();

      if (!cleanSubject || cleanSubject.length < 2) cleanSubject = userContent;

      const enhancedPrompt = `${cleanSubject}, highly detailed, photorealistic 8k, cinematic lighting, masterpiece visual`;
      const encoded = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux`;

      const responseText = `### 🎨 AI Generated Image (FLUX.1)\n\n![${cleanSubject}](${imageUrl})\n\n**Prompt**: *"${cleanSubject}"*\n**Model**: FLUX.1 High-Resolution (1024x1024)\n\nAapki mangi hui photo generate ho chuki hai! Aap ise **Download** button se save kar sakte hain. Agar isme koi aur badlaav ya nayi tasveer chahiye toh batayein!`;

      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Model-Used': 'flux-image-gen',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
    }

    const systemPrompt = AI_CONFIG.systemPrompt;

    // Build candidate model list for automatic dynamic failover
    let candidateModels: string[] = [];
    if (!model || model === 'auto') {
      candidateModels = [...MODEL_CASCADE];
    } else {
      // Put requested model first, followed by fallback models (excluding image-gen)
      candidateModels = [
        model,
        ...MODEL_CASCADE.filter((m) => m !== model),
      ].filter((m) => m !== 'flux-image-gen');
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
        // ONLY include image_url for the single latest image to respect NVIDIA NIM 1-image limit
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

    // 4. Request streaming chat completion with Dynamic Multi-Model Auto-Failover
    let activeResponse: Response | null = null;
    let modelUsed = '';
    let lastErrorDetails = 'All models exhausted';

    for (const currentModel of candidateModels) {
      try {
        console.log(`[Model Dispatch] Attempting model: ${currentModel}`);
        const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: formattedMessages,
            temperature: AI_CONFIG.temperature,
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
          console.log(`[Model Dispatch] Successfully connected to: ${currentModel}`);
          break; // Successfully connected to a working model!
        } else {
          const errorJson = await nvidiaResponse.json().catch(() => ({}));
          console.warn(
            `[Model Failover] Model ${currentModel} returned status ${nvidiaResponse.status}. Auto-switching to next model in cascade...`,
            errorJson
          );
          lastErrorDetails =
            errorJson.detail || errorJson.message || `Status ${nvidiaResponse.status}`;
          // Continue loop to try next model!
        }
      } catch (err: any) {
        console.warn(`[Model Failover] Network/Fetch error on ${currentModel}. Auto-switching...`, err?.message);
        lastErrorDetails = err?.message || 'Connection error';
      }
    }

    if (!activeResponse || !activeResponse.body) {
      return NextResponse.json(
        {
          error: `Saare models busy ya unavailable hain. Kripya thodi der baad koshish karein (${lastErrorDetails}).`,
          code: 'ALL_MODELS_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // 5. Transform SSE stream into plain text chunk stream for the client
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
            buffer = lines.pop() || ''; // Keep incomplete trailing line

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

                  // Repetition loop detector guard:
                  // Check if the last 40 characters repeated more than 2 times
                  if (accumulatedText.length > 120) {
                    const tail = accumulatedText.slice(-40);
                    const occurrences = accumulatedText.split(tail).length - 1;
                    if (occurrences >= 3) {
                      console.warn('Repetition loop detected in stream, safely terminating stream.');
                      isClosed = true;
                      upstreamReader.cancel().catch(() => {});
                      controller.close();
                      return;
                    }
                  }

                  controller.enqueue(encoder.encode(token));
                }
              } catch {
                // Skip unparseable heartbeats or partial lines
              }
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

    return new Response(customReadableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
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
