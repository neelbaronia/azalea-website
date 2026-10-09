"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  APPLE_BOOKS_AUDIOBOOK_MARKETS,
  CATALOG_MARKET_COUNTS,
  CATALOG_MARKET_COUNTRY_COUNT,
  getCatalogPlatforms,
  LISTENER_FOOTPRINT,
  LISTENER_FOOTPRINT_PERIOD,
  SMALL_COUNTRY_MARKERS,
  SPOTIFY_AUDIOBOOK_MARKETS,
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
  catalogPlatforms: ReturnType<typeof getCatalogPlatforms>;
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
  const [view, setView] = useState<"listeners" | "catalog">("listeners");
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
          import("world-atlas/countries-50m.json"),
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
              catalogPlatforms: getCatalogPlatforms(name),
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

      const smallCountries = SMALL_COUNTRY_MARKERS.flatMap(
        ({ name, coordinates }): MapCountry[] => {
          const point = projection(coordinates);
          if (!point) return [];

          const footprint = FOOTPRINT_BY_COUNTRY.get(name);
          return [
            {
              catalogPlatforms: getCatalogPlatforms(name),
              color: footprint?.color ?? null,
              isActive: footprint !== undefined,
              label: name,
              path: "",
              x: point[0],
              y: point[1],
            },
          ];
        },
      );

      if (!cancelled) setCountries([...nextCountries, ...smallCountries]);
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
    const catalogLabel =
      country.catalogPlatforms.length === 2
        ? "Apple Books + Spotify audiobook markets"
        : country.catalogPlatforms[0] === "apple"
          ? "Apple Books audiobook market"
          : country.catalogPlatforms[0] === "spotify"
            ? "Spotify audiobook market"
            : "No Apple Books or Spotify audiobook market listed";
    const catalogColor =
      country.catalogPlatforms.length === 2
        ? "#9b87d5"
        : country.catalogPlatforms[0] === "apple"
          ? "#a8d7c4"
          : country.catalogPlatforms[0] === "spotify"
            ? "#c3b5ed"
            : "#14101f";

    return {
      color:
        scope === "worldwide"
          ? "#9b8ac5"
          : view === "catalog"
            ? catalogColor
            : country.color ?? "#14101f",
      label:
        scope === "worldwide"
          ? country.label
          : view === "catalog"
            ? `${country.label} · ${catalogLabel}`
            : country.isActive
              ? `${country.label} · Spotify listeners`
              : `${country.label} · No listeners in ${LISTENER_FOOTPRINT_PERIOD}`,
      left,
      top,
    };
  }

  function isHighlighted(country: MapCountry) {
    return view === "listeners"
      ? country.isActive
      : country.catalogPlatforms.length > 0;
  }

  function catalogClassName(country: MapCountry) {
    if (country.catalogPlatforms.length === 2) return styles.mapCountryBoth;
    if (country.catalogPlatforms[0] === "apple") return styles.mapCountryApple;
    if (country.catalogPlatforms[0] === "spotify") return styles.mapCountrySpotify;
    return styles.mapCountry;
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
      {scope === "markets" ? (
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
      ) : null}
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
              : view === "catalog"
                ? `Apple Books and Spotify audiobook markets — ${CATALOG_MARKET_COUNTRY_COUNT} countries`
                : `Azalea listener footprint — ${LISTENER_FOOTPRINT_PERIOD}`}
          </title>
          <desc id="publishing-map-description">
            {scope === "worldwide"
              ? "A world map illustrating worldwide distribution settings. Availability varies by title, store, and country. This is not a map of confirmed live listings."
              : view === "catalog"
                ? `A world map showing ${APPLE_BOOKS_AUDIOBOOK_MARKETS.size} Apple Books audiobook markets and ${SPOTIFY_AUDIOBOOK_MARKETS.size} Spotify audiobook markets, with ${CATALOG_MARKET_COUNTRY_COUNT} unique countries between them. Individual title availability may vary.`
                : `A world map highlighting the ${LISTENER_FOOTPRINT.length} countries with Spotify listener activity across the available analytics history, ${LISTENER_FOOTPRINT_PERIOD}.`}
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
            {countries
              ?.filter((country) => country.path)
              .map((country) => {
                const commonProps = {
                  className:
                    scope === "worldwide"
                      ? styles.mapCountryWorldwide
                      : view === "catalog"
                        ? catalogClassName(country)
                        : country.isActive
                          ? styles.mapCountryActive
                          : styles.mapCountry,
                  style:
                    scope === "markets" && view === "listeners" && country.color
                      ? ({ "--market-color": country.color } as CSSProperties)
                      : undefined,
                  tabIndex:
                    scope === "markets" && isHighlighted(country) ? 0 : undefined,
                  role:
                    scope === "markets" && isHighlighted(country)
                      ? ("img" as const)
                      : undefined,
                  "aria-label": tooltipFor(country, 0, 0).label,
                  onMouseEnter: (event: MouseEvent<SVGElement>) =>
                    showFromPointer(country, event.clientX, event.clientY),
                  onMouseMove: (event: MouseEvent<SVGElement>) =>
                    showFromPointer(country, event.clientX, event.clientY),
                  onMouseLeave: () => setTooltip(null),
                  onFocus: () => isHighlighted(country) && showFromCentroid(country),
                  onBlur: () => setTooltip(null),
                  onPointerDown: (event: PointerEvent<SVGElement>) =>
                    showFromPointer(country, event.clientX, event.clientY),
                };

                return <path key={country.label} d={country.path} {...commonProps} />;
              })}
            {scope === "markets"
              ? countries
                  ?.filter((country) => !country.path)
                  .map((country) => (
                    <circle
                      key={country.label}
                      cx={country.x}
                      cy={country.y}
                      r={5}
                      className={
                        view === "catalog"
                          ? catalogClassName(country)
                          : country.isActive
                            ? styles.mapCountryActive
                            : styles.mapCountry
                      }
                      style={
                        view === "listeners" && country.color
                          ? ({ "--market-color": country.color } as CSSProperties)
                          : undefined
                      }
                      tabIndex={isHighlighted(country) ? 0 : undefined}
                      role={isHighlighted(country) ? "img" : undefined}
                      aria-label={tooltipFor(country, 0, 0).label}
                      onMouseEnter={(event) =>
                        showFromPointer(country, event.clientX, event.clientY)
                      }
                      onMouseMove={(event) =>
                        showFromPointer(country, event.clientX, event.clientY)
                      }
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={() => isHighlighted(country) && showFromCentroid(country)}
                      onBlur={() => setTooltip(null)}
                      onPointerDown={(event) =>
                        showFromPointer(country, event.clientX, event.clientY)
                      }
                    />
                  ))
              : null}
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
