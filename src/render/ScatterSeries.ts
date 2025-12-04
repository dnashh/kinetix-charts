import { Series } from "./Series";
import { lttb } from "../math/LTTB";
import { Point } from "../math/Transform";

export class ScatterSeries extends Series {
  color: string = "#4f46e5"; // Indigo-600
  radius: number = 4;

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
    this.ctx.fillStyle = this.color;

    for (let i = 0; i < this.visibleData.length; i++) {
      const p = this.visibleData[i];
      const x = this.xScale.toPixels(p.x);
      const y = this.yScale.toPixels(p.y);

      // Skip if out of bounds (optimization)
      if (x < 0 || x > this.width || y < 0 || y > this.height) continue;

      this.ctx.beginPath();
      this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  getDataAt(point: Point): Point | null {
    if (!this.xScale || !this.yScale || this.visibleData.length === 0)
      return null;

    const mouseX = point.x as number;
    const mouseY = point.y as number;

    // For scatter, we check distance to point
    let closest: Point | null = null;
    let minDist = Infinity;
    const threshold = 10; // Pixel threshold

    // If categorical, we can't binary search easily. Just linear scan.
    if (this.xScale.type === "categorical") {
      for (const p of this.visibleData) {
        const px = this.xScale.toPixels(p.x); // p.x is string or number, toPixels handles it
        const py = this.yScale.toPixels(p.y);
        const dist = Math.sqrt(
          Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2)
        );
        if (dist < minDist && dist < threshold) {
          minDist = dist;
          closest = p;
        }
      }
      return closest;
    }

    const domainX = this.xScale.invert(mouseX) as number;

    // Binary search to find start index
    let low = 0;
    let high = this.visibleData.length - 1;

    // We can't strictly binary search for "closest" in 2D, but we can find X range.
    // Let's just iterate all for now if performance is not an issue,
    // or use the same logic as LineSeries to find X candidate and check Y distance.

    // Using LineSeries logic for X proximity
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const p = this.visibleData[mid];

      if (typeof p.x !== "number") {
        low = mid + 1;
        continue;
      }

      // Calculate 2D distance in pixels

      // Calculate 2D distance in pixels
      const px = this.xScale.toPixels(p.x);
      const py = this.yScale.toPixels(p.y);
      const dist = Math.sqrt(
        Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2)
      );

      if (dist < minDist && dist < threshold) {
        minDist = dist;
        closest = p;
      }

      if (p.x < domainX) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // The binary search above is for X, but we need to check neighbors too because
    // the closest X might not be the closest 2D point if Y is far.
    // A proper spatial index (Quadtree) is better, but for <2000 points linear scan is fine.
    // Let's do linear scan on visibleData for accuracy.

    minDist = Infinity;
    closest = null;

    for (const p of this.visibleData) {
      const px = this.xScale.toPixels(p.x);
      const py = this.yScale.toPixels(p.y);
      const dist = Math.sqrt(
        Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2)
      );

      if (dist < minDist && dist < threshold) {
        minDist = dist;
        closest = p;
      }
    }

    return closest;
  }
}
