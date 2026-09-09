# BahanPas AI — PRD

## Original Problem Statement
Build "BahanPas AI", an AI-native Supply Chain, Dynamic HPP & Kitchen Automation web app for Indonesian F&B MSMEs (UMKM Kuliner). Tagline: "Solusi Stok FIFO, Voice Input Dapur, Simulator HPP, & Belanja Otomatis F&B". Modern mobile-first SaaS dashboard, Emerald/Amber/Rose/Slate palette, full Bahasa Indonesia, light/dark toggle.

## User Choices
- AI: real LLM via Emergent Universal Key (backend proxy, model `gpt-5.4`, emergentintegrations).
- Voice: Web Speech API (browser) + preset sample-text buttons beside mic for LLM parsing fallback.
- Auth: simple client-side demo bypass (admin@bahanpas.ai / bahanpas321), no JWT/DB.
- State: localStorage only (`bahanpas_state_v1`), no MongoDB persistence.
- Theme: light + dark toggle.

## Architecture
- Frontend: React 19 + React Router, Tailwind + shadcn/ui, framer-motion, recharts, sonner. Global state via AppContext (localStorage). ThemeContext toggles `dark` class.
- Backend: FastAPI, `/api` prefix. Stateless AI proxy endpoints using emergentintegrations LlmChat (gpt-5.4):
  - POST /api/ai/parse-voice — transcript -> structured stock JSON
  - POST /api/ai/parse-receipt — {text|image_base64} -> receipt JSON (vision OCR)
  - POST /api/ai/margin-advice — hike% + recipes -> AI margin recommendation
  - POST /api/ai/reorder — inventory + sales -> reorder insights & orders
- Unit conversion engine (kg/g, L/ml) with base-unit storage; FIFO deduction across batches.

## Implemented (2026-06)
- Landing page (hero, bento features, 4-step how-it-works, testimonials, FAQ accordion, CTA).
- Login with demo credentials card, form login + bypass quick login.
- Global header: Quick Demo Mode (10s auto-demo), Pitch Deck modal (4 slides), Reset Data (confirm), theme toggle, responsive mobile nav.
- Dashboard: 4 KPI cards, AI Margin & Price Hike Simulator (slider + before/after chart + AI advice box), 7-day savings/waste bar chart, FIFO batch radar table with status badges + "Pakai Dulu".
- Smart Entry: Voice-to-Stock (mic + 3 sample buttons) with AI parsing + apply-to-inventory, Receipt OCR (upload + sample) with import, Dynamic HPP recalculator (Old vs New).
- Sales/Audit: menu counter + CSV import sim, quick stock take variance, waste log with mandatory reasons + audit trail table.
- AI Reorder + WhatsApp generator (copy + wa.me).
- localStorage persistence; light/dark; full Bahasa Indonesia; data-testids throughout.
- Tested: backend 100% (6 pytest), frontend 100% (testing agent iteration_1).

## Backlog / Remaining
- P2: rate-limiting on AI endpoints (production).
- P2: streaming AI responses for perceived speed.
- P2: real POS integration + multi-outlet, real auth/DB if moved beyond demo.
