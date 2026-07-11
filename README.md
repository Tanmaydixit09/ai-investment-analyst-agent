# AI Investment Research Agent

A full-stack AI research agent: given a company name, it resolves the ticker, fetches financial
data and news, computes investment scores and a BUY/HOLD/SELL recommendation deterministically,
and uses Gemini (via LangGraph.js) only to explain that decision in natural language.

Full architecture, design rationale, and the "why" behind every decision live in
`architecture-spec.md` (this is the document to walk an interviewer through). A fuller narrative
README (design patterns used, hallucination-minimization strategy, future improvements) will be
written once the implementation is complete — see Section 16 of the spec for its outline.

## Status

Project scaffold only. Business logic is being built incrementally, layer by layer:

1. [x] Project setup
2. [ ] Configuration and environment
3. [ ] Provider interfaces
4. [ ] Financial data service (+ company resolution)
5. [ ] News service
6. [ ] Scoring service (with unit tests)
7. [ ] LangGraph workflow
8. [ ] Gemini integration
9. [ ] Express API
10. [ ] React dashboard
11. [ ] Deployment
12. [ ] Full README

## Running locally (once implementation is further along)

```bash
# Backend
cd server
cp .env.example .env   # then fill in real API keys
npm install
npm run dev             # http://localhost:4000

# Frontend
cd client
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```
