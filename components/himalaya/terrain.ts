// 지형 파일 불러오기 (화면에서 실행)
//
// public/terrain/ 의 세 파일(고도, 색, 범위·출처)을 받아 온다.
// 만드는 방법은 scripts/build-terrain.mjs 에 있다.
// 받는 동안 실제 진행률을 알려 줘서 로딩 숫자에 쓴다.

export type TerrainMeta = {
  bounds: { lonW: number; lonE: number; latS: number; latN: number };
  step: number;
  width: number;
  height: number;
  maxElevationM: number;
  sources: { elevation: string; attribution: string; attributionPage: string };
  colorNote: string;
  generatedAt: string;
};

export type TerrainData = {
  meta: TerrainMeta;
  heights: Uint16Array; // 미터. 북쪽 위, 서쪽부터 동쪽으로
  color: ImageBitmap; // 고도·경사로 계산한 색 (위성 사진 아님)
};

const BASE = "/terrain";

// 받으면서 (받은 바이트, 전체 바이트)를 알려 준다.
async function fetchBytes(
  url: string,
  onBytes: (loaded: number, total: number) => void,
): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`${url} 을(를) 받지 못했습니다.`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onBytes(loaded, total);
  }
  const out = new Uint8Array(loaded);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out.buffer;
}

// onProgress: 0~1
export async function loadTerrain(
  onProgress: (fraction: number) => void,
): Promise<TerrainData> {
  const meta: TerrainMeta = await (await fetch(`${BASE}/himalaya-meta.json`)).json();

  // 두 파일의 받은 양을 합쳐서 하나의 진행률로 만든다.
  const progress = { height: [0, 1], color: [0, 1] } as Record<string, [number, number]>;
  const report = () => {
    const loaded = progress.height[0] + progress.color[0];
    const total = progress.height[1] + progress.color[1];
    onProgress(total > 0 ? Math.min(1, loaded / total) : 0);
  };

  const [heightBuf, colorBuf] = await Promise.all([
    fetchBytes(`${BASE}/himalaya-height.bin`, (l, t) => {
      progress.height = [l, t || l || 1];
      report();
    }),
    fetchBytes(`${BASE}/himalaya-color.png`, (l, t) => {
      progress.color = [l, t || l || 1];
      report();
    }),
  ]);

  const heights = new Uint16Array(heightBuf);
  if (heights.length !== meta.width * meta.height) {
    throw new Error("지형 고도 파일의 크기가 범위 정보와 맞지 않습니다.");
  }
  // 위아래를 뒤집어 읽어서, 이미지의 윗줄(북쪽)이 v=1 에 놓이게 한다.
  const color = await createImageBitmap(new Blob([colorBuf], { type: "image/png" }), {
    imageOrientation: "flipY",
  });

  onProgress(1);
  return { meta, heights, color };
}
