"use client";

import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldData from "world-atlas/countries-110m.json";
import styles from "./publishing.module.css";

const WIDTH = 960;
const HEIGHT = 500;

const MARKET_NAMES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Netherlands",
  "Ireland",
  "Germany",
  "New Zealand",
  "Finland",
  "Sweden",
  "Belgium",
  "France",
] as const;

const ACTIVE_COUNTRIES = new Set([
  "United States of America",
  ...MARKET_NAMES.slice(1),
]);

type CountryProperties = { name: string };
type CountryFeature = Feature<Geometry, CountryProperties>;

type MapCountry = {
  isActive: boolean;
  label: string;
  path: string;
  x: number;
  y: number;
};

type Tooltip = {
  label: string;
  left: number;
  top: number;
};

export default function WorldMap() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const countries = useMemo<MapCountry[]>(() => {
    const topology = worldData as unknown as Topology<{
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

    return visibleCountries
      .map((country) => {
        const path = makePath(country);
        if (!path) return null;

        const name = country.properties.name;
        const [x, y] = makePath.centroid(country);

        return {
          isActive: ACTIVE_COUNTRIES.has(name),
          label: name === "United States of America" ? "United States" : name,
          path,
          x,
          y,
        };
      })
      .filter((country): country is MapCountry => country !== null);
  }, []);

  function showFromPointer(country: MapCountry, clientX: number, clientY: number) {
    const element = document.getElementById("publishing-world-map");
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    setTooltip({
      label: country.isActive
        ? country.label
        : `${country.label} · Coming soon`,
      left: ((clientX - bounds.left) / bounds.width) * 100,
      top: ((clientY - bounds.top) / bounds.height) * 100,
    });
  }

  function showFromCentroid(country: MapCountry) {
    setTooltip({
      label: country.isActive
        ? country.label
        : `${country.label} · Coming soon`,
      left: (country.x / WIDTH) * 100,
      top: (country.y / HEIGHT) * 100,
    });
  }

  return (
    <div className={styles.mapShell}>
      <div id="publishing-world-map" className={styles.mapCanvas}>
        <svg
          className={styles.mapSvg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby="publishing-map-title publishing-map-description"
        >
          <title id="publishing-map-title">Azalea Publishing markets</title>
          <desc id="publishing-map-description">
            A world map highlighting twelve countries where Azalea titles have
            sales and distribution.
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
            {countries.map((country) => (
              <path
                key={country.label}
                d={country.path}
                className={
                  country.isActive ? styles.mapCountryActive : styles.mapCountry
                }
                tabIndex={country.isActive ? 0 : undefined}
                role={country.isActive ? "img" : undefined}
                aria-label={
                  country.isActive
                    ? country.label
                    : `${country.label}, coming soon`
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

        {tooltip && (
          <div
            className={styles.mapTooltip}
            style={{ left: `${tooltip.left}%`, top: `${tooltip.top}%` }}
            role="status"
          >
            <span />
            {tooltip.label}
          </div>
        )}
      </div>

    </div>
  );
}
