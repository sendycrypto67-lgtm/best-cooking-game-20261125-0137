[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/sendycrypto67-lgtm/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/sendycrypto67-lgtm/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Dapur Kilat — Game Masak Cepat

Game masak orisinal yang dibuat untuk bounty [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) di make.fun. Dimainkan di desktop browser, tanpa koneksi internet, dengan keyboard dan mouse.

## Cara main

Pesanan muncul di Order Board lengkap dengan batas waktunya. Klik bahan di counter (atau tekan tombol 1-7):

- **Roti, Keju, Nasi** langsung ke piring.
- **Daging, Telur** harus dipanggang dulu di grill (2 slot, bisa gosong kalau kelamaan).
- **Selada, Tomat** harus dipotong 3x di talenan.

Rakit hidangan di piring sesuai resep di Buku Resep, lalu klik **SAJIKAN** (S) sebelum pesanan habis. Sajikan beruntun untuk combo, jangan biarkan pesanan kedaluwarsa atau gosong. Shift 150 detik, level naik dan resep baru terbuka.

Kontrol: klik / 1-7 bahan, S sajikan, X buang piring, P jeda, M suara.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Atau serve folder `game/` dengan server statis apa pun dan buka `game/index.html`.

## Struktur

- `game/index.html` — halaman game (canvas 1280x800)
- `game/src/config.js` — data resep dan layout
- `game/src/world.js` — logika: pesanan, grill, talenan, piring, combo, level
- `game/src/render.js` — semua gambar canvas vektor
- `game/src/input.js` — mouse dan keyboard
- `game/src/audio.js` — suara WebAudio yang digenerate
- `game/src/shots.js` — state deterministik untuk screenshot (`?shot=start|play|end&seed=1`)
- `game/src/random.js` — RNG seed
- `game/src/main.js` — loop dan wiring
- `main.ts` — program penyerahan: menyalin `game/` dan `screenshots/` ke `/output` dan menulis `dossier.json`
- `screenshots/` — 3 tangkapan layar render nyata dari game

Lisensi: MIT.
