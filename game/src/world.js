// world.js — the whole game state and its rules: orders, the grill, the
// chopping board, the assembly plate, serving, combo, levels and the shift
// timer. Pure logic, no DOM and no canvas, so it can be driven by tests.
import {
  BIN_ORDER, INGREDIENTS, MAX_ORDERS, PREPARED, RECIPES, SHIFT_SECONDS, TUNING,
  recipeById,
} from './config.js';
import { makeRng, pick } from './random.js';

let nextOrderId = 1;

export function createWorld(seed) {
  return {
    phase: 'title', // title | playing | paused | over
    seed: seed || 1,
    rng: makeRng(seed || 1),
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    served: 0,
    missed: 0,
    level: 1,
    orders: [],
    plate: [],
    grill: [null, null],
    board: null,
    spawnTimer: 4,
    message: 'Klik MULAI MAIN, lalu layani pesanan secepat mungkin!',
    messageTimer: 0,
    muted: false,
    events: [], // sound cues consumed by main.js: 'chop','pickup','grill','ding','coin','buzz','burn','click'
  };
}

export function startGame(world) {
  world.phase = 'playing';
  world.elapsed = 0;
  world.timeLeft = SHIFT_SECONDS;
  world.score = 0;
  world.coins = 0;
  world.combo = 0;
  world.comboTimer = 0;
  world.served = 0;
  world.missed = 0;
  world.level = 1;
  world.orders = [];
  world.plate = [];
  world.grill = [null, null];
  world.board = null;
  world.spawnTimer = 3;
  world.message = 'Pesanan pertama datang! Klik bahan di counter.';
  world.messageTimer = 4;
  spawnOrder(world);
  spawnOrder(world);
}

export function patienceFor(level) {
  return Math.max(TUNING.patienceMin, TUNING.patienceStart - (level - 1) * 6);
}

export function spawnIntervalFor(level) {
  return Math.max(TUNING.spawnMin, TUNING.spawnStart - (level - 1) * 2);
}

export function availableRecipes(level) {
  return RECIPES.filter((r) => r.level <= level);
}

export function spawnOrder(world) {
  if (world.orders.length >= MAX_ORDERS) return false;
  const pool = availableRecipes(world.level);
  const recipe = pick(world.rng, pool);
  const patience = patienceFor(world.level);
  world.orders.push({
    id: nextOrderId++,
    recipeId: recipe.id,
    patience,
    maxPatience: patience,
    reward: recipe.coins,
  });
  return true;
}

export function setMessage(world, text, seconds) {
  world.message = text;
  world.messageTimer = seconds || 3;
}

export function pushEvent(world, name) {
  world.events.push(name);
}

// --- player actions -------------------------------------------------------

export function clickBin(world, rawId) {
  if (world.phase !== 'playing') return;
  const ing = INGREDIENTS[rawId];
  if (!ing) return;
  if (ing.prep === 'ready') {
    addToPlate(world, PREPARED[rawId]);
    pushEvent(world, 'pickup');
    setMessage(world, ing.name + ' naik ke piring.');
  } else if (ing.prep === 'grill') {
    const slot = world.grill.findIndex((s) => s === null);
    if (slot === -1) {
      setMessage(world, 'Panggangan penuh! Ambil dulu yang sudah matang.');
      pushEvent(world, 'buzz');
      return;
    }
    world.grill[slot] = { kind: rawId, progress: 0, done: false, burnt: false };
    pushEvent(world, 'grill');
    setMessage(world, ing.name + ' masuk panggangan, tunggu sampai matang.');
  } else if (ing.prep === 'chop') {
    if (world.board) {
      setMessage(world, 'Talenan masih dipakai! Potong dulu sampai selesai.');
      pushEvent(world, 'buzz');
      return;
    }
    world.board = { kind: rawId, chopsLeft: TUNING.chopsNeeded, total: TUNING.chopsNeeded };
    pushEvent(world, 'pickup');
    setMessage(world, ing.name + ' di talenan. Klik talenan ' + TUNING.chopsNeeded + 'x untuk memotong.');
  }
}

export function clickBoard(world) {
  if (world.phase !== 'playing' || !world.board) return;
  world.board.chopsLeft -= 1;
  pushEvent(world, 'chop');
  if (world.board.chopsLeft <= 0) {
    const prepared = PREPARED[world.board.kind];
    const name = INGREDIENTS[world.board.kind].name;
    world.board = null;
    addToPlate(world, prepared);
    setMessage(world, name + ' selesai dipotong, naik ke piring.');
  }
}

