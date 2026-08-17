"use client";

import { useEffect, useRef, useState } from "react";
import {
  Datamosh,
  DEFAULT_DIAL_SETTINGS,
  type DialSettings,
} from "./dial-engine";
import styles from "./publishing.module.css";

const STORAGE_KEY = "azalea-dial-settings";

type Control = {
  key: keyof DialSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  hint?: string;
};

const CONTROLS: Control[] = [
  {
    key: "topPerspective",
    label: "Top perspective",
    min: 2,
    max: 14,
    step: 0.25,
    format: (value) => value.toFixed(2),
    hint: "Curve + tilt",
  },
  {
    key: "bottomPerspective",
    label: "Bottom perspective",
    min: 2,
    max: 14,
    step: 0.25,
    format: (value) => value.toFixed(2),
    hint: "Curve + tilt",
  },
  {
    key: "perspective",
    label: "Column spread",
    min: 1,
    max: 2,
    step: 0.05,
    format: (value) => value.toFixed(2),
    hint: "Left to right",
  },
  {
    key: "speed",
    label: "Speed",
    min: 0.3,
    max: 1.8,
    step: 0.05,
    format: (value) => `${value.toFixed(2)} sec`,
  },
  {
    key: "cols",
    label: "Segments",
    min: 4,
    max: 12,
    step: 1,
    format: (value) => `${value}`,
    hint: "Fewer is wider",
  },
  {
    key: "tiles",
    label: "Bands",
    min: 9,
    max: 25,
    step: 2,
    format: (value) => `${value}`,
  },
  {
    key: "offset",
    label: "Column lag",
    min: 0,
    max: 0.2,
    step: 0.01,
    format: (value) => value.toFixed(2),
  },
  {
    key: "typeScale",
    label: "Type size",
    min: 0.04,
    max: 0.14,
    step: 0.005,
    format: (value) => `${Math.round(value * 1000)}`,
  },
];

export default function DialHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Datamosh | null>(null);
  const [settings, setSettings] = useState<DialSettings>(DEFAULT_DIAL_SETTINGS);
  const [tunerOpen, setTunerOpen] = useState(false);
  const showTuner = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!showTuner) return;

    let frame = 0;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const storedSettings = {
          ...DEFAULT_DIAL_SETTINGS,
          ...JSON.parse(saved),
        };
        frame = window.requestAnimationFrame(() => {
          setSettings(storedSettings);
        });
      }
    } catch {
      // The production defaults remain available when storage is unavailable.
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [showTuner]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const stage = host.closest<HTMLElement>("[data-dial-stage]");
    const frame = host.closest<HTMLElement>("[data-dial-frame]");
    const resolvedHeader = document.querySelector<HTMLElement>(
      "[data-resolved-header]",
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const engine = new Datamosh(host);
    if (!engine.ok) return;
    engineRef.current = engine;

    let onScreen = false;
    let scrollFrame = 0;

    const updateResolve = () => {
      scrollFrame = 0;
      if (!stage) return;

      const bounds = stage.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - window.innerHeight);
      const stageProgress = Math.max(0, Math.min(1, -bounds.top / distance));
      const resolveProgress = Math.max(
        0,
        Math.min(1, (stageProgress - 0.42) / 0.3),
      );
      engine.setResolve(resolveProgress);

      const collapseRaw = Math.max(
        0,
        Math.min(1, (stageProgress - 0.76) / 0.22),
      );
      const collapseProgress = reducedMotion
        ? Number(collapseRaw >= 1)
        : collapseRaw * collapseRaw * (3 - 2 * collapseRaw);
      const compact = window.innerWidth <= 760;
      const startHeight = compact
        ? window.innerHeight * 0.82
        : Math.min(window.innerHeight * 0.76, 760);
      const endHeight = compact ? 64 : 72;
      const frameHeight =
        startHeight + (endHeight - startHeight) * collapseProgress;
      const finalShift = -(window.innerHeight - endHeight) / 2;

      if (frame) {
        frame.style.setProperty("--dial-frame-height", `${frameHeight}px`);
        frame.style.setProperty(
          "--dial-frame-shift",
          `${finalShift * collapseProgress}px`,
        );
        frame.style.setProperty(
          "--dial-controls-opacity",
          `${1 - collapseProgress}`,
        );

        const controls = frame.querySelector<HTMLElement>(
          "[data-dial-controls]",
        );
        if (controls) {
          controls.style.pointerEvents =
            collapseProgress > 0.08 ? "none" : "auto";
        }
      }

      const headerRaw = Math.max(
        0,
        Math.min(1, (collapseRaw - 0.72) / 0.28),
      );
      const headerProgress = reducedMotion
        ? Number(headerRaw >= 1)
        : headerRaw * headerRaw * (3 - 2 * headerRaw);
      resolvedHeader?.style.setProperty(
        "--resolved-header-progress",
        `${headerProgress}`,
      );
      resolvedHeader?.style.setProperty(
        "--resolved-header-shift",
        `${-12 * (1 - headerProgress)}px`,
      );
      frame?.style.setProperty(
        "--dial-canvas-opacity",
        `${1 - headerProgress}`,
      );
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateResolve);
    };

    const sync = () => {
      if (reducedMotion) {
        engine.renderFinal();
      } else if (onScreen && !document.hidden) {
        engine.start();
      } else {
        engine.stop();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "160px" },
    );

    observer.observe(host);
    updateResolve();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", sync);

    return () => {
      engineRef.current = null;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", sync);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setSettings(settings);
  }, [settings]);

  const updateSetting = (key: keyof DialSettings, value: number) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Live tuning still works when storage is unavailable.
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_DIAL_SETTINGS);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_DIAL_SETTINGS),
      );
    } catch {
      // Live tuning still works when storage is unavailable.
    }
  };

  return (
    <div className={styles.dialStage}>
      <div
        ref={hostRef}
        className={styles.datamosh}
        role="img"
        aria-label="The Azalea Labs logo and multilingual versions of the name roll upward through fixed columns in a weighted left-to-right wave, briefly align as a clean line in the centre, then continue onward before resolving in English and moving up into the page header."
      />

      {showTuner &&
        (tunerOpen ? (
          <aside
            className={styles.dialTuner}
            data-dial-controls
            aria-label="Dial tuning controls"
          >
            <div className={styles.tunerHeading}>
              <div>
                <strong>Dial tuning</strong>
                <span>Changes save on this device</span>
              </div>
              <button type="button" onClick={() => setTunerOpen(false)}>
                Done
              </button>
            </div>

            <div className={styles.tunerControls}>
              {CONTROLS.map((control) => (
                <label className={styles.tunerControl} key={control.key}>
                  <span className={styles.controlLabel}>
                    <span>
                      {control.label}
                      {control.hint ? <small>{control.hint}</small> : null}
                    </span>
                    <output>{control.format(settings[control.key])}</output>
                  </span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={settings[control.key]}
                    onChange={(event) =>
                      updateSetting(control.key, Number(event.target.value))
                    }
                  />
                </label>
              ))}
            </div>

            <button
              className={styles.tunerReset}
              type="button"
              onClick={resetSettings}
            >
              Reset defaults
            </button>
          </aside>
        ) : (
          <button
            className={styles.tunerOpen}
            data-dial-controls
            type="button"
            onClick={() => setTunerOpen(true)}
            aria-expanded="false"
          >
            Tune dial
          </button>
        ))}
    </div>
  );
}
