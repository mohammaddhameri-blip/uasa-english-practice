# Classbell

Standalone classroom reminder PWA for teachers and families.

Live app: https://mohammaddhameri-blip.github.io/uasa-english-practice/class-reminders/

Teachers sign in with a personal teacher code and post homework, meetings, cleaning, fees, exams and other updates to assigned classes. Parents choose New parent and join using an existing pupil code. Each parent receives a personal access code and can link several children. Two parents can independently follow the same child.

The owner can create and disable teacher access. Smartboard provides a class noticeboard and full-screen display. Dashboard cards show unread updates, current homework, deadlines today and exam countdowns. Seen acknowledgements count accounts, not pupils or homework completion. Archive hides an update and stops its pending reminders.

Enable notifications under My account on each personal device. On iPhone/iPad, first add the app to the Home Screen, open it from that icon, then enable notifications. Internet is required for class data; only the public shell is cached offline. Device notification delivery depends on browser permission, network and operating-system behavior. Native OS widgets are not included in this version.

## Backend

`backend/index.ts` is deployed as the Supabase Edge Function `class-reminders`. It authenticates hashed opaque session tokens itself; JWT gateway verification is therefore off. Supabase provides its URL and service role key privately. All `cr_*` tables have RLS enabled with no browser-access grants. Pupil lookup uses the existing students table.

Tables: cr_accounts, cr_memberships, cr_children, cr_sessions, cr_posts, cr_seen, cr_subscriptions, cr_jobs, cr_deliveries, cr_config, cr_limits. Service-only functions: cr_rate_limit, cr_claim_jobs, cr_create_post. Posting and reminder job creation are transactional.

Web Push uses VAPID keys stored privately in cr_config. A pg_cron job named classbell-notifications runs every minute, reading its dispatcher secret from Supabase Vault. Database job leases and per-subscription delivery records limit duplicates. A crash after sending but before recording may still duplicate a notification; notification tags collapse duplicates. Revoked subscriptions are removed; transient failures retry after five minutes for up to seven days. Notifications show class/category only; details require sign-in.

Teacher sessions last one day in session storage; parent sessions last 30 days. Teacher access revocation also blocks existing sessions. Access codes and tokens are hashed at rest. Generated codes contain 80 bits of randomness. Codes must be kept private. Parent code recovery and class reassignment are not yet self-service. The feed shows the latest 200 active posts.

## Verification

JavaScript syntax, HTML element references and manifest checks passed. Live checks confirmed owner sign-in, assigned-class feed access, rejection of unauthenticated feed access, database access restrictions and successful scheduled dispatcher responses. A proposed live Testers-class integration test was blocked by automatic approval review before creating any records or notifications.

Parent registration, posting, acknowledgement and revocation flows have been reviewed in code but still need a controlled acceptance test. Real-device push delivery and visual checks on mobile/smartboard remain pending.

## Hosting

Static HTML/CSS/JavaScript; no build step. Publish this directory through GitHub Pages. For a different host, update the allowed origin and app URL in the Edge Function and API URL in app.js. Never commit VAPID private keys, service-role keys, dispatcher secrets or user access codes.
