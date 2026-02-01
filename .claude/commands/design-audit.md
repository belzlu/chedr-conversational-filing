# Design Audit Command

Audit the specified component or screen against the Chedr design system.

$file:agent.md

## Target: $ARGUMENTS

If no target specified, audit the most recently modified component files.

## Audit Checklist

### Visual System
- [ ] Typography follows hierarchy (title, section header, body, caption)
- [ ] Spacing uses tokenized scale consistently
- [ ] Colors are Swift Orange (accent) + Cloud Divine (neutrals) only
- [ ] Liquid glass used structurally (panels, overlays), not decoratively

### Layout
- [ ] No overflow or clipped text at any breakpoint
- [ ] Grid alignment is consistent
- [ ] Vertical rhythm feels deliberate

### States
- [ ] All states defined (empty, loading, success, error, needs review)
- [ ] State cues are clear without raw confidence scores

### Accessibility
- [ ] Contrast passes WCAG AA
- [ ] Focus states visible on all interactive elements
- [ ] Tap targets meet minimum size (44x44)
- [ ] Reduced motion respected

### Mobile + Dark Mode
- [ ] Mobile layout is conversation-first, not cramped dashboard
- [ ] Dark mode uses layered neutrals, not pure black
- [ ] Both themes tested, not just light mode

### Localization
- [ ] Spanish strings do not break layout
- [ ] No truncation on longer translations

## Output

Produce a ranked list of issues (max 10) with:
1. Severity (critical / major / minor)
2. Location (file:line or component name)
3. Issue description
4. Recommended fix
