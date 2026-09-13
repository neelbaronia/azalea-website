# Datasheet — azalea-literary-parallel v0.1.1

Follows the "Datasheets for Datasets" structure that most lab procurement teams now
expect alongside a sample. Answers describe the **sample package** in `sample/`, not the
full library.

## Motivation

Assembled by Azalea Labs to demonstrate the shape and quality of commissioned human
literary translation for prospective training-data licensees. It was not originally
collected for machine learning — these are working literary translations produced for
publication, which is why the English reads as literature rather than as gloss.

## Composition

- 7 documents, 423 human-verified aligned segments, 4 language directions (de→en, fr→en,
  zh→en, es→en), 4 named translators.
- ~17,378 source words / ~16,822 English words. **zh source counts are CJK characters,
  not words** — do not sum across scripts without normalizing.
- Segment granularity is the paragraph or the natural discourse unit, not the sentence.
  Alignment is 1:1 throughout the sample and human-verified; the schema supports 1:n,
  n:1 and n:n for future deliveries.
- All source works are contemporary short fiction from literary magazines or literary
  platforms.
- 3 of 423 segments carry the `translator_annotation` rationale layer. This is a
  demonstration of the annotation format, **not representative density.** Annotation is
  collected at delivery time and scales to a buyer's spec.

## Collection process

Each work was commissioned from a translator, delivered as prose, then segment-aligned
against the source by Azalea editorial. Alignment was checked by hand. `editorial_passes`
records how many review rounds each document received. `delivered` is the date the
translator submitted final text.

The source texts were obtained from their public publication URLs, recorded per record in
`provenance.source_publication.url`.

## Preprocessing

Line wrapping from document extraction was normalized. Translator wording, paragraph
boundaries, punctuation and typographic quotation marks are unchanged from delivery.
No lowercasing, no Unicode folding, no de-duplication was applied — the text is delivered
as written.

## Uses

Suited to: document- and discourse-level translation training and evaluation; literary
and low-resource register adaptation; translation-quality evaluation; reasoning-trace and
preference training via the annotation layer.

**Not** suited to: high-volume bitext pretraining (far too small), technical or
domain-specific MT (literary register only), or any use requiring source-text
redistribution rights we do not yet hold.

## Distribution and licensing

**Status: NOT CLEARED FOR DISTRIBUTION.** Every record carries
`provenance.source_text_license` and `provenance.translation_license` set to
`"NOT CLEARED"`. The sample exists to demonstrate format and quality under a
confidentiality understanding; it is not a licensable corpus in its current state. See
[RIGHTS.md](RIGHTS.md).

## Known limitations

- Small. Five works is a format demonstration, not a supply commitment.
- Direction is uniformly *into* English. No en→X data.
- Annotation density is low (0.9% of segments) and will need deliberate collection.
- Source texts are publicly reachable and may already appear in web-scale pretraining
  corpora. Only the English side is guaranteed uncrawled.
- Genre-narrow: contemporary literary short fiction only.
- Translator pool is small (4 in the sample), so translator idiolect is not averaged out
  — a feature for style work, a confound for anything treating the data as a neutral
  reference.

## Maintenance

Regenerated from the live site catalog via `node data-licensing/build-sample.mjs`.
`manifest.json` carries per-file SHA-256 checksums. Contact: nbaronia@gmail.com.
