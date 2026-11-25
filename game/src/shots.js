// shots.js — deterministic states for the screenshots (?shot=start|play|end).
// Each build returns a world frozen at one readable moment: the cover (play)
// shows the whole game at once — order board, ingredients, a dish mid-assembly,
// the grill and board at work, timers and a plate ready to serve.
import { createWorld, startGame } from './world.js';
import { SHIFT_SECONDS } from './config.js';

export function parseShot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || '1') || 1;
  return { shot, seed };
}

export function buildShotWorld(kind, seed) {
  const world = createWorld(seed);
  if (kind === 'start') {
    world.phase = 'title';
    world.elapsed = 0;
    return world;
  }
  if (kind === 'end') {
    startGame(world);
    world.phase = 'over';
    world.elapsed = SHIFT_SECONDS;
    world.timeLeft = 0;
    world.served = 14;
    world.missed = 2;
    world.coins = 512;
    world.score = 6240;
    world.combo = 3;
    world.level = 3;
    world.plate = [];
    world.grill = [null, null];
    world.board = null;
    world.orders = [];
    world.message = 'Shift selesai!';
    return world;
  }
  // kind === 'play': a busy mid-shift moment, frozen for the screenshot.
  startGame(world);
  world.elapsed = 64;
  world.timeLeft = SHIFT_SECONDS - 64;
  world.level = 2;
  world.score = 2340;
  world.coins = 187;
  world.combo = 3;
  world.comboTimer = 8;
  world.served = 7;
  world.missed = 1;
  world.spawnTimer = 6;
  world.message = 'Burger Keju hampir jadi, sajikan sebelum waktunya habis!';
  world.messageTimer = 10;
  // Three orders with different patience left.
  world.orders = [
    { id: 101, recipeId: 'burger-keju', patience: 26, maxPatience: 46, reward: 40 },
    { id: 102, recipeId: 'salad', patience: 38, maxPatience: 52, reward: 25 },
    { id: 103, recipeId: 'burger', patience: 12, maxPatience: 46, reward: 30 },
  ];
  // Dish mid-assembly: burger keju missing only the chopped tomato.
  world.plate = ['roti', 'dagingPanggang', 'keju'];
  // Grill: one patty nearly done, one egg just started.
  world.grill = [
    { kind: 'daging', progress: 5.2, done: false, burnt: false },
    { kind: 'telur', progress: 1.5, done: false, burnt: false },
  ];
  // Board: a tomato half-chopped.
  world.board = { kind: 'tomat', chopsLeft: 1, total: 3 };
  return world;
}
