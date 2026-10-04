# Visual regression

The immutable original is the Git tag `checkpoint/pre-react-node-mysql`; the migrated code is never used to generate its own baseline. On 2026-10-04 the original tag was served from an isolated Git worktree beside the migration and captured through the same Chromium/Playwright browser session, with the same host, fonts, data, viewport and animation settle time.

`validation-2026-10-04.json` records the PNG-byte digests and exact comparison result. Home, Services and Fleet matched exactly in all five required viewports. Booking, Dashboard, Corporate and Usage Matrix matched exactly at mobile and desktop review sizes. Login keeps the approved composition but intentionally differs because the previously inactive prototype form now displays real local demo credentials and truthful authentication copy; both sizes were reviewed visually.

Do not replace the original tag, accept a post-migration capture as the original, mask regions, or change comparison conditions without a documented review.
