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

export type DialSettings = {
  speed: number;
  cols: number;
  tiles: number;
  perspective: number;
  topPerspective: number;
  bottomPerspective: number;
  offset: number;
  typeScale: number;
};

export const DEFAULT_DIAL_SETTINGS: DialSettings = {
  speed: 0.8,
  cols: 10,
  tiles: 21,
  perspective: 1.4,
  topPerspective: 8.5,
  bottomPerspective: 8.5,
  offset: 0.08,
  typeScale: 0.11,
};

const BLEED = 0.012;
const CYCLE_HOLD = 0.1;
const MAX_WAVE_LAG = 0.36;
const ACCELERATION_PHASE = 0.38;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function inertialStep(progress: number): number {
  const value = clamp(progress);
  if (value <= ACCELERATION_PHASE) {
    return (value * value) / ACCELERATION_PHASE;
  }

  const decelerationPhase = 1 - ACCELERATION_PHASE;
  const momentum = value - ACCELERATION_PHASE;
  return (
    ACCELERATION_PHASE +
    2 * momentum -
    (momentum * momentum) / decelerationPhase
  );
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export class Datamosh {
  readonly ok: boolean = false;

  private host: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private raf = 0;
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private resolve = 0;
  private targetFlow: number | null = null;
  private edges: number[] = [];
  private logo: HTMLImageElement;
  private logoReady = false;
  private logoMasks = new Map<string, HTMLCanvasElement>();
  private settings: DialSettings = { ...DEFAULT_DIAL_SETTINGS };

  constructor(host: HTMLElement) {
    this.host = host;
    this.logo = new Image();
    this.logo.onload = () => {
      this.logoReady = true;
      this.logoMasks.clear();
      if (!this.running) this.draw();
    };
    this.logo.src = "/azalea-icon.webp";
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    host.appendChild(this.canvas);

    const context = this.canvas.getContext("2d", { alpha: false });
    if (!context) return;
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;
    this.ok = true;
    this.measure();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.measure();
        if (!this.running) this.draw();
      });
      this.resizeObserver.observe(host);
    }
  }

  private measure() {
    const bounds = this.host.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.max(1, Math.round(bounds.width * this.dpr));
    this.height = Math.max(1, Math.round(bounds.height * this.dpr));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx.imageSmoothingEnabled = false;

    const columns = this.columnCount();
    this.edges = [];
    for (let index = 0; index <= columns; index += 1) {
      this.edges.push(
        Math.round(
          this.width * Math.pow(index / columns, this.settings.perspective),
        ),
      );
    }
  }

  private columnCount() {
    const cssWidth = this.width / this.dpr;
    return cssWidth <= 520
      ? Math.min(this.settings.cols, 5)
      : this.settings.cols;
  }

  private tileEdge(distance: number): number {
    const position = distance / this.settings.tiles;
    if (position < 0) return position * 0.05;
    if (position > 1) return 1 + (position - 1) * 0.05;

    const rise = Math.pow(2 * position, this.settings.topPerspective);
    const fall = Math.pow(2 * (1 - position), this.settings.bottomPerspective);
    return rise / (rise + fall);
  }

  private liveFlow(column = 0) {
    const raw = this.elapsed / this.settings.speed;
    const cycle = Math.floor(raw);
    const phase = raw - cycle;
    const finalColumn = Math.max(1, this.columnCount() - 1);
    const directionIndex = column;
    const totalLag = Math.min(
      MAX_WAVE_LAG,
      this.settings.offset * finalColumn * 0.5,
    );
    const columnLag = (directionIndex / finalColumn) * totalLag;
    const movementDuration = Math.max(0.08, 1 - CYCLE_HOLD * 2 - totalLag);
    const localProgress = (phase - CYCLE_HOLD - columnLag) / movementDuration;

    return 0.5 - cycle - inertialStep(localProgress);
  }

  private chooseTargetFlow() {
    const live = this.liveFlow(0);
    const centerTile = (this.settings.tiles - 1) / 2;
    const approximateId = centerTile - live - 0.5;
    const englishId =
      Math.round(approximateId / LANGUAGES.length) * LANGUAGES.length;
    return centerTile - englishId - 0.5;
  }

  private tintedLogo(ink: string) {
    const cached = this.logoMasks.get(ink);
    if (cached) return cached;

    const mask = document.createElement("canvas");
    mask.width = 256;
    mask.height = 256;
    const context = mask.getContext("2d");
    if (!context) return null;

    context.drawImage(this.logo, 0, 0, mask.width, mask.height);
    context.globalCompositeOperation = "source-in";
    context.fillStyle = ink;
    context.fillRect(0, 0, mask.width, mask.height);
    this.logoMasks.set(ink, mask);
    return mask;
  }

  private drawLabel(
    label: string,
    ink: string,
    logoSide: "left" | "right",
    left: number,
    width: number,
    top: number,
    height: number,
  ) {
    const { ctx } = this;
    const baseSize = Math.min(
      this.width * this.settings.typeScale,
      this.height * this.settings.typeScale * 1.35,
    );
    const family = 'Arial, "Noto Sans", "Noto Sans Arabic", sans-serif';

    const middle = top + height / 2;
    const verticalPosition = clamp(middle / this.height);
    const distanceFromCentre = Math.abs(verticalPosition - 0.5) * 2;
    const edgePerspective =
      verticalPosition < 0.5
        ? this.settings.topPerspective
        : this.settings.bottomPerspective;
    const edgeScale = clamp(1 / edgePerspective, 0.06, 0.55);
    const faceScale =
      edgeScale +
      (1 - edgeScale) * Math.cos((distanceFromCentre * Math.PI) / 2);
    const projectedScale = Math.min(
      faceScale,
      Math.max(0.04, height / (baseSize * 1.08)),
    );

    if (baseSize * projectedScale < this.dpr * 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, width, height);
    ctx.clip();
    ctx.fillStyle = ink;
    ctx.textAlign = logoSide === "right" ? "right" : "left";
    ctx.direction = logoSide === "right" ? "rtl" : "ltr";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${baseSize}px ${family}`;

    const lockupLeft = this.width * 0.06;
    const rightInset = this.width * 0.06;
    const logoSize = baseSize * 0.82;
    const logoGap = baseSize * 0.3;
    const logoLeft =
      logoSide === "right" ? this.width - rightInset - logoSize : lockupLeft;
    const textEdge =
      logoSide === "right" ? logoLeft - logoGap : logoLeft + logoSize + logoGap;
    const maxTextWidth =
      logoSide === "right"
        ? textEdge - lockupLeft
        : this.width - textEdge - rightInset;
    let fontSize = baseSize;
    const textWidth = ctx.measureText(label).width;
    if (textWidth > maxTextWidth) {
      fontSize *= maxTextWidth / textWidth;
    }

    ctx.font = `800 ${fontSize}px ${family}`;
    ctx.translate(0, middle);
    ctx.scale(1, projectedScale);

    if (this.logoReady) {
      const mask = this.tintedLogo(ink);
      if (mask) {
        ctx.drawImage(mask, logoLeft, -logoSize / 2, logoSize, logoSize);
      }
    }

    ctx.fillText(label, textEdge, 0);
    ctx.restore();
  }

  private draw() {
    const { ctx, height, edges } = this;
    const columns = this.columnCount();
    const resolved = smoothstep(this.resolve);
    const target = this.targetFlow ?? this.chooseTargetFlow();
    ctx.fillStyle = PALETTE[8];
    ctx.fillRect(0, 0, this.width, height);

    for (let column = 0; column < columns; column += 1) {
      const left = edges[column];
      const columnWidth = edges[column + 1] - left;
      if (columnWidth <= 0) continue;

      const live = this.liveFlow(column);
      const flow = live + (target - live) * resolved;
      const displayFlow = flow + 0.5;
      const bleed = Math.round(BLEED * height);
      const base = -Math.floor(displayFlow);

      for (let tile = this.settings.tiles + 2; tile >= -2; tile -= 1) {
        const id = base + tile;
        const distance = id + displayFlow;
        const top = Math.round(this.tileEdge(distance) * height);
        const bottom = Math.round(this.tileEdge(distance + 1) * height) + bleed;

        if (bottom <= top || bottom <= 0 || top >= height) continue;

        const y = Math.max(0, top);
        const tileHeight = Math.min(height, bottom) - y;
        if (tileHeight <= 0) continue;

        const language = LANGUAGES[modulo(id, LANGUAGES.length)];
        ctx.fillStyle = PALETTE[language.colour];
        ctx.fillRect(left, y, columnWidth, tileHeight);
        this.drawLabel(
          language.label,
          language.ink,
          language.logoSide,
          left,
          columnWidth,
          top,
          bottom - top,
        );
      }
    }
  }

  private tick = (now: number) => {
    if (!this.running) return;

    const delta = this.lastTime
      ? Math.min(0.05, (now - this.lastTime) / 1000)
      : 0;
    this.lastTime = now;
    if (this.resolve === 0) this.elapsed += delta;
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  setResolve(value: number) {
    const next = Math.max(0, Math.min(1, value));
    if (next > 0 && this.resolve === 0)
      this.targetFlow = this.chooseTargetFlow();
    if (next === 0) this.targetFlow = null;
    this.resolve = next;
    if (!this.running) this.draw();
  }

  setSettings(settings: DialSettings) {
    this.settings = { ...settings };
    this.targetFlow = this.resolve > 0 ? this.chooseTargetFlow() : null;
    this.measure();
    if (!this.running) this.draw();
  }

  start() {
    if (this.running || !this.ok) return;
    this.running = true;
    this.lastTime = 0;
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
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.logo.onload = null;
    this.logoMasks.clear();
    this.canvas.remove();
  }
}
