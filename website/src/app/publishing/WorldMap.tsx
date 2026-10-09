"use client";

import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldData from "world-atlas/countries-50m.json";
import {
  APPLE_BOOKS_AUDIOBOOK_MARKETS,
  CATALOG_MARKET_COUNTS,
  CATALOG_MARKET_COUNTRY_COUNT,
  getCatalogPlatforms,
  LISTENER_FOOTPRINT,
  LISTENER_FOOTPRINT_PERIOD,
  SMALL_COUNTRY_MARKERS,
  SPOTIFY_AUDIOBOOK_MARKETS,
} from "@/components/publishing/markets";
import styles from "./publishing.module.css";

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
  catalogPlatforms: ReturnType<typeof getCatalogPlatforms>;
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
  const [view, setView] = useState<"listeners" | "catalog">("listeners");
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

    const countryShapes = visibleCountries
      .map((country) => {
        const path = makePath(country);
        if (!path) return null;

        const name = country.properties.name;
        const [x, y] = makePath.centroid(country);
        const footprint = FOOTPRINT_BY_COUNTRY.get(name);

        return {
          catalogPlatforms: getCatalogPlatforms(name),
          isActive: footprint !== undefined,
          label: name === "United States of America" ? "United States" : name,
          path,
          x,
          y,
        };
      })
      .filter((country): country is MapCountry => country !== null);

    const smallCountries = SMALL_COUNTRY_MARKERS.flatMap(
      ({ name, coordinates }): MapCountry[] => {
        const point = projection(coordinates);
        if (!point) return [];

        return [
          {
            catalogPlatforms: getCatalogPlatforms(name),
            isActive: FOOTPRINT_BY_COUNTRY.has(name),
            label: name,
            path: "",
            x: point[0],
            y: point[1],
          },
        ];
      },
    );

    return [...countryShapes, ...smallCountries];
  }, []);

  function tooltipLabel(country: MapCountry) {
    if (view === "listeners") {
      return country.isActive
        ? `${country.label} · Spotify listeners`
        : `${country.label} · No listeners in ${LISTENER_FOOTPRINT_PERIOD}`;
    }

    if (country.catalogPlatforms.length === 2) {
      return `${country.label} · Apple Books + Spotify audiobook markets`;
    }
    if (country.catalogPlatforms[0] === "apple") {
      return `${country.label} · Apple Books audiobook market`;
    }
    if (country.catalogPlatforms[0] === "spotify") {
      return `${country.label} · Spotify audiobook market`;
    }
    return `${country.label} · No Apple Books or Spotify audiobook market listed`;
  }

  function countryClassName(country: MapCountry) {
    if (view === "listeners") {
      return country.isActive ? styles.mapCountryActive : styles.mapCountry;
    }
    if (country.catalogPlatforms.length === 2) return styles.mapCountryBoth;
    if (country.catalogPlatforms[0] === "apple") return styles.mapCountryApple;
    if (country.catalogPlatforms[0] === "spotify") return styles.mapCountrySpotify;
    return styles.mapCountry;
  }

  function isHighlighted(country: MapCountry) {
    return view === "listeners"
      ? country.isActive
      : country.catalogPlatforms.length > 0;
  }

  function showFromPointer(country: MapCountry, clientX: number, clientY: number) {
    const element = document.getElementById("publishing-world-map");
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    setTooltip({
      label: tooltipLabel(country),
      left: ((clientX - bounds.left) / bounds.width) * 100,
      top: ((clientY - bounds.top) / bounds.height) * 100,
    });
  }

  function showFromCentroid(country: MapCountry) {
    setTooltip({
      label: tooltipLabel(country),
      left: (country.x / WIDTH) * 100,
      top: (country.y / HEIGHT) * 100,
    });
  }

  return (
    <div className={styles.mapShell}>
      <div className={styles.mapToolbar}>
        <div className={styles.mapViewToggle} role="group" aria-label="Map view">
          <button
            className={styles.mapViewButton}
            type="button"
            aria-pressed={view === "listeners"}
            onClick={() => setView("listeners")}
          >
            Listener activity
          </button>
          <button
            className={styles.mapViewButton}
            type="button"
            aria-pressed={view === "catalog"}
            onClick={() => setView("catalog")}
          >
            Catalog markets
          </button>
        </div>
        {view === "listeners" ? (
          <p className={styles.mapLegend}>
            <span className={`${styles.mapLegendSwatch} ${styles.mapLegendListeners}`} />
            Listener activity · {LISTENER_FOOTPRINT_PERIOD}
          </p>
        ) : (
          <div className={styles.mapCatalogLegend}>
            <p className={styles.mapLegendTitle}>
              Supported audiobook markets · {CATALOG_MARKET_COUNTRY_COUNT} countries
            </p>
            <div className={styles.mapLegendItems}>
              <span className={styles.mapLegendItem}>
                <span className={`${styles.mapLegendSwatch} ${styles.mapLegendApple}`} />
                Apple Books ({CATALOG_MARKET_COUNTS.appleBooks})
              </span>
              <span className={styles.mapLegendItem}>
                <span className={`${styles.mapLegendSwatch} ${styles.mapLegendSpotify}`} />
                Spotify ({CATALOG_MARKET_COUNTS.spotify})
              </span>
              <span className={styles.mapLegendItem}>
                <span className={`${styles.mapLegendSwatch} ${styles.mapLegendBoth}`} />
                Both ({CATALOG_MARKET_COUNTS.both})
              </span>
            </div>
            <p className={styles.mapLegendNote}>
              Store markets only—not confirmation that a specific title is listed there.
            </p>
          </div>
        )}
      </div>
      <div id="publishing-world-map" className={styles.mapCanvas}>
        <svg
          className={styles.mapSvg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby="publishing-map-title publishing-map-description"
        >
          <title id="publishing-map-title">
            {view === "listeners"
              ? `Azalea listener footprint — ${LISTENER_FOOTPRINT_PERIOD}`
              : `Apple Books and Spotify audiobook markets — ${CATALOG_MARKET_COUNTRY_COUNT} countries`}
          </title>
          <desc id="publishing-map-description">
            {view === "listeners"
              ? `A world map highlighting the ${LISTENER_FOOTPRINT.length} countries with Spotify listener activity across the available analytics history, ${LISTENER_FOOTPRINT_PERIOD}.`
              : `A world map showing ${APPLE_BOOKS_AUDIOBOOK_MARKETS.size} Apple Books audiobook markets and ${SPOTIFY_AUDIOBOOK_MARKETS.size} Spotify audiobook markets, with ${CATALOG_MARKET_COUNTRY_COUNT} unique countries between them. Individual title availability may vary.`}
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
            <pattern
              id="map-catalog-both"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(35)"
            >
              <rect width="8" height="8" fill="#a8d7c4" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#9b87d5" strokeWidth="4" />
            </pattern>
          </defs>

          <g className={styles.mapCountries}>
            {countries.map((country) => {
              const commonProps = {
                className: countryClassName(country),
                tabIndex: isHighlighted(country) ? 0 : undefined,
                role: isHighlighted(country) ? ("img" as const) : undefined,
                "aria-label": tooltipLabel(country),
                onMouseEnter: (event: { clientX: number; clientY: number }) =>
                  showFromPointer(country, event.clientX, event.clientY),
                onMouseMove: (event: { clientX: number; clientY: number }) =>
                  showFromPointer(country, event.clientX, event.clientY),
                onMouseLeave: () => setTooltip(null),
                onFocus: () => isHighlighted(country) && showFromCentroid(country),
                onBlur: () => setTooltip(null),
                onPointerDown: (event: { clientX: number; clientY: number }) =>
                  showFromPointer(country, event.clientX, event.clientY),
              };

              return country.path ? (
                <path key={country.label} d={country.path} {...commonProps} />
              ) : (
                <circle
                  key={country.label}
                  cx={country.x}
                  cy={country.y}
                  r={5}
                  {...commonProps}
                />
              );
            })}
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
