# Lead Engine OS - Design System Guide

## Philosophy

**Calm > Exciting** | **Clear > Clever** | **Boring > Flashy**

This is a B2B operator tool. Users are busy business owners who want:
- To understand status at a glance
- To feel in control of their subscription
- To trust the system is working

Never use: countdown timers, fake urgency, exclamation points, emojis, or "hype" language.

---

## Color System

### Primary Palette
| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--primary` | oklch(0.45 0.15 250) | #2563eb | Primary actions, brand |
| `--primary-foreground` | oklch(0.98 0 0) | #ffffff | Text on primary |
| `--accent` | oklch(0.65 0.20 180) | #14b8a6 | Success, positive |
| `--destructive` | oklch(0.55 0.22 25) | #dc2626 | Errors, danger |

### Neutral Palette
| Token | OKLCH | Usage |
|-------|-------|-------|
| `--background` | oklch(0.99 0 0) | Page background |
| `--foreground` | oklch(0.15 0.02 250) | Primary text |
| `--muted` | oklch(0.95 0.01 250) | Subtle backgrounds |
| `--muted-foreground` | oklch(0.50 0.02 250) | Secondary text |
| `--border` | oklch(0.90 0.01 250) | Borders, dividers |

### Status Colors (ADD THESE)
```css
:root {
  /* Status-specific colors */
  --status-gray: oklch(0.60 0.02 250);      /* requested, paused */
  --status-blue: oklch(0.55 0.18 250);      /* queued, info */
  --status-amber: oklch(0.75 0.15 85);      /* needs_info, warning */
  --status-indigo: oklch(0.50 0.20 270);    /* running, processing */
  --status-green: oklch(0.65 0.18 160);     /* done, success */
  --status-red: oklch(0.55 0.22 25);        /* failed, error */
}
```

---

## Typography

### Font Stack
```css
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

### Heading Scale

**Marketing Pages (large screens)**
| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 3rem (48px) | 700 | 1.1 |
| H2 | 2.25rem (36px) | 600 | 1.2 |
| H3 | 1.5rem (24px) | 600 | 1.3 |

**Dashboard/Portal (functional)**
| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 1.875rem (30px) | 600 | 1.2 |
| H2 | 1.5rem (24px) | 600 | 1.3 |
| H3 | 1.25rem (20px) | 600 | 1.4 |

### Body Text
| Variant | Size | Line Height | Usage |
|---------|------|-------------|-------|
| body-lg | 1.125rem (18px) | 1.75 | Marketing prose |
| body-md | 1rem (16px) | 1.75 | Default body |
| body-sm | 0.875rem (14px) | 1.5 | Dense UI, tables |
| caption | 0.75rem (12px) | 1.4 | Labels, hints |

---

## Spacing

Use 4px base unit. Standard scale:

| Token | Size | Common Usage |
|-------|------|--------------|
| space-1 | 4px | Inline icon gap |
| space-2 | 8px | Tight padding |
| space-3 | 12px | Form field gap |
| space-4 | 16px | Card padding (mobile) |
| space-6 | 24px | Card padding (desktop) |
| space-8 | 32px | Section gap |
| space-12 | 48px | Large section gap |
| space-16 | 64px | Hero spacing |

---

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| radius-sm | 4px | Badges, small inputs |
| radius-md | 6px | Buttons, inputs |
| radius-lg | 8px | Cards, dialogs |
| radius-xl | 12px | Large cards, modals |
| radius-full | 9999px | Pills, avatars |

---

## Component Specifications

### Buttons

**Primary (gradient)**
```css
background: linear-gradient(135deg, oklch(0.45 0.15 250), oklch(0.55 0.18 260));
color: white;
padding: 0.75rem 1.5rem;
border-radius: var(--radius-md);
font-weight: 500;
```

**Secondary (outline)**
```css
background: transparent;
border: 1px solid var(--border);
color: var(--foreground);
```

**Destructive**
```css
background: var(--destructive);
color: white;
```

**States:**
- Hover: Slight brightness increase
- Active: Scale 0.98
- Disabled: Opacity 0.5, cursor not-allowed
- Loading: Show spinner, disable interaction

### Cards

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.card-interactive:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
```

### Status Badges

| Status | Background | Text | Icon (optional) |
|--------|------------|------|-----------------|
| requested | gray-100 | gray-700 | Clock |
| needs_info | amber-100 | amber-700 | AlertCircle |
| queued | blue-100 | blue-700 | Clock |
| running | indigo-100 | indigo-700 | Loader (animated) |
| done | green-100 | green-700 | CheckCircle |
| failed | red-100 | red-700 | XCircle |
| paused | gray-100 | gray-500 | Pause |

### Progress Bar (for quotas)

```css
.progress-container {
  height: 8px;
  background: var(--muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

/* Color by percentage */
.progress-bar[data-level="low"] { background: var(--status-green); }    /* 0-50% */
.progress-bar[data-level="medium"] { background: var(--status-amber); } /* 50-80% */
.progress-bar[data-level="high"] { background: var(--status-red); }     /* 80-100% */
```

### Empty States

```tsx
<div className="empty-state">
  <div className="empty-state-icon">
    <Icon className="w-12 h-12 text-muted-foreground/50" />
  </div>
  <h3 className="empty-state-title">No active requests</h3>
  <p className="empty-state-description">
    Submit your first deliverable request to put your subscription to work.
  </p>
  <Button>Create Request</Button>
</div>
```

---

## Data Tables (Admin)

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.data-table tr:hover {
  background: var(--muted);
}
```

---

## Form Fields

### Input
```css
.input {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 2px var(--ring)/20%;
}

.input[aria-invalid="true"] {
  border-color: var(--destructive);
}
```

### Labels
```css
.label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-2);
}

.label-required::after {
  content: " *";
  color: var(--destructive);
}
```

### Helper Text
```css
.helper-text {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin-top: var(--space-1);
}

.error-text {
  font-size: 0.75rem;
  color: var(--destructive);
  margin-top: var(--space-1);
}
```

---

## Animation & Transitions

### Standard Timing
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Common Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Container
- Mobile: 100% width, 16px padding
- Tablet: 100% width, 24px padding
- Desktop: max-width 1280px, 32px padding, centered

---

## Accessibility Requirements

1. **Color contrast**: All text must meet WCAG AA (4.5:1 for normal, 3:1 for large)
2. **Focus states**: All interactive elements must have visible focus rings
3. **Touch targets**: Minimum 44x44px for mobile
4. **Screen readers**: Use semantic HTML, ARIA labels where needed
5. **Motion**: Respect `prefers-reduced-motion`

---

## Do / Don't

### DO
- Use semantic status colors consistently
- Show progress with numbers (3 of 5, not just 3)
- Provide context in empty states
- Use calm, direct language
- Show loading states for async operations

### DON'T
- Use countdown timers or fake urgency
- Show unverified statistics
- Use exclamation points in UI copy
- Add emojis to professional interfaces
- Use generic "Something went wrong" errors
- Hide cancellation options

---

## File Naming Conventions

Components: `PascalCase.tsx` (e.g., `StatusBadge.tsx`)
Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
Styles: `kebab-case.css` (e.g., `button-variants.css`)
Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`)

---

**Version:** 1.0
**Last Updated:** December 15, 2025
