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
  CATALOG_MARKET_COUNTRY_COUNT,
  getCatalogPlatforms,
  LISTENER_FOOTPRINT,
  LISTENER_FOOTPRINT_PERIOD,
  SMALL_COUNTRY_MARKERS,
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
    const listenerStatus = country.isActive
      ? "active Spotify listener base"
      : `no recorded Spotify listeners in ${LISTENER_FOOTPRINT_PERIOD}`;
    const catalogStatus =
      country.catalogPlatforms.length === 2
        ? "catalog available on Apple Books and Spotify"
        : country.catalogPlatforms[0] === "apple"
          ? "catalog available on Apple Books"
          : country.catalogPlatforms[0] === "spotify"
            ? "catalog available on Spotify"
            : "no Apple Books or Spotify audiobook market listed";

    return {
      color: scope === "worldwide" ? "#9b8ac5" : country.color ?? "#14101f",
      label:
        scope === "worldwide"
          ? country.label
          : `${country.label} · ${listenerStatus} · ${catalogStatus}`,
      left,
      top,
    };
  }

  function isHighlighted(country: MapCountry) {
    return country.isActive || country.catalogPlatforms.length > 0;
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
          <div className={styles.mapLegendItems} role="list" aria-label="Map legend">
            <span className={styles.mapLegendItem} role="listitem">
              <span className={`${styles.mapLegendSwatch} ${styles.mapLegendListeners}`} />
              Active listener base · Spotify
            </span>
            <span className={styles.mapLegendItem} role="listitem">
              <span className={`${styles.mapLegendSwatch} ${styles.mapLegendCatalog}`} />
              Catalog available · Apple Books or Spotify ({CATALOG_MARKET_COUNTRY_COUNT} countries)
            </span>
            <span className={styles.mapLegendItem} role="listitem">
              <span className={`${styles.mapLegendSwatch} ${styles.mapLegendNeither}`} />
              Neither
            </span>
          </div>
          <p className={styles.mapLegendNote}>
            Catalog availability varies by title; hatching shows supported store markets, not confirmed listings.
          </p>
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
              : "Azalea listener and audiobook catalog footprint"}
          </title>
          <desc id="publishing-map-description">
            {scope === "worldwide"
              ? "A world map illustrating worldwide distribution settings. Availability varies by title, store, and country. This is not a map of confirmed live listings."
              : `A world map with colored countries showing Spotify listener activity in ${LISTENER_FOOTPRINT.length} countries during ${LISTENER_FOOTPRINT_PERIOD}; hatching marks ${CATALOG_MARKET_COUNTRY_COUNT} unique Apple Books or Spotify audiobook markets. Clear countries have neither recorded listener activity nor a listed audiobook market. Individual title availability may vary.`}
          </desc>

          <defs>
            <pattern
              id="map-catalog-available"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(35)"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="#262431" strokeWidth="2.5" />
            </pattern>
          </defs>

          <g className={styles.mapCountries}>
            {countries
              ?.filter((country) => country.path)
              .map((country) => {
                const base = (
                  <path
                    d={country.path}
                    className={
                      scope === "worldwide"
                        ? styles.mapCountryWorldwide
                        : country.isActive
                          ? styles.mapCountryActive
                          : styles.mapCountry
                    }
                    style={
                      scope === "markets" && country.color
                        ? ({ "--market-color": country.color } as CSSProperties)
                        : undefined
                    }
                    tabIndex={
                      scope === "markets" && isHighlighted(country) ? 0 : undefined
                    }
                    role={
                      scope === "markets" && isHighlighted(country)
                        ? "img"
                        : undefined
                    }
                    aria-label={tooltipFor(country, 0, 0).label}
                    onMouseEnter={(event: MouseEvent<SVGPathElement>) =>
                      showFromPointer(country, event.clientX, event.clientY)
                    }
                    onMouseMove={(event: MouseEvent<SVGPathElement>) =>
                      showFromPointer(country, event.clientX, event.clientY)
                    }
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={() => isHighlighted(country) && showFromCentroid(country)}
                    onBlur={() => setTooltip(null)}
                    onPointerDown={(event: PointerEvent<SVGPathElement>) =>
                      showFromPointer(country, event.clientX, event.clientY)
                    }
                  />
                );
                const catalogOverlay =
                  scope === "markets" && country.catalogPlatforms.length > 0 ? (
                    <path
                      d={country.path}
                      className={styles.mapCountryCatalogOverlay}
                      aria-hidden="true"
                    />
                  ) : null;

                return (
                  <g key={country.label}>
                    {base}
                    {catalogOverlay}
                  </g>
                );
              })}
            {scope === "markets"
              ? countries
                  ?.filter((country) => !country.path)
                  .map((country) => {
                    const base = (
                      <circle
                        cx={country.x}
                        cy={country.y}
                        r={5}
                        className={
                          country.isActive
                            ? styles.mapCountryActive
                            : styles.mapCountry
                        }
                        style={
                          country.color
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
                        onFocus={() =>
                          isHighlighted(country) && showFromCentroid(country)
                        }
                        onBlur={() => setTooltip(null)}
                        onPointerDown={(event) =>
                          showFromPointer(country, event.clientX, event.clientY)
                        }
                      />
                    );
                    const catalogOverlay =
                      country.catalogPlatforms.length > 0 ? (
                        <circle
                          cx={country.x}
                          cy={country.y}
                          r={5}
                          className={styles.mapCountryCatalogOverlay}
                          aria-hidden="true"
                        />
                      ) : null;

                    return (
                      <g key={country.label}>
                        {base}
                        {catalogOverlay}
                      </g>
                    );
                  })
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
