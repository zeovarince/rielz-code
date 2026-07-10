/**
 * splashcursor.js — Vanilla JS Fluid Simulation Cursor
 *
 * Usage:
 *   initSplashCursor({
 *     canvas: '#splash-canvas',   // CSS selector atau HTMLCanvasElement
 *     color: '#8B5CF6',           // warna default (dipakai jika rainbow: false)
 *     rainbow: true,              // mode warna acak
 *     transparent: true,          // background transparan
 *   });
 *
 * Untuk stop / cleanup:
 *   const stop = initSplashCursor({ ... });
 *   stop(); // panggil ini kalau mau cleanup
 */

export function initSplashCursor({
  canvas: canvasTarget,
  SIM_RESOLUTION       = 128,
  DYE_RESOLUTION       = 1440,
  DENSITY_DISSIPATION  = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE             = 0.1,
  PRESSURE_ITERATIONS  = 20,
  CURL                 = 3,
  SPLAT_RADIUS         = 0.2,
  SPLAT_FORCE          = 6000,
  SHADING              = true,
  COLOR_UPDATE_SPEED   = 10,
  BACK_COLOR           = { r: 0, g: 0, b: 0 },
  TRANSPARENT          = true,
  rainbow: RAINBOW_MODE = true,
  color:   COLOR        = '#ff0000',
} = {}) {

  /* ── resolve canvas ─────────────────────────────────────────── */
  const canvas =
    canvasTarget instanceof HTMLCanvasElement
      ? canvasTarget
      : document.querySelector(canvasTarget);

  if (!canvas) {
    console.warn('[SplashCursor] canvas tidak ditemukan:', canvasTarget);
    return () => {};
  }

  /* Pastikan canvas full-screen dan di atas segalanya */
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100vw',
    height:        '100vh',
    pointerEvents: 'none',
    zIndex:        '9998',
    display:       'block',
  });

  let isActive = true;
  let rafId    = null;

  /* ── config ─────────────────────────────────────────────────── */
  const config = {
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
    RAINBOW_MODE,
    COLOR,
  };

  /* ── pointer ─────────────────────────────────────────────────── */
  function makePointer() {
    return {
      id: -1,
      texcoordX: 0, texcoordY: 0,
      prevTexcoordX: 0, prevTexcoordY: 0,
      deltaX: 0, deltaY: 0,
      down: false, moved: false,
      color: [0, 0, 0],
    };
  }
  const pointers = [makePointer()];

  /* ── WebGL context ───────────────────────────────────────────── */
  const { gl, ext } = getWebGLContext(canvas);
  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 256;
    config.SHADING        = false;
  }

  function getWebGLContext(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat, supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0, 0, 0, 1);
    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;

    let formatRGBA, formatRG, formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG   = getSupportedFormat(gl, gl.RG16F,   gl.RG,   halfFloatTexType);
      formatR    = getSupportedFormat(gl, gl.R16F,    gl.RED,  halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG   = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR    = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
  }

  function getSupportedFormat(gl, internalFormat, format, type) {
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      if (internalFormat === gl.R16F)  return getSupportedFormat(gl, gl.RG16F,   gl.RG,   type);
      if (internalFormat === gl.RG16F) return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      return null;
    }
    return { internalFormat, format };
  }

  function supportRenderTextureFormat(gl, internalFormat, format, type) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  /* ── Shader helpers ──────────────────────────────────────────── */
  function compileShader(type, source, keywords) {
    if (keywords) source = keywords.map(k => `#define ${k}`).join('\n') + '\n' + source;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.warn('[SplashCursor] Shader error:', gl.getShaderInfoLog(shader));
    return shader;
  }

  function createProgram(vs, fs) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.warn('[SplashCursor] Program link error:', gl.getProgramInfoLog(prog));
    return prog;
  }

  function getUniforms(prog) {
    const u = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(prog, i).name;
      u[name] = gl.getUniformLocation(prog, name);
    }
    return u;
  }

  function hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h;
  }

  class Material {
    constructor(vs, fsSource) {
      this.vs = vs; this.fsSource = fsSource;
      this.programs = {}; this.activeProgram = null; this.uniforms = {};
    }
    setKeywords(keywords) {
      const hash = keywords.reduce((h, k) => h + hashCode(k), 0);
      if (!this.programs[hash]) {
        const fs = compileShader(gl.FRAGMENT_SHADER, this.fsSource, keywords);
        this.programs[hash] = createProgram(this.vs, fs);
      }
      if (this.programs[hash] === this.activeProgram) return;
      this.activeProgram = this.programs[hash];
      this.uniforms = getUniforms(this.activeProgram);
    }
    bind() { gl.useProgram(this.activeProgram); }
  }

  class Program {
    constructor(vs, fs) {
      this.program  = createProgram(vs, fs);
      this.uniforms = getUniforms(this.program);
    }
    bind() { gl.useProgram(this.program); }
  }

  /* ── Shaders ─────────────────────────────────────────────────── */
  const baseVS = compileShader(gl.VERTEX_SHADER, `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `);

  const copyFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv; uniform sampler2D uTexture;
    void main () { gl_FragColor = texture2D(uTexture, vUv); }
  `);

  const clearFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
  `);

  const displayFSSource = `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uTexture; uniform vec2 texelSize;
    vec3 linearToGamma(vec3 c) { return max(1.055*pow(max(c,vec3(0)),vec3(0.41667))-.055,vec3(0)); }
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc=texture2D(uTexture,vL).rgb, rc=texture2D(uTexture,vR).rgb;
        vec3 tc=texture2D(uTexture,vT).rgb, bc=texture2D(uTexture,vB).rgb;
        float dx=length(rc)-length(lc), dy=length(tc)-length(bc);
        vec3 n=normalize(vec3(dx,dy,length(texelSize)));
        c *= clamp(dot(n,vec3(0,0,1))+0.7, 0.7, 1.0);
      #endif
      gl_FragColor = vec4(c, max(c.r,max(c.g,c.b)));
    }
  `;

  const splatFS = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv; uniform sampler2D uTarget;
    uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main () {
      vec2 p = vUv - point; p.x *= aspectRatio;
      vec3 splat = exp(-dot(p,p)/radius)*color;
      gl_FragColor = vec4(texture2D(uTarget,vUv).xyz + splat, 1.0);
    }
  `);

  const advectionFS = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv; uniform sampler2D uVelocity, uSource;
    uniform vec2 texelSize, dyeTexelSize; uniform float dt, dissipation;
    vec4 bilerp(sampler2D s, vec2 uv, vec2 ts) {
      vec2 st=uv/ts-.5, iuv=floor(st), fuv=fract(st);
      vec4 a=texture2D(s,(iuv+vec2(.5,.5))*ts), b=texture2D(s,(iuv+vec2(1.5,.5))*ts);
      vec4 c=texture2D(s,(iuv+vec2(.5,1.5))*ts), d=texture2D(s,(iuv+vec2(1.5,1.5))*ts);
      return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);
    }
    void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt*texture2D(uVelocity,vUv).xy*texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
      gl_FragColor = result / (1.0 + dissipation*dt);
    }
  `, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);

  const divergenceFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main () {
      float L=texture2D(uVelocity,vL).x, R=texture2D(uVelocity,vR).x;
      float T=texture2D(uVelocity,vT).y, B=texture2D(uVelocity,vB).y;
      vec2 C=texture2D(uVelocity,vUv).xy;
      if(vL.x<0.0)L=-C.x; if(vR.x>1.0)R=-C.x;
      if(vT.y>1.0)T=-C.y; if(vB.y<0.0)B=-C.y;
      gl_FragColor = vec4(0.5*(R-L+T-B), 0.0, 0.0, 1.0);
    }
  `);

  const curlFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main () {
      float L=texture2D(uVelocity,vL).y, R=texture2D(uVelocity,vR).y;
      float T=texture2D(uVelocity,vT).x, B=texture2D(uVelocity,vB).x;
      gl_FragColor = vec4(0.5*(R-L-T+B), 0.0, 0.0, 1.0);
    }
  `);

  const vorticityFS = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
    void main () {
      float L=texture2D(uCurl,vL).x, R=texture2D(uCurl,vR).x;
      float T=texture2D(uCurl,vT).x, B=texture2D(uCurl,vB).x;
      float C=texture2D(uCurl,vUv).x;
      vec2 force = 0.5*vec2(abs(T)-abs(B), abs(R)-abs(L));
      force = force/(length(force)+0.0001) * curl * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity,vUv).xy + force*dt;
      gl_FragColor = vec4(clamp(vel,-1000.0,1000.0), 0.0, 1.0);
    }
  `);

  const pressureFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure, uDivergence;
    void main () {
      float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x;
      float T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x;
      float div=texture2D(uDivergence,vUv).x;
      gl_FragColor = vec4((L+R+B+T-div)*0.25, 0.0, 0.0, 1.0);
    }
  `);

  const gradientFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure, uVelocity;
    void main () {
      float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x;
      float T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x;
      vec2 vel = texture2D(uVelocity,vUv).xy - vec2(R-L, T-B);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }
  `);

  /* ── Programs ────────────────────────────────────────────────── */
  const copyProg       = new Program(baseVS, copyFS);
  const clearProg      = new Program(baseVS, clearFS);
  const splatProg      = new Program(baseVS, splatFS);
  const advectionProg  = new Program(baseVS, advectionFS);
  const divergenceProg = new Program(baseVS, divergenceFS);
  const curlProg       = new Program(baseVS, curlFS);
  const vorticityProg  = new Program(baseVS, vorticityFS);
  const pressureProg   = new Program(baseVS, pressureFS);
  const gradientProg   = new Program(baseVS, gradientFS);
  const displayMat     = new Material(baseVS, displayFSSource);

  /* ── Blit quad ───────────────────────────────────────────────── */
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target, clear = false) {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    if (clear) { gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* ── FBO helpers ─────────────────────────────────────────────── */
  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture: tex, fbo,
      width: w, height: h,
      texelSizeX: 1/w, texelSizeY: 1/h,
      attach(id) { gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; },
    };
  }

  function createDoubleFBO(w, h, iF, f, t, p) {
    let a = createFBO(w, h, iF, f, t, p);
    let b = createFBO(w, h, iF, f, t, p);
    return {
      width: w, height: h,
      texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
      get read()  { return a; }, set read(v)  { a = v; },
      get write() { return b; }, set write(v) { b = v; },
      swap() { [a, b] = [b, a]; },
    };
  }

  function resizeFBO(target, w, h, iF, f, t, p) {
    const n = createFBO(w, h, iF, f, t, p);
    copyProg.bind();
    gl.uniform1i(copyProg.uniforms.uTexture, target.attach(0));
    blit(n);
    return n;
  }

  function resizeDoubleFBO(target, w, h, iF, f, t, p) {
    if (target.width === w && target.height === h) return target;
    target.read  = resizeFBO(target.read, w, h, iF, f, t, p);
    target.write = createFBO(w, h, iF, f, t, p);
    target.width = w; target.height = h;
    target.texelSizeX = 1/w; target.texelSizeY = 1/h;
    return target;
  }

  /* ── Init FBOs ───────────────────────────────────────────────── */
  let dye, velocity, divergence, curl, pressure;

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const { halfFloatTexType: tt, formatRGBA: rgba, formatRG: rg, formatR: r, supportLinearFiltering: lin } = ext;
    const filter = lin ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);

    dye      = dye
      ? resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, tt, filter)
      : createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, tt, filter);

    velocity = velocity
      ? resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, tt, filter)
      : createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, tt, filter);

    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, tt, gl.NEAREST);
    curl       = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, tt, gl.NEAREST);
    pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, tt, gl.NEAREST);
  }

  /* ── Helpers ─────────────────────────────────────────────────── */
  function getResolution(res) {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (ar < 1) ar = 1 / ar;
    const min = Math.round(res), max = Math.round(res * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  function scaleByPixelRatio(v) {
    return Math.floor(v * (window.devicePixelRatio || 1));
  }

  function HSVtoRGB(h, s, v) {
    const i = Math.floor(h * 6), f = h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
    const cases = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
    const [r,g,b] = cases[i%6];
    return { r, g, b };
  }

  function hexToRGB(hex) {
    let v = hex.replace('#','');
    if (v.length===3) v = v[0]+v[0]+v[1]+v[1]+v[2]+v[2];
    return {
      r: parseInt(v.slice(0,2),16)/255 * 0.15,
      g: parseInt(v.slice(2,4),16)/255 * 0.15,
      b: parseInt(v.slice(4,6),16)/255 * 0.15,
    };
  }

  function generateColor() {
    if (!config.RAINBOW_MODE) return hexToRGB(config.COLOR);
    const c = HSVtoRGB(Math.random(), 1, 1);
    return { r: c.r*0.15, g: c.g*0.15, b: c.b*0.15 };
  }

  function correctRadius(r) {
    const ar = canvas.width / canvas.height;
    return ar > 1 ? r * ar : r;
  }

  function correctDeltaX(d) {
    const ar = canvas.width / canvas.height;
    return ar < 1 ? d * ar : d;
  }

  function correctDeltaY(d) {
    const ar = canvas.width / canvas.height;
    return ar > 1 ? d / ar : d;
  }

  function wrap(v, min, max) {
    const r = max - min;
    return r === 0 ? min : ((v-min) % r) + min;
  }

  /* ── Pointer updates ─────────────────────────────────────────── */
  function updatePointerDown(p, id, posX, posY) {
    p.id = id; p.down = true; p.moved = false;
    p.texcoordX = posX / canvas.width;
    p.texcoordY = 1 - posY / canvas.height;
    p.prevTexcoordX = p.texcoordX;
    p.prevTexcoordY = p.texcoordY;
    p.deltaX = 0; p.deltaY = 0;
    p.color = generateColor();
  }

  function updatePointerMove(p, posX, posY, color) {
    p.prevTexcoordX = p.texcoordX;
    p.prevTexcoordY = p.texcoordY;
    p.texcoordX = posX / canvas.width;
    p.texcoordY = 1 - posY / canvas.height;
    p.deltaX = correctDeltaX(p.texcoordX - p.prevTexcoordX);
    p.deltaY = correctDeltaY(p.texcoordY - p.prevTexcoordY);
    p.moved  = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0;
    p.color  = color;
  }

  /* ── Splat ───────────────────────────────────────────────────── */
  function splat(x, y, dx, dy, color) {
    splatProg.bind();
    gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width/canvas.height);
    gl.uniform2f(splatProg.uniforms.point, x, y);
    gl.uniform3f(splatProg.uniforms.color, dx, dy, 0);
    gl.uniform1f(splatProg.uniforms.radius, correctRadius(config.SPLAT_RADIUS/100));
    blit(velocity.write); velocity.swap();

    gl.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProg.uniforms.color, color.r, color.g, color.b);
    blit(dye.write); dye.swap();
  }

  function splatPointer(p) {
    splat(p.texcoordX, p.texcoordY, p.deltaX*config.SPLAT_FORCE, p.deltaY*config.SPLAT_FORCE, p.color);
  }

  function clickSplat(p) {
    const c = generateColor();
    c.r *= 10; c.g *= 10; c.b *= 10;
    splat(p.texcoordX, p.texcoordY, 10*(Math.random()-.5), 30*(Math.random()-.5), c);
  }

  /* ── Simulation step ─────────────────────────────────────────── */
  function step(dt) {
    gl.disable(gl.BLEND);

    curlProg.bind();
    gl.uniform2f(curlProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProg.bind();
    gl.uniform2f(vorticityProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProg.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProg.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProg.uniforms.dt, dt);
    blit(velocity.write); velocity.swap();

    divergenceProg.bind();
    gl.uniform2f(divergenceProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProg.bind();
    gl.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProg.uniforms.value, config.PRESSURE);
    blit(pressure.write); pressure.swap();

    pressureProg.bind();
    gl.uniform2f(pressureProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProg.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    gradientProg.bind();
    gl.uniform2f(gradientProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradientProg.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradientProg.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    advectionProg.bind();
    gl.uniform2f(advectionProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProg.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    const velId = velocity.read.attach(0);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velId);
    gl.uniform1i(advectionProg.uniforms.uSource, velId);
    gl.uniform1f(advectionProg.uniforms.dt, dt);
    gl.uniform1f(advectionProg.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write); velocity.swap();

    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProg.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProg.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProg.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write); dye.swap();
  }

  function render(target) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    let w = target ? target.width  : gl.drawingBufferWidth;
    let h = target ? target.height : gl.drawingBufferHeight;
    displayMat.bind();
    if (config.SHADING) gl.uniform2f(displayMat.uniforms.texelSize, 1/w, 1/h);
    gl.uniform1i(displayMat.uniforms.uTexture, dye.read.attach(0));
    blit(target);
  }

  /* ── Resize canvas to match CSS size ────────────────────────── */
  function resizeCanvas() {
    const w = scaleByPixelRatio(canvas.clientWidth);
    const h = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      return true;
    }
    return false;
  }

  /* ── Animation loop ──────────────────────────────────────────── */
  let lastTime       = Date.now();
  let colorTimer     = 0;
  let firstMove      = false;

  function updateKeywords() {
    displayMat.setKeywords(config.SHADING ? ['SHADING'] : []);
  }

  updateKeywords();
  initFramebuffers();

  function frame() {
    if (!isActive) return;

    const now = Date.now();
    const dt  = Math.min((now - lastTime) / 1000, 0.016667);
    lastTime  = now;

    if (resizeCanvas()) initFramebuffers();

    // Color cycling
    colorTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorTimer >= 1) {
      colorTimer = wrap(colorTimer, 0, 1);
      pointers.forEach(p => { p.color = generateColor(); });
    }

    // Apply pointer inputs
    pointers.forEach(p => {
      if (p.moved) { p.moved = false; splatPointer(p); }
    });

    step(dt);
    render(null);

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  /* ── Event listeners ─────────────────────────────────────────── */
  function onMouseDown(e) {
    const p = pointers[0];
    updatePointerDown(p, -1, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY));
    clickSplat(p);
  }

  function onMouseMove(e) {
    const p = pointers[0];
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    const color = firstMove ? p.color : generateColor();
    firstMove = true;
    updatePointerMove(p, posX, posY, color);
  }

  function onTouchStart(e) {
    const p = pointers[0];
    for (const t of e.targetTouches)
      updatePointerDown(p, t.identifier, scaleByPixelRatio(t.clientX), scaleByPixelRatio(t.clientY));
  }

  function onTouchMove(e) {
    const p = pointers[0];
    for (const t of e.targetTouches)
      updatePointerMove(p, scaleByPixelRatio(t.clientX), scaleByPixelRatio(t.clientY), p.color);
  }

  function onTouchEnd(e) {
    pointers[0].down = false;
  }

  window.addEventListener('mousedown',  onMouseDown);
  window.addEventListener('mousemove',  onMouseMove);
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove',  onTouchMove, { passive: true });
  window.addEventListener('touchend',   onTouchEnd);

  /* ── Cleanup / stop function ─────────────────────────────────── */
  return function stop() {
    isActive = false;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('mousedown',  onMouseDown);
    window.removeEventListener('mousemove',  onMouseMove);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove',  onTouchMove);
    window.removeEventListener('touchend',   onTouchEnd);
  };
}