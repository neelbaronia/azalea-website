"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldData from "world-atlas/countries-50m.json";
import {
  CATALOG_MARKET_COUNTRY_COUNT,
  getCatalogPlatforms,
  LISTENER_FOOTPRINT,
  LISTENER_FOOTPRINT_PERIOD,
  SMALL_COUNTRY_MARKERS,
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
  color: string | null;
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

    const countryShapes = visibleCountries
      .map((country): MapCountry | null => {
        const path = makePath(country);
        if (!path) return null;

        const name = country.properties.name;
        const [x, y] = makePath.centroid(country);
        const footprint = FOOTPRINT_BY_COUNTRY.get(name);

        return {
          catalogPlatforms: getCatalogPlatforms(name),
          color: footprint?.color ?? null,
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
            color: FOOTPRINT_BY_COUNTRY.get(name)?.color ?? null,
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
    const listenerStatus = country.isActive
      ? "active readers and listeners"
      : `no recorded readers or listeners in ${LISTENER_FOOTPRINT_PERIOD}`;
    const catalogStatus = country.catalogPlatforms.length
      ? "catalog available"
      : "no catalog availability listed";

    return `${country.label} · ${listenerStatus} · ${catalogStatus}`;
  }

  function isHighlighted(country: MapCountry) {
    return country.isActive || country.catalogPlatforms.length > 0;
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
        <div className={styles.mapLegendItems} role="list" aria-label="Map legend">
          <span className={styles.mapLegendItem} role="listitem">
            <span className={`${styles.mapLegendSwatch} ${styles.mapLegendListeners}`} />
            Active Readers &amp; Listeners
          </span>
          <span className={styles.mapLegendItem} role="listitem">
            <span className={`${styles.mapLegendSwatch} ${styles.mapLegendCatalog}`} />
            Catalog Available
          </span>
        </div>
      </div>
      <div id="publishing-world-map" className={styles.mapCanvas}>
        <svg
          className={styles.mapSvg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby="publishing-map-title publishing-map-description"
        >
          <title id="publishing-map-title">Azalea listener and audiobook catalog footprint</title>
          <desc id="publishing-map-description">
            {`A world map showing active readers and listeners in ${LISTENER_FOOTPRINT.length} countries during ${LISTENER_FOOTPRINT_PERIOD}; translucent color marks catalog availability across ${CATALOG_MARKET_COUNTRY_COUNT} countries. Clear countries have neither recorded audience activity nor listed catalog availability.`}
          </desc>

          <g className={styles.mapCountries}>
            {countries.map((country) => {
              const commonProps = {
                className: country.isActive
                  ? styles.mapCountryActive
                  : styles.mapCountry,
                style: country.color
                  ? ({ "--market-color": country.color } as CSSProperties)
                  : undefined,
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

              const base = country.path ? (
                <path d={country.path} {...commonProps} />
              ) : (
                <circle cx={country.x} cy={country.y} r={5} {...commonProps} />
              );
              const catalogOverlay = country.catalogPlatforms.length > 0 ? (
                country.path ? (
                  <path
                    d={country.path}
                    className={styles.mapCountryCatalogOverlay}
                    aria-hidden="true"
                  />
                ) : (
                  <circle
                    cx={country.x}
                    cy={country.y}
                    r={5}
                    className={styles.mapCountryCatalogOverlay}
                    aria-hidden="true"
                  />
                )
              ) : null;

              return (
                <g key={country.label}>
                  {base}
                  {catalogOverlay}
                </g>
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
