# Plan: Apple HIG Audit — Chedr Conversational Tax Filing

## Goal / Definition of Done

Measurable completion criteria:
- [ ] P0 Issue 001: No duplicate messages after clicking "Get Started"
- [ ] P1 Issue 002: Plaid modal has Cancel button, Esc handler, ARIA, focus trap
- [ ] P1 Issue 003: Typing indicators and bridging copy between context switches
- [ ] P1 Issue 004: All interactive Tax Summary items have focus rings and hover states
- [ ] P1 Issue 005: Typography scale applied consistently (no text < 13px except design tokens)
- [ ] P2 Issue 006: Green contrast ratio ≥4.5:1, reduced motion support
- [ ] P2 Issues 007-011: Copy improvements (phone prompt, summaries, button labels)
- [ ] P2 Issue 012: Deduction card says "Claim Deduction", info icon is interactive
- [ ] P3 Issue 013: Profile area has hover state and chevron affordance
- [ ] P3 Issues 014-015: Status messages have icons, not color-only
- [ ] P3 Issue 016: No layout shift on "Get Started" click (CLS < 0.1)
- [ ] P3 Issue 017: Message composer has ARIA labels, Enter sends message
- [ ] P3 Issue 018: Scroll performance is 60fps
- [ ] P3 Issue 019: Plaid security text uses sentence case
- [ ] P3 Issue 020: Mobile has bottom bar for Tax Summary access
- [ ] Verification: Manual walkthrough of full flow shows no HIG violations

## Current Status Snapshot

- Branch: N/A (not a git repo)
- Baseline: Dev server running on port 3000, syntax error in ChatPanel.tsx resolved
- Key constraints: React 19, Vite 6, Tailwind CDN (no build step for CSS)
- Tech stack: TypeScript, React, Tailwind CSS (CDN config in index.html)

## Approach

High-level design:
- [x] Reconnaissance complete - identified all target files
- [x] Entry points mapped: App.tsx, ChatPanel.tsx, PlaidSelector.tsx, LiveModelPanel.tsx, Sidebar.tsx, index.html
- [ ] Fix P0 first (duplicate messages) as it's blocking
- [ ] P1 fixes in order: accessibility (002, 004), pacing (003), typography (005)
- [ ] P2 and P3 as time permits

Non-goals:
- Full WCAG 2.1 AA compliance (only addressing flagged issues)
- Mobile-first responsive design overhaul (only Issue 020)
- Performance optimization beyond scroll jank (Issue 018)

## ADR-Lite (Decision Log)

### Decision: Duplicate Message Root Cause
- **Options**: [A] Race condition in chip handler, [B] React StrictMode double-render, [C] Multiple event handlers
- **Chosen**: [A] - The `get_started` handler in App.tsx pushes messages synchronously, but user may click multiple times before state updates
- **Implications**: Add guard to prevent duplicate "Get Started" handling

### Decision: Typing Indicator Implementation
- **Options**: [A] CSS-only animation, [B] React state-based with setTimeout
- **Chosen**: [B] - Use setTimeout delays before adding bot messages to simulate typing
- **Implications**: Delays will be hardcoded for prototype (1-2 seconds)

## Execution Plan

### P0: BLOCKING

[ ] Step 1: Fix duplicate conversation messages (Issue 001)

