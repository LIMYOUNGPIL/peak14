// 히말라야·카라코람 지형 파일 만들기
//
// 실행: node scripts/build-terrain.mjs
//
// 하는 일
//  1) 공개 고도 타일(AWS Terrain Tiles, terrarium 형식)을 내려받는다.
//  2) 위도·경도 격자로 다시 맞춰 고도 파일(himalaya-height.bin)을 만든다.
//  3) 고도와 경사만으로 색 이미지(himalaya-color.png)를 만든다. (눈, 암석, 초원 등)
//     — 사진이나 다른 이미지는 쓰지 않는다. 사실적 정보(고도)에서만 계산한다.
//  4) 범위·출처를 적은 himalaya-meta.json 을 만든다.
//
// 결과는 public/terrain/ 에 저장되고, 화면(3D)이 이 파일을 읽는다.
// 타일은 한 번 받으면 scripts/.terrain-cache/ 에 두고 다시 쓴다. (서버에 부담을 주지 않기 위해)

import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

// ---- 설정 --------------------------------------------------------------
const ZOOM = 7; // 타일 확대 단계. 7 이면 이 지역에서 약 1km 간격이다.
const BOUNDS = { lonW: 73.2, lonE: 89.2, latS: 27.0, latN: 36.6 };
const STEP = 0.02; // 고도 파일의 격자 간격(도). 약 2km
const COLOR_STEP = 0.01; // 색 이미지의 격자 간격(도). 약 1km
const TILE_URL = (z, x, y) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

const root = path.resolve(import.meta.dirname, "..");
const cacheDir = path.join(root, "scripts", ".terrain-cache");
const outDir = path.join(root, "public", "terrain");
fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

// ---- 타일 좌표 계산 -----------------------------------------------------
const WORLD = 256 * 2 ** ZOOM; // 지구 전체의 가로 픽셀 수
const lonToPx = (lon) => ((lon + 180) / 360) * WORLD;
const latToPx = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * WORLD;
};

const x0 = Math.floor(lonToPx(BOUNDS.lonW) / 256);
const x1 = Math.floor(lonToPx(BOUNDS.lonE) / 256);
const y0 = Math.floor(latToPx(BOUNDS.latN) / 256);
const y1 = Math.floor(latToPx(BOUNDS.latS) / 256);

