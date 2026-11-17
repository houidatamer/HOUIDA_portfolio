import { useEffect, useRef } from "react";

export function CreativeField({
  activeCluster,
  onHoverCluster,
}: {
  activeCluster: number | null;
  onHoverCluster: (id: number | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<number | null>(activeCluster);
  const hoverCallbackRef = useRef(onHoverCluster);

  useEffect(() => {
    activeRef.current = activeCluster;
  }, [activeCluster]);

  useEffect(() => {
    hoverCallbackRef.current = onHoverCluster;
  }, [onHoverCluster]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let hoveredLayer: number | null = null;

    const layerLift = [0, 0, 0, 0];

    const pointer = {
      nx: 0,
      ny: 0,
      tx: 0,
      ty: 0,
      px: -9999,
      py: -9999,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const getIsoProjector = (
      cx: number,
      cy: number,
      size: number,
      tiltX: number,
      tiltY: number
    ) => {
      const cosA = Math.cos(Math.PI / 4 + tiltX * 0.06);
      const sinA = Math.sin(Math.PI / 4 + tiltX * 0.06);
      const ySquash = 0.54 + tiltY * 0.04;

      return (u: number, v: number, z = 0): [number, number] => {
        const rx = u * cosA - v * sinA;
        const ry = u * sinA + v * cosA;
        return [cx + rx * size, cy + ry * size * ySquash - z];
      };
    };

    const pointInPoly = (px: number, py: number, pts: [number, number][]) => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i]![0];
        const yi = pts[i]![1];
        const xj = pts[j]![0];
        const yj = pts[j]![1];
        const intersect =
          yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-6) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const getLayoutMetrics = () => {
      const isMobile = width < 768;
      const cx = isMobile ? width * 0.5 : width * 0.70;
      const stackCenterY = isMobile ? height * 0.74 : height * 0.51;
      const planeSize = isMobile
        ? Math.min(width * 0.42, 175)
        : Math.min(width * 0.235, height * 0.31, 290);
      const layerGap = isMobile ? planeSize * 0.34 : planeSize * 0.37;
      return { isMobile, cx, stackCenterY, planeSize, layerGap };
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.px = x;
      pointer.py = y;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        pointer.tx = (x / width - 0.5) * 2;
        pointer.ty = (y / height - 0.5) * 2;

        const { isMobile, cx, stackCenterY, planeSize, layerGap } = getLayoutMetrics();
        if (!isMobile) {
          // Convert the pointer position back into the animation's unscaled coordinates.
          const animationScale = 0.78;
          const hitX = cx + (x - cx) / animationScale;
          const hitY = stackCenterY + (y - stackCenterY) / animationScale;
          let found: number | null = null;
          for (let idx = 0; idx < 4; idx++) {
            const baseY = stackCenterY + (idx - 1.5) * layerGap - layerLift[idx]!;
            const proj = getIsoProjector(cx, baseY, planeSize, pointer.nx, pointer.ny);
            const quad: [number, number][] = [
              proj(-1, -1),
              proj(1, -1),
              proj(1, 1),
              proj(-1, 1),
            ];
            if (pointInPoly(hitX, hitY, quad)) {
              found = idx;
              break;
            }
          }
          if (found !== hoveredLayer) {
            hoveredLayer = found;
            hoverCallbackRef.current(found);
          }
        }
      } else {
        pointer.tx = 0;
        pointer.ty = 0;
        if (hoveredLayer !== null) {
          hoveredLayer = null;
          hoverCallbackRef.current(null);
        }
      }
    };

    const onPointerLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
      if (hoveredLayer !== null) {
        hoveredLayer = null;
        hoverCallbackRef.current(null);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    const startTime = performance.now();

    const drawIsoLabel = (
      text: string,
      p1: [number, number],
      p2: [number, number],
      offsetNormal: number,
      fontSize: number,
      alpha: number
    ) => {
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const len = Math.hypot(dx, dy) || 1;
      const angle = Math.atan2(dy, dx);
      const nx = -dy / len;
      const ny = dx / len;

      ctx.save();
      ctx.translate(p1[0] + nx * offsetNormal, p1[1] + ny * offsetNormal);
      ctx.rotate(angle);
      ctx.font = `400 ${fontSize}px "Inter Tight", system-ui, sans-serif`;
      ctx.fillStyle = `rgba(17, 17, 17, ${alpha})`;
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    const render = (now: number) => {
      const t = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      pointer.nx += (pointer.tx - pointer.nx) * 0.06;
      pointer.ny += (pointer.ty - pointer.ny) * 0.06;

      const activeId = activeRef.current ?? hoveredLayer;
      const { isMobile, cx, stackCenterY, planeSize, layerGap } = getLayoutMetrics();

      // Uniformly scale the complete illustration around its existing center.
      // This keeps every layer, label, line, dot and animation in proportion.
      const animationScale = isMobile ? 0.86 : 0.78;
      ctx.save();
      ctx.translate(cx * (1 - animationScale), stackCenterY * (1 - animationScale));
      ctx.scale(animationScale, animationScale);

      for (let i = 0; i < 4; i++) {
        let targetLift = Math.sin(t * 1.1 + i * 1.2) * 2.5;
        if (activeId !== null) {
          if (i < activeId) targetLift += 18;
          else if (i === activeId) targetLift += 10;
          else targetLift -= 12;
        }
        layerLift[i] += (targetLift - layerLift[i]!) * 0.1;
      }

      const topY = stackCenterY + (0 - 1.5) * layerGap - layerLift[0]!;
      const botY = stackCenterY + (3 - 1.5) * layerGap - layerLift[3]!;
      const projTop = getIsoProjector(cx, topY, planeSize, pointer.nx, pointer.ny);
      const projBot = getIsoProjector(cx, botY, planeSize, pointer.nx, pointer.ny);

      const topCorners: [number, number][] = [
        projTop(-1, -1),
        projTop(1, -1),
        projTop(1, 1),
        projTop(-1, 1),
      ];
      const botCorners: [number, number][] = [
        projBot(-1, -1),
        projBot(1, -1),
        projBot(1, 1),
        projBot(-1, 1),
      ];

      ctx.save();
      ctx.setLineDash([2.5, 3]);
      ctx.strokeStyle = "rgba(17, 17, 17, 0.24)";
      ctx.lineWidth = 0.8;
      for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        ctx.moveTo(topCorners[c]![0], topCorners[c]![1] - 12);
        ctx.lineTo(botCorners[c]![0], botCorners[c]![1] + 12);
        ctx.stroke();
      }

      if (!isMobile) {
        ctx.setLineDash([]);
        ctx.font = '400 10px "Inter Tight", system-ui, sans-serif';
        ctx.fillStyle = "rgba(17, 17, 17, 0.48)";
        ctx.textBaseline = "middle";

        const leftPt = projTop(-1, 1);
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(leftPt[0] - 16, leftPt[1]);
        ctx.lineTo(leftPt[0] - 4, leftPt[1]);
        ctx.stroke();
        ctx.fillText("1px", leftPt[0] - 36, leftPt[1]);

        const midLeftPt = getIsoProjector(
          cx,
          stackCenterY + (1.5 - 1.5) * layerGap,
          planeSize,
          pointer.nx,
          pointer.ny
        )(-1, 1);
        ctx.beginPath();
        ctx.moveTo(midLeftPt[0] - 16, midLeftPt[1]);
        ctx.lineTo(midLeftPt[0] - 4, midLeftPt[1]);
        ctx.stroke();
        ctx.fillText("1px", midLeftPt[0] - 36, midLeftPt[1]);

        const botLeftPt = projBot(-1, 1);
        ctx.beginPath();
        ctx.moveTo(botLeftPt[0] - 16, botLeftPt[1]);
        ctx.lineTo(botLeftPt[0] - 4, botLeftPt[1]);
        ctx.stroke();
        ctx.fillText("1px", botLeftPt[0] - 36, botLeftPt[1]);

        const rightPt = projTop(1, -1);
        ctx.beginPath();
        ctx.moveTo(rightPt[0] + 4, rightPt[1]);
        ctx.lineTo(rightPt[0] + 18, rightPt[1]);
        ctx.stroke();
        ctx.fillText("42°", rightPt[0] + 22, rightPt[1]);

        const botRightPt = projBot(1, -1);
        ctx.beginPath();
        ctx.moveTo(botRightPt[0] + 4, botRightPt[1]);
        ctx.lineTo(botRightPt[0] + 18, botRightPt[1]);
        ctx.stroke();
        ctx.fillText("1px", botRightPt[0] + 22, botRightPt[1]);

        const apexPt = projTop(-1, -1);
        ctx.fillText("1px", apexPt[0] + 10, apexPt[1] - 12);

        const nadirPt = projBot(1, 1);
        ctx.fillText("1px", nadirPt[0] - 10, nadirPt[1] + 22);
      }
      ctx.restore();

      const layerNames = ["Étalonnage", "Montage", "Motion design", "Art 3D"];

      for (let idx = 3; idx >= 0; idx--) {
        const isSelected = activeId === idx;
        const isDimmed = activeId !== null && !isSelected;
        const alphaMult = isDimmed ? 0.35 : 1;

        const layerY = stackCenterY + (idx - 1.5) * layerGap - layerLift[idx]!;
        const proj = getIsoProjector(cx, layerY, planeSize, pointer.nx, pointer.ny);

        const pTL = proj(-1, -1);
        const pTR = proj(1, -1);
        const pBR = proj(1, 1);
        const pBL = proj(-1, 1);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pTL[0], pTL[1]);
        ctx.lineTo(pTR[0], pTR[1]);
        ctx.lineTo(pBR[0], pBR[1]);
        ctx.lineTo(pBL[0], pBL[1]);
        ctx.closePath();

        ctx.fillStyle =
          idx === 3
            ? "rgba(255, 255, 255, 0.92)"
            : isSelected
              ? "rgba(255, 255, 255, 0.88)"
              : "rgba(250, 250, 250, 0.82)";
        ctx.fill();

        ctx.strokeStyle = `rgba(17, 17, 17, ${(isSelected ? 0.85 : 0.42) * alphaMult})`;
        ctx.lineWidth = isSelected ? 1.25 : 0.85;
        ctx.stroke();

        ctx.clip();

        // --- LAYER 0 (TOP): ÉTALONNAGE (Color Wheels & Sliders) ---
        if (idx === 0) {
          const wheelCenters: [number, number, number][] = [
            [-0.45, -0.42, 0.34],
            [0.25, -0.42, 0.34],
            [-0.45, 0.36, 0.34],
          ];

          for (let w = 0; w < wheelCenters.length; w++) {
            const [wu, wv, wr] = wheelCenters[w]!;
            const segs = 24;
            for (let s = 0; s < segs; s++) {
              const a0 = (s / segs) * Math.PI * 2 + t * 0.25;
              const a1 = ((s + 1) / segs) * Math.PI * 2 + t * 0.25;
              const hue = (s / segs) * 360;
              const cPt = proj(wu, wv);
              const pA = proj(wu + Math.cos(a0) * wr, wv + Math.sin(a0) * wr);
              const pB = proj(wu + Math.cos(a1) * wr, wv + Math.sin(a1) * wr);

              ctx.beginPath();
              ctx.moveTo(cPt[0], cPt[1]);
              ctx.lineTo(pA[0], pA[1]);
              ctx.lineTo(pB[0], pB[1]);
              ctx.closePath();
              ctx.fillStyle = `hsla(${hue}, 68%, 56%, ${0.42 * alphaMult})`;
              ctx.fill();
            }

            const ringPts = 28;
            ctx.beginPath();
            for (let s = 0; s <= ringPts; s++) {
              const a = (s / ringPts) * Math.PI * 2;
              const pt = proj(wu + Math.cos(a) * wr, wv + Math.sin(a) * wr);
              if (s === 0) ctx.moveTo(pt[0], pt[1]);
              else ctx.lineTo(pt[0], pt[1]);
            }
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.45 * alphaMult})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();

            const dotPt = proj(
              wu + Math.cos(t * 0.9 + w) * wr * 0.32,
              wv + Math.sin(t * 0.9 + w) * wr * 0.32
            );
            ctx.beginPath();
            ctx.arc(dotPt[0], dotPt[1], 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(17, 17, 17, ${0.85 * alphaMult})`;
            ctx.fill();
          }

          const sliderRows = [0.15, 0.34, 0.53, 0.72];
          const sliderColors = ["#ef4444", "#22c55e", "#3b82f6", "#111111"];
          sliderRows.forEach((sv, rIdx) => {
            const pStart = proj(0.05, sv);
            const pEnd = proj(0.84, sv);
            ctx.beginPath();
            ctx.moveTo(pStart[0], pStart[1]);
            ctx.lineTo(pEnd[0], pEnd[1]);
            ctx.strokeStyle = sliderColors[rIdx]!;
            ctx.globalAlpha = 0.55 * alphaMult;
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.globalAlpha = 1;

            const knobU = 0.45 + Math.sin(t * 1.1 + rIdx * 1.4) * 0.25;
            const pKnob = proj(knobU, sv);
            ctx.beginPath();
            ctx.arc(pKnob[0], pKnob[1], 2.3, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.85 * alphaMult})`;
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();
          });
        }

        // --- LAYER 1: MONTAGE (NLE Timeline, Filmstrip & Audio Waveforms) ---
        if (idx === 1) {
          const frames = [-0.82, -0.25, 0.32];
          frames.forEach((fu, fIdx) => {
            const f0 = proj(fu, -0.78);
            const f1 = proj(fu + 0.5, -0.78);
            const f2 = proj(fu + 0.5, -0.22);
            const f3 = proj(fu, -0.22);

            ctx.beginPath();
            ctx.moveTo(f0[0], f0[1]);
            ctx.lineTo(f1[0], f1[1]);
            ctx.lineTo(f2[0], f2[1]);
            ctx.lineTo(f3[0], f3[1]);
            ctx.closePath();
            ctx.fillStyle = `rgba(17, 17, 17, ${(0.08 + fIdx * 0.05) * alphaMult})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.35 * alphaMult})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          });

          const tracks = [-0.04, 0.26, 0.56];
          tracks.forEach((tv, tIdx) => {
            const t0 = proj(-0.86, tv);
            const t1 = proj(0.86, tv);
            const t2 = proj(0.86, tv + 0.22);
            const t3 = proj(-0.86, tv + 0.22);

            ctx.beginPath();
            ctx.moveTo(t0[0], t0[1]);
            ctx.lineTo(t1[0], t1[1]);
            ctx.lineTo(t2[0], t2[1]);
            ctx.lineTo(t3[0], t3[1]);
            ctx.closePath();
            ctx.fillStyle = `rgba(17, 17, 17, ${0.04 * alphaMult})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.28 * alphaMult})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();

            if (tIdx >= 1) {
              ctx.beginPath();
              for (let u = -0.82; u <= 0.82; u += 0.04) {
                const amp =
                  (0.03 + 0.065 * Math.abs(Math.sin(u * 14 + t * 2.2 + tIdx))) *
                  Math.cos(u * 1.4);
                const wTop = proj(u, tv + 0.11 - amp);
                const wBot = proj(u, tv + 0.11 + amp);
                ctx.moveTo(wTop[0], wTop[1]);
                ctx.lineTo(wBot[0], wBot[1]);
              }
              ctx.strokeStyle = `rgba(17, 17, 17, ${0.42 * alphaMult})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          });

          const playU = Math.sin(t * 0.65) * 0.72;
          const phTop = proj(playU, -0.88);
          const phBot = proj(playU, 0.86);
          ctx.beginPath();
          ctx.moveTo(phTop[0], phTop[1]);
          ctx.lineTo(phBot[0], phBot[1]);
          ctx.strokeStyle = `rgba(17, 17, 17, ${0.85 * alphaMult})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        // --- LAYER 2: MOTION DESIGN (Bezier Curves & Keyframe Handles) ---
        if (idx === 2) {
          ctx.strokeStyle = `rgba(17, 17, 17, ${0.09 * alphaMult})`;
          ctx.lineWidth = 0.6;
          for (let g = -0.6; g <= 0.61; g += 0.4) {
            const a = proj(g, -1);
            const b = proj(g, 1);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();

            const c = proj(-1, g);
            const d = proj(1, g);
            ctx.beginPath();
            ctx.moveTo(c[0], c[1]);
            ctx.lineTo(d[0], d[1]);
            ctx.stroke();
          }

          const wave = Math.sin(t * 1.4) * 0.16;
          const curves = [
            {
              p0: [-0.75, 0.55],
              c1: [-0.25 + wave, -0.65],
              c2: [0.25, 0.65 - wave],
              p1: [0.75, -0.55],
              op: 0.65,
            },
            {
              p0: [-0.75, 0.25],
              c1: [-0.15, -0.45 - wave],
              c2: [0.35 + wave, 0.35],
              p1: [0.75, -0.25],
              op: 0.32,
            },
          ];

          for (const cv of curves) {
            const s0 = proj(cv.p0[0]!, cv.p0[1]!);
            const sc1 = proj(cv.c1[0]!, cv.c1[1]!);
            const sc2 = proj(cv.c2[0]!, cv.c2[1]!);
            const s1 = proj(cv.p1[0]!, cv.p1[1]!);

            ctx.beginPath();
            ctx.moveTo(s0[0], s0[1]);
            ctx.bezierCurveTo(sc1[0], sc1[1], sc2[0], sc2[1], s1[0], s1[1]);
            ctx.strokeStyle = `rgba(17, 17, 17, ${cv.op * alphaMult})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(s0[0], s0[1]);
            ctx.lineTo(sc1[0], sc1[1]);
            ctx.moveTo(s1[0], s1[1]);
            ctx.lineTo(sc2[0], sc2[1]);
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.35 * alphaMult})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();

            for (const pt of [s0, s1]) {
              ctx.fillStyle = "#ffffff";
              ctx.strokeStyle = `rgba(17, 17, 17, ${0.8 * alphaMult})`;
              ctx.lineWidth = 1;
              ctx.fillRect(pt[0] - 2.5, pt[1] - 2.5, 5, 5);
              ctx.strokeRect(pt[0] - 2.5, pt[1] - 2.5, 5, 5);
            }
            for (const pt of [sc1, sc2]) {
              ctx.beginPath();
              ctx.arc(pt[0], pt[1], 2.2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(17, 17, 17, ${0.75 * alphaMult})`;
              ctx.fill();
            }
          }
        }

        // --- LAYER 3 (BOTTOM): ART 3D (3D Undulating Point-Cloud Terrain Mesh + X/Y/Z Gizmo) ---
        if (idx === 3) {
          const GRID = 13;
          const step = 1.72 / (GRID - 1);
          const maxAmp = planeSize * 0.16;
          const gridPts: { x: number; y: number; bx: number; by: number; h: number }[][] = [];

          for (let r = 0; r < GRID; r++) {
            const row: { x: number; y: number; bx: number; by: number; h: number }[] = [];
            const v = -0.86 + r * step;
            for (let c = 0; c < GRID; c++) {
              const u = -0.86 + c * step;
              const dist = Math.hypot(u - 0.15, v - 0.15);
              const wave =
                Math.sin(u * 3.1 + t * 1.1) * Math.cos(v * 3.1 - t * 0.85) * 0.65 +
                Math.exp(-dist * dist * 2.4) * 0.95;
              const z = wave * maxAmp;
              const pt = proj(u, v, z);
              const basePt = proj(u, v, 0);
              row.push({ x: pt[0], y: pt[1], bx: basePt[0], by: basePt[1], h: wave });
            }
            gridPts.push(row);
          }

          // Subtle base floor reference grid
          ctx.strokeStyle = `rgba(17, 17, 17, ${0.07 * alphaMult})`;
          ctx.lineWidth = 0.5;
          for (let i = 0; i < GRID; i += 2) {
            ctx.beginPath();
            ctx.moveTo(gridPts[i]![0]!.bx, gridPts[i]![0]!.by);
            ctx.lineTo(gridPts[i]![GRID - 1]!.bx, gridPts[i]![GRID - 1]!.by);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(gridPts[0]![i]!.bx, gridPts[0]![i]!.by);
            ctx.lineTo(gridPts[GRID - 1]![i]!.bx, gridPts[GRID - 1]![i]!.by);
            ctx.stroke();
          }

          // Vertical elevation stems on peaks
          for (let r = 1; r < GRID - 1; r += 2) {
            for (let c = 1; c < GRID - 1; c += 2) {
              const cell = gridPts[r]![c]!;
              if (cell.h > 0.35) {
                ctx.beginPath();
                ctx.setLineDash([1.5, 2]);
                ctx.moveTo(cell.bx, cell.by);
                ctx.lineTo(cell.x, cell.y);
                ctx.strokeStyle = `rgba(17, 17, 17, ${0.26 * alphaMult})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
                ctx.setLineDash([]);
              }
            }
          }

          // 3D surface wireframe isolines (U & V)
          for (let r = 0; r < GRID; r++) {
            ctx.beginPath();
            for (let c = 0; c < GRID; c++) {
              const pt = gridPts[r]![c]!;
              if (c === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.22 * alphaMult})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }

          for (let c = 0; c < GRID; c++) {
            ctx.beginPath();
            for (let r = 0; r < GRID; r++) {
              const pt = gridPts[r]![c]!;
              if (r === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.18 * alphaMult})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }

          // 3D point-cloud vertices scaled by Z elevation
          for (let r = 0; r < GRID; r++) {
            for (let c = 0; c < GRID; c++) {
              const pt = gridPts[r]![c]!;
              const normH = Math.max(0, Math.min(1, (pt.h + 0.5) / 1.5));
              const dotR = 0.8 + normH * 1.45;
              const dotAlpha = (0.28 + normH * 0.62) * alphaMult;

              ctx.beginPath();
              ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(17, 17, 17, ${dotAlpha})`;
              ctx.fill();
            }
          }

          // Blender-style 3D X/Y/Z axis gizmo in the visible front corner
          const origin = proj(0.58, 0.58, 0);
          const xAxis = proj(0.84, 0.58, 0);
          const yAxis = proj(0.58, 0.84, 0);
          const zAxis = proj(0.58, 0.58, planeSize * 0.14);

          const axes: { end: [number, number]; label: string }[] = [
            { end: xAxis, label: "X" },
            { end: yAxis, label: "Y" },
            { end: zAxis, label: "Z" },
          ];

          ctx.font = '500 8.5px "Inter Tight", system-ui, sans-serif';
          ctx.textBaseline = "middle";
          for (const ax of axes) {
            ctx.beginPath();
            ctx.moveTo(origin[0], origin[1]);
            ctx.lineTo(ax.end[0], ax.end[1]);
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.75 * alphaMult})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = `rgba(17, 17, 17, ${0.85 * alphaMult})`;
            ctx.fillText(ax.label, ax.end[0] + 3, ax.end[1] - 2);
          }
        }

        ctx.restore();

        const labelSize = isMobile ? 10 : 12;
        drawIsoLabel(
          layerNames[idx]!,
          pBL,
          pBR,
          14,
          labelSize,
          (isSelected ? 0.95 : 0.72) * alphaMult
        );

        if (idx === 0) {
          drawIsoLabel(
            "Image Pipeline & Post-Production",
            pBL,
            pTL,
            -12,
            isMobile ? 9 : 11,
            0.78 * alphaMult
          );
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}