export function clickGrillSlot(world, i) {
  if (world.phase !== 'playing') return;
  const slot = world.grill[i];
  if (!slot) return;
  if (slot.burnt) {
    world.grill[i] = null;
    pushEvent(world, 'burn');
    setMessage(world, 'Gosong! Dibuang ke tempat sampah.');
    return;
  }
  if (slot.done) {
    const prepared = PREPARED[slot.kind];
    world.grill[i] = null;
    addToPlate(world, prepared);
    pushEvent(world, 'pickup');
    setMessage(world, INGREDIENTS[slot.kind].name + ' matang, naik ke piring.');
  } else {
    setMessage(world, 'Belum matang, sabar sebentar lagi.');
    pushEvent(world, 'click');
  }
}

export function addToPlate(world, preparedId) {
  if (world.plate.length >= 6) {
    setMessage(world, 'Piring penuh! Sajikan atau buang dulu.');
    pushEvent(world, 'buzz');
    return false;
  }
  world.plate.push(preparedId);
  return true;
}

export function clearPlate(world) {
  if (world.phase !== 'playing') return;
  if (world.plate.length === 0) return;
  world.plate = [];
  pushEvent(world, 'click');
  setMessage(world, 'Piring dikosongkan.');
}

export function plateMatches(world, recipe) {
  if (world.plate.length !== recipe.needs.length) return false;
  const have = world.plate.slice().sort();
  const want = recipe.needs.slice().sort();
  return have.every((v, i) => v === want[i]);
}

export function matchingOrder(world) {
  for (const order of world.orders) {
    if (plateMatches(world, recipeById(order.recipeId))) return order;
  }
  return null;
}

export function serve(world) {
  if (world.phase !== 'playing') return false;
  if (world.plate.length === 0) {
    setMessage(world, 'Piring masih kosong, rakit hidangan dulu.');
    pushEvent(world, 'buzz');
    return false;
  }
  const order = matchingOrder(world);
  if (!order) {
    setMessage(world, 'Tidak cocok dengan pesanan mana pun. Cek buku resep di bawah!');
    pushEvent(world, 'buzz');
    return false;
  }
  const recipe = recipeById(order.recipeId);
  const tip = Math.round(order.patience * TUNING.tipPerSecondLeft);
  const comboMult = 1 + Math.min(world.combo, 4) * 0.25;
  const earned = Math.round((recipe.coins + tip) * comboMult);
  world.coins += earned;
  world.score += earned * 10;
  world.combo += 1;
  world.comboTimer = TUNING.comboWindow;
  world.served += 1;
  world.orders = world.orders.filter((o) => o.id !== order.id);
  world.plate = [];
  pushEvent(world, 'coin');
  setMessage(world, recipe.name + ' tersaji! +' + earned + ' koin (combo x' + world.combo + ').', 3.5);
  return true;
}

// --- per-frame update -----------------------------------------------------

export function levelFor(elapsed) {
  if (elapsed >= 100) return 3;
  if (elapsed >= 50) return 2;
  return 1;
}

export function update(world, dt) {
  if (world.phase !== 'playing') return;
  world.elapsed += dt;
  world.timeLeft = Math.max(0, SHIFT_SECONDS - world.elapsed);
  world.level = levelFor(world.elapsed);
  if (world.messageTimer > 0) world.messageTimer -= dt;
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }
  // Orders lose patience; expired ones are missed.
  for (const order of world.orders) order.patience -= dt;
  const expired = world.orders.filter((o) => o.patience <= 0);
  if (expired.length > 0) {
    world.orders = world.orders.filter((o) => o.patience > 0);
    world.missed += expired.length;
    world.combo = 0;
    world.comboTimer = 0;
    world.coins = Math.max(0, world.coins - TUNING.missPenalty * expired.length);
    pushEvent(world, 'buzz');
    setMessage(world, 'Pesanan kedaluwarsa! Pelanggan kecewa, -' + TUNING.missPenalty + ' koin.', 3.5);
  }
  // Spawn new orders.
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    if (spawnOrder(world)) world.spawnTimer = spawnIntervalFor(world.level);
    else world.spawnTimer = 2;
  }
  // Grill cooks; done items burn if left too long.
  for (let i = 0; i < world.grill.length; i++) {
    const slot = world.grill[i];
    if (!slot || slot.burnt) continue;
    slot.progress += dt;
    const need = TUNING.grillSeconds[slot.kind];
    if (!slot.done && slot.progress >= need) {
      slot.done = true;
      pushEvent(world, 'ding');
      setMessage(world, INGREDIENTS[slot.kind].name + ' matang! Klik untuk ambil.', 3);
    } else if (slot.done && slot.progress >= need + TUNING.burnSeconds) {
      slot.burnt = true;
      pushEvent(world, 'burn');
      setMessage(world, 'Ada yang gosong di panggangan!', 3);
    }
  }
  // Shift over.
  if (world.timeLeft <= 0) {
    world.phase = 'over';
    world.score += world.served * 50;
    pushEvent(world, 'over');
    setMessage(world, 'Shift selesai!', 5);
  }
}

export { BIN_ORDER, INGREDIENTS };
