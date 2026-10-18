# Year 2 UASA Part 7 Drills

Standalone writing practice for 2 Terbilang. The original Tile 8–10 sentence banks come from mohammaddhameri-blip/year-2-unit-9, verified 15 October 2026. All 21 source sentences are retained.

- Drill 1: three subsets × seven picture unjumbles, followed by editable capital/full-stop checks.
- Drill 2: same subsets; questions 1–3 unjumble; questions 4–5 red and green cues; questions 6–7 red cues.
- Drill 3: three pictures, one per source tile, three red cues each. Sequencing words and conjunctions are encouraged, not mandatory.
- Existing student-code authentication; 2 TERBILANG and teacher tester accounts only.
- Completion records in a separate RLS-protected Supabase table. The server authenticates codes before all private reads/writes. No pupil roster, codes or service keys in client assets.
- Public leaderboard uses given names, excludes testers, and counts each completed question once (200 points; maximum 9,000).
- Open writing uses server-side AI marking; original accepted answers use a deterministic fast path. No points are awarded when marking fails.
- Typed drafts stay on the device; successful completions persist across devices.

Backend source: backend/index.ts and backend/data.json. Deploy to Supabase qekcgsfeomjckctiubgm, function y2-tile-writing. Uses existing environment SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY. Custom pupil-code authentication permits verify_jwt=false. CORS is restricted to the Site origin.

Original image sheets are retained. extra-scenes.webp adds four picnic and four photography variations, generated with the built-in image tool; brief: equal 2×4 storybook panels showing ice cream in garden, pizzas under tree, burgers on bench, juice on bench, child photographing zebra, lion, tiger, hippo.

Validation: JavaScript syntax, all word banks match the original answers, live login, invalid-code rejection, order/punctuation separation, required capitals/full stops, idempotent save, flexible writing, missing conjunction accepted, bare cue list rejected, cross-session progress and public leaderboard tester exclusion. Browser visual QA unavailable in the current environment.
