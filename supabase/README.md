## Supabase local context

Project ref: `advbuqejlceiwaxxmuld`
Synced on: `2026-03-11`

Available locally:
- `config.toml` linked to the current remote project
- `migrations/` rebuilt from the remote migration history with `supabase migration fetch --linked`
- `types.ts` generated from the current remote `public` schema with `supabase gen types --linked --lang typescript --schema public`
- `.temp/` metadata written by the Supabase CLI for the linked project

Not materialized in this workspace:
- A full schema dump from `supabase db pull` or `supabase db dump`

Reason:
- The current machine does not have Docker Desktop available, and those commands require Docker to inspect the remote database safely.

Refresh commands:
- `.\node_modules\.bin\supabase.cmd migration fetch --linked`
- `.\node_modules\.bin\supabase.cmd gen types --linked --lang typescript --schema public > supabase\types.ts`
