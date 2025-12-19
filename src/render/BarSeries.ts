import { Series } from "./Series";
import { Point } from "../math/Transform";

export class BarSeries extends Series {
  color: string = "#3b82f6"; // Blue-500
  barWidth: number = 0.8; // 0 to 1 (relative to category width)
  /** Enable delta mode - show bar heights relative to minimum value for better visualization of small variations */
  deltaMode: boolean = false;

  updateVisibleData() {
    // For bars, we usually don't downsample the same way as lines
    // because every bar is significant.
    // But for performance with huge datasets, we might need to.
    // For now, take all.
    this.visibleData = this.data;
  }

  draw() {
    if (!this.xScale || !this.yScale || this.visibleData.length === 0) return;

    this.clear();
    this.ctx.fillStyle = this.color;

    // Calculate bar width based on domain
    let minDiff = Infinity;
    if (this.visibleData.length > 1) {
      if (typeof this.visibleData[0].x === "string") {
        minDiff = 1;
      } else {
        for (let i = 1; i < this.visibleData.length; i++) {
          const diff =
            (this.visibleData[i].x as number) -
            (this.visibleData[i - 1].x as number);
          if (diff < minDiff) minDiff = diff;
        }
      }
    } else {
      minDiff = 1;
    }

    if (minDiff === Infinity) minDiff = 1;

    let slotWidth = 0;
    if (this.xScale.type === "categorical") {
      const [r0, r1] = this.xScale.range;
      const width = Math.abs(r1 - r0);
      const count = this.xScale.domain.length;
      slotWidth = width / count;
    } else {
      const p0 = this.xScale.toPixels(0);
      const p1 = this.xScale.toPixels(minDiff);
      slotWidth = Math.abs(p1 - p0);
    }

    const actualBarWidth = slotWidth * this.barWidth;

    // Calculate minY for delta mode
    let deltaMinY = Infinity;
    if (this.deltaMode) {
      for (const p of this.visibleData) {
        if (p.y < deltaMinY) deltaMinY = p.y;
      }
      // Add small buffer below minimum for visual clarity
      const yRange = Math.max(...this.visibleData.map((p) => p.y)) - deltaMinY;
      deltaMinY = deltaMinY - yRange * 0.1;
    }

    for (const p of this.visibleData) {
      const x = this.xScale.toPixels(p.x);

      // Support stacking: use p.y0 if available
      let bottomVal: number;
      if ((p as any).y0 !== undefined) {
        bottomVal = (p as any).y0;
      } else if (this.deltaMode && deltaMinY !== Infinity) {
        // In delta mode, use the calculated minimum as baseline
        bottomVal = deltaMinY;
      } else {
        // Use the lower bound of Y domain for bar bottom
        const yDomain = this.yScale.domain as [number, number];
        bottomVal = Math.max(0, yDomain[0]);
      }

      const y0Pixel = this.yScale.toPixels(bottomVal);
      const yTargetPixel = this.yScale.toPixels(p.y);

      // Apply animation: interpolate bar height from baseline
      const animatedY =
        y0Pixel + (yTargetPixel - y0Pixel) * this.animationProgress;

      // Draw rect - Center the bar on x
      this.ctx.fillRect(
        x - actualBarWidth / 2,
        animatedY,
        actualBarWidth,
        y0Pixel - animatedY
      );
    }
  }

  getDataAt(point: Point): Point | null {
    if (!this.xScale || !this.yScale || this.visibleData.length === 0)
      return null;

    // Check which bar contains the point
    const [r0, r1] = this.xScale.range;
    const width = Math.abs(r1 - r0);
    const count = this.visibleData.length;
    const slotWidth = width / count;
    const actualBarWidth = slotWidth * this.barWidth;

    for (const p of this.visibleData) {
      const x = this.xScale.toPixels(p.x);
      const y = this.yScale.toPixels(p.y);
      const y0 = this.yScale.toPixels((p as any).y0 || 0);

      const halfWidth = actualBarWidth / 2;

      // Check X bounds (using pixel coordinates)
      if (
        (point.x as number) >= x - halfWidth &&
        (point.x as number) <= x + halfWidth
      ) {
        // Check Y bounds (between y and y0)
        const minY = Math.min(y, y0);
        const maxY = Math.max(y, y0);
        if (point.y >= minY && point.y <= maxY) {
          return p;
        }
      }
    }
    return null;
  }
}
