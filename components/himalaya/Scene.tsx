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
const INTRO_START = new THREE.Vector3(0, 52, 8);
const POLE = 0.6; // 표지 기둥 높이
const POLE_SELECTED = 1;
const INTRO_SECONDS = 4;
const FOCUS_DISTANCE = 2.6;

// 화면이 세로로 길수록(휴대폰) 14좌가 모두 들어오도록 더 멀리서 본다.
const homeDistanceFor = (aspect: number) =>
  HOME_DISTANCE * THREE.MathUtils.clamp(1.35 / aspect, 1, 2.4);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ---- 지형 ------------------------------------------------------------------
function Terrain({
  terrain,
  frame,
  stride,
}: {
  terrain: TerrainData;
  frame: Frame;
  stride: number;
}) {
  const { geometry, texture, alphaMap } = useMemo(() => {
    const { heights, meta } = terrain;
    const W = meta.width;
    const H = meta.height;
    const { bounds, step } = meta;
    const cols = Math.floor((W - 1) / stride) + 1;
    const rows = Math.floor((H - 1) / stride) + 1;

    const positions = new Float32Array(cols * rows * 3);
    const uvs = new Float32Array(cols * rows * 2);
    for (let r = 0; r < rows; r++) {
      const j = Math.min(r * stride, H - 1);
      const lat = bounds.latN - j * step;
      for (let c = 0; c < cols; c++) {
        const i = Math.min(c * stride, W - 1);
        const k = r * cols + c;
        positions[k * 3] = frame.toX(bounds.lonW + i * step);
        positions[k * 3 + 1] = frame.toY(heights[j * W + i]);
        positions[k * 3 + 2] = frame.toZ(lat);
        uvs[k * 2] = i / (W - 1);
        uvs[k * 2 + 1] = 1 - j / (H - 1);
      }
    }
    const indices = new Uint32Array((cols - 1) * (rows - 1) * 6);
    let p = 0;
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c;
        const b = a + 1;
        const d = a + cols;
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
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();

    const texture = new THREE.Texture(terrain.color);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;

    // 지형이 네모난 판처럼 보이지 않도록, 가장자리와 모서리가 타원 모양으로 어둠 속에 녹아들게 한다.
    // (중심에서 멀어질수록 투명해지고, 모서리는 완전히 사라진다. 14좌는 모두 불투명한 안쪽에 있다.)
    const size = 512;
    const data = new Uint8Array(size * size * 4);
    const smooth = (a: number, b: number, v: number) => {
      const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const r = Math.hypot((2 * x) / (size - 1) - 1, (2 * y) / (size - 1) - 1);
        const a = Math.round(255 * (1 - smooth(0.84, 1.24, r)));
        const o = (y * size + x) * 4;
        data[o] = data[o + 1] = data[o + 2] = a;
        data[o + 3] = 255;
      }
    }
    const alphaMap = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    alphaMap.needsUpdate = true;

    return { geometry, texture, alphaMap };
  }, [terrain, frame, stride]);

  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
      alphaMap.dispose();
    },
    [geometry, texture, alphaMap],
  );

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        map={texture}
        alphaMap={alphaMap}
        transparent
        roughness={1}
        metalness={0}
      />
    </mesh>
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
    camera.position.copy(INTRO_START);
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
      camera.position.lerpVectors(INTRO_START, homePosition, easeInOutCubic(t));
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
  useFrame(({ camera, size }) => {
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
      <fog attach="fog" args={[BACKGROUND, 22, 70]} />
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
        autoRotateSpeed={0.35}
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
