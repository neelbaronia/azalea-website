import {
  DEFAULT_DIAL_SETTINGS,
  clamp,
  modulo,
  resolvedDisplayFlow,
  type DialSettings,
} from "./dial-geometry";
import { ATLAS_COLUMNS, ATLAS_ROWS, SweepRenderer } from "./dial-renderer";

export { DEFAULT_DIAL_SETTINGS, type DialSettings } from "./dial-geometry";

const PALETTE = [
  "#282142",
  "#ffffff",
  "#3566ff",
  "#ffcf00",
  "#192aff",
  "#d62036",
  "#ec4978",
  "#ff9900",
  "#14101f",
  "#00dd33",
  "#00ef82",
] as const;

const LANGUAGES = [
  { label: "AZALEA LABS", colour: 0, ink: "#ffffff", logoSide: "left" },
  { label: "LABORATORIOS AZALEA", colour: 2, ink: "#ffffff", logoSide: "left" },
  { label: "阿泽利亚实验室", colour: 3, ink: "#10100f", logoSide: "left" },
  { label: "مختبرات أزاليا", colour: 5, ink: "#ffffff", logoSide: "right" },
  { label: "अज़ेलिया लैब्स", colour: 9, ink: "#10100f", logoSide: "left" },
  { label: "LABORATOIRES AZALEA", colour: 1, ink: "#10100f", logoSide: "left" },
  { label: "アザレア・ラボ", colour: 4, ink: "#ffffff", logoSide: "left" },
  { label: "아잘레아 랩스", colour: 6, ink: "#10100f", logoSide: "left" },
  { label: "ЛАБОРАТОРИЯ АЗАЛИЯ", colour: 8, ink: "#ffffff", logoSide: "left" },
  { label: "LABORATÓRIOS AZALEA", colour: 7, ink: "#10100f", logoSide: "left" },
  { label: "ΕΡΓΑΣΤΗΡΙΑ ΑΖΑΛΕΑ", colour: 10, ink: "#10100f", logoSide: "left" },
  { label: "מעבדות אזליה", colour: 2, ink: "#ffffff", logoSide: "left" },
  { label: "LABORATORI AZALEA", colour: 3, ink: "#10100f", logoSide: "left" },
  { label: "আজালিয়া ল্যাবস", colour: 5, ink: "#ffffff", logoSide: "left" },
  { label: "அசேலியா லேப்ஸ்", colour: 7, ink: "#10100f", logoSide: "left" },
  { label: "อาซาเลีย แล็บส์", colour: 8, ink: "#ffffff", logoSide: "left" },
  { label: "✌︎☪︎✌︎☹︎☜︎✌︎ ☹︎✌︎👌︎💧︎", colour: 10, ink: "#10100f", logoSide: "left" },
  { label: "AZALEA LABORE", colour: 1, ink: "#10100f", logoSide: "left" },
] as const;

const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MAX_CANVAS_PIXELS = 1_800_000;

export class ContinuousSweep {
  readonly ok: boolean = false;

  private canvas: HTMLCanvasElement;
  private renderer: SweepRenderer | null = null;
  private fallback: CanvasRenderingContext2D | null = null;
  private atlas: HTMLCanvasElement;
  private atlasContext!: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private raf = 0;
  private running = false;
  private disposed = false;
  private contextLost = false;
  private lastTime = 0;
  private elapsed = 0;
  private resolve = 0;
  private targetFlow: number | null = null;
  private logo!: HTMLImageElement;
  private settings: DialSettings = { ...DEFAULT_DIAL_SETTINGS };

