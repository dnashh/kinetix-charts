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
  theme?: "light" | "dark";
  type?: "numeric" | "datetime" | "categorical";
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
    theme: "light",
    type: "numeric",
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

    const isDark = this.config.theme === "dark";
    const textColor = this.config.textColor || (isDark ? "#e5e7eb" : "#374151");
    const lineColor = isDark ? "#4b5563" : "#d1d5db";
    const bgColor = isDark ? "#1f2937" : "#ffffff";

    this.ctx.font = this.config.font!;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = lineColor;

    const [xr0, xr1] = this.xScale.range;
    const [yr0, yr1] = this.yScale.range;

    // Draw Axis Lines
    this.ctx.beginPath();
    // X Axis
    this.ctx.moveTo(xr0, yr0);
    this.ctx.lineTo(xr1, yr0);
    // Y Axis
    this.ctx.moveTo(xr0, yr0);
    this.ctx.lineTo(xr0, yr1);
    this.ctx.stroke();

    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";

    // X Axis Labels
    if (this.xScale.type === "categorical") {
      const domain = this.xScale.domain as string[];
      // Draw all labels for categorical if they fit, or skip some
      // Simple implementation: draw all
      domain.forEach((label, i) => {
        const x = this.xScale!.toPixels(i);
        // Clip
        if (x < Math.min(xr0, xr1) || x > Math.max(xr0, xr1)) return;

        // Draw background
        const metrics = this.ctx.measureText(label);
        const bgPadding = 2;
        this.ctx.fillStyle = bgColor;
        // Add padding between axis line and label (e.g. 5px)
        const yPos = this.height - 25 + 5;

        this.ctx.fillRect(
          x - metrics.width / 2 - bgPadding,
          yPos - bgPadding,
          metrics.width + bgPadding * 2,
          14 + bgPadding * 2
        );

        this.ctx.fillStyle = textColor;
        this.ctx.fillText(label, x, yPos);
      });
    } else {
      const xTicks = this.config.xTickCount!;
      const [xd0, xd1] = this.xScale.domain as [number, number];

      for (let i = 0; i <= xTicks; i++) {
        const t = i / xTicks;
        const val = xd0 + t * (xd1 - xd0);
        const x = this.xScale.toPixels(val);

        // Clip to range
        if (x < Math.min(xr0, xr1) || x > Math.max(xr0, xr1)) continue;

        let label = "";
        if (this.config.xLabelFormat) {
          label = this.config.xLabelFormat(val);
        } else if (this.config.type === "datetime") {
          label = new Date(val).toLocaleDateString();
        } else {
          label = parseFloat(val.toFixed(2)).toString();
        }

        // Draw background for text
        const metrics = this.ctx.measureText(label);
        const bgPadding = 2;
        this.ctx.fillStyle = bgColor;
        // Add padding between axis line and label
        const yPos = this.height - 25 + 5;

        this.ctx.fillRect(
          x - metrics.width / 2 - bgPadding,
          yPos - bgPadding,
          metrics.width + bgPadding * 2,
          14 + bgPadding * 2 // Approx height
        );

        this.ctx.fillStyle = textColor;
        this.ctx.fillText(label, x, yPos);
      }
    }

    // Y Axis Labels
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    const yTicks = this.config.yTickCount!;
    const [yd0, yd1] = this.yScale.domain as [number, number];

    for (let i = 0; i <= yTicks; i++) {
      const t = i / yTicks;
      const val = yd0 + t * (yd1 - yd0);
      const y = this.yScale.toPixels(val);

      if (y < Math.min(yr0, yr1) || y > Math.max(yr0, yr1)) continue;

      let label = "";
      if (this.config.yLabelFormat) {
        label = this.config.yLabelFormat(val);
      } else {
        // Smart formatting for large numbers
        const absVal = Math.abs(val);
        if (absVal >= 1000000) {
          label = (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        } else if (absVal >= 1000) {
          label = (val / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        } else if (absVal >= 1) {
          label = val.toFixed(1).replace(/\.0$/, "");
        } else {
          label = val.toFixed(2);
        }
      }

      // Draw background for text
      const metrics = this.ctx.measureText(label);
      const bgPadding = 2;
      this.ctx.fillStyle = bgColor;
      // Add padding between axis line and label (e.g. 5px)
      // Axis line is at 60 (left padding), so label should be at 55 - 5 = 50?
      // Current implementation draws at 55. Let's move it to 50.
      const xPos = 50;

      this.ctx.fillRect(
        xPos - metrics.width - bgPadding,
        y - 6 - bgPadding, // Approx half height offset
        metrics.width + bgPadding * 2,
        12 + bgPadding * 2
      );

      this.ctx.fillStyle = textColor;
      this.ctx.fillText(label, xPos, y);
    }
  }
}
