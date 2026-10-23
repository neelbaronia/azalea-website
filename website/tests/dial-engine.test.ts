// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContinuousSweep } from "@/components/dial/dial-engine";

const renderer = vi.hoisted(() => ({
  initialize: vi.fn(), upload: vi.fn(), draw: vi.fn(), destroy: vi.fn(),
}));

vi.mock("@/components/dial/dial-renderer", () => ({
  ATLAS_COLUMNS: 3,
  ATLAS_ROWS: 6,
  SweepRenderer: class {
    atlasTileWidth = 1024;
    constructor() { renderer.initialize(); }
    upload = renderer.upload;
    draw = renderer.draw;
    destroy = renderer.destroy;
  },
}));

const engines: ContinuousSweep[] = [];
const context = {
  save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn(),
  beginPath: vi.fn(), rect: vi.fn(), clip: vi.fn(), fillRect: vi.fn(),
  drawImage: vi.fn(), fillText: vi.fn(), measureText: vi.fn(() => ({ width: 500 })),
};

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  vi.spyOn(host, "getBoundingClientRect").mockReturnValue({ width: 1200, height: 600 } as DOMRect);
  const engine = new ContinuousSweep(host);
  engines.push(engine);
  return { host, engine };
}

beforeEach(() => {
  vi.clearAllMocks();
  renderer.initialize.mockReset();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  engines.splice(0).forEach((engine) => engine.destroy());
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("Continuous sweep lifecycle", () => {
  it("uploads the multilingual artwork once, not on every frame", () => {
    const { host, engine } = mount();
    expect(engine.ok).toBe(true);
    expect(host.dataset.dialRenderer).toBe("webgl");
    expect(renderer.upload).toHaveBeenCalledTimes(1);
    engine.setResolve(0.25);
    engine.setResolve(0.5);
    expect(renderer.upload).toHaveBeenCalledTimes(1);
    expect(renderer.draw).toHaveBeenLastCalledWith(0, expect.anything(), 0.5, -8);
  });

  it("draws a final English lockup without starting animation", () => {
    const { engine } = mount();
    engine.renderFinal();
    expect(renderer.draw).toHaveBeenLastCalledWith(0, expect.anything(), 1, -8);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("uses a static lockup instead of a broken animation without WebGL", () => {
    renderer.initialize.mockImplementation(() => { throw new Error("No WebGL"); });
    const { host, engine } = mount();
    expect(engine.ok).toBe(true);
    expect(host.dataset.dialRenderer).toBe("static");
    expect(context.drawImage).toHaveBeenCalled();
    engine.start();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("restores the artwork and current scroll state after GPU context loss", () => {
    const { host, engine } = mount();
    engine.setResolve(0.5);
    const canvas = host.querySelector("canvas")!;
    const event = new Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(host.dataset.dialRenderer).toBe("restoring");
    const calls = renderer.draw.mock.calls.length;
    engine.setResolve(0.75);
    expect(renderer.draw).toHaveBeenCalledTimes(calls);
    canvas.dispatchEvent(new Event("webglcontextrestored"));
    expect(host.dataset.dialRenderer).toBe("webgl");
    expect(renderer.upload).toHaveBeenCalledTimes(2);
    expect(renderer.draw).toHaveBeenLastCalledWith(0, expect.anything(), 0.75, -8);
  });

  it("releases animation and GPU resources when unmounted", () => {
    const { host, engine } = mount();
    engine.start();
    engine.destroy();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(renderer.destroy).toHaveBeenCalledTimes(1);
    expect(host.querySelector("canvas")).toBeNull();
    expect(host.dataset.dialRenderer).toBeUndefined();
  });
});