// ---- 타일 내려받기와 해독 ------------------------------------------------
// terrarium 해독: 고도(m) = R*256 + G + B/256 - 32768
async function loadTile(x, y) {
  const file = path.join(cacheDir, `${ZOOM}-${x}-${y}.png`);
  if (!fs.existsSync(file)) {
    const res = await fetch(TILE_URL(ZOOM, x, y), {
      headers: { "User-Agent": "peak14-terrain-build/0.1 (local development)" },
    });
    if (!res.ok) throw new Error(`타일 ${x}/${y} 받기 실패: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const png = PNG.sync.read(fs.readFileSync(file));
  const elev = new Float32Array(256 * 256);
  for (let i = 0; i < 256 * 256; i++) {
    const r = png.data[i * 4];
    const g = png.data[i * 4 + 1];
    const b = png.data[i * 4 + 2];
    elev[i] = r * 256 + g + b / 256 - 32768;
  }
  return elev;
}

const tiles = new Map();
const jobs = [];
for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) jobs.push([x, y]);
console.log(`타일 ${jobs.length}개 (z${ZOOM}, x ${x0}~${x1}, y ${y0}~${y1})`);
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const [x, y] = queue.shift();
      tiles.set(`${x},${y}`, await loadTile(x, y));
    }
  }),
);

// 세계 픽셀 좌표 (px, py) 의 고도를 이웃 4칸에서 부드럽게 구한다.
function pixel(px, py) {
  const tx = Math.floor(px / 256);
  const ty = Math.floor(py / 256);
  const t = tiles.get(`${tx},${ty}`);
  if (!t) return 0;
  return t[(py - ty * 256) * 256 + (px - tx * 256)];
}
function elevationAt(lat, lon) {
  const px = lonToPx(lon) - 0.5;
  const py = latToPx(lat) - 0.5;
  const ix = Math.floor(px);
  const iy = Math.floor(py);
  const fx = px - ix;
  const fy = py - iy;
  return (
    pixel(ix, iy) * (1 - fx) * (1 - fy) +
    pixel(ix + 1, iy) * fx * (1 - fy) +
    pixel(ix, iy + 1) * (1 - fx) * fy +
    pixel(ix + 1, iy + 1) * fx * fy
  );
}

// ---- 고도 파일 -----------------------------------------------------------
const W = Math.round((BOUNDS.lonE - BOUNDS.lonW) / STEP) + 1;
const H = Math.round((BOUNDS.latN - BOUNDS.latS) / STEP) + 1;
const heights = new Uint16Array(W * H);
let maxElev = 0;
for (let j = 0; j < H; j++) {
  const lat = BOUNDS.latN - j * STEP; // 위(북쪽)부터 아래로
  for (let i = 0; i < W; i++) {
    const lon = BOUNDS.lonW + i * STEP;
    const v = Math.max(0, Math.round(elevationAt(lat, lon)));
    heights[j * W + i] = v;
    if (v > maxElev) maxElev = v;
  }
}
fs.writeFileSync(
  path.join(outDir, "himalaya-height.bin"),
  Buffer.from(heights.buffer, heights.byteOffset, heights.byteLength),
);
console.log(`고도 파일 ${W}x${H}, 최고 ${maxElev}m`);

// ---- 색 이미지 (고도와 경사만으로 계산) ------------------------------------
const CW = Math.round((BOUNDS.lonE - BOUNDS.lonW) / COLOR_STEP) + 1;
const CH = Math.round((BOUNDS.latN - BOUNDS.latS) / COLOR_STEP) + 1;
const grid = new Float32Array(CW * CH);
for (let j = 0; j < CH; j++) {
  const lat = BOUNDS.latN - j * COLOR_STEP;
  for (let i = 0; i < CW; i++) {
    grid[j * CW + i] = elevationAt(lat, BOUNDS.lonW + i * COLOR_STEP);
  }
}

const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// 고도 구간별 기본색: 낮은 곳은 건조한 평지, 중간은 초목, 높은 곳은 암석
const RAMP = [
  [0, [138, 140, 96]],
  [900, [118, 132, 84]],
  [2200, [84, 112, 72]],
  [3300, [112, 116, 82]],
  [4300, [150, 134, 108]],
  [5200, [150, 142, 132]],
  [6200, [134, 130, 126]],
];
function baseColor(e) {
  if (e <= RAMP[0][0]) return RAMP[0][1];
  for (let k = 1; k < RAMP.length; k++) {
    if (e <= RAMP[k][0]) {
      const [e0, c0] = RAMP[k - 1];
      const [e1, c1] = RAMP[k];
      return mix(c0, c1, (e - e0) / (e1 - e0));
    }
  }
  return RAMP[RAMP.length - 1][1];
}

const png = new PNG({ width: CW, height: CH });
const mPerDegLat = 111320;
for (let j = 0; j < CH; j++) {
  const lat = BOUNDS.latN - j * COLOR_STEP;
  const dy = COLOR_STEP * mPerDegLat;
  const dx = COLOR_STEP * mPerDegLat * Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i < CW; i++) {
    const e = grid[j * CW + i];
    const eL = grid[j * CW + Math.max(0, i - 1)];
    const eR = grid[j * CW + Math.min(CW - 1, i + 1)];
    const eU = grid[Math.max(0, j - 1) * CW + i];
    const eD = grid[Math.min(CH - 1, j + 1) * CW + i];
    const gx = (eR - eL) / (2 * dx);
    const gy = (eD - eU) / (2 * dy);
    const slope = Math.atan(Math.hypot(gx, gy)) * (180 / Math.PI); // 도(°)

    let color = baseColor(e);
    // 가파른 곳은 암석이 드러난다.
    color = mix(color, [112, 106, 100], smooth(28, 48, slope) * smooth(1500, 3500, e));
    // 눈: 높을수록 많이 쌓이고, 아주 가파른 절벽에는 덜 쌓인다.
    const snowLine = 5300 - smooth(0, 1, 0) * 0;
    const snow = smooth(snowLine - 300, snowLine + 700, e) * (1 - smooth(42, 62, slope) * 0.85);
    color = mix(color, [244, 247, 250], clamp01(snow));

    const o = (j * CW + i) * 4;
    png.data[o] = Math.round(color[0]);
    png.data[o + 1] = Math.round(color[1]);
    png.data[o + 2] = Math.round(color[2]);
    png.data[o + 3] = 255;
  }
}
fs.writeFileSync(path.join(outDir, "himalaya-color.png"), PNG.sync.write(png));
console.log(`색 이미지 ${CW}x${CH}`);

// ---- 범위와 출처 -----------------------------------------------------------
const meta = {
  bounds: BOUNDS,
  step: STEP,
  width: W,
  height: H,
  format: "uint16 little-endian, 미터, 북서쪽부터 동쪽으로, 위에서 아래로",
  maxElevationM: maxElev,
  sources: {
    elevation:
      "AWS Terrain Tiles (terrarium), 이 지역은 SRTM(zoom 7 이상)·GMTED2010 자료",
    attribution:
      "United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.",
    tiles: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/{x}/{y}.png`,
    attributionPage:
      "https://github.com/tilezen/joerd/blob/master/docs/attribution.md",
  },
  colorNote: "색은 고도와 경사만으로 계산했다. 위성 사진이 아니다.",
  generatedAt: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(outDir, "himalaya-meta.json"), JSON.stringify(meta, null, 2));

// ---- 확인: 14좌 근처의 최고 고도 ---------------------------------------------
const peaks = {
  Everest: [27.98833333, 86.92527778],
  K2: [35.8825, 76.51333333],
  Kangchenjunga: [27.7025, 88.14666667],
  Lhotse: [27.9617, 86.9333],
  Makalu: [27.88972222, 87.08888889],
  "Cho Oyu": [28.09416667, 86.66083333],
  Dhaulagiri: [28.69611111, 83.49527778],
  Manaslu: [28.54944444, 84.56194444],
  "Nanga Parbat": [35.2375, 74.58916667],
  Annapurna: [28.59611111, 83.82027778],
  "Gasherbrum I": [35.72444444, 76.69638889],
  "Broad Peak": [35.81361111, 76.56527778],
};
for (const [name, [lat, lon]] of Object.entries(peaks)) {
  let best = 0;
  for (let dj = -2; dj <= 2; dj++)
    for (let di = -2; di <= 2; di++)
      best = Math.max(best, elevationAt(lat + dj * 0.01, lon + di * 0.01));
  console.log(`  ${name.padEnd(14)} 주변 최고 ${Math.round(best)}m`);
}
