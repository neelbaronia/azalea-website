"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface AlignmentWord {
  index: number;
  text: string;
  start: number;
  end: number;
  charStart: number;
  charEnd: number;
}

interface AlignmentData {
  displayText: string;
  words: AlignmentWord[];
}

interface Fragment {
  id: number;
  begin: number;
  end: number;
  text: string;
  paragraph: number;
}

const AUDIO_URL = "/demo-data/games-sample/audio.mp3";
const ALIGNMENT_URL = "/demo-data/games-sample/alignment.json";
const HIGHLIGHT_LEAD_SECONDS = 0.12;
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function transformAlignment({ displayText, words }: AlignmentData): Fragment[] {
  if (words.length === 0) return [];

  const fragments: Fragment[] = [];
  let paragraph = 0;
  let sentenceWords: AlignmentWord[] = [words[0]];

  const flushSentence = (lastWord: AlignmentWord, nextWord?: AlignmentWord) => {
    const firstWord = sentenceWords[0];
    const between = displayText.slice(firstWord.charStart, lastWord.charEnd);
    const gap = nextWord
      ? displayText.slice(lastWord.charEnd, nextWord.charStart)
      : displayText.slice(lastWord.charEnd);
    const trailingPunctuation =
      gap.match(/^[.!?,;:"'\u201D\u2019)\]]*/)?.[0] ?? "";
    const text = `${between}${trailingPunctuation}`.trim();

    if (text) {
      fragments.push({
        id: fragments.length,
        begin: firstWord.start,
        end: lastWord.end,
        text,
        paragraph,
      });
    }

    if (gap.includes("\n\n")) paragraph += 1;
  };

  for (let index = 1; index < words.length; index += 1) {
    const previous = words[index - 1];
    const current = words[index];
    const gap = displayText.slice(previous.charEnd, current.charStart);
    const isParagraphBreak = gap.includes("\n\n");
    const isSentenceBreak = /[.!?]["'\u201D\u2019)]*\s/.test(gap);

    if (isParagraphBreak || isSentenceBreak) {
      flushSentence(previous, current);
      sentenceWords = [current];
    } else {
      sentenceWords.push(current);
    }
  }

  const lastWord = sentenceWords[sentenceWords.length - 1];
  flushSentence(lastWord);

  for (let index = 0; index < fragments.length - 1; index += 1) {
    fragments[index].end = fragments[index + 1].begin;
  }

  return fragments;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default function GamesSamplePage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeFragmentRef = useRef<HTMLSpanElement>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(ALIGNMENT_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the transcript.");
        return response.json() as Promise<AlignmentData>;
      })
      .then((data) => {
        if (!cancelled) setFragments(transformAlignment(data));
      })
      .catch(() => {
        if (!cancelled) setAudioError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const findActiveIndex = useCallback(
    (time: number) => {
      let low = 0;
      let high = fragments.length - 1;

      while (low <= high) {
        const middle = (low + high) >> 1;
        const fragment = fragments[middle];
        if (time < fragment.begin) high = middle - 1;
        else if (time >= fragment.end) low = middle + 1;
        else return middle;
      }

      return -1;
    },
    [fragments],
  );

  const syncToTime = useCallback(
    (time: number) => {
      setCurrentTime(time);
      setActiveIndex(findActiveIndex(time + HIGHLIGHT_LEAD_SECONDS));
    },
    [findActiveIndex],
  );

  const updateDuration = useCallback(() => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    updateDuration();
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
    };
  }, [updateDuration]);

  useEffect(() => {
    if (activeIndex < 0 || !activeFragmentRef.current) return;
    activeFragmentRef.current.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  }, [activeIndex]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setAudioError(true);
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  const changeSpeed = () => {
    const nextIndex = (SPEEDS.indexOf(playbackRate) + 1) % SPEEDS.length;
    const nextRate = SPEEDS[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  const seekToFragment = (fragment: Fragment) => {
    const audio = audioRef.current;
    if (!audio || audioError) return;
    audio.currentTime = fragment.begin;
    syncToTime(fragment.begin);
    if (audio.paused) void audio.play().catch(() => setAudioError(true));
  };

  const seekToTime = (time: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = time;
    syncToTime(time);
  };

  const paragraphs: Fragment[][] = [];
  for (const fragment of fragments) {
    const lastParagraph = paragraphs[paragraphs.length - 1];
    const firstOfLastParagraph = lastParagraph?.[0];
    if (firstOfLastParagraph && firstOfLastParagraph.paragraph === fragment.paragraph) {
      lastParagraph.push(fragment);
    } else {
      paragraphs.push([fragment]);
    }
  }

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#202521]">
      <audio
        ref={audioRef}
        src={AUDIO_URL}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) syncToTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          updateDuration();
          if (audioRef.current) audioRef.current.playbackRate = playbackRate;
        }}
        onDurationChange={updateDuration}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setActiveIndex(-1);
        }}
        onError={() => setAudioError(true)}
      />
      <style jsx>{`
        .games-sample-range {
          appearance: none;
          height: 32px;
          margin: 0;
          background: transparent !important;
        }
        .games-sample-range::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
        }
        .games-sample-range::-moz-range-track {
          height: 4px;
          background: transparent;
          border: 0;
        }
        .games-sample-range::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          margin-top: -5px;
          border: 2px solid #f7f5ef;
          border-radius: 999px;
          background: #b88643;
          box-shadow: 0 0 0 1px #a97735, 0 1px 4px rgb(32 37 33 / 20%);
        }
        .games-sample-range::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border: 2px solid #f7f5ef;
          border-radius: 999px;
          background: #b88643;
          box-shadow: 0 0 0 1px #a97735, 0 1px 4px rgb(32 37 33 / 20%);
        }
        .games-sample-range:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgb(169 119 53 / 30%);
        }
        .games-sample-range:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgb(169 119 53 / 30%);
        }
      `}</style>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-7 sm:px-8 sm:pt-10">
        <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#355f4e]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#244b3b]">
            <Image
              src="/azalea-icon.webp"
              alt=""
              width={25}
              height={25}
              className="h-6 w-6 object-contain"
            />
          </span>
          <span>Azalea Labs</span>
          <span className="text-[#b4b4a9]">/</span>
          <span className="text-[#77786f]">Listening sample</span>
        </div>

        <div className="grid items-center gap-8 rounded-[2rem] border border-[#e6e2d7] bg-[#fbfaf6] p-6 shadow-[0_16px_48px_rgba(43,48,38,0.06)] sm:gap-12 sm:p-10 md:grid-cols-[minmax(190px,270px)_1fr] md:p-14">
          <div className="mx-auto w-[min(64vw,230px)] md:w-full">
            <div className="overflow-hidden rounded-sm bg-white shadow-[0_18px_35px_rgba(25,28,23,0.18)] ring-1 ring-black/5">
              <Image
                src="/sample-covers/games-agency-as-art.png"
                alt="Cover of Games: Agency as Art by C. Thi Nguyen"
                width={765}
                height={990}
                priority
                className="block h-auto w-full"
              />
            </div>
          </div>

          <div className="max-w-2xl text-center md:text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#8a7350]">
              Chapter 1 sample
            </p>
            <h1 className="font-[family-name:var(--font-garamond)] text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#202521] sm:text-6xl lg:text-7xl">
              Games
              <span className="mt-2 block text-[#355f4e]">Agency as Art</span>
            </h1>
            <p className="mt-5 text-lg text-[#62675f] sm:text-xl">
              C. Thi Nguyen
            </p>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#5e625b] md:mx-0 md:text-lg md:leading-8">
              A short narrated excerpt on how games shape the goals and
              abilities we temporarily take on—and what that can teach us about
              agency.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Audio player"
        className="sticky top-0 z-40 border-y border-[#345541]/15 bg-[#f7f5ef] shadow-[0_8px_24px_rgba(32,37,33,0.08)]"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:w-56 sm:shrink-0">
            <Image
              src="/sample-covers/games-agency-as-art.png"
              alt="Cover of Games: Agency as Art"
              width={36}
              height={48}
              sizes="36px"
              className="h-12 w-9 shrink-0 rounded-[2px] object-cover shadow-sm"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a7350]">
                Chapter 1 sample
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-[#303b32]">
                Games: Agency as Art
              </p>
              <p className="mt-0.5 truncate text-xs text-[#77786f]">
                C. Thi Nguyen
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-4">
            <button
              type="button"
              onClick={() => void togglePlayback()}
              disabled={audioError || loading}
              aria-label={playing ? "Pause sample" : "Play sample"}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#244b3b] text-white shadow-sm transition hover:bg-[#1b3b2e] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="2" width="4" height="14" rx="1" />
                  <rect x="11" y="2" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <path d="M4 2.4v13.2L15 9 4 2.4Z" />
                </svg>
              )}
            </button>

            <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-[#6d746b] sm:w-10">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex h-8 min-w-0 flex-1 items-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 h-1 overflow-hidden rounded-full bg-[#dddcd3]"
              >
                <div
                  className="h-full rounded-full bg-[#b88643]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                aria-label="Seek through sample"
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={Math.min(currentTime, duration || 1)}
                onChange={(event) => seekToTime(Number(event.target.value))}
                className="games-sample-range absolute inset-0 w-full cursor-pointer"
              />
            </div>
            <span className="w-9 shrink-0 font-mono text-xs tabular-nums text-[#6d746b] sm:w-10">
              {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={changeSpeed}
              aria-label={`Playback speed ${playbackRate} times. Change speed.`}
              className="min-w-12 shrink-0 rounded-full border border-[#d8ddd3] px-2 py-2 text-xs font-bold tabular-nums text-[#45574a] transition hover:bg-white"
            >
              {playbackRate}×
            </button>
          </div>
        </div>
        {audioError && (
          <p className="mx-auto max-w-5xl px-5 pb-3 text-sm text-[#a54632]">
            The sample player or synchronized transcript could not be loaded.
            Please refresh and try again.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-[#dcd9cf] pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7350]">
              Follow along
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-garamond)] text-3xl font-semibold tracking-tight text-[#202521] sm:text-4xl">
              Opening excerpt
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#74766e]">
            The current sentence follows the narration. Select any sentence to
            jump to that point.
          </p>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-[#77786f]">
            Preparing synchronized text…
          </p>
        ) : (
          <div className="space-y-6">
            {paragraphs.map((paragraph, paragraphIndex) => (
              <p
                key={paragraphIndex}
                className="font-[family-name:var(--font-garamond)] text-[1.28rem] leading-[1.78] text-[#414740] sm:text-[1.45rem]"
              >
                {paragraph.map((fragment) => {
                  const isActive = fragment.id === activeIndex;
                  return (
                    <span
                      key={fragment.id}
                      ref={isActive ? activeFragmentRef : undefined}
                      onClick={() => seekToFragment(fragment)}
                      aria-current={isActive ? "true" : undefined}
                      className={`cursor-pointer rounded-[0.18em] transition-colors duration-200 ${
                        isActive
                          ? "bg-[#ead8b6] text-[#24392e] box-decoration-clone px-1 -mx-1"
                          : "hover:bg-[#eee8d8]"
                      }`}
                    >
                      {fragment.text}{" "}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        )}

        <p className="mt-16 border-t border-[#dcd9cf] pt-5 text-center text-xs leading-5 text-[#898a81]">
          A narrated sample from <i>Games: Agency as Art</i> by C. Thi Nguyen.
          The text highlight is synchronized to the audio.
        </p>
      </section>
    </main>
  );
}
