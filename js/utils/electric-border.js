/**
 * electric-border.js
 * Konversi ElectricBorder (ReactBits) → Vanilla JS
 *
 * Usage:
 *   import { ElectricBorder } from './electric-border.js';
 *   const eb = new ElectricBorder(element, { color: '#a855f7' });
 *   eb.start();
 *   eb.destroy(); // cleanup
 */

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const int = parseInt(h, 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
}

export class ElectricBorder {
  constructor(container, options = {}) {
    this.container    = container;
    this.color        = options.color        ?? '#a855f7';
    this.speed        = options.speed        ?? 1;
    this.chaos        = options.chaos        ?? 0.12;
    this.borderRadius = options.borderRadius ?? 16;

    this.animRef       = null;
    this.time          = 0;
    this.lastFrameTime = 0;
    this.width         = 0;
    this.height        = 0;
    this.lastDpr       = 1;
    this.canvas        = null;
    this.ctx           = null;
    this.wrapper       = null;
    this.resizeObs     = null;

    this.OCTAVES      = 10;
    this.LACUNARITY   = 1.6;
    this.GAIN         = 0.7;
    this.FREQUENCY    = 10;
    this.BASE_FLAT    = 0;
    this.DISPLACEMENT = 60;
    this.BORDER_OFF   = 60;

    this._build();
  }

  _build() {
    const c = this.container;
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    c.style.overflow = 'visible';

    this.wrapper = document.createElement('div');
    Object.assign(this.wrapper.style, {
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none', zIndex: '2',
    });

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.wrapper.appendChild(this.canvas);
    c.appendChild(this.wrapper);

    const makeGlow = (blur, opacity = 1) => {
      const d = document.createElement('div');
      Object.assign(d.style, {
        position: 'absolute', inset: '0',
        borderRadius: 'inherit', pointerEvents: 'none',
        border: `2px solid ${hexToRgba(this.color, opacity)}`,
        filter: `blur(${blur}px)`, zIndex: '0',
      });
      return d;
    };

    const glow3 = document.createElement('div');
    Object.assign(glow3.style, {
      position: 'absolute', inset: '0', borderRadius: 'inherit',
      pointerEvents: 'none', zIndex: '-1',
      transform: 'scale(1.1)', opacity: '0.3', filter: 'blur(32px)',
      background: `linear-gradient(-30deg, ${this.color}, transparent, ${this.color})`,
    });

    const glowWrap = document.createElement('div');
    Object.assign(glowWrap.style, {
      position: 'absolute', inset: '0', borderRadius: 'inherit',
      pointerEvents: 'none', zIndex: '0',
    });
    glowWrap.appendChild(makeGlow(1, 0.6));
    glowWrap.appendChild(makeGlow(4, 1));
    glowWrap.appendChild(glow3);
    c.appendChild(glowWrap);

    this.ctx = this.canvas.getContext('2d');
  }

  _updateSize() {
    const rect   = this.container.getBoundingClientRect();
    const off    = this.BORDER_OFF;
    const width  = rect.width  + off * 2;
    const height = rect.height + off * 2;
    const dpr    = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width        = width  * dpr;
    this.canvas.height       = height * dpr;
    this.canvas.style.width  = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.width  = width;
    this.height = height;
  }

  _random(x) {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }

  _noise2D(x, y) {
    const i = Math.floor(x), j = Math.floor(y);
    const fx = x - i, fy = y - j;
    const a  = this._random(i +     j * 57);
    const b  = this._random(i + 1 + j * 57);
    const cc = this._random(i +     (j + 1) * 57);
    const d  = this._random(i + 1 + (j + 1) * 57);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    return a*(1-ux)*(1-uy) + b*ux*(1-uy) + cc*(1-ux)*uy + d*ux*uy;
  }

  _octavedNoise(x, time, seed) {
    let y = 0, amplitude = this.chaos, frequency = this.FREQUENCY;
    for (let i = 0; i < this.OCTAVES; i++) {
      let oct = amplitude;
      if (i === 0) oct *= this.BASE_FLAT;
      y += oct * this._noise2D(frequency * x + seed * 100, time * frequency * 0.3);
      frequency *= this.LACUNARITY;
      amplitude *= this.GAIN;
    }
    return y;
  }

  _getCornerPoint(cx, cy, radius, startAngle, arcLength, progress) {
    const angle = startAngle + progress * arcLength;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  _getRoundedRectPoint(t, left, top, width, height, radius) {
    const sw  = width - 2 * radius, sh = height - 2 * radius;
    const arc = (Math.PI * radius) / 2;
    const tot = 2 * sw + 2 * sh + 4 * arc;
    const d   = t * tot;
    let acc   = 0;

    if (d <= acc + sw) return { x: left + radius + (d - acc) / sw * sw, y: top };
    acc += sw;
    if (d <= acc + arc) return this._getCornerPoint(left + width - radius, top + radius, radius, -Math.PI/2, Math.PI/2, (d-acc)/arc);
    acc += arc;
    if (d <= acc + sh)  return { x: left + width, y: top + radius + (d-acc)/sh*sh };
    acc += sh;
    if (d <= acc + arc) return this._getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI/2, (d-acc)/arc);
    acc += arc;
    if (d <= acc + sw)  return { x: left + width - radius - (d-acc)/sw*sw, y: top + height };
    acc += sw;
    if (d <= acc + arc) return this._getCornerPoint(left + radius, top + height - radius, radius, Math.PI/2, Math.PI/2, (d-acc)/arc);
    acc += arc;
    if (d <= acc + sh)  return { x: left, y: top + height - radius - (d-acc)/sh*sh };
    acc += sh;
    return this._getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI/2, (d-acc)/arc);
  }

  _draw(currentTime) {
    if (!this.canvas || !this.ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (dpr !== this.lastDpr) { this.lastDpr = dpr; this._updateSize(); }

    const delta        = (currentTime - this.lastFrameTime) / 1000;
    this.time         += delta * this.speed;
    this.lastFrameTime = currentTime;

    const { ctx, width, height } = this;
    const off = this.BORDER_OFF;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 1;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    const left      = off, top_ = off;
    const bw        = width - 2 * off, bh = height - 2 * off;
    const radius    = Math.min(this.borderRadius, Math.min(bw, bh) / 2);
    const perimeter = 2 * (bw + bh) + 2 * Math.PI * radius;
    const samples   = Math.floor(perimeter / 2);
    const scale     = this.DISPLACEMENT;

    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const p  = i / samples;
      const pt = this._getRoundedRectPoint(p, left, top_, bw, bh, radius);
      const dx = pt.x + this._octavedNoise(p * 8, this.time, 0) * scale;
      const dy = pt.y + this._octavedNoise(p * 8, this.time, 1) * scale;
      i === 0 ? ctx.moveTo(dx, dy) : ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.stroke();

    this.animRef = requestAnimationFrame(t => this._draw(t));
  }

  start() {
    this._updateSize();
    this.resizeObs = new ResizeObserver(() => this._updateSize());
    this.resizeObs.observe(this.container);
    this.lastFrameTime = performance.now();
    this.animRef = requestAnimationFrame(t => this._draw(t));
  }

  destroy() {
    if (this.animRef)   cancelAnimationFrame(this.animRef);
    if (this.resizeObs) this.resizeObs.disconnect();
    if (this.wrapper)   this.wrapper.remove();
  }
}