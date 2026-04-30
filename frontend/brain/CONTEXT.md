# CONTEXT.md (frontend/brain)
> Frontend-specific context for the React/Next.js part of the project.

## What this frontend is
A React + Next.js frontend for the Awas water outages app. Focused on the UI, client-side data fetching, and integration with Supabase for auth and realtime updates.

## Stack (frontend)
- React 18+
- Next.js App Router
- TypeScript
- Tailwind CSS (optional)
- supabase-js for client integration

## Folder Structure (frontend)
```
frontend/
├── app/          # Next.js app router
├── components/   # Reusable components
├── hooks/        # Custom hooks (data fetching, auth)
├── styles/       # Global styles, tailwind config
└── lib/          # client utilities
```

## Current Status
- [ ] Implement outage list and details
- [ ] Implement auth flow (Supabase)
- [ ] Responsive layout and accessibility audits

## Active Priorities
1. Implement core pages: index, outages/[id], auth flows
2. Wire Supabase auth and realtime subscription for outages
3. Add tests for hooks and critical components

## Known Issues / Blockers
- Design assets incomplete (icons, logos)
- Backend realtime API needs stabilization

## Recent Decisions
- Use App Router and server components for data-heavy pages; add `"use client"` only where needed.

(End of file)
