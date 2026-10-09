"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  LISTENER_FOOTPRINT,
  LISTENER_FOOTPRINT_MONTH,
  LISTENER_FOOTPRINT_PERIOD,
} from "./markets";
import styles from "./full-publishing.module.css";

const WIDTH = 960;
const HEIGHT = 500;

const FOOTPRINT_BY_COUNTRY: ReadonlyMap<
  string,
  (typeof LISTENER_FOOTPRINT)[number]
> = new Map(
  LISTENER_FOOTPRINT.map((country) => [country.name, country]),
);

type CountryProperties = { name: string };
type CountryFeature = Feature<Geometry, CountryProperties>;

type MapCountry = {
  color: string | null;
  isActive: boolean;
  label: string;
  path: string;
  x: number;
  y: number;
};

type Tooltip = {
  color: string;
  label: string;
  left: number;
  top: number;
};

export default function FullWorldMap({
  className = "",
  scope = "markets",
}: {
  className?: string;
  scope?: "markets" | "worldwide";
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [countries, setCountries] = useState<MapCountry[] | null>(null);

  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;

    let cancelled = false;
    const loadMap = async () => {
      const [{ geoNaturalEarth1, geoPath }, { feature }, worldModule] =
        await Promise.all([
          import("d3-geo"),
          import("topojson-client"),
          import("world-atlas/countries-110m.json"),
        ]);
      if (cancelled) return;

      const topology = worldModule.default as unknown as Topology<{
        countries: GeometryCollection<CountryProperties>;
      }>;
      const collection = feature(
        topology,
        topology.objects.countries,
      ) as unknown as FeatureCollection<Geometry, CountryProperties>;
      const visibleCountries = collection.features.filter(
        (country) => country.properties.name !== "Antarctica",
      ) as CountryFeature[];

      const projection = geoNaturalEarth1().fitExtent(
        [
          [10, 12],
          [WIDTH - 10, HEIGHT - 12],
        ],
        {
          type: "FeatureCollection",
          features: visibleCountries,
        },
      );
      const makePath = geoPath(projection);
      const nextCountries = visibleCountries.flatMap(
        (country): MapCountry[] => {
          const path = makePath(country);
          if (!path) return [];

          const name = country.properties.name;
          const footprint = FOOTPRINT_BY_COUNTRY.get(name);
          const color = footprint?.color ?? null;
          const [x, y] = makePath.centroid(country);

          return [
            {
              color,
              isActive: color !== null,
              label:
                name === "United States of America" ? "United States" : name,
              path,
              x,
              y,
            },
          ];
        },
      );

      if (!cancelled) setCountries(nextCountries);
    };

    if (typeof IntersectionObserver === "undefined") {
      void loadMap();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void loadMap();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(block);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  function tooltipFor(country: MapCountry, left: number, top: number): Tooltip {
    return {
      color: scope === "worldwide" ? "#9b8ac5" : country.color ?? "#14101f",
      label:
        scope === "worldwide"
          ? country.label
          : country.isActive
            ? country.label
            : `${country.label} · No listeners in ${LISTENER_FOOTPRINT_MONTH}`,
      left,
      top,
    };
  }

  function showFromPointer(
    country: MapCountry,
    clientX: number,
    clientY: number,
  ) {
    const element = document.getElementById("publishing-world-map");
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    setTooltip(
      tooltipFor(
        country,
        ((clientX - bounds.left) / bounds.width) * 100,
        ((clientY - bounds.top) / bounds.height) * 100,
      ),
    );
  }

  function showFromCentroid(country: MapCountry) {
    setTooltip(
      tooltipFor(
        country,
        (country.x / WIDTH) * 100,
        (country.y / HEIGHT) * 100,
      ),
    );
  }

  return (
    <div ref={blockRef} className={`${styles.mapBlock} ${className}`}>
      <div id="publishing-world-map" className={styles.mapCanvas}>
        <svg
          className={styles.mapSvg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby="publishing-map-title publishing-map-description"
        >
          <title id="publishing-map-title">
            {scope === "worldwide"
              ? "Azalea worldwide distribution"
              : `Azalea listener footprint — ${LISTENER_FOOTPRINT_PERIOD}`}
          </title>
          <desc id="publishing-map-description">
            {scope === "worldwide"
              ? "A world map illustrating worldwide distribution settings. Availability varies by title, store, and country. This is not a map of confirmed live listings."
              : `A world map highlighting the ${LISTENER_FOOTPRINT.length} countries with Spotify listener activity in ${LISTENER_FOOTPRINT_PERIOD}.`}
          </desc>

          <defs>
            <pattern
              id="map-lines"
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(35)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="7"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          <g className={styles.mapCountries}>
            {countries?.map((country) => (
              <path
                key={country.label}
                d={country.path}
                className={
                  scope === "worldwide"
                    ? styles.mapCountryWorldwide
                    : country.isActive ? styles.mapCountryActive : styles.mapCountry
                }
                style={
                  scope === "markets" && country.color
                    ? ({ "--market-color": country.color } as CSSProperties)
                    : undefined
                }
                tabIndex={scope === "markets" && country.isActive ? 0 : undefined}
                role={scope === "markets" && country.isActive ? "img" : undefined}
                aria-label={
                  scope === "worldwide" || country.isActive
                    ? country.label
                    : `${country.label}, no listeners in ${LISTENER_FOOTPRINT_MONTH}`
                }
                onMouseEnter={(event) =>
                  showFromPointer(country, event.clientX, event.clientY)
                }
                onMouseMove={(event) =>
                  showFromPointer(country, event.clientX, event.clientY)
                }
                onMouseLeave={() => setTooltip(null)}
                onFocus={() => country.isActive && showFromCentroid(country)}
                onBlur={() => setTooltip(null)}
                onPointerDown={(event) =>
                  showFromPointer(country, event.clientX, event.clientY)
                }
              />
            ))}
          </g>
        </svg>

        {tooltip ? (
          <div
            className={styles.mapTooltip}
            style={{ left: `${tooltip.left}%`, top: `${tooltip.top}%` }}
            role="status"
          >
            <span style={{ background: tooltip.color }} />
            {tooltip.label}
          </div>
        ) : null}
      </div>

    </div>
  );
}
