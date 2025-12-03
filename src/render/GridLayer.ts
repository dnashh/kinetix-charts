import { Layer } from "./Layer";
import { Scale } from "../math/Scale";

export class GridLayer extends Layer {
  xScale: Scale | null = null;
  yScale: Scale | null = null;

  setScales(xScale: Scale, yScale: Scale) {
    this.xScale = xScale;
    this.yScale = yScale;
  }

  draw() {
    if (!this.xScale || !this.yScale) return;

    this.clear();
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Vertical Lines (X Axis)
    const xTicks = 10;
    const [xd0, xd1] = this.xScale.domain;
    const [yr0, yr1] = this.yScale.range; // Y range (top/bottom of chart area)

    for (let i = 0; i <= xTicks; i++) {
      const t = i / xTicks;
      const val = xd0 + t * (xd1 - xd0);
      const x = this.xScale.toPixels(val);

      this.ctx.beginPath();
      this.ctx.moveTo(x, yr0);
      this.ctx.lineTo(x, yr1);
      this.ctx.stroke();
    }

    // Horizontal Lines (Y Axis)
    const yTicks = 10;
    const [yd0, yd1] = this.yScale.domain;
    const [xr0, xr1] = this.xScale.range; // X range (left/right of chart area)

    for (let i = 0; i <= yTicks; i++) {
      const t = i / yTicks;
      const val = yd0 + t * (yd1 - yd0);
      const y = this.yScale.toPixels(val);

      this.ctx.beginPath();
      this.ctx.moveTo(xr0, y);
      this.ctx.lineTo(xr1, y);
      this.ctx.stroke();
    }
  }
}
