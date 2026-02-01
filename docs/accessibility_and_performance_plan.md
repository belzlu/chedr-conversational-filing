# Accessibility and Performance Refactor Plan

This document outlines the specific steps ("TODOs") required to improve accessibility (a11y) and performance across the Chedr application, focusing on panels and key pages.

## Global / Shared Tasks

### Accessibility (A11y)
- [ ] **Audit Colors:** Verify all text contrast ratios meet WCAG AA standards (4.5:1 for normal text).
- [ ] **Focus Management:** Ensure a visible focus ring is present for all interactive elements (buttons, inputs, links) when navigated via keyboard.
- [ ] **Typography:** Ensure `rem` units are used for all font sizes to respect user scaling preferences.

### Performance (Perf)
- [ ] **Font Loading:** Optimize font loading strategies (e.g., `font-display: swap`).
- [ ] **Performance Budget:** Define and document performance budgets for bundle sizes (e.g., < 150kb initial load).
- [ ] **Critical CSS:** Identify and inline critical CSS for above-the-fold content (if applicable with current build tool).

---

## Component-Specific TODOs

### 1. `App.tsx` (Main Layout)
#### Accessibility
- [x] **Landmarks:** Ensure `<nav>`, `<main>`, and `<aside>` are used correctly (already done in previous refactor, but verify).
- [x] **Skip Link:** Add a "Skip to main content" link at the top of the DOM.
- [ ] **Modal Management:** Implement focus trapping for overlays like `Drawer` or `MobileForm`.

#### Performance
- [ ] **Lazy Loading:** Implement `React.lazy` / `Suspense` for heavy components like `DocumentVault` or `SettingsView` if they are not immediately visible.

### 2. `components/Sidebar.tsx`
#### Accessibility
- [ ] **ARIA:** Add `aria-current="page"` to the active navigation item.
- [ ] **Keyboard Nav:** Ensure the "Rail" toggle button has a clear focus state and label.

### 3. `components/ChatPanel.tsx`
#### Accessibility
- [ ] **Landmarks:** Ensure the chat area has `role="log"` or `aria-live="polite"` for new messages.
- [ ] **Input Label:** Ensure the chat input has an associated `<label>` (visually hidden if needed) or `aria-label`.
- [ ] **Focus Order:** Ensure the "Send" button is reachable and in logical order.

#### Performance
- [ ] **List Virtualization:** If message history can get very long, consider implementing list virtualization (e.g., `react-window`).

### 4. `components/LiveModelPanel.tsx`
#### Accessibility
- [x] **ARIA Region:** Add `role="region"` and `aria-labelledby` (pointing to the header title).
- [x] **Headings:** Ensure section headers use correct heading levels (`h2`, `h3`) respecting the document hierarchy.
- [x] **Keyboard Nav:** Ensure "Form Sections" (which act as buttons) have `tabIndex="0"` (or are `<button>` tags) and handle `Enter`/`Space` keys.

### 5. `components/vault/DocumentVault.tsx` & `DocumentTable.tsx`
#### Accessibility
- [ ] **Table Semantics:** Ensure the document list uses semantic list (`<ul>`/`<li>`) or grid (`role="grid"`) structures if meant to be navigated as such.
- [ ] **Search Input:** Add `aria-label="Search documents"` to the search input.
- [ ] **Filter Chips:** Use `role="radio"` group or `aria-pressed` for filter chips to indicate state.
- [ ] **Empty State:** Ensure the empty state message has `role="status"`.

#### Performance
- [ ] **Image Optimization:** Add `loading="lazy"` to document thumbnails in `DocumentCard`.
- [ ] **Debounce:** Debounce the search input handler to avoid excessive re-renders.

### 6. `components/vault/DocumentDetail.tsx`
#### Accessibility
- [x] **Dialog Role:** Ensure the detail view (slide-over) has `role="dialog"` and `aria-modal="true"`.
- [x] **Focus Trap:** Trap focus within the detail panel when it is open.
- [x] **Close Button:** Ensure the close button is the first or last focusable element and is clearly labeled.
- [ ] **Form Validation:** Use schema validation (e.g., Zod) for editable fields and provide ARIA error messages (`aria-invalid`, `aria-errormessage`).

#### Performance
- [x] **Image Optimization:** Use `loading="lazy"` for the preview image.
- [ ] **Deferred Loading:** Defer loading the `LineageCanvas` until the "Advanced" toggle is expanded.

### 7. `components/SettingsView.tsx`
#### Accessibility
- [x] **Toggle Buttons:** Use `role="switch"` and `aria-checked` for the toggle buttons (Notifications, Test Mode).
- [x] **Headings:** Ensure "Account", "Preferences", etc., use semantic `<h2>` tags.

### 8. `components/Drawer.tsx`
#### Accessibility
- [ ] **Dialog Semantics:** Ensure the drawer has `role="dialog"` and `aria-modal="true"`.
- [ ] **Focus Management:** Save the previously focused element before opening and restore it upon closing.

---

## Completed Actions (Session 1)

1.  **`App.tsx`:** Added a "Skip to main content" link hidden visually but accessible via keyboard. Verified semantic landmarks (`nav`, `main`).
2.  **`LiveModelPanel.tsx`:** Implemented `role="region"` with `aria-labelledby`. Updated typography to use semantic heading tags (`h2`, `h3`). Verified interactive elements are keyboard accessible.
3.  **`DocumentDetail.tsx`:** Added `role="dialog"`, `aria-modal="true"`, and basic focus management (focuses panel on mount). Implemented `loading="lazy"` for the document preview image.
4.  **`SettingsView.tsx`:** Updated section headings to semantic `h2`. Implemented ARIA-compliant toggle switches (`role="switch"`, `aria-checked`) for "Push Notifications" and "Test Mode".
