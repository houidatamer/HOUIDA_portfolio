import { useEffect, useRef } from "react";

// Low-poly 3D sculpted head/mask vertices & triangle edges for the Art 3D layer
const HEAD_VERTS: [number, number, number][] = [
  [0, -1.05, 0.15],    // 0: crown
  [0, -0.78, 0.72],    // 1: forehead center
  [-0.46, -0.72, 0.52],// 2: forehead L
  [0.46, -0.72, 0.52], // 3: forehead R
  [-0.68, -0.25, 0.18],// 4: temple L
  [0.68, -0.25, 0.18], // 5: temple R
  [-0.34, -0.28, 0.78],// 6: brow L
  [0.34, -0.28, 0.78], // 7: brow R
  [0, -0.22, 0.88],    // 8: glabella
  [-0.36, -0.05, 0.74],// 9: eye L
  [0.36, -0.05, 0.74], // 10: eye R
  [0, 0.08, 1.04],     // 11: nose tip
  [-0.22, 0.14, 0.82], // 12: nostril L
  [0.22, 0.14, 0.82],  // 13: nostril R
  [-0.58, 0.18, 0.44], // 14: cheekbone L
  [0.58, 0.18, 0.44],  // 15: cheekbone R
  [0, 0.36, 0.86],     // 16: upper lip
  [-0.26, 0.42, 0.72], // 17: mouth corner L
  [0.26, 0.42, 0.72],  // 18: mouth corner R
  [0, 0.56, 0.82],     // 19: lower lip
  [-0.44, 0.62, 0.34], // 20: jaw L
  [0.44, 0.62, 0.34],  // 21: jaw R
  [0, 0.94, 0.62],     // 22: chin
  [0, -0.35, -0.75],   // 23: back cranium
  [-0.54, 0.15, -0.55],// 24: back L
  [0.54, 0.15, -0.55], // 25: back R
  [0, 0.75, -0.35],    // 26: nape
];

const HEAD_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 23],
  [1, 2], [1, 3], [1, 6], [1, 7], [1, 8],
  [2, 4], [2, 6], [3, 5], [3, 7],
  [4, 9], [4, 14], [4, 24], [5, 10], [5, 15], [5, 25],
  [6, 8], [6, 9], [7, 8], [7, 10],
  [8, 11], [9, 11], [9, 12], [9, 14], [10, 11], [10, 13], [10, 15],
  [11, 12], [11, 13], [11, 16],
  [12, 14], [12, 16], [12, 17], [13, 15], [13, 16], [13, 18],
  [14, 17], [14, 20], [15, 18], [15, 21],
  [16, 17], [16, 18], [16, 19],
  [17, 19], [17, 20], [17, 22], [18, 19], [18, 21], [18, 22],
  [19, 22], [20, 22], [21, 22],
  [20, 24], [20, 26], [21, 25], [21, 26],
  [23, 24], [23, 25], [23, 26], [24, 26], [25, 26],
];

const HEAD_TRIS: [number, number, number][] = [
  [1, 2, 6], [1, 6, 8], [1, 8, 7], [1, 7, 3],
  [6, 9, 8], [8, 9, 11], [8, 11, 10], [8, 10, 7],
  [9, 14, 12], [9, 12, 11], [10, 11, 13], [10, 13, 15],
  [11, 12, 16], [11, 16, 13],
  [12, 17, 16], [13, 16, 18],
  [16, 17, 19], [16, 19, 18],
  [17, 20, 22], [17, 22, 19], [19, 22, 18], [18, 22, 21],
];

