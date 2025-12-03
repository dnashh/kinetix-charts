import { Series } from "./Series";
import { lttb, Point } from "../math/LTTB";

export class LineSeries extends Series {
  color: string = "#4f46e5"; // Indigo-600

  updateVisibleData() {
    // For now, just use LTTB on the whole dataset
    if (this.data.length > 2000) {
      this.visibleData = lttb(this.data, 2000);
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
  }

  getDataAt(point: Point): Point | null {
    // Simple implementation: find closest point in X
    // This assumes data is sorted by X
    if (!this.xScale || !this.yScale || this.visibleData.length === 0)
      return null;

    // Convert pixel X to domain X
    const domainX = this.xScale.invert(point.x);

    // Binary search for closest point
    let low = 0;
    let high = this.visibleData.length - 1;
    let closest: Point | null = null;
    let minDiff = Infinity;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const p = this.visibleData[mid];
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
      if (Math.abs(pixelX - point.x) > 10) {
        return null;
      }
    }

    return closest;
  }
}
