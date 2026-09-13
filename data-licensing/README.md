# Azalea Labs — Human Literary Translation Data

**Licensing brief + sample package · v0.1.1 · September 2026**

Azalea Labs commissions literary translation into English from named, credentialed
translators — PhD candidates and working literary translators at Berkeley, Cornell,
UW, and the Society of Authors. Every English text we hold was written by a human
being from scratch, has never been published, and has never been crawled.

This directory is what we send to a prospective data buyer: a sample of the corpus in
the format we would deliver it, the schema, the datasheet, and our rights position.

```
data-licensing/
├── README.md                              this brief
├── DATASHEET.md                           dataset card (collection, composition, limits)
├── RIGHTS.md                              rights chain + what we must clear before selling
├── build-sample.mjs                       regenerates the sample from the site catalog
└── sample/
    ├── azalea-literary-parallel-v0.1.jsonl   document-level records  ← recommended
    ├── azalea-segments-v0.1.jsonl            flat segment rows (drop-in for MT/SFT)
    ├── schema.json                            JSON Schema, annotated
    └── manifest.json                          inventory, counts, SHA-256
```

Sample contents: **7 works · 423 aligned segments · ~17.4k source words · ~16.8k English
words · 4 translators · de→en, fr→en, zh→en, es→en.** The full library is larger and growing;
see [Inventory](#inventory).

---

## 1. What buyers actually want (research summary)

Before pricing anything, it's worth being blunt about what is and isn't scarce.

**Plain sentence-aligned bitext is worthless.** OPUS, CCMatrix, ParaCrawl and the NLLB
bitext mining releases put billions of segments in the public domain for free. If we
walk into Mercor or Handshake and say "we have parallel sentences," the correct response
is "so does everyone, at zero cost." Any pitch that leads with volume loses.

Four things *are* scarce, and all four are things we have:

**1. Provenance you can defend in court.** The dominant anxiety in training-data
procurement right now is not quality, it's legal exposure. Buyers want a documented chain
from author → rights holder → license, per record, and they will pay a premium for data
that is clean rather than merely good. Conversely they will walk from anything ambiguous.
This is our single biggest lever and also our biggest current gap — see [RIGHTS.md](RIGHTS.md).

**2. Guaranteed absence of machine output.** Labs increasingly refuse data that may
contain MT or LLM drafting, because training on it recycles the model's own artifacts and
collapses diversity. A signed human-authorship attestation per document is a real,
priceable asset. Our `process` block carries it.

**3. Uncrawled target text.** If the English already exists on the open web, the buyer's
pretraining run has probably seen it, and it's worth close to nothing for training and
nothing at all for evaluation. Our English translations are unpublished. That is the
crown jewel and we should say so in the first sentence of any email. Our `contamination`
block states, per record, which side is public.

**4. The translator's reasoning, not just their output.** This is the part nobody else is
selling. Post-training has moved from "here is the right answer" to "here is why this
answer beats the plausible alternatives." A segment carrying the translator's decision,
their rationale in their own words, and the renderings they rejected is directly usable
as a reasoning trace or as a preference pair (chosen = delivered rendering, rejected =
the alternatives). Sentence-aligned bitext cannot produce that at any volume.

Where it lands commercially: the expert-data marketplaces (Mercor, Handshake AI, Surge,
Scale) are built around exactly this shape — credentialed specialists producing rubrics,
graded outputs, preference rankings and reasoning traces, at $85–110/hr for coding
evaluators and $90–250+/hr for credentialed domain experts, against roughly $10–25/hr for
commodity labeling. Their published dataset catalogs cover law, medicine, finance,
coding and agentic workflows — **and conspicuously not literary or multilingual
humanities data.** That gap is the opening. We are not a translation vendor competing on
price per word; we are a credentialed-expert supplier in a domain they don't currently
cover.

Sources for the above are listed in [§7](#7-sources).

---

## 2. How we structure the data, and why

**Format: JSONL, document-level, one work per line.** Not TMX, not XLIFF, not CSV, not
pickle.

- **JSONL** because every training pipeline on earth streams it, it survives arbitrary
  nesting (our annotation layer needs that), and it diffs and shards cleanly. TMX and
  XLIFF are translation-industry interchange formats built for CAT tools; they carry
  translation-memory semantics no lab needs and force our rich metadata into `<prop>`
  soup. If a buyer specifically asks for TMX we can emit it, but leading with it signals
  "LSP vendor" rather than "training data supplier." Never ship a pickle — it's an
  arbitrary-code-execution vector and no serious buyer will load one from a stranger.
- **Document-level, with an ordered `segments` array**, because discourse context is the
  entire reason literary translation data is interesting. A pronoun resolved 40 segments
  earlier, a register established on page one, a motif that has to land at the close —
  flatten to independent sentence pairs and you have thrown away the thing being sold.
  `azalea-segments-v0.1.jsonl` provides the flat view too (with `prev_segment` /
  `next_segment` context windows) so a buyer can drop it into an existing pipeline
  without touching their loader.

**Every record carries five blocks beyond the text itself:**

| Block | Answers | Why the buyer cares |
|---|---|---|
| `translator` | Who wrote this, with a verifiable credential URL | Expert-data premium; auditability |
| `provenance` | Two rights chains — source text and translation, separately | Legal clearance; this is usually the deal-breaker |
| `process` | Human-authored? MT used? How many editorial passes? | Guarantees no recycled machine output |
| `contamination` | Is either side already on the public web? | Determines training value and eval validity |
| `translator_annotation` | The decision, the rationale, the rejected alternatives | Reasoning traces and preference pairs |

Here is one annotated segment, verbatim from the sample:

```json
{
  "segment_id": "azl-zh-0002:s0003",
  "index": 2,
  "source_text": "撞拐是很多人都熟悉的游戏，在地上画一个圈儿，…",
  "target_text": "Zhuangguai is a game familiar to many people. A circle is drawn on the ground…",
  "alignment": "1:1",
  "translator_annotation": {
    "difficulty": "culture_bound_game",
    "decision": "撞拐 transliterated as 'Zhuangguai' and glossed in-line by the paragraph that follows.",
    "rationale": "The source paragraph already functions as a rules explanation for Chinese readers unfamiliar with the regional variant, so the gloss is native to the text rather than a translator's intrusion. Substituting 'chicken fight' or 'knee wars' would localise away the setting, which the story needs for its generational frame.",
    "alternatives_rejected": ["chicken fighting", "knee wars", "one-legged tag"]
  }
}
```

That single object is worth more to a post-training team than a thousand unannotated
sentence pairs, and it converts mechanically into a DPO/preference row.

**Honest limitation:** the sample carries 3 annotated segments out of 423. The rationale
layer is a *capability demonstration*, not existing inventory — it is collected from
translators at delivery time and we have only just started asking for it. Any buyer
conversation should treat annotation density as something we scale to spec and price
separately, not as something we already have at volume. Overstating this is the fastest
way to lose the relationship at the QA stage.

---

## 3. Inventory

Sample package (this directory), all real delivered work:

| Direction | Docs | Segments | Source words | English words |
|---|---:|---:|---:|---:|
| de→en | 1 | 180 | 4,643 | 4,893 |
| fr→en | 2 | 114 | 3,602 | 3,552 |
| zh→en | 2 | 46 | 3,336* | 2,619 |
| es→en | 2 | 83 | 5,797 | 5,758 |
| **Total** | **7** | **423** | **17,378** | **16,822** |

\* zh counts are CJK characters, not words.

Beyond the sample, the wider library adds further Italian, Spanish and Japanese works and
additional translators (Sophia Barry Gordon, Jess Dubie, Jordan Niver-Johnson), several of
which are currently held as translation-only text without source alignment. Aligning those
is mechanical work we should do before any buyer call — unaligned text sells for materially
less.

**Growth rate is the number a buyer will actually ask for**, because a one-time 11k-word
drop is not a supply relationship. We need a defensible answer on words/month and how
fast we can add a language pair on demand before we send this out.

---

## 4. Pricing: what to ask for, and on what unit

**Do not price per token.** Tokens are a property of the buyer's tokenizer, not of our
work — the same passage is 1.3× more tokens in Chinese than English under most BPE
vocabularies, which means per-token pricing silently penalizes us on exactly the pairs
that are hardest to produce. Per token is also the unit of commodity text, and it invites
comparison against free web-scale corpora. Price on the unit that reflects human effort.

Recommended: **per English (target) word for bulk parallel text, per annotated segment
for the rationale layer, and a flat term license for held-out evaluation sets.**

| Tier | What it is | Unit | Ask |
|---|---|---|---|
| **1 — Parallel text** | Rights-cleared, MT-free, uncrawled aligned works | per target word | **$0.25–0.40** |
| **2 — Annotated** | Tier 1 + translator rationale and rejected alternatives on flagged segments | per annotated segment | **$12–25** |
| **3 — Evaluation set** | Held out, never delivered to any other party, contamination-guaranteed | flat, per term | **$25k–75k / year** |

Where those numbers come from:

- **Tier 1 floor** is our cost. Professional literary translation into English runs
  roughly $0.12–0.20/word to the translator, before editorial passes. Anything at or
  below that is us subsidizing a lab, and we should decline it out loud.
- **Tier 1 ask** is that floor plus editorial cost plus a premium for the three things
  free corpora cannot offer: cleared rights, human-authorship attestation, and an
  uncrawled English side. A non-exclusive license at the bottom of the band, exclusive at
  the top.
- **Tier 2** is derived from expert hourly rather than from word count, because that's
  how the marketplaces price this shape of work. At $90–250/hr for credentialed experts
  and a realistic 6–10 considered annotations per hour, $12–25/segment is the same
  economics expressed per unit — and per-unit is easier for a buyer to forecast than
  hourly.
- **Tier 3** is priced as scarcity, not effort. An uncontaminated literary eval set in a
  language pair a lab is weak in has no substitute at any price, and its value collapses
  the moment it is sold twice. Exclusivity is the product.

**Terms to hold firm on**, roughly in order of importance:

1. **Non-exclusive by default.** Exclusivity is a separate, much larger number, and it
   forecloses every other buyer. Never give it away inside a first deal.
2. **Named use.** Training and evaluation for the buyer's own models. Not redistribution,
   not resale, not sublicensing to their own customers.
3. **Term-limited with renewal**, not perpetual. Perpetual is a one-time payment for an
   asset that appreciates.
4. **Translator attribution and a revenue share.** Our translators are the product. A
   share of licensing revenue flowing back to them is both the right thing and the reason
   the next cohort signs with us instead of going direct.
5. **No model-output-washing clause** — the buyer may not use our data to generate
   synthetic translations and then resell those as human data.

**Questions to put to the buyer on the first call** (their answers reprice everything
above): Which language pairs are you weakest in, and is that a pretraining, post-training
or eval gap? Do you buy on volume or on per-example quality? What's your annotation
density spec? Do you require exclusivity, and what does that pay? What's your rights
diligence bar — do you need signed author consent per work, or is translator warranty
enough? And plainly: what have you paid per unit for comparable expert data?

---

## 5. The blocker: we cannot sell this yet

Every record in the sample says `"source_text_license": "NOT CLEARED"`, and that is
accurate, not boilerplate.

A translation is a derivative work. The copyright in the English belongs to the
translator; the right to make and distribute a translation at all belongs to the original
author or their publisher. Azalea currently holds neither. The site itself says so — the
translations page carries a notice stating that Azalea does not own or claim copyright in
the original works and that the samples are shared privately, not for commercial use.

Selling this to a lab requires two clearances per work, and the sample file is
deliberately built to be honest about that: those fields flip to real license identifiers
only when the paperwork exists.

[RIGHTS.md](RIGHTS.md) has the full chain and a clearance checklist. The short version:
this brief is ready to send, but it should be sent as *"here is what we produce and how
we'd structure it — what would you pay, and what's your diligence bar?"* and not as
*"here is a corpus you can buy today."* Getting a price signal before spending months on
clearances is the right sequencing; misrepresenting the rights position is how a
promising relationship becomes a legal problem.

---

## 6. Regenerating the sample

```bash
node data-licensing/build-sample.mjs
```

Reads the live catalog under `website/src/app/translations/_components/`, so new
translator deliveries flow into the sample as soon as they land on the site. Rerun after
any catalog change; `manifest.json` carries SHA-256 checksums so a buyer can verify what
they received.

---

## 7. Sources

- [Mercor — Off-the-Shelf AI Training Datasets](https://www.mercor.com/apex/off-the-shelf-data/) — catalog scope (50k+ tasks, 30+ domains), expert-written prompts/rubrics/golden solutions; no translation or literary category
- [Mercor — Types of Data](https://www.mercor.com/docs/types-of-data/) — prompt-response pairs, preference rankings, reasoning and agentic traces, eval sets
- [Mercor vs Surge vs Scale AI: 2026 Buyer Guide](https://www.herohunt.ai/blog/mercor-vs-surge-vs-scale-ai-2026-buyer-guide/) and [Top 10 Data Annotators for AI Labs (2026 Benchmark)](https://www.herohunt.ai/blog/top-10-data-annotators-for-ai-labs-2026-benchmark/) — $10/hr commodity to $300/hr expert; Mercor $85–110/hr coding, $90–250+/hr credentialed specialists; historical Scale per-unit rates
- [Data Labeling Market 2026: Experts and AI Sourcing](https://blog.pebblous.ai/report/expert-data-labor-market-2026/en/) — shift from public corpora to credentialed expert data
- [Translators as Invisible Teachers of AI: Copyright, Translation Memory, and the Political Economy of Linguistic Data](https://arxiv.org/html/2605.24842v1) — translation memories as supervised training capital; loss of translator attribution
- [Data Security and Copyright in AI Translation — Slator](https://slator.com/resources/data-security-copyright-ai-translation/) — derivative-work status of translations; opt-in clauses with publishers and rights holders
- [A large-scale audit of dataset licensing and attribution in AI (Nature Machine Intelligence)](https://www.nature.com/articles/s42256-024-00878-8) — per-record license/provenance metadata as a filtering requirement
- [Common Corpus: The Largest Collection of Ethical Data for LLM Pre-Training](https://arxiv.org/html/2506.01732v3) — provenance-carrying corpus design; license/language/domain fields per object
- [Building Large-Scale English-Romanian Literary Translation Resources with Open Models](https://arxiv.org/pdf/2509.07829) and [Findings of the WMT 2024 Shared Task on Discourse-Level Literary Translation](https://arxiv.org/pdf/2412.11732) — document- and discourse-level literary translation as an open problem
- [MQM-APE: Toward High-Quality Error Annotation Predictors](https://aclanthology.org/2025.coling-main.374/) — MQM error-span annotation as the standard quality schema, if a buyer wants that layer added
- [Rights-Cleared AI Data Licensing in 2026](https://blog.depositphotos.com/rights-cleared-ai-data-licensing.html) — cleared-rights premium in current licensing deals
