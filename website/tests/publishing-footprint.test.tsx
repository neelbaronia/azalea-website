// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import worldData from "world-atlas/countries-50m.json";
import FullWorldMap from "@/components/publishing/FullWorldMap";
import WorldMap from "@/app/publishing/WorldMap";
import {
  CATALOG_MARKET_COUNTRY_COUNT,
  LISTENER_FOOTPRINT,
  LISTENER_FOOTPRINT_PERIOD,
  SMALL_COUNTRY_MARKERS,
} from "@/components/publishing/markets";

afterEach(cleanup);

const historicalCountries = [
  "United States of America",
  "United Kingdom",
  "Canada",
  "Ireland",
  "Australia",
  "Germany",
  "New Zealand",
  "Belgium",
  "Denmark",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Austria",
  "Finland",
  "France",
  "Monaco",
];
const addedCountries = [
  "Norway",
  "Poland",
  "Mexico",
  "Brazil",
  "Spain",
  "Chile",
  "Colombia",
];

it("keeps the all-time footprint and adds the seven countries in October's report", () => {
  const names = LISTENER_FOOTPRINT.map(({ name }) => name);
  expect(new Set(names).size).toBe(23);
  expect([...names].sort()).toEqual(
    [...historicalCountries, ...addedCountries].sort(),
  );
  expect(LISTENER_FOOTPRINT_PERIOD).toBe("November 2025–October 2026");
  expect(CATALOG_MARKET_COUNTRY_COUNT).toBe(28);
});

it("can draw every active country as an atlas shape or microstate marker", () => {
  const drawable = new Set([
    ...worldData.objects.countries.geometries.map(
      ({ properties }) => properties.name,
    ),
    ...SMALL_COUNTRY_MARKERS.map(({ name }) => name),
  ]);
  for (const country of LISTENER_FOOTPRINT) {
    expect(drawable.has(country.name), country.name).toBe(true);
    expect(country.color).toMatch(/^#[\da-f]{6}$/i);
  }
});

it.each([
  ["home and publications", FullWorldMap],
  ["publishing", WorldMap],
] as const)(
  "renders all 23 active countries on the %s map with country-only hovers",
  async (_name, Map) => {
    const view = render(<Map />);
    await waitFor(() => {
      for (const country of LISTENER_FOOTPRINT) {
        // Tiny countries can have both an atlas shape and a visibility marker.
        for (const shape of screen.getAllByLabelText(country.label)) {
          expect(shape.getAttribute("class")).toContain("mapCountryActive");
          expect(shape.getAttribute("style")).toContain(country.color);
        }
      }
    });
    const active = Array.from(
      view.container.querySelectorAll("path, circle"),
    ).filter((shape) =>
      shape.getAttribute("class")?.includes("mapCountryActive"),
    );
    expect(
      new Set(active.map((shape) => shape.getAttribute("aria-label"))).size,
    ).toBe(23);
    expect(view.container.querySelector("desc")?.textContent).toContain(
      "23 countries during November 2025–October 2026",
    );

    for (const name of addedCountries) {
      const shape = screen.getByLabelText(name);
      fireEvent.focus(shape);
      expect(screen.getByRole("status").textContent).toBe(name);
      fireEvent.blur(shape);
      expect(screen.queryByRole("status")).toBeNull();
    }
  },
);
