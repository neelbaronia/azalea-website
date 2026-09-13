# Rights position

Read this before sending the sample to anyone.

## The two chains

A translation is a derivative work. Licensing one for AI training requires **two**
separate permissions per work, and Azalea currently holds neither in writing.

**Chain A — the source text.** The right to make and distribute a translation belongs to
the original author or their publisher. Every source work in the sample is in copyright
(all first published 2024–2025) and is held by its author, its magazine, or both:
VOLLTEXT, Short Édition, Le Lecteur du Val, 一苇轩, 北国网, L'Indiscreto, Energheia,
オレンジ文庫.

**Chain B — the translation.** Copyright in the English text belongs to the translator
who wrote it, unless assigned. Our translator agreements are not work-for-hire —
`provenance.work_for_hire` is `false` in every record, deliberately and accurately.

The website's own translations page states the position plainly: Azalea does not own or
claim copyright in the original works, and the samples are private, not for commercial
use. Any licensing conversation has to be consistent with that notice, because a buyer's
counsel will read it.

## What this means practically

- The sample can be shown to a prospective buyer **as a format and quality demonstration
  under an NDA or a clear confidentiality understanding.** That is normal and low-risk.
- It cannot be sold, and no license can be granted, until both chains are cleared per
  work.
- Do not let a term sheet get ahead of the paperwork. Selling data you don't control is
  the one mistake in this business that ends the business.

## Clearance checklist, per work

**Translator side (do this first — it's fast, cheap, and entirely in our control):**

- [ ] Written license or assignment from the translator covering AI-training use
- [ ] Explicit AI/machine-learning language — a generic publication grant does not cover
      training, and translators are rightly sensitive about this
- [ ] Revenue-share terms stated in the agreement, not promised verbally
- [ ] Human-authorship attestation signed (no MT, no LLM drafting or post-editing) — this
      is what backs the `process.attestation` field
- [ ] Attribution terms: how the translator is credited in the licensed dataset
- [ ] Right to sublicense to a named buyer, and whether the translator may veto a buyer

**Source side (slower, and the real gate):**

- [ ] Identify the actual rights holder — author or magazine, which varies by venue
- [ ] Written permission to create and commercially license a translation
- [ ] Explicit AI-training permission, separately named
- [ ] Territory and term
- [ ] Whether the permission survives resale or is buyer-specific

**Then:**

- [ ] Flip `provenance.source_text_license` and `provenance.translation_license` in the
      build script from `"NOT CLEARED"` to real license identifiers
- [ ] Regenerate the sample; checksums change, which is the point

## Sequencing recommendation

Clearing rights for a corpus nobody has agreed to buy is months of unpaid work with no
price signal at the end. Clear in this order:

1. **Get a price signal first.** Send the brief and sample as "this is what we produce and
   how we'd structure it — what's it worth to you, and what's your diligence bar?" A
   buyer's answer on diligence tells you exactly how much clearance work is actually
   required, and it varies enormously between labs.
2. **Clear the translator side immediately regardless.** It's cheap, it's ours, it's the
   right thing to do by the people who did the work, and it makes the next cohort of
   translators want to sign with us rather than go direct to a marketplace.
3. **Clear source rights per deal**, targeted at the works a buyer actually wants, rather
   than across the whole library speculatively.
4. **For future commissions, structure it right at the front** — commission works whose
   source rights we clear at the point of commissioning, so no retroactive chase is
   needed. Public-domain source texts sidestep Chain A entirely and are worth
   considering for a rights-clean subcorpus we can sell without any negotiation.
