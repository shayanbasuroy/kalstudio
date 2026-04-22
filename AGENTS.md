<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-2026-04-22 -->
# Session: April 22, 2026 — Owner/Employee Dashboard Fixes

## Files modified

### `src/app/dashboard/owner/projects/page.tsx`
- Status action buttons (Mark Complete, In Progress, Reopen) were non-functional; added `handleStatusUpdate` with `try/catch`
- Edit/Delete modals were non-functional; added `handleEditGig` and `handleDeleteGig` with `try/catch`
- Error display: errors now show inline next to status buttons (red text + XCircle icon), not hidden at top of page
- Loading state: shows "Updating..." with spinner during status mutations
- Design alignment: status buttons use `text-[9px] font-bold uppercase tracking-widest px-3 py-1` matching revenue page pattern
- "In Progress" → gold theme, "Mark Complete" → sage green, "Reopen" → orange
- Completed projects show "Reopen" button (sets to `in_progress`)
- Lead/confirmed show both "In Progress" and "Mark Complete"
- Modals use `bg-brand-offwhite p-10 shadow-2xl` matching materials page

### `src/app/dashboard/owner/projects/[id]/page.tsx`
- Action buttons (Record Payment, Update Status, Archive Project) were static with no `onClick` — added three modals:
  - **Record Payment**: inserts into `payments` table (`gig_id`, `amount_received`, `received_at`), refreshes gig to show new payment in history
  - **Update Status**: dropdown to change gig status (lead/confirmed/in_progress/completed/cancelled), button disabled when status unchanged
  - **Archive Project**: confirmation modal, sets status to `cancelled`
- All handlers use `try/catch` with inline error messages
- Loading spinners on action buttons during save

### `src/app/dashboard/employee/projects/page.tsx`
- "Project Workspace" button had no `onClick` — now navigates to `/dashboard/owner/projects/${gig.id}`
- Fixed broken data access: Supabase FK relationships return single objects, not arrays
  - `p.gigs[0]` → `p.gigs`
  - `p.gigs.clients[0]?.name` → `p.gigs.clients?.name`
  - `p.gigs.sales[0]?.id` → `p.gigs.sales?.id`
  - Updated TypeScript interfaces accordingly (`Client[]` → `Client`, `Gig[]` → `Gig`)

### `src/app/dashboard/employee/clients/page.tsx`
- Added `try/catch` to `handleAddClient` with `actionError` state (was silently failing)
- Error displays inline in the Add Lead modal

### `src/app/dashboard/employee/settings/page.tsx`
- Added `try/catch` to `handleSave` with `actionError` state (was silently failing)
- Error displays above the save button

### `src/app/dashboard/layout.tsx`
- Fixed sidebar active state: changed from exact match (`pathname === link.href`) to also match sub-routes (`pathname.startsWith(link.href + '/')`), excluding dashboard root links

## SQL / Schema notes
- No schema changes needed for any of the above
- `payments` table already has `gig_id`, `amount_received`, `received_at`
- `gig_status` enum already includes `cancelled`
- `payment_details.user_id` has `UNIQUE` constraint, so `upsert({ onConflict: 'user_id' })` works
- RLS caveat: if `fix_rls_recursion_v2.sql` hasn't been run, RLS policies may silently block mutations on `gigs` table
<!-- END:session-2026-04-22 -->