Target files:
- [App.tsx:469-481](App.tsx#L469-L481)

Action:
- Add guard to prevent handling "get_started" if already transitioning
- Use a ref or state flag to track if "Get Started" was already clicked
- Clear flag when conversation resets

Verification:
- Command: Manual test - click "Get Started" multiple times rapidly
- Expected: Only one user bubble and one bot response appear
- Timeout: < 2 min

Notes:
- Root cause: Line 471 sets phase to 'phone' and lines 472-481 push messages
- If clicked twice before state updates, duplicates occur

---

### P1: HIGH PRIORITY

[ ] Step 2: Improve Plaid modal accessibility (Issue 002)

Target files:
- [PlaidSelector.tsx:30-81](components/PlaidSelector.tsx#L30-L81)

Action:
- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="plaid-modal-title"`
- Add Esc key handler: `useEffect` with keydown listener
- Add "Cancel" button (secondary style) in footer
- Change "BANK-GRADE 256-BIT ENCRYPTION" to "Your data is encrypted and secure"
- Add microcopy above bank list: "Securely connect via Plaid"

Verification:
- Command: Press Esc in modal, Tab through elements
- Expected: Modal closes on Esc, focus cycles within modal
- Timeout: < 5 min

---

[ ] Step 3: Add conversational pacing (Issue 003)

Target files:
- [App.tsx:486-516](App.tsx#L486-L516)

Action:
- After user actions (skip_additional, etc.), insert typing indicator before bot response
- Add 1.5s setTimeout before pushing bot messages
- Add bridging copy: "Got it. Let me check what else I can help with..."

Verification:
- Command: Complete flow from start to "I'm done"
- Expected: Typing indicator appears, transitions feel natural
- Timeout: < 5 min

---

[ ] Step 4: Fix keyboard focus indicators (Issue 004)

Target files:
- [LiveModelPanel.tsx:41-65](components/LiveModelPanel.tsx#L41-L65)
- [index.html](index.html) (add CSS)

Action:
- Add `:focus-visible` styles to FormSection buttons
- Standardize hover state: `hover:bg-white/5`
- Replace "Click to edit" with pencil icon or clearer microcopy

Verification:
- Command: Tab through Tax Summary items
- Expected: 2px blue focus ring on each item, hover state visible
- Timeout: < 5 min

---

[ ] Step 5: Implement consistent typography (Issue 005)

Target files:
- [LiveModelPanel.tsx](components/LiveModelPanel.tsx) - various hardcoded sizes
- [ChatPanel.tsx](components/ChatPanel.tsx) - message text sizes
- [Sidebar.tsx](components/Sidebar.tsx) - section headers

Action:
- Replace `text-[10px]` with `text-hig-caption2` or `text-hig-section-header`
- Replace `text-[11px]` with `text-hig-caption2`
- Replace `text-[13px]` with `text-hig-footnote`
- Change "POTENTIAL DEDUCTION" to "Potential Deduction" (sentence case)
- Change "LIVE CALCULATION" to "Updates automatically"

Verification:
- Command: Audit all text sizes in browser DevTools
- Expected: No text smaller than 11px (hig-caption2)
- Timeout: < 10 min

---

### P2: MEDIUM PRIORITY

[ ] Step 6: Fix color contrast and motion (Issue 006)

Target files:
- [LiveModelPanel.tsx:257-261](components/LiveModelPanel.tsx#L257-L261)
- [index.html](index.html)

Action:
- Verify `#30D158` (hig-green) has 4.5:1 contrast on dark background
- Add `@media (prefers-reduced-motion: reduce)` to progress bar animation
- Ensure "Estimated Refund" label accompanies the green color

Verification:
- Command: WebAIM Contrast Checker, toggle Reduce Motion in macOS
- Expected: Contrast passes, animation disabled with preference
- Timeout: < 5 min

---

[ ] Step 7: Improve copy clarity (Issues 007-011)

Target files:
- [App.tsx:478](App.tsx#L478) - phone prompt copy
- [App.tsx:320-330](App.tsx#L320-L330) - summary copy
- [LiveModelPanel.tsx:152-154](components/LiveModelPanel.tsx#L152-L154) - "POTENTIAL DEDUCTION"
- [LiveModelPanel.tsx:132-133](components/LiveModelPanel.tsx#L132-L133) - "Live Calculation"

Action:
- Phone prompt: "To get started, I'll need your phone number. I'll use it to verify your identity and securely connect your accounts."
- Summary: Use checkmarks, positive affirmation, clear next step
- Labels: Sentence case for "Potential Deduction", "Updates automatically"
- Buttons: "Skip" → "Skip for now"

Verification:
- Command: Read all copy aloud during flow
- Expected: Sounds natural, explains "why" before "what"
- Timeout: < 10 min

---

[ ] Step 8: Improve Deduction card (Issue 012)

Target files:
- [LiveModelPanel.tsx:159-172](components/LiveModelPanel.tsx#L159-L172)

Action:
- Change "Add {opt.amount}" to "Claim Deduction"
- Make info icon clickable with tooltip
- Remove blue dot, use sentence case label
- Apply 16px border-radius

Verification:
- Command: Navigate to Review mode, interact with card
- Expected: Button says "Claim Deduction", info icon has tooltip
- Timeout: < 5 min

---

### P3: LOW PRIORITY

[ ] Step 9: Improve profile area (Issue 013)

Target files:
- [Sidebar.tsx:74-82](components/Sidebar.tsx#L74-L82)

Action:
- Wrap profile in button with `aria-label="User menu"`
- Add hover state: `hover:bg-white/5`
- Add chevron icon on right side
- Make entire row clickable

Verification:
- Command: Hover over profile, click
- Expected: Hover state visible, chevron present
- Timeout: < 3 min

---

[ ] Step 10: Improve accessibility labels (Issues 014-015)

Target files:
- [ChatPanel.tsx](components/ChatPanel.tsx) - status messages
- [LiveModelPanel.tsx](components/LiveModelPanel.tsx) - status indicators

Action:
- Add icons to all status messages: ✓ for success, ⓘ for info, ⚠️ for warning
- Ensure icons have `aria-hidden="true"` (text provides meaning)
- Change "LIVE CALCULATION" → "Updates automatically" (sentence case)
- Add `aria-label` to status elements where color conveys meaning

Verification:
- Command: View with color-blind simulator (Stark)
- Expected: Status meaning clear without color
- Timeout: < 5 min

---

[ ] Step 11: Eliminate layout shift (Issue 016)

Target files:
- [ChatPanel.tsx](components/ChatPanel.tsx) - input container

Action:
- Pre-allocate min-height for input container
- Add fade-in animation (200ms) for phone input
- Use transform instead of height for animations

Verification:
- Command: Click "Get Started" and watch for jump
- Expected: No visible layout shift, smooth transition
- Timeout: < 3 min

---

[ ] Step 12: Improve message composer (Issue 017)

Target files:
- [ChatPanel.tsx:300-322](components/ChatPanel.tsx#L300-L322)

Action:
- Change placeholder: "Message" → "Ask a question or describe your situation..."
- Add `aria-label="Send message"` to send button
- Add `aria-label="Attach document"` to attachment button
- Ensure Enter sends, Shift+Enter creates new line

Verification:
- Command: Type and press Enter, then Shift+Enter
- Expected: Message sends on Enter, new line on Shift+Enter
- Timeout: < 3 min

---

[ ] Step 13: Optimize scroll performance (Issue 018)

Target files:
- [ChatPanel.tsx](components/ChatPanel.tsx) - message bubbles
- [index.html](index.html) - CSS

Action:
- Add `will-change: transform` to message bubbles
- Lighten box-shadows
- Memoize Message component with React.memo

Verification:
- Command: Add 50+ messages, scroll rapidly
- Expected: Smooth 60fps scrolling
- Timeout: < 5 min

---

[ ] Step 14: Simplify Plaid security messaging (Issue 019)

Target files:
- [PlaidSelector.tsx:67-69](components/PlaidSelector.tsx#L67-L69)

Action:
- Change "BANK-GRADE 256-BIT ENCRYPTION" → "Your data is encrypted and secure"
- Use sentence case, add lock icon
- Remove all-caps styling

Verification:
- Command: Open Plaid modal
- Expected: Security text is reassuring, not alarming
- Timeout: < 2 min

---

[ ] Step 15: Mobile Tax Summary access (Issue 020)

Target files:
- [App.tsx](App.tsx) - layout
- [LiveModelPanel.tsx](components/LiveModelPanel.tsx)

Action:
- On mobile (<768px), show persistent bottom bar with refund amount
- Tapping bar opens bottom sheet with Tax Summary
- Sheet dismissible via drag, button, or outside tap
- Respect safe-area-inset-bottom

Verification:
- Command: Resize to 375px, tap refund bar
- Expected: Sheet opens with Tax Summary
- Timeout: < 10 min

---

## Design Tokens

Add these CSS custom properties to index.html:

```css
:root {
  /* Type Scale */
  --font-headline: 28px/34px;
  --font-title-1: 22px/28px;
  --font-body: 17px/22px;
  --font-subhead: 15px/20px;
  --font-caption-1: 13px/18px;
  --font-caption-2: 12px/16px;

  /* Spacing (8px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Elevation */
  --elevation-1: 0 1px 3px rgba(0,0,0,0.12);
  --elevation-2: 0 2px 8px rgba(0,0,0,0.15);
  --elevation-3: 0 4px 16px rgba(0,0,0,0.18);
}
```

## Definition of Done Checklist

Before marking any step complete:

**Functional**
- [ ] Feature works as described
- [ ] No regressions in existing flow
- [ ] Works in Chrome, Safari, Firefox

**Accessibility**
- [ ] Keyboard navigation works
- [ ] Focus order is logical
- [ ] Screen reader tested (VoiceOver)
- [ ] Color contrast ≥4.5:1

**Visual**
- [ ] Dark mode validated
- [ ] Typography uses HIG scale
- [ ] Spacing uses 8px grid

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Tailwind CDN limits custom CSS | Add inline styles or extend config in index.html |
| Copy changes may need legal review | Mark as "pending review" if tax-specific |
| Focus trap in modal may break keyboard nav | Test thoroughly with Tab key |

## Progress Log

[2026-01-29 22:50] claude | Phase 0 | ✅ Reconnaissance complete
[2026-01-29 22:50] claude | Phase 1 | ✅ Plan created
[2026-01-29 22:55] claude | Phase 1 | ✅ Plan expanded with P3 steps (10-15), design tokens, DoD checklist
[2026-01-29 22:55] claude | Phase 1 | ✅ TodoWrite synced with 15 execution steps

## Discovered Work

None yet.
