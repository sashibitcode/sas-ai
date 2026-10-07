import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, width = 1024, height = 1024, thinkMode = false } = body;

    const rawPrompt = (prompt || '').trim();
    if (!rawPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhance prompt for AI generation
    let enhancedPrompt = rawPrompt;
    if (thinkMode) {
      enhancedPrompt = `${rawPrompt}, masterpiece, hyper-detailed, photorealistic 8k, dramatic cinematic lighting, volumetric atmosphere, 35mm lens, sharp focus`;
    } else {
      enhancedPrompt = `${rawPrompt}, high resolution, detailed photorealistic photography, crisp lighting, 8k`;
    }

    const encoded = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 9999999);

    // Primary URL (FLUX.1)
    const fluxUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    
    // Fast Fallback URL (SDXL Turbo - renders in < 500ms)
    const turboUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=turbo`;

    return NextResponse.json({
      success: true,
      prompt: rawPrompt,
      enhancedPrompt,
      imageUrl: fluxUrl,
      fallbackUrl: turboUrl,
      seed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
