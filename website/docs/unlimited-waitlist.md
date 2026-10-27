# Azalea Audio Unlimited waitlist

The approved consumer landing page is published at `/unlimited`. The existing
`/unlimited/ornamental` comparison URL serves the same design and remains
no-index, canonicalized to `/unlimited`. The home page, existing checkout, and
publisher preview are unchanged; the original editorial component is retained
in source. At the user's direction, the
compact page uses: "Unlimited audiobooks", "1,000s of titles", "$9 / mo",
and "Coming early 2027". These are supplied prelaunch offer/copy targets, not
a fresh audit of the current catalog. Joining is a free waitlist signup, not
a purchase or subscription activation.

## Signup storage

The form posts to the existing `/api/waitlist` endpoint. Addresses are trimmed,
lowercased, and saved to the existing Supabase `public.waitlist` table (`email`,
`created_at`, `id`). No new database schema or service is needed. The endpoint
requires the existing server-only `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`; neither is sent to the browser. A duplicate is
an acknowledged success, not a second conversion. Database failures never
produce a success message. The form accepts launch-update consent inline.

Request-size limits, origin validation, a honeypot, and a bounded per-instance
rate limit reduce abuse. For sustained paid traffic, configure a shared WAF
rate limit or challenge at the hosting layer; an in-memory limiter cannot
provide a global guarantee across serverless instances.

## Advertising measurement

A successful **new** signup pushes `azalea_waitlist_signup` to `window.dataLayer`,
with `product: unlimited` and any of the five standard `utm_*` campaign values
present in the landing URL. Email is never included in that event. This is a
measurement hook, not a configured Google/Meta pixel, conversion destination,
or consent manager. Configure the chosen ad platform and applicable consent
before spending. No ads, trackers, or advertising accounts are created here.
Campaign attribution is not stored in the existing email-only database table.

## Ornamental comparison

`/unlimited/ornamental` remains a no-index comparison URL using the
same approved component as `/unlimited`. It removes the FAQs, benefit rows,
repeated calls to action, and ornamental replay label. The original
editorial component is retained in source. Inspired by the illuminated-initial treatment in
https://x.com/azlenelza/status/2114559456763883871, it uses original SVG botanical
geometry and an engraved Garamond initial. No artwork or code
was copied from the reference. Branches, leaves, and rosettes draw once in
under four seconds. The compact headline uses an illuminated U; the shared
component still supports its original O and optional replay control. The
catalog section uses a smaller, distinct copperplate-inspired E: an original
drawn letter with pen flourishes, an ivory cartouche, coral ink, muted teal trim,
and fine gold details. The U retains its bright blue floral treatment. Both
initials respect reduced-motion preferences. The catalog remains an accessible h2 named
"Explore the catalog"; SVG pattern IDs are unique for each initial. The letter and readable
headline are present immediately, and reduced-motion users get a fully
rendered, static ornament with no replay control. The ornament itself has no
animation loop, canvas, or per-frame JavaScript. No signup data is sent to the
reference site.

The compact candidate now includes a short introduction and one 20-title
carousel beneath its two actual app screenshots. Covers come from existing
local Azalea assets and the allowed public R2 catalog, with an explicit note that
launch titles may differ. All twenty are unique books, not a repeated six-title list.
There are still only two sections and one signup form; no FAQs or repeated pitches.
The catalog heading and browsing controls sit above the full-width book row,
not in a sidebar that narrows or masks the left edge of the carousel.

The bookshelf drifts continuously at 14 pixels per second, about 20–22 seconds
per cover at typical desktop widths. A second, assistive-technology-hidden and inert
visual copy lets it loop without an end-to-start rewind.
Previous/next buttons, native touch scrolling, and arrow keys support manual
browsing. Manual browsing pauses automatic rotation until resumed. Hover and
keyboard focus temporarily pause it as well. It only rotates while visible and
the browser tab is active; reduced-motion users get manual, instant scrolling.
The animation only advances the native scroll offset; React does not render
per frame and dimensions are cached outside the frame loop. Resize handling
preserves catalog position. Frames and observers are removed on pause/unmount.
No new animation library is added.

Each carousel title includes category names without numeric BISAC codes and a
short, original summary of its existing description. `featured-books.ts` records
the per-title metadata snapshot checked on October 26, 2026, without adding a
large feed request at page load. Twelve records have assigned BISAC labels.
The other eight only supply genres; their cards explicitly say "Catalog genres"
rather than claiming those are verified BISAC assignments.
The full supplied category paths remain visible, including secondary categories.

Where the feed's description was only a placeholder or ambiguous, summaries were
checked against the publisher or original text:

- https://www.skyhorsepublishing.com/9781510755864/framed-in-monte-carlo/
- https://www.skyhorsepublishing.com/9781510763371/return-from-siberia/
- https://dev.gutenberg.org/cache/epub/76966/pg76966-images.html
- https://www.gutenberg.org/ebooks/21638
- https://www.gutenberg.org/ebooks/77181

The compact candidate uses the home page dial's exact blue (#3566ff), yellow
(#ffcf00), pink (#ec4978), orange (#ff9900), green (#00dd33), and mint (#00ef82)
swatches, with the same off-white paper and dark-purple ink. Its SVG lettering
and signup action carry those colors. The two phone screenshots sit directly on
the page, without a colored panel, rings, frame, or caption. Theme variables
are scoped to the compact page; the original editorial page is unchanged.

The header includes a small App Store platform mark with "iOS App Store" and
"Coming early 2027". This is a non-clickable platform indicator, not a live
download or pre-order offer. The vector mark is sourced from Simple Icons 16
(`https://cdn.jsdelivr.net/npm/simple-icons@16/icons/appstore.svg`) and embedded
locally, so no third-party request is added to page load.

## Images

`public/subscription-preview/app-browse.png` and `app-player.png` are copied
unchanged from the existing subscription-preview checkout. They are actual
September 2026 iOS app captures from
`azalea-audio-interactive-live-browse-to-transcript-20260915.mp4` (00:02 and
00:16). The app icon is the existing iOS icon, not a redesigned logo. Local
catalog covers are reused; the page states that the subscription collection
and experience may change. Next.js delivers responsive image sizes.

## Checks

`npm test` covers route validation, duplicates, failures, spam controls, and
the form's confirmation/retry/conversion behavior. `npm run build` checks the
production app. Verify a clearly labeled test signup through the browser,
confirm its database row, and remove that exact test row after verification.
