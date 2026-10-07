// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PublicationsTabs from "@/app/publications/PublicationsTabs";

afterEach(cleanup);

function renderTabs() {
  render(
    <PublicationsTabs
      books={<a href="https://example.com/book">Book listing</a>}
      network={<p>Map and distribution partners</p>}
    />,
  );
  return {
    books: screen.getByRole("tab", { name: "Books" }),
    network: screen.getByRole("tab", { name: "Publication network" }),
  };
}

it("shows books by default and exposes only the active panel", () => {
  const { books, network } = renderTabs();
  expect(books.getAttribute("aria-selected")).toBe("true");
  expect(network.getAttribute("aria-selected")).toBe("false");
  expect(books.tabIndex).toBe(0);
  expect(network.tabIndex).toBe(-1);
  expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  expect(screen.getByRole("tabpanel", { name: "Books" }).textContent).toBe("Book listing");
});

it("switches panels on click and preserves the book list when switching back", () => {
  const { books, network } = renderTabs();
  const listing = screen.getByRole("link", { name: "Book listing" });
  fireEvent.click(network);
  expect(screen.getByRole("tabpanel", { name: "Publication network" }).textContent).toBe("Map and distribution partners");
  expect(screen.queryByRole("link", { name: "Book listing" })).toBeNull();
  expect(network.getAttribute("aria-selected")).toBe("true");
  fireEvent.click(books);
  expect(screen.getByRole("link", { name: "Book listing" })).toBe(listing);
});

it("supports arrow keys with wraparound, Home, and End while moving focus", () => {
  const { books, network } = renderTabs();
  books.focus();
  for (const [key, target] of [
    ["ArrowRight", network],
    ["ArrowRight", books],
    ["ArrowLeft", network],
    ["Home", books],
    ["End", network],
  ] as const) {
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(target);
    expect(target.getAttribute("aria-selected")).toBe("true");
  }
  fireEvent.keyDown(network, { key: "Tab" });
  expect(network.getAttribute("aria-selected")).toBe("true");
});

it("connects each tab to its labelled panel", () => {
  renderTabs();
  for (const tab of screen.getAllByRole("tab")) {
    const panel = document.getElementById(tab.getAttribute("aria-controls")!);
    expect(panel?.getAttribute("role")).toBe("tabpanel");
    expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
  }
});
