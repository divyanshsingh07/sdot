# Internship Intake Page Overrides

> **PROJECT:** Sdot
> **Page Type:** Application dossier

> Rules in this file **override** MASTER.md for the internship intake page.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 760px
- **Layout:** Single-column dossier, not a marketplace grid
- **Structure:** Stamp header → section tabs → 01 Profile / 02 Assessment / 03 Video → submit

### Typography Overrides

- **Sans:** Montserrat
- **Mono:** IBM Plex Mono (eyebrows, labels, refs, section numbers)
- Headlines: extra-bold, tight tracking
- Labels: 11px mono, uppercase, letter-spacing

### Color Overrides

Use the SDOT dossier palette (not MASTER education navy/green):

- Navy `#2D3480` / deep `#1E2359`
- Amber `#E8822A` (highlight)
- Burnt `#C94E1E` (CTA / required)
- Paper `#F5F0E8` / dim `#EAE3D6`
- Ink `#1E1B16` / soft `#6B6458`

### Component Overrides

- Multi-select interests/tools as chips (ToggleGroup multiple)
- Video briefing on a navy panel
- Success state: confirmation card with REF id, not a toast-only flow
- Show loading then success/error after submit
- Labels always visible — never placeholder-only

### Accessibility

- Skip link to form
- Visible focus rings
- Required fields marked in copy and `aria-required`
- Word count for the assessment textarea
- `prefers-reduced-motion` respected