  constructor(private host: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    this.atlas = document.createElement("canvas");
    const atlasContext = this.atlas.getContext("2d");
    if (!atlasContext) return;
    this.atlasContext = atlasContext;

    try {
      this.renderer = new SweepRenderer(this.canvas);
      host.dataset.dialRenderer = "webgl";
      this.canvas.addEventListener("webglcontextlost", this.onContextLost);
      this.canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    } catch {
      // A canvas that acquired WebGL cannot switch to a 2D context.
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("aria-hidden", "true");
      this.fallback = this.canvas.getContext("2d", { alpha: false });
      if (!this.fallback) return;
      host.dataset.dialRenderer = "static";
    }
    host.appendChild(this.canvas);

    this.logo = new Image();
    this.logo.onload = () => {
      if (!this.disposed) this.buildAtlas();
    };
    this.logo.src = "/azalea-icon.webp";
    this.ok = true;
    this.buildAtlas();
    this.measure();

    // Redraw text if a browser loads a script-specific fallback font later.
    void document.fonts?.ready.then(() => {
      if (!this.disposed) this.buildAtlas();
    });

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(host);
    }
  }

  private buildAtlas() {
    const tileWidth = this.renderer?.atlasTileWidth ?? 1024;
    const tileHeight = tileWidth / 4;
    this.atlas.width = tileWidth * ATLAS_COLUMNS;
    this.atlas.height = tileHeight * ATLAS_ROWS;
    const context = this.atlasContext;
    const fontFamily = 'Arial, "Noto Sans", "Noto Sans Arabic", sans-serif';

    LANGUAGES.forEach((language, index) => {
      const left = (index % ATLAS_COLUMNS) * tileWidth;
      const top = Math.floor(index / ATLAS_COLUMNS) * tileHeight;
      const scale = tileWidth / 1024;
      const baseSize = this.settings.typeScale * 1024;
      const logoSize = baseSize * 0.89;
      const logoGap = baseSize * 0.32;
      const inset = 58;
      const right = language.logoSide === "right";
      const logoLeft = right ? 1024 - inset - logoSize : inset;
      const textEdge = right ? logoLeft - logoGap : logoLeft + logoSize + logoGap;
      const maxTextWidth = right ? textEdge - inset : 1024 - inset - textEdge;

      context.save();
      context.translate(left, top);
      context.scale(scale, scale);
      context.beginPath();
      context.rect(0, 0, 1024, 256);
      context.clip();
      context.fillStyle = PALETTE[language.colour];
      context.fillRect(0, 0, 1024, 256);

      if (this.logo.complete && this.logo.naturalWidth) {
        const mask = document.createElement("canvas");
        mask.width = 256;
        mask.height = 256;
        const maskContext = mask.getContext("2d");
        if (maskContext) {
          maskContext.drawImage(this.logo, 0, 0, 256, 256);
          maskContext.globalCompositeOperation = "source-in";
          maskContext.fillStyle = language.ink;
          maskContext.fillRect(0, 0, 256, 256);
          context.drawImage(mask, logoLeft, (256 - logoSize) / 2, logoSize, logoSize);
        }
      }

      context.font = "800 " + baseSize + "px " + fontFamily;
      const measured = context.measureText(language.label).width;
      const fontSize = baseSize * Math.min(1, maxTextWidth / Math.max(1, measured));
      context.font = "800 " + fontSize + "px " + fontFamily;
      context.fillStyle = language.ink;
      context.textBaseline = "middle";
      context.textAlign = right ? "right" : "left";
      context.direction = right ? "rtl" : "ltr";
      context.fillText(language.label, textEdge, 132);
      context.restore();
    });

    if (!this.contextLost) this.renderer?.upload(this.atlas);
    this.draw();
  }

  private measure() {
    if (!this.ok || this.disposed) return;
    const bounds = this.host.getBoundingClientRect();
    const cssWidth = Math.max(1, bounds.width);
    const cssHeight = Math.max(1, bounds.height);
    const pixelBudgetRatio = Math.sqrt(MAX_CANVAS_PIXELS / (cssWidth * cssHeight));
    const dpr = Math.max(1, Math.min(
      MAX_DEVICE_PIXEL_RATIO,
      window.devicePixelRatio || 1,
      pixelBudgetRatio,
    ));
    const width = Math.max(1, Math.round(cssWidth * dpr));
    const height = Math.max(1, Math.round(cssHeight * dpr));
    if (width === this.width && height === this.height && dpr === this.dpr) return;

    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = width;
    this.canvas.height = height;
    this.draw();
  }

  private chooseTargetFlow() {
    return resolvedDisplayFlow(this.elapsed, this.settings, LANGUAGES.length);
  }

  private draw() {
    if (!this.ok || !this.width || this.disposed || this.contextLost) return;
    if (this.renderer) {
      this.renderer.draw(
        this.elapsed,
        this.settings,
        this.resolve,
        this.targetFlow ?? this.chooseTargetFlow(),
      );
      return;
    }

    // Graceful non-animated English lockup when GPU rendering is unavailable.
    const context = this.fallback;
    if (!context) return;
    context.fillStyle = PALETTE[0];
    context.fillRect(0, 0, this.width, this.height);
    const tileWidth = this.atlas.width / ATLAS_COLUMNS;
    const tileHeight = this.atlas.height / ATLAS_ROWS;
    const height = Math.min(this.height, this.width / 4);
    const width = height * 4;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      this.atlas, 0, 0, tileWidth, tileHeight,
      (this.width - width) / 2, (this.height - height) / 2, width, height,
    );
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const delta = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    if (this.resolve === 0) {
      // Wrap whole language cycles to keep shader precision stable on long visits.
      this.elapsed = modulo(this.elapsed + delta, this.settings.speed * LANGUAGES.length);
      this.draw();
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    this.host.dataset.dialRenderer = "restoring";
  };

  private onContextRestored = () => {
    if (this.disposed) return;
    this.renderer?.destroy();
    try {
      this.renderer = new SweepRenderer(this.canvas);
      this.contextLost = false;
      this.host.dataset.dialRenderer = "webgl";
      this.buildAtlas();
    } catch {
      this.stop();
      this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
      this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
      this.renderer = null;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.width = this.width;
      canvas.height = this.height;
      this.canvas.replaceWith(canvas);
      this.canvas = canvas;
      this.fallback = canvas.getContext("2d", { alpha: false });
      this.contextLost = false;
      this.host.dataset.dialRenderer = "static";
      this.draw();
    }
  };

  setResolve(value: number) {
    const next = clamp(value);
    if (next === this.resolve) return;
    if (next > 0 && this.resolve === 0) this.targetFlow = this.chooseTargetFlow();
    if (next === 0) this.targetFlow = null;
    this.resolve = next;
    this.draw();
  }

  setSettings(settings: DialSettings) {
    if (Object.entries(settings).every(
      ([key, value]) => this.settings[key as keyof DialSettings] === value,
    )) return;

    const rebuildAtlas = settings.typeScale !== this.settings.typeScale;
    this.settings = { ...settings };
    this.elapsed = modulo(this.elapsed, settings.speed * LANGUAGES.length);
    this.targetFlow = this.resolve > 0 ? this.chooseTargetFlow() : null;
    if (rebuildAtlas) this.buildAtlas();
    else this.draw();
  }

  start() {
    if (this.running || !this.ok || !this.renderer || this.disposed) return;
    this.running = true;
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  renderFinal() {
    if (!this.ok) return;
    this.targetFlow = this.chooseTargetFlow();
    this.resolve = 1;
    this.draw();
  }

  destroy() {
    this.disposed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.logo) this.logo.onload = null;
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.renderer?.destroy();
    this.renderer = null;
    this.canvas.remove();
    delete this.host.dataset.dialRenderer;
  }
}
