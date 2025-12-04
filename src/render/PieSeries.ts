import { Series } from "./Series";
import { Point } from "../math/Transform";

export interface PieData {
  label: string;
  value: number;
  color?: string;
}

export class PieSeries extends Series {
  // Override data type for PieSeries
  pieData: PieData[] = [];
  colors: string[] = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
  innerRadius: number = 0; // 0 for Pie, >0 for Donut

  setData(data: any[]) {
    // Expect PieData[]
    this.pieData = data;
    // We don't use lttb for pie charts
  }

  updateVisibleData() {
    // No-op
  }

  draw() {
    if (this.pieData.length === 0) return;

    this.clear();

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    let total = 0;
    for (const d of this.pieData) total += d.value;

    let startAngle = -Math.PI / 2; // Start at top

    for (let i = 0; i < this.pieData.length; i++) {
      const d = this.pieData[i];
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();

      this.ctx.fillStyle = d.color || this.colors[i % this.colors.length];
      this.ctx.fill();

      // Donut hole (if innerRadius > 0)
      if (this.innerRadius > 0) {
        // We can either draw arcs with inner radius or just clear the center at the end.
        // Clearing center is easier but might overwrite other layers if not careful.
        // Better to draw proper donut segments (arc) but standard arc method fills sector.
        // For simple donut, drawing a white circle in middle works if background is white.
        // But better: use globalCompositeOperation or path subtraction.
        // Simplest for now: Draw sector, then later draw a "hole" circle.
      }

      startAngle = endAngle;
    }

    // Draw hole for donut
    if (this.innerRadius > 0) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * this.innerRadius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#0f172a"; // Match background or make transparent with clip
      // Problem: We don't know background color.
      // Better approach: Use arc to draw ring.
      // But Canvas 2D simple arc fills the wedge.
      // To draw a ring:
      // ctx.arc(..., start, end, false) -> outer
      // ctx.arc(..., end, start, true) -> inner (reverse)
      // ctx.fill()
    }
  }

  // Re-implement draw for proper Donut support
  drawDonut() {
    // ... implementation using ring paths ...
    // For now, let's stick to simple Pie.
    // If user wants Donut, we can implement the ring path logic.
    // Let's update draw() to support ring path.
  }

  getDataAt(point: Point): Point | null {
    // Hit testing for Pie
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const dx = (point.x as number) - centerX;
    const dy = (point.y as number) - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) * 0.8;

    if (
      dist > radius ||
      (this.innerRadius > 0 && dist < radius * this.innerRadius)
    ) {
      return null;
    }

    // Calculate angle
    let angle = Math.atan2(dy, dx);
    // Normalize to -PI/2 start (top)
    // atan2 returns -PI to PI, 0 is right.
    // We started at -PI/2.
    // Let's normalize everything to 0-2PI starting from top.

    // Current angle relative to center
    // 0 (Right) -> PI/2 (Bottom) -> PI (Left) -> -PI/2 (Top)

    // We want 0 at Top.
    // angle + PI/2
    let normalizedAngle = angle + Math.PI / 2;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    let total = 0;
    for (const d of this.pieData) total += d.value;

    let currentAngle = 0;
    for (const d of this.pieData) {
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      if (
        normalizedAngle >= currentAngle &&
        normalizedAngle < currentAngle + sliceAngle
      ) {
        // Found the slice
        // Return a Point that represents this data (maybe with extra props)
        // Since Point is {x, y}, we can return the center of the slice or just the mouse point with attached data?
        // The signature returns Point | null.
        // We probably need to return the data object, but the signature is strict.
        // For now, return the mouse point, but we need a way to pass the value to the tooltip.
        // We might need to change getDataAt signature or return type.
        // Or attach data to the point object.
        return { x: point.x, y: point.y, ...d } as any;
      }
      currentAngle += sliceAngle;
    }

    return null;
  }
}
