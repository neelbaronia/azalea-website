import {
  CYCLE_HOLD,
  letterScale,
  smoothstep,
  sweepLag,
  type DialSettings,
} from "./dial-geometry";

export const ATLAS_COLUMNS = 3;
export const ATLAS_ROWS = 6;

const VERTEX_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = vec2((aPosition.x + 1.0) * 0.5, (1.0 - aPosition.y) * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision PRECISION float;
varying vec2 vUv;
uniform sampler2D uAtlas;
uniform float uTime;
uniform float uSpeed;
uniform float uLag;
uniform float uPerspective;
uniform float uTopPerspective;
uniform float uBottomPerspective;
uniform float uTiles;
uniform float uTarget;
uniform float uResolve;
uniform float uLetterScale;

float easeStep(float p) {
  p = clamp(p, 0.0, 1.0);
  if (p <= 0.38) return p * p / 0.38;
  float momentum = p - 0.38;
  return 0.38 + 2.0 * momentum - momentum * momentum / 0.62;
}

float inverseTileEdge(float y) {
  y = clamp(y, 0.00001, 0.99999);
  if (abs(uTopPerspective - uBottomPerspective) < 0.001) {
    return 1.0 / (1.0 + exp(-log(y / (1.0 - y)) / uTopPerspective));
  }

  // The tuner also supports independently curved top and bottom faces.
  float low = 0.0;
  float high = 1.0;
  for (int i = 0; i < 14; i++) {
    float middle = (low + high) * 0.5;
    float rise = pow(2.0 * middle, uTopPerspective);
    float fall = pow(2.0 * (1.0 - middle), uBottomPerspective);
    if (rise / (rise + fall) < y) low = middle;
    else high = middle;
  }
  return (low + high) * 0.5;
}

vec4 rowSample(float id, float y) {
  id = mod(mod(id, 18.0) + 18.0, 18.0);
  float column = mod(id, 3.0);
  float row = floor(id / 3.0);
  float textureY = (y - 0.5) * uLetterScale + 0.5;
  return texture2D(uAtlas, vec2(
    (column + clamp(vUv.x, 0.001, 0.999)) / 3.0,
    (row + clamp(textureY, 0.002, 0.998)) / 6.0
  ));
}

void main() {
  float clock = uTime / uSpeed;
  float profile = pow(vUv.x, 1.0 / uPerspective);
  float duration = max(0.08, 1.0 - ${CYCLE_HOLD * 2} - uLag);
  float progress = (fract(clock) - ${CYCLE_HOLD} - profile * uLag) / duration;
  float live = 1.0 - floor(clock) - easeStep(progress);
  float flow = mix(live, uTarget, uResolve);
  float material = inverseTileEdge(vUv.y) * uTiles - flow;
  float id = floor(material);
  float fraction = fract(material);
  float aa = AA_WIDTH;
  vec4 colour = rowSample(id, fraction);
  if (fraction < aa) {
    colour = mix(rowSample(id - 1.0, 0.998), colour, smoothstep(-aa, aa, fraction));
  }
  if (fraction > 1.0 - aa) {
    colour = mix(colour, rowSample(id + 1.0, 0.002), smoothstep(1.0 - aa, 1.0 + aa, fraction));
  }
  gl_FragColor = colour;
}
`;

type UniformName =
  | "uAtlas"
  | "uTime"
  | "uSpeed"
  | "uLag"
  | "uPerspective"
  | "uTopPerspective"
  | "uBottomPerspective"
  | "uTiles"
  | "uTarget"
  | "uResolve"
  | "uLetterScale";

const UNIFORM_NAMES: UniformName[] = [
  "uAtlas", "uTime", "uSpeed", "uLag", "uPerspective",
  "uTopPerspective", "uBottomPerspective", "uTiles", "uTarget", "uResolve", "uLetterScale",
];

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create sweep shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile sweep shader");
  }
  return shader;
}

export class SweepRenderer {
  readonly atlasTileWidth: number;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private texture: WebGLTexture | null = null;
  private uniforms = new Map<UniformName, WebGLUniformLocation | null>();

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) throw new Error("WebGL is unavailable");
    this.gl = gl;
    this.atlasTileWidth = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096 ? 1024 : 512;

    try {
      this.initialize();
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  private initialize() {
    const gl = this.gl;
    const derivatives = gl.getExtension("OES_standard_derivatives");
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    let source = FRAGMENT_SOURCE.replace("PRECISION", precision?.precision ? "highp" : "mediump");
    source = source.replace(
      "AA_WIDTH",
      derivatives ? "max(0.001, min(0.08, fwidth(material) * 0.65))" : "0.006",
    );
    if (derivatives) source = "#extension GL_OES_standard_derivatives : enable\n" + source;

    const program = gl.createProgram();
    if (!program) throw new Error("Unable to create sweep program");
    this.program = program;
    const shaders: WebGLShader[] = [];
    try {
      shaders.push(compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE));
      shaders.push(compileShader(gl, gl.FRAGMENT_SHADER, source));
      shaders.forEach((shader) => gl.attachShader(program, shader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "Unable to link sweep program");
      }
    } finally {
      shaders.forEach((shader) => gl.deleteShader(shader));
    }

    gl.useProgram(program);
    this.buffer = gl.createBuffer();
    this.texture = gl.createTexture();
    if (!this.buffer || !this.texture) throw new Error("Unable to allocate sweep resources");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    UNIFORM_NAMES.forEach((name) => this.uniforms.set(name, gl.getUniformLocation(program, name)));
  }

  upload(atlas: HTMLCanvasElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  }

  draw(elapsed: number, settings: DialSettings, resolve: number, target: number) {
    const gl = this.gl;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(this.program);
    gl.uniform1i(this.uniforms.get("uAtlas")!, 0);
    const values: Partial<Record<UniformName, number>> = {
      uTime: elapsed,
      uSpeed: settings.speed,
      uLag: sweepLag(settings),
      uPerspective: settings.perspective,
      uTopPerspective: settings.topPerspective,
      uBottomPerspective: settings.bottomPerspective,
      uTiles: settings.tiles,
      uTarget: target,
      uResolve: smoothstep(resolve),
      // Keep letter/logo proportions natural in a tall mobile hero. The
      // colored bands still follow the full continuous perspective surface.
      uLetterScale: letterScale(settings, gl.drawingBufferWidth / gl.drawingBufferHeight),
    };
    Object.entries(values).forEach(([key, value]) => {
      gl.uniform1f(this.uniforms.get(key as UniformName)!, value);
    });
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  destroy() {
    const gl = this.gl;
    if (this.buffer) gl.deleteBuffer(this.buffer);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.program) gl.deleteProgram(this.program);
    this.buffer = null;
    this.texture = null;
    this.program = null;
    this.uniforms.clear();
  }
}
