"use client";

// 따라다니는 커서 (마우스가 있는 기기에서만)
//
// 작은 점은 바로 따라오고, 고리는 조금 늦게 부드럽게 따라온다.
// 산 위에 올리면 고리가 커지고 "열기" 글자가 나타난다. 휴대폰 등 터치 기기에서는 쓰지 않는다.

import { useEffect, useRef, useState, type RefObject } from "react";

type Props = {
  enabled: boolean; // 마우스가 있는 기기에서만 true
  containerRef: RefObject<HTMLElement | null>;
  label: string; // 고리 아래에 보여 줄 글자
  hovering: boolean; // 산 위에 올라가 있는가
};

export default function CustomCursor({ enabled, containerRef, label, hovering }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const orbit = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;
    const target = { x: 0, y: 0 };
    const ring = { x: 0, y: 0 };
    let first = true;
    let frame = 0;

    const move = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (first) {
        ring.x = target.x;
        ring.y = target.y;
        first = false;
      }
      setVisible(true);
    };
    const leave = () => setVisible(false);

    const loop = () => {
      ring.x += (target.x - ring.x) * 0.2;
      ring.y += (target.y - ring.y) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px,${target.y}px,0) translate(-50%,-50%)`;
      if (orbit.current) orbit.current.style.transform = `translate3d(${ring.x}px,${ring.y}px,0) translate(-50%,-50%)`;
      if (root.current) {
        const lab = root.current.querySelector<HTMLElement>(".hx-cursor-label");
        if (lab) lab.style.transform = `translate3d(${ring.x}px,${ring.y + 28}px,0) translateX(-50%)`;
      }
      frame = requestAnimationFrame(loop);
    };

    container.addEventListener("pointermove", move);
    container.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(loop);
    return () => {
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, [containerRef, enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`hx-cursor ${visible ? "is-visible" : ""} ${hovering ? "is-hover" : ""}`}
    >
      <span ref={orbit} className="hx-cursor-orbit" />
      <span ref={dot} className="hx-cursor-dot" />
      <span className="hx-cursor-label">{label}</span>
    </div>
  );
}
