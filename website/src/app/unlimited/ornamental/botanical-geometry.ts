type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point, Point];

// Original, deterministic botanical geometry. No random values at hydration,
// raster decoration, copied artwork, or per-frame JavaScript is involved.
const curves: readonly Curve[] = [
  [
    [17, 202],
    [88, 168],
    [-22, 105],
    [49, 25],
  ],
  [
    [184, 201],
    [108, 164],
    [230, 115],
    [153, 24],
  ],
  [
    [16, 13],
    [30, 80],
    [97, -9],
    [113, 44],
  ],
  [
    [185, 13],
    [161, 78],
    [113, -11],
    [90, 52],
  ],
  [
    [18, 143],
    [78, 182],
    [3, 222],
    [97, 185],
  ],
  [
    [183, 143],
    [122, 182],
    [201, 220],
    [105, 188],
  ],
  [
    [21, 70],
    [97, 21],
    [58, 103],
    [103, 90],
  ],
  [
    [180, 80],
    [115, 37],
    [148, 130],
    [104, 115],
  ],
];

function pointOnCurve(curve: Curve, t: number) {
  const [a, b, c, d] = curve;
  const u = 1 - t;
  const x =
    u ** 3 * a[0] +
    3 * u ** 2 * t * b[0] +
    3 * u * t ** 2 * c[0] +
    t ** 3 * d[0];
  const y =
    u ** 3 * a[1] +
    3 * u ** 2 * t * b[1] +
    3 * u * t ** 2 * c[1] +
    t ** 3 * d[1];
  const dx =
    3 * u ** 2 * (b[0] - a[0]) +
    6 * u * t * (c[0] - b[0]) +
    3 * t ** 2 * (d[0] - c[0]);
  const dy =
    3 * u ** 2 * (b[1] - a[1]) +
    6 * u * t * (c[1] - b[1]) +
    3 * t ** 2 * (d[1] - c[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

export function createBotanicalOrnament() {
  return curves.map((curve, curveIndex) => ({
    path: `M${curve[0].join(" ")} C${curve[1].join(" ")} ${curve[2].join(" ")} ${curve[3].join(" ")}`,
    delay: curveIndex * 0.09,
    leaves: Array.from({ length: 9 }, (_, index) => {
      const t = (index + 0.7) / 10;
      const point = pointOnCurve(curve, t);
      const side = index % 2 === 0 ? 1 : -1;
      const length = 11 + ((index * 7 + curveIndex * 3) % 8);
      const width = 3.1 + ((index + curveIndex) % 3);
      return {
        x: Number(point.x.toFixed(2)),
        y: Number(point.y.toFixed(2)),
        angle: Number((point.angle + 90 + side * 58).toFixed(2)),
        path: `M0 0 C${-width} ${-length * 0.35} ${-width} ${-length * 0.8} 0 ${-length} C${width} ${-length * 0.8} ${width} ${-length * 0.35} 0 0Z`,
        vein: `M0 -1 L0 ${-length + 3}`,
        delay: Number((0.15 + curveIndex * 0.09 + t * 1.65).toFixed(2)),
      };
    }),
  }));
}

export const flowerCenters = [
  [49, 25],
  [153, 24],
  [113, 44],
  [90, 52],
  [97, 185],
  [105, 188],
  [103, 90],
  [104, 115],
] as const;
