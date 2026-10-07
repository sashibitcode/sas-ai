# ⚡ SAS AI - ChatGPT-Style AI Chat Website

> **NVIDIA NIM (Meta Llama 3.2)**, **Next.js 14 (App Router)** aur **Tailwind CSS** se bana ek ultra-fast AI Chat application jo Hindi, Hinglish aur English teeno mein live streaming ke saath fluent jawab deta hai.

---

## ✨ Features

- 💬 **Clean & Modern Chat UI**: User ke messages right side mein aur AI ke messages left side mein sleek avatar aur bubbles ke saath.
- ⚡ **Real-Time Word-by-Word Streaming**: NVIDIA NIM OpenAI-compatible API ke through live streaming response sub-second latency mein.
- 🧠 **Meta Llama 3.2 Models (via NVIDIA NIM)**:
  - **Llama 3.2 11B** (Default): Ultra-fast speed aur instant responses.
  - **Llama 3.2 90B**: Meta ka flagship 90B model for deep reasoning.
- 📝 **Rich Markdown & Code Rendering**:
  - Auto language detection ke saath syntax-highlighted code blocks (`Python`, `JS`, `TS`, `HTML`, `CSS`, `JSON`, etc.).
  - 1-Click **"Copy Code"** aur **"Copy Message"** buttons.
  - Tables, lists, blockquotes aur links ka clean formatting.
- 🗂️ **Sidebar & History (localStorage)**:
  - Purani chats browser ke `localStorage` mein automatically save hoti hain.
  - Har chat ko **Rename**, **Delete** ya saari chats ko **Clear** karne ka option.
  - Chat titles pehle prompt se automatically generate hote hain.
  - Quick Search bar purani chats dhoondhne ke liye.
- 🌐 **Multilingual Mastery (Hindi, Hinglish & English)**:
  - Hinglish (*"Bhai React hooks samjhao"*), Devanagari Hindi (*"नमस्ते, आप कैसे हैं?"*) ya English sabme natural conversation.
- 🌓 **Dark & Light Mode**: Ek click mein switch karein, default sleek dark mode ke saath.
- 📱 **100% Mobile Responsive**: Mobile screens par drawer sidebar aur touch-friendly UI.
- 🛑 **Stop Generation**: AI response beech mein rokne ke liye interactive stop button.
- 🛡️ **Server-Side API Security & Rate Limiting**:
  - `NVIDIA_API_KEY` sirf server-side `.env.local` mein rehti hai, browser mein kabhi leak nahi hoti.
  - In-memory sliding window rate limiter (per IP).

---

## 🚀 Locally Kaise Chalayein (Local Setup Guide)

### Step 1: Environment Variables Setup Karein
Apni [`.env.local`](file:///d:/Shashi/sas.ai/.env.local) file mein NVIDIA NIM API key dalein:

```env
NVIDIA_API_KEY=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
```

### Step 2: Dev Server Start Karein
```bash
npm run dev
```

Browser mein **[http://localhost:3000](http://localhost:3000)** kholein! 🎉

---

## ☁️ Vercel Par Deploy Kaise Karein (Vercel Deployment Guide)

1. Apne project code ko GitHub par push karein:
   ```bash
   git add .
   git commit -m "Deploy SAS AI with NVIDIA NIM"
   git push origin main
   ```
2. [Vercel.com](https://vercel.com/) par repository import karein.
3. **Environment Variables** mein add karein:
   - **Key**: `NVIDIA_API_KEY`
   - **Value**: `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`
4. **Deploy** button dabayein! 🚀

---

## 👨‍💻 Creator Identity & Photo Feature

- **Creator Attribution**:
  - Jab koi bhi user puche *"Tumhe kisne banaya?"*, *"Who created you?"*, *"Developer kaun hai?"* ya *"Shashikant kaun hai?"*:
  - Chatbot clearly aur garv se batata hai ki use **SHASHIKANT RAJ (sashibitcode)** ne develop kiya hai.
- **Creator Official Photo**:
  - Chatbot se bole *"Shashikant ki photo dikhao"*, *"Creator ki image dikhao"*, ya *"Developer ki tasveer chahiye"*:
  - Chatbot turant **SHASHIKANT RAJ** ki official photo (`/shashikant-raj.jpg`) high-definition mein 1-click Download button ke saath display karta hai!
- **AI Image Generation (FLUX.1)**:
  - Chatbot se kisi bhi cheez ki photo maange (*"car ki photo banao"*, *"sunset generate karo"*), wo real AI visual FLUX.1 se generate karke deta hai.

---

## 📜 License & Developer
Created with ❤️ by **SHASHIKANT RAJ (sashibitcode)**.
MIT License.

