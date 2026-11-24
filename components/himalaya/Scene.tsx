"use client";

// 히말라야·카라코람 3D 장면
//
// 실제 고도 데이터로 만든 지형 위에 14좌 표지를 세운다.
// 드래그(또는 한 손가락)로 돌리고, 두 손가락(또는 휠)으로 가까이·멀리 본다.
// 산 표지를 누르면 카메라가 그 산으로 날아가고, 선택은 부모(Experience)가 관리한다.
//
// Design Ref: §3.1 — 첫 화면은 터치·드래그로 회전하는 3D 전경이고, 산을 누르면 정보가 나온다.

import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { makeFrame, sampleElevation, type Frame } from "./geo";
import type { TerrainData } from "./terrain";

export type Phase = "waiting" | "intro" | "explore";

export type PeakPoint = {
  slug: string;
  number: number; // 목록 번호 (1~14)
  nameKo: string;
  nameEn: string;
  lat: number;
  lon: number;
};

type Props = {
  terrain: TerrainData;
  peaks: PeakPoint[];
  selected: string | null;
  phase: Phase; // waiting: 로딩 중 대기, intro: 날아 들어오는 중, explore: 자유롭게 보기
  reducedMotion: boolean;
  coarsePointer: boolean; // 휴대폰 등: 지형을 덜 촘촘하게 그린다
  onSelect: (slug: string | null) => void;
  onHover: (slug: string | null) => void;
  labelRefs: React.RefObject<(HTMLElement | null)[]>; // 이름표 버튼들 (위치를 3D 좌표에서 계산해 옮긴다)
  onReady: () => void; // 첫 화면을 그릴 준비가 끝났을 때
  onIntroDone: () => void;
};

const BACKGROUND = "#070d18";
const HOME_TARGET = new THREE.Vector3(0, 0, -0.4);
const HOME_DISTANCE = 16;
const HOME_DIRECTION = new THREE.Vector3(0, 0.7, 0.714).normalize();
// 진입 연출: 높은 곳에서 시작해 전경 자리로 내려오며, 자동 회전과 같은 방향으로 천천히 돌아 들어온다.
const INTRO_FROM = { radius: 46, polar: 0.3, azimuth: 1.15 };
const HOME_POLAR = Math.acos(HOME_DIRECTION.y);
const HOME_AZIMUTH = Math.atan2(HOME_DIRECTION.x, HOME_DIRECTION.z);
const AUTO_ROTATE_SPEED = 0.35;
const ROTATE_RAMP_SECONDS = 3.5; // 도착한 뒤 자동 회전이 서서히 시작되는 시간
const POLE = 0.6; // 표지 기둥 높이
const POLE_SELECTED = 1;
const INTRO_SECONDS = 6.5;
const FOCUS_DISTANCE = 2.6;

// 화면이 세로로 길수록(휴대폰) 14좌가 모두 들어오도록 더 멀리서 본다.
const homeDistanceFor = (aspect: number) =>
  HOME_DISTANCE * THREE.MathUtils.clamp(1.35 / aspect, 1, 2.4);

// 처음엔 빠르고 끝에서는 속도가 0으로 부드럽게 멈춘다. (도착 뒤 자동 회전이 이어서 서서히 시작된다)
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// ---- 지형 ------------------------------------------------------------------
// 두 겹으로 만든다.
//  1) 바닥 땅: 자료 구역 밖으로 지평선까지 이어지는 부드러운 땅. 가장자리 고도를 넓게 평균 낸 값으로 만들고 한 가지 흙색으로 칠한다.
//     (실제 지형이 아니라 이어 붙인 "배경"이다. 화면 아래에 그 사실을 적는다.)
//  2) 자료 지형: 실제 고도·색 자료. 가장자리 0.7도는 서서히 투명해져서 바닥 땅과 끊김 없이 이어진다.
const OUTER_RINGS = 14; // 바깥으로 이어 붙이는 칸의 수
const OUTER_GROWTH = 1.6; // 바깥으로 갈수록 칸이 이만큼씩 커진다
const OUTER_DROP = 0.5; // 가장 먼 곳에서는 가장자리 고도의 (1 - 이 값)배까지 낮아진다
const FEATHER_DEG = 1.4; // 자료 지형의 가장자리가 서서히 사라지는 폭(도)
const BASE_SINK = 0.5; // 바닥 땅을 자료 지형보다 이만큼 아래에 둔다(장면 단위). 자료 지형 아래에 가려지게 하려는 값

