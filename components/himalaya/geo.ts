// 위도·경도 ↔ 3D 장면 좌표
//
// 장면의 1칸 = 100km. 동쪽이 +x, 북쪽이 -z, 위가 +y 이다.
// 고도는 눈에 잘 보이도록 EXAGGERATION 배 과장한다. (화면 아래에 "고도 7배 과장"을 표시한다.)
// 산의 높이 숫자는 과장하지 않고, 등록된 값 그대로 보여 준다. (PRD: 등록된 값과 다르게 그리지 않는다)

import type { TerrainData } from "./terrain";

export const EXAGGERATION = 7;
const KM_PER_DEGREE = 111.32;
const UNIT_KM = 100;

export type Frame = {
  width: number; // 장면에서 지형의 가로 길이
  depth: number; // 장면에서 지형의 세로 길이
  toX: (lon: number) => number;
  toZ: (lat: number) => number;
  toY: (meters: number) => number;
};

export function makeFrame(bounds: TerrainData["meta"]["bounds"]): Frame {
  const lonMid = (bounds.lonW + bounds.lonE) / 2;
  const latMid = (bounds.latS + bounds.latN) / 2;
  // 경도 1도의 길이는 위도에 따라 달라진다. 지형 가운데 위도 기준으로 맞춘다.
  const kx = (KM_PER_DEGREE * Math.cos((latMid * Math.PI) / 180)) / UNIT_KM;
  const kz = KM_PER_DEGREE / UNIT_KM;
  return {
    width: (bounds.lonE - bounds.lonW) * kx,
    depth: (bounds.latN - bounds.latS) * kz,
    toX: (lon) => (lon - lonMid) * kx,
    toZ: (lat) => -(lat - latMid) * kz,
    toY: (meters) => ((meters / 1000) * EXAGGERATION) / UNIT_KM,
  };
}

// 위도·경도 지점의 지형 고도(m)를 격자에서 부드럽게 구한다.
export function sampleElevation(
  terrain: TerrainData,
  lat: number,
  lon: number,
): number {
  const { meta, heights } = terrain;
  const { bounds, step, width, height } = meta;
  const fx = Math.min(width - 1.001, Math.max(0, (lon - bounds.lonW) / step));
  const fy = Math.min(height - 1.001, Math.max(0, (bounds.latN - lat) / step));
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  const tx = fx - i;
  const ty = fy - j;
  const h = (a: number, b: number) => heights[b * width + a];
  return (
    h(i, j) * (1 - tx) * (1 - ty) +
    h(i + 1, j) * tx * (1 - ty) +
    h(i, j + 1) * (1 - tx) * ty +
    h(i + 1, j + 1) * tx * ty
  );
}
