---
name: ui-design
description: Build UI in this Next.js app using shadcn/ui components and Figma design context. Use when implementing screens, components, design tokens, or translating Figma frames to code.
---

# UI Design (Sdot)

## Stack

- Next.js App Router (`src/app/`)
- Tailwind CSS v4 (`src/app/globals.css`)
- shadcn/ui (`radix-nova` style, Radix primitives)
- Icons: `lucide-react`
- Utilities: `cn()` from `@/lib/utils`

## Component workflow

1. Prefer existing shadcn components in `src/components/ui/` before creating new ones.
2. Add missing primitives with: `npx shadcn@latest add <component> -y`
3. Compose pages from tokens: `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`.

## Figma → code workflow

1. Load Figma skills before MCP calls (`figma-use`, `figma-code-connect`, `figma-generate-design` as needed).
2. Use `get_design_context` for the target frame, then adapt output to this codebase.
3. Reuse `@/components/ui/*` instead of generating raw HTML elements.
4. Map design tokens to CSS variables in `globals.css`; avoid hardcoded hex colors.

## Design defaults

- Style: `radix-nova`, base color `neutral`
- Fonts: Geist Sans (UI), Geist Mono (code/metrics)
- Density: comfortable (`gap-6`, `p-6`, `text-sm`)
- Reach for: `Card`, `Button`, `Input`, `Label`, `Badge`, `Separator`, `Tooltip`

## Anti-patterns

- Raw `<button>`, `<input>`, or ad-hoc bordered divs when shadcn primitives exist
- `var(--font-sans)` circular references in `@theme inline` — use literal Geist font names
- Implementing destructive actions with `Dialog` instead of `AlertDialog`
