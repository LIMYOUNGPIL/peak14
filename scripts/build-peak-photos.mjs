// 산 대표 사진 만들기: 위키미디어 커먼즈 원본을 내려받아 14좌가 같은 분위기가 되도록 가공한다.
//
// 실행: node scripts/build-peak-photos.mjs
// 입력: scripts/peak-photos.sources.json (산별 원본 주소·잘라낼 위치)
// 출력: public/peaks/{slug}.webp (큰 사진), public/peaks/{slug}-thumb.webp (옆 카드용)
//
// 가공은 색감과 크기만 바꾼다: 노출 통일 → 채도 낮춤 → 남색 톤 입힘 → 가장자리 어둡게.
// 원본은 저장소에 넣지 않는다. (글쓴이·라이선스는 lib/data/peak-photos.ts 에 적어 화면에 표시한다)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const sharp = require("sharp");

const sources = JSON.parse(fs.readFileSync(path.join(root, "scripts/peak-photos.sources.json"), "utf8"));
const outDir = path.join(root, "public/peaks");
const cacheDir = path.join(os.tmpdir(), "peak14-originals");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

const W = 2000;
const H = 1200; // 5:3
const only = process.argv[2]; // 한 산만 다시 만들 때: node scripts/build-peak-photos.mjs everest

async function download(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 10_000) return;
  for (let attempt = 1; attempt <= 8; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "Peak14-educational-app/1.0 (https://peak14.vercel.app)" } });
    if (res.ok) {
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return;
    }
    if (res.status !== 429 && res.status < 500) throw new Error(`${url} → ${res.status}`);
    await new Promise((r) => setTimeout(r, 6000 * attempt)); // 요청이 몰리면(429) 천천히 다시 시도한다
  }
  throw new Error(`${url} 를 내려받지 못했습니다`);
}

for (const item of sources) {
  if (only && item.slug !== only) continue;
  const raw = path.join(cacheDir, `${item.slug}${path.extname(new URL(item.originalUrl).pathname) || ".jpg"}`);
  await download(item.originalUrl, raw);
  await new Promise((r) => setTimeout(r, 1500)); // 위키미디어 서버에 부담을 주지 않도록 간격을 둔다

  // 1) 방향을 바로잡고, 지정한 영역(없으면 전체)을 가져온다.
  const base = sharp(raw, { limitInputPixels: false }).rotate();
  const meta = await base.metadata();
  const ow = meta.autoOrient?.width ?? meta.width;
  const oh = meta.autoOrient?.height ?? meta.height;
  const c = item.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  let left = Math.round(c.x * ow);
  let top = Math.round(c.y * oh);
  let cw = Math.round(c.w * ow);
  let ch = Math.round(c.h * oh);

  // 2) 5:3 비율로 맞추되, 정상(focal) 쪽이 남도록 자른다.
  const focal = item.focal ?? { x: 0.5, y: 0.4 };
  const ratio = W / H;
  if (cw / ch > ratio) {
    const nw = Math.round(ch * ratio);
    const cx = left + focal.x * cw; // 정상의 위치가 가운데에 가깝게
    left = Math.min(Math.max(Math.round(cx - nw / 2), left), left + cw - nw);
    cw = nw;
  } else {
    const nh = Math.round(cw / ratio);
    const cy = top + focal.y * ch;
    top = Math.min(Math.max(Math.round(cy - nh * 0.4), top), top + ch - nh);
    ch = nh;
  }

  // 3) 통일된 색감: 노출을 맞추고 채도를 낮춘 뒤 남색 톤을 입히고 가장자리를 어둡게 한다.
  const graded = await sharp(raw, { limitInputPixels: false })
    .rotate()
    .extract({ left, top, width: cw, height: ch })
    .resize(W, H, { kernel: "lanczos3" })
    .gamma(item.lift ?? 1) // 너무 어두운 사진만 밝게 끌어올린다
    .normalise({ lower: 2, upper: 99 })
    .modulate({ saturation: 0.62, brightness: 0.97 })
    .linear(1.06, -8)
    .composite([
      { input: { create: { width: W, height: H, channels: 3, background: { r: 18, g: 44, b: 92 } } }, blend: "soft-light" },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="v" cx="50%" cy="46%" r="75%"><stop offset="55%" stop-color="#050a14" stop-opacity="0"/><stop offset="100%" stop-color="#050a14" stop-opacity="0.55"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`,
        ),
        blend: "over",
      },
    ])
    .toBuffer();

  await sharp(graded).webp({ quality: 80, effort: 5 }).toFile(path.join(outDir, `${item.slug}.webp`));
  await sharp(graded).resize(480, 288, { kernel: "lanczos3" }).webp({ quality: 74, effort: 5 }).toFile(path.join(outDir, `${item.slug}-thumb.webp`));
  console.log(`${item.slug}: ${ow}x${oh} → ${W}x${H} (${(fs.statSync(path.join(outDir, `${item.slug}.webp`)).size / 1024) | 0} KB)`);
}
