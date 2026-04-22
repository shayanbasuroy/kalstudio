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

<!-- BEGIN:session-2026-04-22-features -->
# Session: April 22, 2026 — Project Comments, Global Search, Notifications

## New features added

### 1. Comments / Project Notes (`src/app/dashboard/owner/projects/[id]/page.tsx`)
- Full-width "Project Notes" card below the 3-column grid in workspace page
- Comment list with user avatar, name, timestamp, content — styled with `bg-brand-offwhite` cards
- Empty state with dashed border + italic "No notes yet" message
- Input + Send button at bottom (Enter key also submits)
- `handleSendComment` with `try/catch` — inserts into `comments` table, refreshes list
- Creates in-app notification for other team members (`sales_id` / `developer_id`)
- Sends email via `/api/notify/assignment` endpoint to the other party
- Loading spinner while sending

### 2. Global Search (`src/app/dashboard/layout.tsx`)
- Search input below sidebar header, above navigation — styled for dark sidebar (`bg-white/5`, `text-white/60`, `placeholder:text-white/30`)
- Debounced (300ms) Supabase search across `gigs` (by client name) and `clients` (by name)
- Dropdown results with type icon (Briefcase for project, Users for client), label, subtitle, and link
- Click outside closes dropdown; X button clears query
- Search icon inside input, Loader2 spinner while searching

### 3. Notifications Bell (`src/app/dashboard/layout.tsx`)
- Bell icon with unread count badge in sidebar header area
- Fetches notifications from `notifications` table on mount + polls every 30s
- Dropdown with notification list — each shows type icon (comment/status), message, timestamp
- Unread notifications have bold text + gold dot indicator
- Click marks as read and navigates to linked page
- Empty state: "No notifications" with Bell icon
- Click outside closes dropdown

## SQL Migration
- `supabase/migrations/20260422_add_comments_and_notifications.sql`
  - `comments` table (id, gig_id, user_id, content, created_at) with indexes and RLS
  - `notifications` table (id, user_id, type, message, link, is_read, created_at) with indexes and RLS
  - RLS uses `is_owner()` helper for owner access, and direct subqueries for staff assigned to gigs

## Design patterns followed
- Brand colors: `bg-brand-offwhite` for comment cards, `bg-white` for main cards
- Sidebar search: dark theme (`bg-white/5`, `border-white/10`, `text-white/80`)
- Notifications dropdown: white rounded shadow-2xl with border
- Modals: `bg-brand-offwhite p-10 shadow-2xl` pattern
- Buttons: always `text-[10px] font-bold uppercase tracking-widest`

## Email notifications
- Resend already configured (`RESEND_API_KEY` in `.env.local`)
- Comment notifications use existing `/api/notify/assignment` endpoint
- Status change notifications should use same pattern via `/api/notify/assignment` or dedicated endpoint
<!-- END:session-2026-04-22-features -->
