// main.js — entry point: game loop, input routing, sound cues and screenshot
// mode. Loads after the canvas exists; nothing here draws, that is render.js.
import { BIN_ORDER, CANVAS_H, CANVAS_W, RESTART_BTN, SERVE_BTN, START_BTN, STATION_RECTS, TRASH_BTN, binRect, grillSlotRect } from './config.js';
import { Input, pointInRect } from './input.js';
import { SoundBank } from './audio.js';
import { buildShotWorld, parseShot } from './shots.js';
import { render } from './render.js';
import {
  clearPlate, clickBin, clickBoard, clickGrillSlot, createWorld, serve,
  startGame, update,
} from './world.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const sounds = new SoundBank();
const input = new Input(canvas);
const shot = parseShot();
const world = shot ? buildShotWorld(shot.shot, shot.seed) : createWorld(1);
world.hover = input.mouse;
// Exposed for play-testing from the console: window.__dapur.world.
window.__dapur = { world };

function playEvents() {
  const names = world.events.splice(0, world.events.length);
  for (const name of names) {
    if (name === 'chop') sounds.chop();
    else if (name === 'pickup') sounds.pickup();
    else if (name === 'grill') sounds.grillOn();
    else if (name === 'ding') sounds.ding();
    else if (name === 'coin') sounds.coin();
    else if (name === 'buzz') sounds.buzz();
    else if (name === 'burn') sounds.burn();
    else if (name === 'click') sounds.click();
    else if (name === 'start') sounds.start();
    else if (name === 'over') sounds.over();
  }
}

function handleClick(p) {
  sounds.ensure();
  if (world.phase === 'title') {
    if (pointInRect(p.x, p.y, START_BTN)) {
      startGame(world);
      world.events.push('start');
    }
    return;
  }
  if (world.phase === 'over') {
    if (pointInRect(p.x, p.y, RESTART_BTN)) {
      startGame(world);
      world.events.push('start');
    }
    return;
  }
  if (world.phase === 'paused') return;
  // Ingredient bins.
  for (let i = 0; i < BIN_ORDER.length; i++) {
    if (pointInRect(p.x, p.y, binRect(i))) {
      clickBin(world, BIN_ORDER[i]);
      return;
    }
  }
  // Chopping board.
  if (pointInRect(p.x, p.y, STATION_RECTS.board)) {
    clickBoard(world);
    return;
  }
  // Grill slots.
  for (let i = 0; i < 2; i++) {
    if (pointInRect(p.x, p.y, grillSlotRect(i))) {
      clickGrillSlot(world, i);
      return;
    }
  }
  // Serve and trash.
  if (pointInRect(p.x, p.y, SERVE_BTN)) {
    serve(world);
    return;
  }
  if (pointInRect(p.x, p.y, TRASH_BTN)) {
    clearPlate(world);
  }
}

function handleKeys(pressed) {
  for (const code of pressed) {
    if (code === 'Enter') {
      if (world.phase === 'title' || world.phase === 'over') {
        startGame(world);
        world.events.push('start');
      }
    } else if (code === 'KeyM') {
      world.muted = !world.muted;
      sounds.muted = world.muted;
    } else if (code === 'KeyP') {
      if (world.phase === 'playing') world.phase = 'paused';
      else if (world.phase === 'paused') world.phase = 'playing';
    } else if (world.phase === 'playing') {
      if (code === 'KeyS') serve(world);
      else if (code === 'KeyX') clearPlate(world);
      else if (code === 'KeyC') clickBoard(world);
      else if (code.startsWith('Digit')) {
        const n = Number(code.slice(5));
        if (n >= 1 && n <= BIN_ORDER.length) clickBin(world, BIN_ORDER[n - 1]);
      }
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) {
    for (const p of input.takeClicks()) handleClick(p);
    handleKeys(input.takePressed());
    update(world, dt);
    playEvents();
  } else {
    // Screenshot mode: frozen state, no input, no timers.
    input.takeClicks();
    input.takePressed();
  }
  render(ctx, world);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
