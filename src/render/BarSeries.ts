import { Series } from "./Series";
import { Point } from "../math/Transform";

export class BarSeries extends Series {
  color: string = "#3b82f6"; // Blue-500
  barWidth: number = 0.8; // 0 to 1 (relative to category width)

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

    // Debug info
    /*
    const debugId = 'bar-debug-' + Math.random();
    let debugEl = document.getElementById('bar-debug');
    if (!debugEl) {
        debugEl = document.createElement('div');
        debugEl.id = 'bar-debug';
        debugEl.style.position = 'absolute';
        debugEl.style.top = '0';
        debugEl.style.left = '0';
        debugEl.style.background = 'rgba(0,0,0,0.8)';
        debugEl.style.color = 'white';
        debugEl.style.padding = '5px';
        debugEl.style.zIndex = '1000';
        this.container.appendChild(debugEl);
    }
    debugEl.innerText = `Data: ${this.visibleData.length}, Scale: ${this.xScale?.type}, Domain: ${this.xScale?.domain.length}`;
    */

    // Assuming X is categorical or linear-discrete
    // We need to know the width of each bar.
    // If linear scale, we estimate width based on data density or fixed pixel width.

    // Assuming X is categorical or linear-discrete
    // We need to know the width of each bar.
    // If linear scale, we estimate width based on data density or fixed pixel width.

    // Calculate bar width based on domain
    // We need to know the domain width of one "slot".
    // Assuming uniform distribution for now, or just use a fixed domain width if known.
    // If we assume data is sorted, we can check min diff.

    let minDiff = Infinity;
    if (this.visibleData.length > 1) {
      // Check if string X
      if (typeof this.visibleData[0].x === "string") {
        // For categorical, the slot width is just range / count
        // We can't calculate diff of strings.
        // Let's handle this in the width calculation below.
        minDiff = 1; // Dummy value, we won't use it for categorical logic if we separate it
      } else {
        for (let i = 1; i < this.visibleData.length; i++) {
          const diff =
            (this.visibleData[i].x as number) -
            (this.visibleData[i - 1].x as number);
          if (diff < minDiff) minDiff = diff;
        }
      }
    } else {
      minDiff = 1; // Fallback
    }

    // If minDiff is still Infinity (e.g. 0 or 1 point), use a default
    if (minDiff === Infinity) minDiff = 1;

    // Calculate pixel width of this domain difference
    let slotWidth = 0;
    if (this.xScale.type === "categorical") {
      const [r0, r1] = this.xScale.range;
      const width = Math.abs(r1 - r0);
      const count = this.xScale.domain.length; // Use domain length for categorical slots
      slotWidth = width / count;
    } else {
      const p0 = this.xScale.toPixels(0);
      const p1 = this.xScale.toPixels(minDiff);
      slotWidth = Math.abs(p1 - p0);
    }

    const actualBarWidth = slotWidth * this.barWidth;

    for (const p of this.visibleData) {
      const x = this.xScale.toPixels(p.x);
      const y = this.yScale.toPixels(p.y);

      // Support stacking: use p.y0 if available
      // For non-stacked bars, bottom should be at the chart bottom (y scale minimum)
      let bottomVal: number;
      if ((p as any).y0 !== undefined) {
        bottomVal = (p as any).y0;
      } else {
        // Use the lower bound of Y domain for bar bottom
        const yDomain = this.yScale.domain as [number, number];
        bottomVal = Math.max(0, yDomain[0]); // Use 0 if it's in range, otherwise domain min
      }
      const y0 = this.yScale.toPixels(bottomVal);

      // Draw rect - Center the bar on x
      this.ctx.fillRect(x - actualBarWidth / 2, y, actualBarWidth, y0 - y);
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
