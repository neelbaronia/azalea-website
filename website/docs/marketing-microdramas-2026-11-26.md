# Featured audiobook films — November 26, 2026

The public `/marketing` showcase features two user-approved finished films
before the four existing examples. Selection is editorial, not a measured
retention or conversion winner.

## Selected films

- **Killing Kennedy — The Bus to Induction, hook B.** “What if Kennedy had
  lived?” establishes the subject immediately and gives the fictional brothers
  clear emotional stakes. The film keeps the uncertainty about Kennedy and
  Vietnam explicit. Full captioned 63.021333s, 720×1280 H.264/AAC.
  SHA256: `178ef16f05d21c8b82cc3d7302d6a46b970ac7ba61d1c551fa797300f3a61d8f`.
- **The Truth About the O.J. Simpson Trial — The Dare Behind the Glove,
  hook 5.** The glove close-up and direct question identify the subject without
  a direct-to-camera impersonation. This is the latest corrected real-cover
  ending, not the earlier blank-book version. Full captioned 50.066667s,
  720×1280 H.264/AAC.
  SHA256: `888812558b1dc7f66ca7b90847d05ac5fc0d01181f77cf17ee51e126173522ff`.

Both files are byte-for-byte copies of the finished outputs in the
marketing-ideas workspace; no new generation, narration or re-editing.
The JFK film includes the user-requested retailer logos and Spotify QR ending.
Audible branding was requested by the user; do not infer an independently
verified Audible product URL or add one without verification.

## Presentation and checks

Assets are versioned under `public/marketing/microdramas/`, alongside matching
9:16 JPEG posters. Players retain native controls, `playsInline`, no autoplay
and `preload="none"`; a new `featuredOrder` places JFK then O.J. first while
preserving the older examples and their order. Other players pause on slide
changes or when another video starts. Website copy identifies these as
AI-created fictional/illustrative scenes rather than archival footage or real
audiobook excerpts, without adding new burned-in labels to the films.

Focused tests cover ordering, original examples, destinations, framing,
uncropped playback and audio-pause behavior. Production build, scoped lint,
six focused tests and local desktop/390px mobile checks pass. The existing
middleware/cache warnings and unrelated `yun-paipai` standalone test typing
issues were not modified by this feature.

Only this scoped change is committed. An unrelated unfinished merge in the
original checkout is intentionally untouched; implementation uses a clean
working copy based on the current production commit.
