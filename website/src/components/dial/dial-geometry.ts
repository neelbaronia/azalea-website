export type DialSettings = {
  speed: number;
  tiles: number;
  perspective: number;
  topPerspective: number;
  bottomPerspective: number;
  offset: number;
  typeScale: number;
};

export const DEFAULT_DIAL_SETTINGS: DialSettings = {
  speed: 0.8,
  tiles: 21,
  perspective: 1.4,
  topPerspective: 8.5,
  bottomPerspective: 8.5,
  offset: 0.08,
  typeScale: 0.11,
};

export const CYCLE_HOLD = 0.1;
const MAX_WAVE_LAG = 0.36;
const ACCELERATION_PHASE = 0.38;

export function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function smoothstep(value: number) {
  const position = clamp(value);
  return position * position * (3 - 2 * position);
}

export function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function inertialStep(progress: number) {
  const position = clamp(progress);
  if (position <= ACCELERATION_PHASE) {
    return (position * position) / ACCELERATION_PHASE;
  }

  const momentum = position - ACCELERATION_PHASE;
  return (
    ACCELERATION_PHASE +
    2 * momentum -
    (momentum * momentum) / (1 - ACCELERATION_PHASE)
  );
}

export function sweepLag(settings: DialSettings) {
  return clamp(settings.offset * 4.5, 0, MAX_WAVE_LAG);
}

export function letterScale(settings: DialSettings, aspect: number) {
  const perspective = (settings.topPerspective + settings.bottomPerspective) / 2;
  return Math.max(1, (4 * perspective) / settings.tiles / Math.max(0.001, aspect));
}

// Evaluate the lag at the actual horizontal position, never at a column index.
export function displayFlow(
  elapsed: number,
  settings: DialSettings,
  x = 0,
) {
  const clock = elapsed / settings.speed;
  const cycle = Math.floor(clock);
  const phase = clock - cycle;
  const lag = sweepLag(settings);
  const profile = Math.pow(clamp(x), 1 / settings.perspective);
  const duration = Math.max(0.08, 1 - CYCLE_HOLD * 2 - lag);
  const progress = (phase - CYCLE_HOLD - profile * lag) / duration;
  return 1 - cycle - inertialStep(progress);
}

export function resolvedDisplayFlow(
  elapsed: number,
  settings: DialSettings,
  languageCount: number,
) {
  const center = settings.tiles / 2;
  const approximateId = center - displayFlow(elapsed, settings) - 0.5;
  const englishId = Math.round(approximateId / languageCount) * languageCount;
  return center - englishId - 0.5;
}

