// render.js — every pixel of Dapur Kilat, drawn with canvas 2D vector shapes.
// No images, no fonts from the network; food is drawn so it reads at a glance.
import {
  BIN_GAP, BIN_ORDER, BIN_W, CANVAS_H, CANVAS_W, GAME_NAME, INGREDIENTS, LAYOUT, ORDER_GAP, ORDER_W, PREPARED_NAMES, RECIPES, RESTART_BTN, SERVE_BTN, START_BTN, STATION_RECTS,
  TRASH_BTN, binRect, grillSlotRect, orderRect, recipeById,
} from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align, weight) {
  ctx.fillStyle = color || '#2b2118';
  ctx.font = (weight || '700') + ' ' + size + 'px Verdana, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// --- vector food icons ----------------------------------------------------

export function drawFoodIcon(ctx, id, cx, cy, size) {
  const s = size / 64;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (id === 'roti') {
    ctx.fillStyle = '#e8b25c';
    ctx.beginPath();
    ctx.arc(0, 2, 26, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-26, 2, 52, 10);
    ctx.fillStyle = '#c98f3d';
    ctx.fillRect(-26, 10, 52, 4);
    ctx.fillStyle = '#fff3d0';
    [[-14, -12], [0, -18], [14, -12], [-6, -6], [8, -6]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (id === 'daging' || id === 'dagingPanggang') {
    ctx.fillStyle = id === 'daging' ? '#e07878' : '#8a5a2b';
    rr(ctx, -28, -12, 56, 24, 12);
    ctx.fill();
    ctx.fillStyle = id === 'daging' ? '#c95454' : '#6e451f';
    [[-16, -4], [0, 3], [16, -4]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (id === 'telur' || id === 'telurGoreng') {
    ctx.fillStyle = id === 'telur' ? '#f2e3c6' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcf3f';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.arc(-3, -3, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'selada' || id === 'seladaPotong') {
    ctx.fillStyle = '#58b368';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 16, 2, 15, 12, i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#3d8f4c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.quadraticCurveTo(0, 10, 24, 0);
    ctx.stroke();
  } else if (id === 'tomat' || id === 'tomatPotong') {
    ctx.fillStyle = '#e05252';
    ctx.beginPath();
    ctx.arc(0, 2, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c23b3b';
    ctx.beginPath();
    ctx.arc(-6, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3d8f4c';
    ctx.beginPath();
    ctx.ellipse(0, -18, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, -22, 4, 6);
  } else if (id === 'keju') {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(-26, 12);
    ctx.lineTo(26, 12);
    ctx.lineTo(26, -12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d9a41f';
    [[-12, 2], [6, 4], [16, -4]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (id === 'nasi') {
    ctx.fillStyle = '#f7f3e8';
    ctx.beginPath();
    ctx.arc(0, 4, 24, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9bfa5';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#d8d2bd';
    ctx.lineWidth = 2;
    [[-12, -8], [0, -14], [12, -8], [-5, -4], [8, -5]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 4, y);
      ctx.stroke();
    });
  } else if (id === 'gosong') {
    ctx.fillStyle = '#2b2b2b';
    rr(ctx, -26, -12, 52, 24, 10);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(14, 6);
    ctx.moveTo(14, -6);
    ctx.lineTo(-14, 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPatienceBar(ctx, x, y, w, frac) {
  rr(ctx, x, y, w, 12, 6);
  ctx.fillStyle = '#e8dcc8';
  ctx.fill();
  const color = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#f5a623' : '#e05252';
  if (frac > 0.01) {
    rr(ctx, x, y, Math.max(10, w * frac), 12, 6);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawOrderCard(ctx, world, order, i) {
  const r = orderRect(i);
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.25;
  rr(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fillStyle = urgent && Math.floor(world.elapsed * 4) % 2 === 0 ? '#ffe3e3' : '#fff8ea';
  ctx.fill();
  ctx.strokeStyle = urgent ? '#e05252' : '#d8c9a8';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, recipe.name, r.x + 14, r.y + 20, 17, '#2b2118', 'left', '800');
  text(ctx, recipe.coins + ' koin', r.x + r.w - 14, r.y + 20, 15, '#b07d1e', 'right', '800');
  // Needed ingredients, ticked when already on the plate.
  const counts = {};
  world.plate.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
  recipe.needs.forEach((need, k) => {
    const cx = r.x + 34 + k * 62;
    const cy = r.y + 52;
    drawFoodIcon(ctx, need, cx, cy, 40);
    if (counts[need] > 0) {
      counts[need] -= 1;
      ctx.fillStyle = '#58b368';
      ctx.beginPath();
      ctx.arc(cx + 18, cy - 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy - 16);
      ctx.lineTo(cx + 17, cy - 12);
      ctx.lineTo(cx + 24, cy - 21);
      ctx.stroke();
    }
  });
  drawPatienceBar(ctx, r.x + 14, r.y + 74, r.w - 28, frac);
  text(ctx, Math.ceil(order.patience) + ' dtk', r.x + r.w - 14, r.y + 56, 12, '#8a7a5c', 'right', '700');
}

function drawBin(ctx, world, rawId, i) {
  const r = binRect(i);
  const ing = INGREDIENTS[rawId];
  const hover = world.hover && world.hover.x >= r.x && world.hover.x <= r.x + r.w
    && world.hover.y >= r.y && world.hover.y <= r.y + r.h;
  rr(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fillStyle = hover ? '#fff3d6' : '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#d8c9a8';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawFoodIcon(ctx, rawId, r.x + r.w / 2, r.y + 30, 52);
  text(ctx, ing.name, r.x + r.w / 2, r.y + 62, 17, '#2b2118', 'center', '800');
  const hint = ing.prep === 'ready' ? 'langsung ke piring'
    : ing.prep === 'grill' ? 'panggang dulu' : 'potong dulu';
  text(ctx, hint, r.x + r.w / 2, r.y + 84, 12, '#8a7a5c', 'center', '600');
  // Keyboard key badge.
  ctx.fillStyle = '#2b2118';
  rr(ctx, r.x + 8, r.y + 8, 24, 24, 6);
  ctx.fill();
  text(ctx, ing.key, r.x + 20, r.y + 21, 14, '#fff', 'center', '800');
}

function drawBoard(ctx, world) {
  const r = STATION_RECTS.board;
  rr(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fillStyle = '#f3e2c2';
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'TALENAN  (klik untuk potong)', r.x + 18, r.y + 24, 15, '#7a5c22', 'left', '800');
  if (!world.board) {
    text(ctx, 'Kosong. Klik Selada / Tomat', r.x + 18, r.y + 70, 16, '#8a7a5c', 'left', '600');
    text(ctx, 'di counter untuk menaruhnya di sini.', r.x + 18, r.y + 96, 16, '#8a7a5c', 'left', '600');
    drawFoodIcon(ctx, 'selada', r.x + 200, r.y + 160, 64);
    ctx.globalAlpha = 0.35;
    drawFoodIcon(ctx, 'tomat', r.x + 290, r.y + 160, 56);
    ctx.globalAlpha = 1;
  } else {
    const done = world.board.total - world.board.chopsLeft;
    drawFoodIcon(ctx, world.board.kind, r.x + 200, r.y + 110, 96);
    text(ctx, INGREDIENTS[world.board.kind].name + ': ' + world.board.chopsLeft + ' potongan lagi',
      r.x + 200, r.y + 168, 16, '#2b2118', 'center', '700');
    for (let k = 0; k < world.board.total; k++) {
      ctx.fillStyle = k < done ? '#58b368' : '#e8dcc8';
      rr(ctx, r.x + 120 + k * 56, r.y + 186, 44, 14, 7);
      ctx.fill();
    }
  }
}

function drawGrill(ctx, world) {
  const r = STATION_RECTS.grill;
  rr(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PANGGANGAN', r.x + 18, r.y + 24, 15, '#ffd94d', 'left', '800');
  text(ctx, 'klik yang matang untuk mengambil', r.x + r.w - 18, r.y + 24, 13, '#bbb', 'right', '600');
  world.grill.forEach((slot, i) => {
    const s = grillSlotRect(i);
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fillStyle = '#555';
    ctx.fill();
    ctx.strokeStyle = slot && slot.done && !slot.burnt ? '#58b368' : '#777';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!slot) {
      text(ctx, 'Slot ' + (i + 1) + ' kosong', s.x + s.w / 2, s.y + 40, 14, '#aaa', 'center', '600');
      text(ctx, 'klik Daging / Telur', s.x + s.w / 2, s.y + 66, 13, '#999', 'center', '600');
      return;
    }
    if (slot.burnt) {
      drawFoodIcon(ctx, 'gosong', s.x + s.w / 2, s.y + 42, 52);
      text(ctx, 'GOSONG! Klik untuk buang', s.x + s.w / 2, s.y + 88, 13, '#ff9d9d', 'center', '800');
      return;
    }
    const need = slot.kind === 'daging' ? 6 : 5;
    const frac = Math.min(1, slot.progress / need);
    drawFoodIcon(ctx, slot.done ? (slot.kind === 'daging' ? 'dagingPanggang' : 'telurGoreng') : slot.kind,
      s.x + s.w / 2, s.y + 40, 52);
    // Heat bar.
    rr(ctx, s.x + 14, s.y + 76, s.w - 28, 10, 5);
    ctx.fillStyle = '#222';
    ctx.fill();
    rr(ctx, s.x + 14, s.y + 76, Math.max(8, (s.w - 28) * frac), 10, 5);
    ctx.fillStyle = slot.done ? '#58b368' : '#ff8c42';
    ctx.fill();
    text(ctx, slot.done ? 'MATANG! Klik untuk ambil' : 'Memanggang... ' + Math.ceil(need - slot.progress) + ' dtk',
      s.x + s.w / 2, s.y + 100, 12, slot.done ? '#8fe3a0' : '#ddd', 'center', '700');
    // Steam wisps while cooking.
    if (!slot.done) {
      const t = world.elapsed * 2 + i * 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x + s.w / 2 - 14, s.y + 14 - (t % 8));
      ctx.quadraticCurveTo(s.x + s.w / 2 - 8, s.y + 8 - (t % 8), s.x + s.w / 2 - 12, s.y + 2 - (t % 8));
      ctx.stroke();
    }
  });
}

function drawPlatePanel(ctx, world) {
  const r = STATION_RECTS.plate;
  rr(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fillStyle = '#fff8ea';
  ctx.fill();
  ctx.strokeStyle = '#d8c9a8';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PIRING RAKITAN  (hidangan sedang dirakit)', r.x + 18, r.y + 24, 15, '#7a5c22', 'left', '800');
  // The plate itself.
  const px = r.x + 100;
  const py = r.y + 130;
  ctx.fillStyle = '#e8e2d4';
  ctx.beginPath();
  ctx.ellipse(px, py, 92, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(px, py, 78, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9b98f';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (world.plate.length === 0) {
    text(ctx, 'Piring kosong', px, py, 15, '#a89a7c', 'center', '600');
  } else {
    // Stack the plated items so the dish reads as one meal.
    world.plate.forEach((item, k) => {
      drawFoodIcon(ctx, item, px, py - 6 - k * 4, 52);
    });
  }
  // Matching hint.
  const match = world.plate.length > 0
    ? RECIPES.find((rec) => {
      const have = world.plate.slice().sort();
      const want = rec.needs.slice().sort();
      return have.length === want.length && have.every((v, i) => v === want[i]);
    })
    : null;
  const hint = match
    ? 'Cocok: ' + match.name + ' — sajikan!'
    : world.plate.length === 0
      ? 'Klik bahan di counter untuk merakit.'
      : world.plate.length + ' bahan di piring...';
  text(ctx, hint, r.x + 200, r.y + 52, 13, match ? '#2e7d32' : '#8a7a5c', 'left', '700');
  text(ctx, 'Isi piring:', r.x + 200, r.y + 78, 13, '#8a7a5c', 'left', '700');
  const shown = world.plate.slice(0, 4);
  shown.forEach((item, k) => {
    text(ctx, (k + 1) + '. ' + (PREPARED_NAMES[item] || item), r.x + 200, r.y + 100 + k * 19, 14, '#2b2118', 'left', '600');
  });
  if (world.plate.length > 4) {
    text(ctx, '+' + (world.plate.length - 4) + ' lagi', r.x + 200, r.y + 100 + 4 * 19, 13, '#8a7a5c', 'left', '600');
  }
  // Serve + trash buttons.
  const serve = SERVE_BTN;
  rr(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fillStyle = match ? '#58b368' : '#9db89d';
  ctx.fill();
  text(ctx, 'SAJIKAN  (S)', serve.x + serve.w / 2, serve.y + serve.h / 2, 18, '#fff', 'center', '800');
  const trash = TRASH_BTN;
  rr(ctx, trash.x, trash.y, trash.w, trash.h, 12);
  ctx.fillStyle = '#e05252';
  ctx.fill();
  text(ctx, 'BUANG  (X)', trash.x + trash.w / 2, trash.y + trash.h / 2, 16, '#fff', 'center', '800');
}

function drawRecipes(ctx) {
  const r = LAYOUT.recipes;
  text(ctx, 'BUKU RESEP — sajikan tepat seperti resepnya:', r.x, r.y + 8, 15, '#7a5c22', 'left', '800');
  RECIPES.forEach((rec, i) => {
    const x = r.x + i * 250;
    const y = r.y + 26;
    rr(ctx, x, y, 240, 88, 10);
    ctx.fillStyle = '#fff8ea';
    ctx.fill();
    ctx.strokeStyle = '#d8c9a8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, rec.name, x + 12, y + 16, 14, '#2b2118', 'left', '800');
    text(ctx, rec.coins + ' koin', x + 228, y + 16, 12, '#b07d1e', 'right', '800');
    rec.needs.forEach((need, k) => {
      drawFoodIcon(ctx, need, x + 28 + k * 48, y + 56, 36);
    });
  });
}

function drawKitchenBackground(ctx, world) {
  // Warm kitchen wall with a soft tile band behind the counters.
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(0, 0, CANVAS_W, 58);
  ctx.fillStyle = '#e8c98f';
  ctx.fillRect(0, 58, CANVAS_W, 4);
  ctx.fillStyle = '#f1ddb0';
  ctx.fillRect(0, 584, CANVAS_W, 4);
}

export function render(ctx, world) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawKitchenBackground(ctx, world);

  if (world.phase === 'title') {
    renderTitle(ctx, world);
    return;
  }
  if (world.phase === 'over') {
    renderPlaying(ctx, world);
    renderEnd(ctx, world);
    return;
  }
  renderPlaying(ctx, world);
  if (world.phase === 'paused') {
    ctx.fillStyle = 'rgba(43,33,24,0.55)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    text(ctx, 'JEDA  (P untuk lanjut)', CANVAS_W / 2, CANVAS_H / 2, 40, '#fff', 'center', '800');
  }
}

function renderPlaying(ctx, world) {
  // Header: name, shift timer, score, coins, combo, level.
  text(ctx, GAME_NAME, 20, 30, 26, '#7a3c00', 'left', '800');
  const timeLeft = world.timeLeft;
  const timeColor = timeLeft <= 20 ? '#e05252' : '#2b2118';
  text(ctx, 'SHIFT  ' + fmtTime(timeLeft), 640, 30, 26, timeColor, 'center', '800');
  // Shift progress bar under the timer.
  const barW = 220;
  rr(ctx, 640 - barW / 2, 46, barW, 8, 4);
  ctx.fillStyle = '#e8dcc8';
  ctx.fill();
  rr(ctx, 640 - barW / 2, 46, Math.max(6, barW * (timeLeft / 150)), 8, 4);
  ctx.fillStyle = timeLeft <= 20 ? '#e05252' : '#58b368';
  ctx.fill();
  text(ctx, 'Skor ' + world.score, 780, 30, 18, '#2b2118', 'left', '800');
  text(ctx, 'Koin ' + world.coins, 900, 30, 18, '#b07d1e', 'left', '800');
  text(ctx, 'Combo x' + world.combo, 1010, 30, 18, world.combo >= 2 ? '#2e7d32' : '#8a7a5c', 'left', '800');
  text(ctx, 'Lv ' + world.level, 1130, 30, 16, '#2b2118', 'left', '800');

  // Order board.
  text(ctx, 'ORDER BOARD — layani pesanan sebelum waktunya habis',
    LAYOUT.orders.x, LAYOUT.orders.y + 10, 14, '#7a5c22', 'left', '800');
  if (world.orders.length === 0) {
    text(ctx, 'Belum ada pesanan...', LAYOUT.orders.x + 8, LAYOUT.orders.y + 66, 16, '#8a7a5c', 'left', '600');
  }
  world.orders.forEach((order, i) => drawOrderCard(ctx, world, order, i));

  // Ingredient counter.
  text(ctx, 'COUNTER BAHAN — klik bahan, atau tekan tombol 1-7', LAYOUT.bins.x, LAYOUT.bins.y + 10, 14, '#7a5c22', 'left', '800');
  BIN_ORDER.forEach((rawId, i) => drawBin(ctx, world, rawId, i));

  // Stations.
  drawBoard(ctx, world);
  drawGrill(ctx, world);
  drawPlatePanel(ctx, world);

  // Recipe book + message + controls.
  drawRecipes(ctx);
  const f = LAYOUT.footer;
  text(ctx, world.message, f.x, f.y + 16, 16, '#2b2118', 'left', '700');
  text(ctx, 'Kontrol: klik / 1-7 bahan  •  S sajikan  •  X buang piring  •  P jeda  •  M suara  •  Disajikan ' + world.served + '  •  Gagal ' + world.missed,
    f.x, f.y + 42, 13, '#8a7a5c', 'left', '600');
}

function renderTitle(ctx, world) {
  // Big title card over the kitchen.
  ctx.fillStyle = 'rgba(43,33,24,0.45)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  rr(ctx, 290, 90, 700, 540, 20);
  ctx.fillStyle = '#fff8ea';
  ctx.fill();
  ctx.strokeStyle = '#d8a24a';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, GAME_NAME, 640, 170, 56, '#7a3c00', 'center', '800');
  text(ctx, 'Masak cepat, sajikan tepat waktu!', 640, 220, 20, '#8a7a5c', 'center', '600');
  // Mini food parade.
  ['roti', 'dagingPanggang', 'seladaPotong', 'tomatPotong', 'telurGoreng', 'keju', 'nasi'].forEach((id, i) => {
    drawFoodIcon(ctx, id, 400 + i * 80, 290, 56);
  });
  text(ctx, 'Cara main:', 380, 350, 18, '#2b2118', 'left', '800');
  const lines = [
    '1. Pesanan muncul di Order Board, lengkap dengan batas waktunya.',
    '2. Klik bahan di counter: Roti, Keju, Nasi langsung ke piring.',
    '3. Daging dan Telur harus dipanggang dulu, Selada dan Tomat dipotong di talenan.',
    '4. Rakit hidangan di piring sesuai resep, lalu klik SAJIKAN sebelum pesanan habis.',
    '5. Sajikan beruntun untuk combo, jangan biarkan pesanan kedaluwarsa atau gosong!',
  ];
  lines.forEach((line, i) => text(ctx, line, 380, 384 + i * 28, 15, '#5c4a2e', 'left', '600'));
  // Start button.
  const b = START_BTN;
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fillStyle = '#58b368';
  ctx.fill();
  text(ctx, 'MULAI MAIN  (Enter)', b.x + b.w / 2, b.y + b.h / 2, 22, '#fff', 'center', '800');
  text(ctx, 'Shift 2 menit 30 detik  •  Keyboard 1-7, S, X, P, M  •  Mouse penuh', 640, 532, 14, '#8a7a5c', 'center', '600');
}

function renderEnd(ctx, world) {
  ctx.fillStyle = 'rgba(43,33,24,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  rr(ctx, 340, 110, 600, 500, 20);
  ctx.fillStyle = '#fff8ea';
  ctx.fill();
  ctx.strokeStyle = '#d8a24a';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'SHIFT SELESAI!', 640, 180, 44, '#7a3c00', 'center', '800');
  const grade = world.served >= 12 ? 'Koki Bintang Lima!' : world.served >= 8 ? 'Koki Hebat!' : world.served >= 4 ? 'Koki Pemula!' : 'Terus Berlatih!';
  text(ctx, grade, 640, 228, 22, '#2e7d32', 'center', '800');
  const rows = [
    ['Hidangan tersaji', String(world.served)],
    ['Pesanan gagal', String(world.missed)],
    ['Koin dikumpulkan', String(world.coins)],
    ['Skor akhir', String(world.score)],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, 420, 290 + i * 44, 20, '#5c4a2e', 'left', '600');
    text(ctx, value, 860, 290 + i * 44, 20, '#2b2118', 'right', '800');
  });
  const b = RESTART_BTN;
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fillStyle = '#58b368';
  ctx.fill();
  text(ctx, 'MAIN LAGI  (Enter)', b.x + b.w / 2, b.y + b.h / 2, 22, '#fff', 'center', '800');
}
