"use client";

import { useEffect, useRef, useState } from "react";
import {
  Datamosh,
  DEFAULT_DIAL_SETTINGS,
  type DialSettings,
} from "./dial-engine";
import styles from "./dial.module.css";

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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const engine = new Datamosh(host);
    if (!engine.ok) return;
    engineRef.current = engine;

    let onScreen = false;

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
    document.addEventListener("visibilitychange", sync);

    return () => {
      engineRef.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
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
        aria-label="The Azalea Labs logo and multilingual versions of the name roll upward through fixed columns in a weighted left-to-right wave."
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
