// config.js — all static data for Dapur Kilat: canvas size, layout rectangles,
// ingredient definitions, recipes and tuning. No logic lives here, only data.
export const GAME_NAME = 'Dapur Kilat';
export const CANVAS_W = 1280;
export const CANVAS_H = 800;
export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;

// Ingredient ids. Raw ids go in through the bins; prepared ids land on the plate.
export const INGREDIENTS = {
  roti:   { name: 'Roti',    short: 'Roti',   prep: 'ready',  color: '#e8b25c', key: '1' },
  daging: { name: 'Daging',  short: 'Daging', prep: 'grill',  color: '#d96a6a', key: '2' },
  telur:  { name: 'Telur',   short: 'Telur',  prep: 'grill',  color: '#f2e3c6', key: '3' },
  selada: { name: 'Selada',  short: 'Selada', prep: 'chop',   color: '#58b368', key: '4' },
  tomat:  { name: 'Tomat',   short: 'Tomat',  prep: 'chop',   color: '#e05252', key: '5' },
  keju:   { name: 'Keju',    short: 'Keju',   prep: 'ready',  color: '#f5c542', key: '6' },
  nasi:   { name: 'Nasi',    short: 'Nasi',   prep: 'ready',  color: '#f7f3e8', key: '7' },
};
export const BIN_ORDER = ['roti', 'daging', 'telur', 'selada', 'tomat', 'keju', 'nasi'];

// Prepared (plate-ready) form of each raw ingredient.
export const PREPARED = {
  roti: 'roti',
  daging: 'dagingPanggang',
  telur: 'telurGoreng',
  selada: 'seladaPotong',
  tomat: 'tomatPotong',
  keju: 'keju',
  nasi: 'nasi',
};
export const PREPARED_NAMES = {
  roti: 'Roti',
  dagingPanggang: 'Daging Panggang',
  telurGoreng: 'Telur Goreng',
  seladaPotong: 'Selada Potong',
  tomatPotong: 'Tomat Potong',
  keju: 'Keju',
  nasi: 'Nasi',
};
export const PREPARED_COLORS = {
  roti: '#e8b25c',
  dagingPanggang: '#8a5a2b',
  telurGoreng: '#ffd94d',
  seladaPotong: '#58b368',
  tomatPotong: '#e05252',
  keju: '#f5c542',
  nasi: '#f7f3e8',
};

// Recipes: id, display name, prepared ingredients, base coin reward.
export const RECIPES = [
  { id: 'burger',       name: 'Burger Kilat',      needs: ['roti', 'dagingPanggang', 'seladaPotong'], coins: 30, level: 1 },
  { id: 'salad',        name: 'Salad Segar',       needs: ['seladaPotong', 'tomatPotong', 'keju'],    coins: 25, level: 1 },
  { id: 'burger-keju',  name: 'Burger Keju',       needs: ['roti', 'dagingPanggang', 'keju', 'tomatPotong'], coins: 40, level: 2 },
  { id: 'nasi-telur',   name: 'Nasi Telur Mata Sapi', needs: ['nasi', 'telurGoreng', 'tomatPotong'],  coins: 35, level: 2 },
  { id: 'nasi-goreng',  name: 'Nasi Goreng Kilat', needs: ['nasi', 'telurGoreng', 'seladaPotong'],   coins: 45, level: 3 },
];
export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Tuning.
export const TUNING = {
  grillSeconds: { daging: 6, telur: 5 },
  burnSeconds: 7,          // extra seconds on the grill after done before it burns
  chopsNeeded: 3,          // clicks on the chopping board per item
  patienceStart: 52,       // seconds an order waits at level 1
  patienceMin: 30,
  spawnStart: 13,          // seconds between new orders at level 1
  spawnMin: 7,
  comboWindow: 12,         // seconds to keep the combo alive after a serve
  tipPerSecondLeft: 0.4,   // bonus coins per second of patience left
  missPenalty: 10,         // coins lost when an order expires
};

export const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 58 },
  orders: { x: 16, y: 66, w: 1248, h: 116 },
  bins: { x: 16, y: 198, w: 1248, h: 122 },
  stations: { x: 16, y: 336, w: 1248, h: 240 },
  recipes: { x: 16, y: 592, w: 1248, h: 128 },
  footer: { x: 16, y: 732, w: 1248, h: 56 },
};
export const BIN_W = 170;
export const BIN_GAP = 9;
export const ORDER_W = 404;
export const ORDER_GAP = 18;

// Hit rectangles, computed from the layout above (shared by input and render).
export function binRect(i) {
  return {
    x: LAYOUT.bins.x + i * (BIN_W + BIN_GAP),
    y: LAYOUT.bins.y + 22,
    w: BIN_W,
    h: 96,
  };
}
export function orderRect(i) {
  return {
    x: LAYOUT.orders.x + i * (ORDER_W + ORDER_GAP),
    y: LAYOUT.orders.y + 22,
    w: ORDER_W,
    h: 88,
  };
}
export const STATION_RECTS = {
  board: { x: 16, y: 358, w: 400, h: 218 },
  grill: { x: 432, y: 358, w: 400, h: 218 },
  plate: { x: 848, y: 358, w: 416, h: 218 },
};
export function grillSlotRect(i) {
  return { x: 452 + i * 186, y: 420, w: 166, h: 110 };
}
export const SERVE_BTN = { x: 1064, y: 528, w: 180, h: 40 };
export const TRASH_BTN = { x: 880, y: 528, w: 160, h: 40 };
export const START_BTN = { x: 490, y: 560, w: 300, h: 64 };
export const RESTART_BTN = { x: 490, y: 580, w: 300, h: 64 };
export const MUTE_BTN = { x: 1150, y: 10, w: 114, h: 38 };
export const PAUSE_BTN = { x: 1024, y: 10, w: 114, h: 38 };
// Note: pause and mute are keyboard-only (P and M); the header keeps its
// room for the score cluster instead of buttons.
