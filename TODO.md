# TODO - Question Paper Tracker

## Remaining Items (Need Server/Schema Changes)

- [ ] **Role-based access control** — Add role checks in UI and RLS. Currently all users have equal access (admin can delete, reset, import). Non-admin teachers should have restricted permissions.
- [ ] **Rate-limit school creation** — Add Supabase Edge Function or trigger to limit new school creation (currently anyone can create unlimited junk schools).
- [ ] **Signup atomicity** — Use a Supabase database trigger (`on_auth_user_created`) to auto-create `public.users` row on auth signup, preventing orphaned auth users if profile insert fails.
- [ ] **SECURITY DEFINER on user_school_id()** — Review and consider removing `SECURITY DEFINER` from the RLS helper function. Low risk in current form but maintenance concern.
- [ ] **Server-side validation** — Add API routes or Edge Functions for critical operations (delete tracker, reset all, import) with business logic validation beyond RLS.
- [ ] **Import file size limit** — Add client-side validation to reject JSON files over a reasonable size (e.g., 5MB) to prevent DoS via large uploads.
- [ ] **Custom confirmation dialogs** — Replace `window.confirm()` calls (7 instances in useTracker.ts) with proper modal UI components.
- [ ] **Error boundary** — Add React Error Boundary to dashboard to prevent full-page crash on rendering errors.
- [ ] **CSP headers** — Add Content-Security-Policy header in next.config.mjs for XSS protection.
