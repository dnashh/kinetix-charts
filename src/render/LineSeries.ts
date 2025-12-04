import { Series } from "./Series";
import { lttb } from "../math/LTTB";
import { Point } from "../math/Transform";

export class LineSeries extends Series {
  color: string = "#4f46e5"; // Indigo-600

  updateVisibleData() {
    // Check if we have string X
    const hasStringX =
      this.data.length > 0 && typeof this.data[0].x === "string";

    if (!hasStringX && this.data.length > 2000) {
      // LTTB requires numeric X
      this.visibleData = lttb(this.data as any, 2000);
    } else {
      this.visibleData = this.data;
    }
  }

  draw() {
    if (!this.xScale || !this.yScale || this.visibleData.length === 0) return;

    this.clear();
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const first = this.visibleData[0];
    this.ctx.moveTo(
      this.xScale.toPixels(first.x),
      this.yScale.toPixels(first.y)
    );

    for (let i = 1; i < this.visibleData.length; i++) {
      const p = this.visibleData[i];
      this.ctx.lineTo(this.xScale.toPixels(p.x), this.yScale.toPixels(p.y));
    }

    this.ctx.stroke();

    // Draw points
    this.ctx.fillStyle = this.color; // Use same color as line
    // Optional: white fill with colored stroke for "premium" look?
    // Let's do solid color for now as requested "visible clearly"

    // Only draw points if density is low enough or always?
    // If we have 2000 points, drawing 2000 circles is slow and messy.
    // Let's draw if visibleData is < 100 or so? Or just draw them.
    // User asked for "plotted points should be visible".
    // Let's draw them.

    const pointRadius = 3;
    for (let i = 0; i < this.visibleData.length; i++) {
      const p = this.visibleData[i];
      const x = this.xScale.toPixels(p.x);
      const y = this.yScale.toPixels(p.y);

      // Optimization: check bounds
      if (x < 0 || x > this.width) continue;

      this.ctx.beginPath();
      this.ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // White border for better contrast?
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  getDataAt(point: Point): Point | null {
    if (!this.xScale || !this.yScale || this.visibleData.length === 0)
      return null;

    const mouseX = point.x as number; // Mouse event coordinates are numbers

    // If categorical (string X), we can't easily binary search by value unless we map to index
    if (this.xScale.type === "categorical") {
      // Linear scan for now (simple)
      let closest: Point | null = null;
      let minDiff = Infinity;

      for (const p of this.visibleData) {
        const px = this.xScale.toPixels(p.x);
        const diff = Math.abs(px - mouseX);
        if (diff < minDiff && diff < 10) {
          // 10px threshold
          minDiff = diff;
          closest = p;
        }
      }
      return closest;
    }

    // Convert pixel X to domain X
    const domainX = this.xScale.invert(mouseX) as number;

    // Binary search for closest point
    let low = 0;
    let high = this.visibleData.length - 1;
    let closest: Point | null = null;
    let minDiff = Infinity;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const p = this.visibleData[mid];

      // Ensure p.x is number
      if (typeof p.x !== "number") {
        // Should not happen if scale is linear/time
        low = mid + 1;
        continue;
      }

      const diff = Math.abs(p.x - domainX);

      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }

      if (p.x < domainX) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // Check if within a reasonable threshold (e.g. 10 pixels)
    if (closest) {
      const pixelX = this.xScale.toPixels(closest.x);
      if (Math.abs(pixelX - (point.x as number)) > 10) {
        return null;
      }
    }

    return closest;
  }
}