const smooth01 = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// 가로·세로 이동 평균으로 흐릿하게 만든 고도
function blurHeights(heights: Uint16Array, W: number, H: number, radius: number) {
  const tmp = new Float32Array(W * H);
  const out = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    let sum = 0;
    let n = 0;
    for (let i = 0; i < Math.min(W, radius); i++) { sum += heights[j * W + i]; n++; }
    for (let i = 0; i < W; i++) {
      const add = i + radius;
      const sub = i - radius - 1;
      if (add < W) { sum += heights[j * W + add]; n++; }
      if (sub >= 0) { sum -= heights[j * W + sub]; n--; }
      tmp[j * W + i] = sum / n;
    }
  }
  for (let i = 0; i < W; i++) {
    let sum = 0;
    let n = 0;
    for (let j = 0; j < Math.min(H, radius); j++) { sum += tmp[j * W + i]; n++; }
    for (let j = 0; j < H; j++) {
      const add = j + radius;
      const sub = j - radius - 1;
      if (add < H) { sum += tmp[add * W + i]; n++; }
      if (sub >= 0) { sum -= tmp[sub * W + i]; n--; }
      out[j * W + i] = sum / n;
    }
  }
  return out;
}

type Cell = { pos: number; idx: number; out: number };

// 한 축의 격자: 안쪽(자료가 있는 구간)은 stride 칸마다. withOuter 이면 바깥으로 점점 넓은 칸을 이어 붙인다.
function buildAxis(count: number, stride: number, toScene: (idx: number) => number, withOuter: boolean): Cell[] {
  const inner: Cell[] = [];
  for (let k = 0; ; k += stride) {
    const idx = Math.min(k, count - 1);
    inner.push({ pos: toScene(idx), idx, out: 0 });
    if (idx === count - 1) break;
  }
  if (!withOuter) return inner;
  const dir = Math.sign(inner[1].pos - inner[0].pos);
  const first = Math.abs(inner[1].pos - inner[0].pos);
  const lo: Cell[] = [];
  const hi: Cell[] = [];
  let d = 0;
  for (let r = 1; r <= OUTER_RINGS; r++) {
    d += first * Math.pow(OUTER_GROWTH, r - 1);
    const out = r / OUTER_RINGS;
    lo.unshift({ pos: inner[0].pos - dir * d, idx: 0, out });
    hi.push({ pos: inner[inner.length - 1].pos + dir * d, idx: count - 1, out });
  }
  return [...lo, ...inner, ...hi];
}

