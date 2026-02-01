# Chedr Project Instructions

## Agent Specifications

This project has two specialized agents with strict quality standards:

| Agent | File | Scope |
|-------|------|-------|
| Design Agent | [agent.md](agent.md) | UI/UX, components, styling, layout |
| Gemini Agent | [agent-gemini.md](agent-gemini.md) | API integration, OCR, extraction, pipelines |

**Always read the relevant agent spec before making changes in that domain.**

---

## Design Work

For all UI/UX design, refactoring, or component work, follow the specifications in [agent.md](agent.md).

Key triggers for design mode:
- Any work on components in `components/`
- Style changes (Tailwind, CSS, tokens)
- Layout or responsive behavior
- New screens or flows
- Visual polish or refactoring

Before making UI changes:
1. Read `agent.md` for the design system rules
2. Follow the operating loop (baseline → audit → patch → validate)
3. Produce validation artifacts (screenshots, a11y checks)

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Expo / React Native Web

## Quality Gates

- Run `npm run lint` before commits
- Run `npm run typecheck` for type validation
- Playwright tests for visual regression: `npm run test:e2e`

## Tokens & Components

Design tokens and shared components should follow the system defined in agent.md:
- Swift Orange (accent)
- Cloud Divine (neutrals)
- Liquid glass for panels/overlays
- Single spacing scale (tokenized)

---

## Gemini Integration Work

For all API integration, document processing, or extraction work, follow [agent-gemini.md](agent-gemini.md).

Key triggers for Gemini mode:
- Changes to `services/geminiService.ts`
- Changes to `services/documentClassifier.ts`
- Document processing pipeline work
- Tax data extraction or mapping
- Conversation/tool calling implementation

Critical rules (always apply):
- Monetary values are integer cents (never floats)
- Validate all Gemini responses against TypeScript schemas
- Never log SSN/EIN/passwords
- All extracted fields need confidence scores and source references

Key files:
- `services/geminiService.ts` - Core Gemini API integration
- `services/documentClassifier.ts` - Document classification and processing
- `services/taxFormModels.ts` - Tax form field mappings
- `types.ts` - Core type definitions
