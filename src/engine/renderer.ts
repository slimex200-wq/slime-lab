/** WebGL POINTS 렌더러 (v8 이식). 컨텍스트 실패 시 gl=null — 폴백은 mount에서 처리. */
export interface PointRenderer {
  resize(): void;
  draw(
    pos: Float32Array, dep: Float32Array,
    col: Uint8Array /* mount의 동적 조명색 버퍼 — anatomy.col 아님 */,
    size: Float32Array, count: number,
  ): void;
  readonly dpr: number;
  readonly gl: WebGLRenderingContext | null;
}

const VSH = `attribute vec2 a_pos; attribute float a_dep; attribute vec3 a_col; attribute float a_sz;
uniform vec2 u_res; varying vec3 v_col;
void main(){ vec2 clip=(a_pos/u_res)*2.0-1.0;
  gl_Position=vec4(clip.x,-clip.y,a_dep,1.0); gl_PointSize=a_sz; v_col=a_col; }`;
const FSH = `precision mediump float; varying vec3 v_col;
void main(){ vec2 d=gl_PointCoord-vec2(.5); if(dot(d,d)>.25) discard;
  gl_FragColor=vec4(v_col,1.0); }`;

export function createPointRenderer(canvas: HTMLCanvasElement, maxPoints: number): PointRenderer {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 1.5);
  if (!gl) {
    return { resize() {}, draw() {}, dpr, gl: null };
  }

  function mk(type: number, src: string): WebGLShader {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      throw new Error(`shader compile: ${gl!.getShaderInfoLog(s)}`);
    }
    return s;
  }
  const prog = gl.createProgram()!;
  gl.attachShader(prog, mk(gl.VERTEX_SHADER, VSH));
  gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FSH));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);

  function attr(name: string, bytes: number, size: number, type: number, norm: boolean): WebGLBuffer {
    const b = gl!.createBuffer()!;
    gl!.bindBuffer(gl!.ARRAY_BUFFER, b);
    gl!.bufferData(gl!.ARRAY_BUFFER, bytes, gl!.DYNAMIC_DRAW);
    const loc = gl!.getAttribLocation(prog, name);
    gl!.enableVertexAttribArray(loc);
    gl!.vertexAttribPointer(loc, size, type, norm, 0, 0);
    return b;
  }
  const bPos = attr('a_pos', maxPoints * 2 * 4, 2, gl.FLOAT, false);
  const bDep = attr('a_dep', maxPoints * 4, 1, gl.FLOAT, false);
  const bCol = attr('a_col', maxPoints * 3, 3, gl.UNSIGNED_BYTE, true);
  const bSz = attr('a_sz', maxPoints * 4, 1, gl.FLOAT, false);
  const uRes = gl.getUniformLocation(prog, 'u_res');

  function resize() {
    canvas.width = Math.max(2, Math.round(innerWidth * dpr));
    canvas.height = Math.max(2, Math.round(innerHeight * dpr));
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();

  return {
    resize,
    dpr,
    gl,
    draw(pos, dep, col, size, count) {
      gl!.uniform2f(uRes, canvas.width, canvas.height);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, bPos); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, pos);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, bDep); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, dep);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, bCol); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, col);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, bSz); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, size);
      gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
      gl!.drawArrays(gl!.POINTS, 0, count);
    },
  };
}