function buildGeometry(terrain: TerrainData, frame: Frame, stride: number, base: boolean) {
  const { heights, meta } = terrain;
  const W = meta.width;
  const H = meta.height;
  const { bounds, step } = meta;
  const cols = buildAxis(W, stride, (i) => frame.toX(bounds.lonW + i * step), base);
  const rows = buildAxis(H, stride, (j) => frame.toZ(bounds.latN - j * step), base);
  const nC = cols.length;
  const nR = rows.length;
  const blurred = blurHeights(heights, W, H, 40);

  const positions = new Float32Array(nC * nR * 3);
  const uvs = new Float32Array(nC * nR * 2);
  const rgba = base ? null : new Float32Array(nC * nR * 4);
  for (let r = 0; r < nR; r++) {
    const row = rows[r];
    for (let c = 0; c < nC; c++) {
      const col = cols[c];
      const k = r * nC + c;
      const at = row.idx * W + col.idx;
      const out = Math.max(col.out, row.out);
      // 자료 구역 가장자리까지의 거리(도). 바깥 칸은 인덱스가 가장자리에 고정되어 0 이다.
      const edgeDeg = Math.min(col.idx, W - 1 - col.idx, row.idx, H - 1 - row.idx) * step;
      const w = smooth01(0, FEATHER_DEG, edgeDeg);
      const fall = 1 - OUTER_DROP * out * out * (3 - 2 * out);
      let h: number;
      if (base) {
        // 바닥 땅: 흐릿한 고도. 자료 구역 안쪽에서는 자료 지형 아래로 가라앉혀 가려지게 한다.
        h = frame.toY(blurred[at]) * fall - BASE_SINK * w;
      } else {
        h = frame.toY(blurred[at] + (heights[at] - blurred[at]) * w);
      }
      positions[k * 3] = col.pos;
      positions[k * 3 + 1] = h;
      positions[k * 3 + 2] = row.pos;
      uvs[k * 2] = col.idx / (W - 1);
      uvs[k * 2 + 1] = 1 - row.idx / (H - 1);
      if (rgba) {
        rgba[k * 4] = rgba[k * 4 + 1] = rgba[k * 4 + 2] = 1;
        rgba[k * 4 + 3] = smooth01(0.02, FEATHER_DEG * 0.95, edgeDeg);
      }
    }
  }
  const indices = new Uint32Array((nC - 1) * (nR - 1) * 6);
  let p = 0;
  for (let r = 0; r < nR - 1; r++) {
    for (let c = 0; c < nC - 1; c++) {
      const a = r * nC + c;
      const b = a + 1;
      const d = a + nC;
      const e = d + 1;
      indices[p++] = a;
      indices[p++] = d;
      indices[p++] = b;
      indices[p++] = b;
      indices[p++] = d;
      indices[p++] = e;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  if (rgba) geometry.setAttribute("color", new THREE.BufferAttribute(rgba, 4));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function Terrain({
  terrain,
  frame,
  stride,
}: {
  terrain: TerrainData;
  frame: Frame;
  stride: number;
}) {
  const { surface, ground, texture } = useMemo(() => {
    const surface = buildGeometry(terrain, frame, stride, false);
    // 바닥 땅은 멀리 있어 거칠어도 되므로 조금 성기게 만든다.
    const ground = buildGeometry(terrain, frame, Math.max(stride, 4), true);
    const texture = new THREE.Texture(terrain.color);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
    return { surface, ground, texture };
  }, [terrain, frame, stride]);

  useEffect(
    () => () => {
      surface.dispose();
      ground.dispose();
      texture.dispose();
    },
    [surface, ground, texture],
  );

  return (
    <>
      <mesh geometry={ground} renderOrder={0}>
        <meshStandardMaterial color="#7f7660" roughness={1} metalness={0} />
      </mesh>
      <mesh geometry={surface} renderOrder={1}>
        <meshStandardMaterial map={texture} vertexColors transparent roughness={1} metalness={0} />
      </mesh>
    </>
  );
}

// ---- 산 표지 -----------------------------------------------------------------
function PeakMarker({
  peak,
  base,
  selected,
  onSelect,
  onHover,
}: {
  peak: PeakPoint;
  base: THREE.Vector3;
  selected: boolean;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const phase = peak.number * 0.9;
  const color = selected ? "#ffb454" : "#e9f1ff";

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const s = 1 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.2 + phase));
    ring.current.scale.setScalar(s * (selected ? 1.4 : 1));
  });

  const pole = selected ? POLE_SELECTED : POLE;

  return (
    <group position={base}>
      {/* 땅에서 솟은 빛기둥 */}
      <mesh position={[0, pole / 2, 0]}>
        <cylinderGeometry args={[0.009, 0.009, pole, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.75} />
      </mesh>
      {/* 끝의 점과 맥박 고리 */}
      <mesh position={[0, pole, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring} position={[0, pole, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.105, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* 누르기 쉽도록 눈에 안 보이는 큰 영역 */}
      <mesh
        position={[0, pole * 0.6, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(peak.slug);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          if (e.delta > 6) return; // 드래그였다면 선택하지 않는다
          e.stopPropagation();
          onSelect(peak.slug);
        }}
      >
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ---- 카메라 ------------------------------------------------------------------
function CameraRig({
  controlsRef,
  focus,
  phase,
  homeDistance,
  halfWidth,
  halfDepth,
  onIntroDone,
}: {
  controlsRef: React.RefObject<ComponentRef<typeof OrbitControls> | null>;
  focus: THREE.Vector3 | null; // 선택한 산의 위치. 없으면 전체 전경으로 돌아간다
  phase: Phase;
  homeDistance: number; // 전경을 볼 때의 카메라 거리 (화면 모양에 따라 달라진다)
  halfWidth: number;
  halfDepth: number;
  onIntroDone: () => void;
}) {
  const { camera } = useThree();
  const flying = useRef(false);
  const introStart = useRef<number | null>(null);
  const placedHome = useRef(false);
  const goal = useRef({ target: HOME_TARGET.clone(), distance: homeDistance });

  // 처음 위치: 멀리 위에서 시작한다.
  useEffect(() => {
    camera.position.copy(HOME_TARGET).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(INTRO_FROM.radius, INTRO_FROM.polar, INTRO_FROM.azimuth)));
    camera.lookAt(HOME_TARGET);
  }, [camera]);

  // 선택이 바뀌면 그 산으로(또는 전경으로) 날아간다.
  useEffect(() => {
    goal.current = focus
      ? { target: focus.clone(), distance: FOCUS_DISTANCE }
      : { target: HOME_TARGET.clone(), distance: homeDistance };
    flying.current = true;
  }, [focus, homeDistance]);

  useFrame(({ clock }, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;
    dt = Math.min(dt, 0.05);

    // 1) 로딩 중에는 멀리서 기다린다.
    if (phase === "waiting") return;

    const homePosition = HOME_TARGET.clone().addScaledVector(HOME_DIRECTION, homeDistance);

    // 2) 진입 연출: 멀리서 전경 위치로 내려온다.
    if (phase === "intro") {
      if (introStart.current === null) introStart.current = clock.elapsedTime;
      const t = Math.min(1, (clock.elapsedTime - introStart.current) / INTRO_SECONDS);
      const e = easeOutQuart(t);
      const lerp = THREE.MathUtils.lerp;
      const sph = new THREE.Spherical(
        lerp(INTRO_FROM.radius, homeDistance, e),
        lerp(INTRO_FROM.polar, HOME_POLAR, e),
        lerp(INTRO_FROM.azimuth, HOME_AZIMUTH, e),
      );
      camera.position.copy(HOME_TARGET).add(new THREE.Vector3().setFromSpherical(sph));
      camera.lookAt(HOME_TARGET);
      controls.target.copy(HOME_TARGET);
      if (t >= 1) {
        placedHome.current = true;
        flying.current = false;
        onIntroDone();
      }
      return;
    }

    // 연출을 건너뛰고 바로 자유 보기로 온 경우(움직임 줄이기 설정): 전경 위치에 바로 놓는다.
    if (!placedHome.current) {
      placedHome.current = true;
      camera.position.copy(homePosition);
      controls.target.copy(HOME_TARGET);
      flying.current = false;
    }

    // 3) 산 선택·해제: 목표 지점과 거리로 부드럽게 이동한다. (보는 방향은 유지)
    if (flying.current) {
      const k = 1 - Math.exp(-dt * 2.4);
      controls.target.lerp(goal.current.target, k);
      const offset = camera.position.clone().sub(controls.target);
      const len = offset.length();
      const next = len + (goal.current.distance - len) * k;
      offset.setLength(next);
      camera.position.copy(controls.target).add(offset);
      if (
        controls.target.distanceTo(goal.current.target) < 0.01 &&
        Math.abs(len - goal.current.distance) < 0.02
      ) {
        flying.current = false;
      }
    }

    // 4) 손으로 옮겨도 지형 밖으로 나가지 않게 한다.
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -halfWidth, halfWidth);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -halfDepth, halfDepth);
  });

  return null;
}

// ---- 장면 전체 ---------------------------------------------------------------
function World({
  terrain,
  peaks,
  selected,
  phase,
  reducedMotion,
  coarsePointer,
  onSelect,
  onHover,
  labelRefs,
  onReady,
  onIntroDone,
}: Props) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const viewport = useThree((s) => s.size);
  const homeDistance = homeDistanceFor(viewport.width / viewport.height);
  const exploreStart = useRef<number | null>(null);
  const [interacted, setInteracted] = useState(false); // 한 번이라도 손댔으면 자동 회전을 멈춘다
  const frame = useMemo(() => makeFrame(terrain.meta.bounds), [terrain]);

  // 14좌의 표지 위치: 위도·경도에서 지형 표면 높이를 읽어 그 위에 세운다.
  const bases = useMemo(
    () =>
      peaks.map((p) => ({
        slug: p.slug,
        base: new THREE.Vector3(
          frame.toX(p.lon),
          frame.toY(sampleElevation(terrain, p.lat, p.lon)),
          frame.toZ(p.lat),
        ),
      })),
    [peaks, terrain, frame],
  );
  const focus = useMemo(() => {
    const hit = bases.find((b) => b.slug === selected);
    return hit ? hit.base.clone().add(new THREE.Vector3(0, 0.15, 0)) : null;
  }, [bases, selected]);

  // 첫 화면을 그릴 준비가 끝났음을 한 번 알린다.
  const reported = useRef(false);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const inCameraSpace = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, clock }) => {
    // 도착한 뒤 자동 회전 속도를 0 에서 서서히 올린다. (진입 연출의 끝과 자연스럽게 이어진다)
    if (phase === "explore" && controlsRef.current) {
      if (exploreStart.current === null) exploreStart.current = clock.elapsedTime;
      const k = smoothstep(Math.min(1, (clock.elapsedTime - exploreStart.current) / ROTATE_RAMP_SECONDS));
      controlsRef.current.autoRotateSpeed = AUTO_ROTATE_SPEED * k;
    }
    // 카메라가 멀리 있으면 이름표를 번호만으로 줄여 서로 겹치지 않게 한다.
    const focusPoint = controlsRef.current?.target ?? HOME_TARGET;
    const zoomedOut = camera.position.distanceTo(focusPoint) > 12;
    if (!reported.current) {
      reported.current = true;
      onReady();
    }

    // 이름표 버튼을 각 산 표지의 화면 위치로 옮긴다. (3D 밖의 일반 버튼이라 누르기 쉽다)
    bases.forEach((b, i) => {
      const el = labelRefs.current[i];
      if (!el) return;
      const top = b.slug === selected ? POLE_SELECTED : POLE;
      // 카메라 뒤에 있는 산은 화면에 그리지 않는다. (카메라 좌표계에서 앞쪽은 z 가 음수)
      inCameraSpace
        .set(b.base.x, b.base.y + top + 0.12, b.base.z)
        .applyMatrix4(camera.matrixWorldInverse);
      const inFront = inCameraSpace.z < -0.2;
      projected.set(b.base.x, b.base.y + top + 0.12, b.base.z).project(camera);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      const inView =
        inFront && projected.z < 1 && x > -60 && x < size.width + 60 && y > -40 && y < size.height + 40;
      // 멀수록 작고 흐리게, 가까울수록 크게
      const distance = camera.position.distanceTo(b.base);
      const scale = THREE.MathUtils.clamp(14 / distance, 0.72, 1.15);
      el.classList.toggle("is-compact", zoomedOut && b.slug !== selected);
      el.style.visibility = inView ? "visible" : "hidden";
      el.style.opacity = String(THREE.MathUtils.clamp(1.25 - distance / 60, 0.55, 1));
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%) scale(${scale})`;
    });
  });

  return (
    <>
      {/* 배경색은 화면(CSS)이 칠하고 3D 는 투명하게 그린다. 먼 지형은 같은 색 안개 속으로 사라진다. */}
      <fog attach="fog" args={[BACKGROUND, 20, 78]} />
      <hemisphereLight args={["#9db7e0", "#3b3128", 0.85]} />
      <directionalLight position={[-9, 5.5, 8]} intensity={2.9} color="#ffd9b0" />
      <Stars radius={140} depth={40} count={1800} factor={4} saturation={0} fade speed={0.4} />

      <Terrain terrain={terrain} frame={frame} stride={coarsePointer ? 2 : 1} />
      {peaks.map((p, idx) => (
        <PeakMarker
          key={p.slug}
          peak={p}
          base={bases[idx].base}
          selected={p.slug === selected}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enabled={phase === "explore"}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        screenSpacePanning={false}
        minDistance={1.4}
        maxDistance={Math.max(26, homeDistance * 1.2)}
        minPolarAngle={0.12}
        maxPolarAngle={1.4}
        autoRotate={phase === "explore" && !reducedMotion && !selected && !interacted}
        autoRotateSpeed={0}
        onStart={() => setInteracted(true)}
      />
      <CameraRig
        controlsRef={controlsRef}
        focus={focus}
        phase={phase}
        homeDistance={homeDistance}
        halfWidth={frame.width / 2}
        halfDepth={frame.depth / 2}
        onIntroDone={onIntroDone}
      />
    </>
  );
}

export default function Scene(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.05, far: 400, position: [0, 44, 7] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <World {...props} />
    </Canvas>
  );
}