type RingParticle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
};

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

    // Smooth interpolated elevation offsets for each of the 4 layers
    const layerLift = [0, 0, 0, 0];

    const pointer = {
      nx: 0,
      ny: 0,
      tx: 0,
      ty: 0,
      px: -9999,
      py: -9999,
    };

    // Pre-generate point-cloud particles around the 3D head mesh
    const ringParticles: RingParticle[] = Array.from({ length: 170 }, (_, i) => ({
      angle: (i / 170) * Math.PI * 2 + Math.random() * 0.2,
      radius: 0.42 + Math.random() * 0.46,
      speed: (0.12 + Math.random() * 0.22) * (i % 2 === 0 ? 1 : -1),
      size: 0.7 + Math.random() * 1.1,
      alpha: 0.25 + Math.random() * 0.55,
    }));

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

    // Helper: map normalized plane coordinates (u in [-1,1], v in [-1,1]) to screen isometric coords
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

    // Point-in-quad hit test for hovering any of the 4 isometric planes directly
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
      const cx = isMobile ? width * 0.5 : width * 0.725;
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

        // Check hover from top layer (0) to bottom layer (3)
        const { isMobile, cx, stackCenterY, planeSize, layerGap } = getLayoutMetrics();
        if (!isMobile) {
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
            if (pointInPoly(x, y, quad)) {
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

      // Smoothly animate exploded elevation when hovering any discipline
      for (let i = 0; i < 4; i++) {
        let targetLift = Math.sin(t * 1.1 + i * 1.2) * 2.5;
        if (activeId !== null) {
          if (i < activeId) targetLift += 18;
          else if (i === activeId) targetLift += 10;
          else targetLift -= 12;
        }
        layerLift[i] += (targetLift - layerLift[i]!) * 0.1;
      }

      // Compute corners of top (0) and bottom (3) planes for vertical architectural guide lines
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

      // Vertical dashed corner guides connecting top to bottom layer
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

      // Dimension ticks ("1px" and "42°")
      if (!isMobile) {
        ctx.setLineDash([]);
        ctx.font = '400 10px "Inter Tight", system-ui, sans-serif';
        ctx.fillStyle = "rgba(17, 17, 17, 0.48)";
        ctx.textBaseline = "middle";

        // Left "1px" ticks
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

        // Right "42°" & "1px" ticks
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

        // Top apex tick
        const apexPt = projTop(-1, -1);
        ctx.fillText("1px", apexPt[0] + 10, apexPt[1] - 12);

        // Bottom apex tick
        const nadirPt = projBot(1, 1);
        ctx.fillText("1px", nadirPt[0] - 10, nadirPt[1] + 22);
      }
      ctx.restore();

      // Order from top (0) to bottom (3): Étalonnage, Montage, Motion design, Art 3D
      const layerNames = ["Étalonnage", "Montage", "Motion design", "Art 3D"];

      // Draw layers from bottom (3: Art 3D) to top (0: Étalonnage) for proper painter's occlusion
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

        // Plane fill (translucent frosted white so lower layers peek through subtly)
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

        // Outer border of isometric plane
        ctx.strokeStyle = `rgba(17, 17, 17, ${(isSelected ? 0.85 : 0.42) * alphaMult})`;
        ctx.lineWidth = isSelected ? 1.25 : 0.85;
        ctx.stroke();

        // Clip internal UI/artwork cleanly to the plane diamond
        ctx.clip();

        // --- LAYER 2: MOTION DESIGN (Bezier Curves & Keyframe Handles) ---
        if (idx === 2) {
          // Subtle grid lines
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

          // Animated cubic bezier easing curves
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

            // Tangent handle lines & keyframe nodes
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

        // --- LAYER 0 (TOP): ÉTALONNAGE (Color Wheels, RGB Parade & Sliders) ---
        if (idx === 0) {
          const wheelCenters: [number, number, number][] = [
            [-0.45, -0.42, 0.34],
            [0.25, -0.42, 0.34],
            [-0.45, 0.36, 0.34],
          ];

          for (let w = 0; w < wheelCenters.length; w++) {
            const [wu, wv, wr] = wheelCenters[w]!;
            // Draw segmented color wheel ring in isometric space
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

            // Wheel outer ring & moving balance dot
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

          // Right side grading sliders & RGB spectrum bars
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
          // Top filmstrip preview frames
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

          // Timeline tracks (V1, A1, A2)
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

            // Audio waveform spikes inside audio tracks
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

          // Scrubbing playhead line across timeline
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

        // --- LAYER 3 (BOTTOM): ART 3D (Low-Poly Wireframe Head + Point-Cloud Ring) ---
        if (idx === 3) {
          // Subtle point-grid texture on the plane
          ctx.fillStyle = `rgba(17, 17, 17, ${0.12 * alphaMult})`;
          for (let gu = -0.85; gu <= 0.86; gu += 0.17) {
            for (let gv = -0.85; gv <= 0.86; gv += 0.17) {
              const gp = proj(gu, gv);
              ctx.fillRect(gp[0] - 0.5, gp[1] - 0.5, 1, 1);
            }
          }

          // Orbiting point-cloud ring on the plane
          for (const rp of ringParticles) {
            const a = rp.angle + t * rp.speed;
            const pt = proj(Math.cos(a) * rp.radius, Math.sin(a) * rp.radius);
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], rp.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(17, 17, 17, ${rp.alpha * alphaMult})`;
            ctx.fill();
          }

          // Project 3D sculpted low-poly head mesh floating above the plane center
          const yaw = Math.sin(t * 0.55) * 0.55 + pointer.nx * 0.35;
          const pitch = -0.25 + pointer.ny * 0.2;
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          const cosP = Math.cos(pitch);
          const sinP = Math.sin(pitch);

          const meshScale = planeSize * 0.44;
          const meshCenter = proj(0, 0, planeSize * 0.14);

          const projectedVerts: [number, number, number][] = HEAD_VERTS.map(([vx, vy, vz]) => {
            const rx = vx * cosY + vz * sinY;
            const rz1 = -vx * sinY + vz * cosY;
            const ry = vy * cosP - rz1 * sinP;
            const rz = vy * sinP + rz1 * cosP;

            const persp = 3.2 / (3.2 - rz * 0.5);
            return [
              meshCenter[0] + rx * meshScale * persp,
              meshCenter[1] + ry * meshScale * persp,
              rz,
            ];
          });

          // Subtle shaded facets on front-facing triangles
          for (const [i0, i1, i2] of HEAD_TRIS) {
            const v0 = projectedVerts[i0]!;
            const v1 = projectedVerts[i1]!;
            const v2 = projectedVerts[i2]!;
            const avgZ = (v0[2] + v1[2] + v2[2]) / 3;
            if (avgZ > 0.1) {
              ctx.beginPath();
              ctx.moveTo(v0[0], v0[1]);
              ctx.lineTo(v1[0], v1[1]);
              ctx.lineTo(v2[0], v2[1]);
              ctx.closePath();
              ctx.fillStyle = `rgba(17, 17, 17, ${(0.04 + avgZ * 0.08) * alphaMult})`;
              ctx.fill();
            }
          }

          // Wireframe mesh edges
          for (const [i0, i1] of HEAD_EDGES) {
            const v0 = projectedVerts[i0]!;
            const v1 = projectedVerts[i1]!;
            const avgZ = (v0[2] + v1[2]) * 0.5;
            const edgeAlpha = (avgZ > 0 ? 0.58 : 0.18) * alphaMult;

            ctx.beginPath();
            ctx.moveTo(v0[0], v0[1]);
            ctx.lineTo(v1[0], v1[1]);
            ctx.strokeStyle = `rgba(17, 17, 17, ${edgeAlpha})`;
            ctx.lineWidth = avgZ > 0 ? 0.85 : 0.5;
            ctx.stroke();
          }

          // Mesh vertex dots
          for (const [vx, vy, vz] of projectedVerts) {
            if (vz > -0.1) {
              ctx.beginPath();
              ctx.arc(vx, vy, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(17, 17, 17, ${0.82 * alphaMult})`;
              ctx.fill();
            }
          }
        }

        ctx.restore();

        // Isometric rotated edge labels along the left/top edges of each plane
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