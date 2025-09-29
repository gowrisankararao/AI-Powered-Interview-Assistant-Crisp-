# Swipe — AI-Powered Interview Assistant (Starter)

Quick start (run these in VS Code terminal):

1. Install dependencies
```bash
npm install
```

2. Run dev server
```bash
npm run dev
```

3. Open http://localhost:5173

Notes & Features:
- Resume upload supports PDF and DOCX. It uses `pdfjs-dist` and `mammoth` to extract text and a simple regex to parse name/email/phone.
- Interview flow UI is implemented with timers and a 6-question flow (2 easy, 2 medium, 2 hard).
- State persistence uses `redux-persist` (localStorage) so closing/reopening restores progress.
- Optional: integrate OpenAI by wiring an API call in `Chat.jsx` where scoring and questions are currently local/simulated.
- This is a starter, intentionally minimal but complete and runnable. Extend it for production (validation, robust parsing, server-side storage).

If you want, I can:
- Convert scoring & dynamic question generation to use OpenAI (I'll add example code that reads `REACT_APP_OPENAI_KEY`).
- Add more polished UI (glassmorphism, animations) and split into more components.
