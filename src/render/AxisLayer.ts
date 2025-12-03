import { Layer } from "./Layer";
import { Scale } from "../math/Scale";

export interface AxisConfig {
  min?: number;
  max?: number;
  xLabelFormat?: (val: number) => string;
  yLabelFormat?: (val: number) => string;
  xTickCount?: number;
  yTickCount?: number;
  gridColor?: string;
  textColor?: string;
  font?: string;
  visible?: boolean;
}

export class AxisLayer extends Layer {
  xScale: Scale | null = null;
  yScale: Scale | null = null;
  config: AxisConfig = {
    xTickCount: 10,
    yTickCount: 10,
    textColor: "#000000",
    font: "12px sans-serif",
    visible: true,
  };

  constructor(container: HTMLElement, zIndex: number, config?: AxisConfig) {
    super(container, zIndex);
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  setScales(xScale: Scale, yScale: Scale) {
    this.xScale = xScale;
    this.yScale = yScale;
  }

  draw() {
    if (!this.xScale || !this.yScale || this.config.visible === false) return;

    this.clear();

    this.ctx.fillStyle = this.config.textColor!;
    this.ctx.font = this.config.font!;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";

    // X Axis Labels
    const xTicks = this.config.xTickCount!;
    const [xd0, xd1] = this.xScale.domain;
    const [xr0, xr1] = this.xScale.range;

    for (let i = 0; i <= xTicks; i++) {
      const t = i / xTicks;
      const val = xd0 + t * (xd1 - xd0);
      const x = this.xScale.toPixels(val);

      // Clip to range
      if (x < Math.min(xr0, xr1) || x > Math.max(xr0, xr1)) continue;

      let label = val.toFixed(1);
      // Auto-format: max 3 decimals, remove trailing zeros if integer
      if (!this.config.xLabelFormat) {
        label = parseFloat(val.toFixed(3)).toString();
      } else {
        label = this.config.xLabelFormat(val);
      }

      // Draw in bottom margin
      this.ctx.fillText(label, x, this.height - 25);
    }

    // Y Axis Labels
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    const yTicks = this.config.yTickCount!;
    const [yd0, yd1] = this.yScale.domain;
    const [yr0, yr1] = this.yScale.range;

    for (let i = 0; i <= yTicks; i++) {
      const t = i / yTicks;
      const val = yd0 + t * (yd1 - yd0);
      const y = this.yScale.toPixels(val);

      if (y < Math.min(yr0, yr1) || y > Math.max(yr0, yr1)) continue;

      let label = val.toFixed(1);
      if (!this.config.yLabelFormat) {
        label = parseFloat(val.toFixed(3)).toString();
      } else {
        label = this.config.yLabelFormat(val);
      }

      // Draw in left margin
      // Assuming left padding is around 60, draw at 55
      this.ctx.fillText(label, 55, y);
    }
  }
}
