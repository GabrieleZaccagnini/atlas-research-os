# Atlas cloud research setup

Status: application integration prepared; hosted project, credentials, migration and live access-policy checks must be completed before claiming cloud storage is active.

## Provisioning
1. Create or connect your own Supabase account. Create an Atlas project in an appropriate EU region on the free plan when available. Do not authorize a paid plan without the owner's approval.
2. Apply `supabase/migrations/202609270001_private_research.sql` to the new project. The owner-scoped table stores complete version-2 research documents; all nested research remains intact. Shared provider caches are separate from private research.
3. Put the project URL and **publishable** key in `.env.local` using the names in `.env.example`. No service-role key or database password belongs in the app. Rebuild/restart after changing these public build-time values.
4. Enable email authentication. Set the Site URL to the actual app origin and add exact `/account` redirect URLs for each approved local/production origin. Use the default magic-link email template. This client-only auth flow uses Supabase's session detection; private data is protected by database RLS, not route hiding. Supabase's email delivery restrictions may require custom SMTP or an authorized team email before a hosted sign-in test succeeds.
5. Open `/account`, send a sign-in link and complete it yourself. Account creation is enabled by this app's sign-in request; each account is isolated by RLS. For a strictly single-owner installation, invite the owner and disable new signups in Supabase after initial setup.
6. Export the old browser backup, then select **Copy browser research to this account** on the original browser/origin. Import is atomic and insert-only. Duplicate IDs keep cloud records. Browser copies are never removed. Repeating an uncertain transfer is safe. JSON backups can also be imported from Projects.

## Required live verification
- Sign in, create and save a project, reload, sign out and sign back in; confirm persistence.
- Use a second test account: it must not read or update the first account's records, including through direct table requests and RPCs.
- Save an older revision from a second browser; confirm a conflict rather than overwriting newer work.
- Import a legacy backup twice and confirm the second transfer adds zero records and the original browser copy is unchanged.
- Lose network connectivity while editing; confirm no false saved status and that the draft is retained.
- Confirm signup email delivery and exact redirect settings on the chosen app origin.

## Behavior and limits
Without cloud settings Atlas retains browser mode. Partial/invalid configuration displays an error rather than silently switching storage. Configured signed-out users see sign-in instead of projects. Auth tokens persist in the browser; private cloud documents are held in memory and the provider is remounted on account changes/sign-out. Existing local research remains on the same browser intentionally for recovery. Do not treat sign-out as deleting that old browser backup.

Reads page in batches of 500 with a 2,000-project limit. Saves carry an optimistic revision. Imports use one database transaction, skip existing IDs, and preserve unknown/zero distinctions through existing validation. Client validation checks the complete schema; database constraints additionally enforce owner, ID, required fields and per-document size. The database does not duplicate every application-level schema constraint. There is no automatic merge, realtime subscription, offline cloud-save queue, or automatic cloud-to-browser fallback. Use Account & Storage to reload across devices and retain exported backups.

Tests mock the Supabase transport for pagination, input validation, conflicts and response validation. They do not replace the live RLS and email checks above.

Sources: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/database/postgres/row-level-security
