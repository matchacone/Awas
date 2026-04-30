# rules.md (frontend/brain)
> Frontend coding conventions — subset of project-level rules focused on React/Next.js UI code.

## React / Next.js
- Use TypeScript for all files.
- Prefer small, focused components. Split if >150 lines.
- Use functional components and named exports for components.
- Use server components where appropriate; mark client components with `"use client"`.
- Keep data fetching in server components when possible; client components should call hooks that encapsulate client-side behavior.

## Styling
- Prefer utility-first styles (Tailwind) or CSS Modules scoped per component.
- Keep global styles minimal; prefer component-level styles.

## State Management
- Use React context or Zustand for cross-cutting state; avoid prop drilling.
- Local component state with useState/useReducer.

## Accessibility
- Use semantic HTML and ARIA attributes where necessary.
- Ensure keyboard navigation and focus management on interactive components.

## Testing
- Write unit tests for hooks and critical components (jest + testing-library).
- Add integration tests for core flows where feasible.

## What to Never Do (frontend)
- Never ship without basic accessibility checks.
- Never use `any` in exported types.

(End of file)
