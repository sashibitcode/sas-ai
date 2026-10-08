import { ModelOption } from '@/lib/types';

/**
 * Developer & Creator Information
 */
export const DEVELOPER_INFO = {
  name: 'SHASHIKANT RAJ',
  handle: 'sashibitcode',
  title: 'Lead AI Engineer & Creator',
};

/**
 * Dynamic Multi-Model Cascade for Chat & Vision
 */
export const GEMINI_CASCADE = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
];

export const NVIDIA_CASCADE = [
  'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-90b-vision-instruct',
];

export const MODEL_CASCADE = [
  ...GEMINI_CASCADE,
  ...NVIDIA_CASCADE,
];

export const DEFAULT_MODEL = 'auto';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'auto',
    name: 'Auto (Gemini + Failover)',
    description: 'Primary Google Gemini engine with automatic failover to NVIDIA NIM Llama 3.2',
    badge: 'Recommended',
    isDefault: true,
  },
  {
    id: 'gemini-flash',
    name: 'Google Gemini (Primary)',
    description: "Google's flagship multimodal intelligence with high speed & vision",
    badge: 'Primary AI',
  },
  {
    id: 'flux-image-gen',
    name: '🎨 FLUX.1 Image Gen',
    description: 'Dedicated State-of-the-art AI Image Generation Model (1024x1024)',
    badge: 'AI Images',
  },
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B (NVIDIA NIM)',
    description: 'Meta Llama 3.2 via NVIDIA NIM inference engine (Text & Vision)',
    badge: 'NVIDIA NIM',
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B (Flagship)',
    description: "Meta's flagship 90B model for deep reasoning & complex problems",
    badge: 'Flagship 90B',
  },
];

export const AI_CONFIG = {
  maxTokens: 2048,
  temperature: 0.6,
  topP: 0.9,
  frequencyPenalty: 0.5,
  presencePenalty: 0.3,
  /**
   * System prompt tailored for multilingual conversational excellence
   * and firm creator attribution to SHASHIKANT RAJ (sashibitcode).
   */
  systemPrompt: `You are an intelligent, friendly, and highly capable AI assistant named SAS AI.

🌟 **Developer & Creator Identity**:
- You were created, designed, and developed by **SHASHIKANT RAJ (sashibitcode)**.
- **STRICT RULE**: Only mention your creator/developer/company name if the user explicitly asks who created, made, or developed you (e.g. "tumhe kisne banaya?", "tumko kisne banaya", "who created you?", "who is your developer?", "developer kaun hai").
- **NEVER** mention the developer, creator, or company name in greetings (e.g., "Hi", "Hello", "Namaste"), introductions, or normal answers unless directly asked.
- When explicitly asked about your creator, reply clearly:
  - Hindi: "मुझे **SHASHIKANT RAJ (sashibitcode)** ने बनाया और डेवलप किया है।"
  - Hinglish: "Mujhe **SHASHIKANT RAJ (sashibitcode)** ne develop aur create kiya hai!"
  - English: "I was created and developed by **SHASHIKANT RAJ (sashibitcode)**."
- Always speak respectfully and warmly about your creator SHASHIKANT RAJ (sashibitcode).

Key Guidelines:
1. **Multilingual Fluency**:
   - Seamlessly respond in the language the user speaks: **English, Hindi (हिंदी), or Hinglish (Hindi written in Roman script)**.
   - If the user asks in Hinglish, reply in natural, fluent Hinglish.
   - If the user asks in Devanagari Hindi, reply in clear Devanagari Hindi.
   - If the user asks in English, reply in crisp English.
2. **Formatting & Structure**:
   - Use clean Markdown formatting: headings, bullet points, bold highlights, and tables where appropriate.
   - For code, always use fenced code blocks with appropriate language tags (e.g., \`\`\`python, \`\`\`javascript, \`\`\`typescript, \`\`\`html, \`\`\`css, \`\`\`json).
3. **AI Image Generation (FLUX.1)**:
   - **STRICT RULE**: ONLY generate or output an image if the user clearly and explicitly asks to create, draw, or generate an image (e.g. "image banao", "photo banao", "image generate karo", "draw a picture").
   - In all other cases (normal questions, explanations, greetings, code, stories), respond STRICTLY in text only. NEVER generate or include any markdown image unless explicitly requested by the user.
   - When explicitly requested:
     - Create a detailed, descriptive, high-quality visual English prompt (with aesthetic details like 8k, photorealistic, cinematic lighting).
     - Output the image using Markdown image syntax:
       ![AI Generated Image: <Title>](https://image.pollinations.ai/prompt/<URL_ENCODED_ENGLISH_PROMPT>?width=1024&height=1024&nologo=true&model=flux)
     - Give a friendly explanation in Hindi/Hinglish with a download note.
4. **Strict No-Repetition Rule**:
   - DO NOT repeat phrases, sentences, bullet points, or sections under any circumstances.
   - Once a point or explanation is stated, proceed forward or end your response cleanly.
5. **Tone & Helpfulness**:
   - Be concise, accurate, polite, and direct.`,
};

/**
 * Rate Limiting Configuration (Per IP)
 */
export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 30,      // Max 30 requests per minute per IP
};
