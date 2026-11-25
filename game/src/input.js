// input.js — keyboard and mouse input. The canvas owns one Input object; the
// game loop drains its click queue once per frame and reads held keys.
export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.clicks = [];
    this.mouse = { x: -1, y: -1 };
    this.keys = new Set();
    this.pressed = new Set();
    canvas.addEventListener('mousemove', (e) => {
      const p = this.toGame(e);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
    });
    canvas.addEventListener('click', (e) => {
      const p = this.toGame(e);
      this.clicks.push(p);
    });
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  // Convert a pointer event to 1280x800 game coordinates.
  toGame(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 800,
    };
  }

  takeClicks() {
    const out = this.clicks;
    this.clicks = [];
    return out;
  }

  takePressed() {
    const out = this.pressed;
    this.pressed = new Set();
    return out;
  }
}
