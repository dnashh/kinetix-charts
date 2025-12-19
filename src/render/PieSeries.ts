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
  showLabels: boolean = true; // Show labels on slices
  showLegend: boolean = true; // Show legend below chart

  setData(data: any[]) {
    // Expect PieData[]
    this.pieData = data;
    // Trigger animation
    if (this.animationEnabled) {
      this.startAnimation();
    }
  }

  updateVisibleData() {
    // No-op
  }

  draw() {
    if (this.pieData.length === 0) return;

    this.clear();

    const legendHeight = this.showLegend ? 60 : 0;
    const availableHeight = this.height - legendHeight;
    const centerX = this.width / 2;
    const centerY = availableHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.75;

    let total = 0;
    for (const d of this.pieData) total += d.value;

    // Apply animation - draw only portion of the total angle
    const totalAngleToDraw = 2 * Math.PI * this.animationProgress;
    let startAngle = -Math.PI / 2; // Start at top
    let drawnAngle = 0;

    for (let i = 0; i < this.pieData.length; i++) {
      const d = this.pieData[i];
      const sliceAngle = (d.value / total) * 2 * Math.PI;

      // Don't draw slices beyond animation progress
      if (drawnAngle >= totalAngleToDraw) break;

      // Calculate how much of this slice to draw
      const remainingAngle = totalAngleToDraw - drawnAngle;
      const angleToDraw = Math.min(sliceAngle, remainingAngle);
      const endAngle = startAngle + angleToDraw;

      this.ctx.beginPath();
      if (this.innerRadius > 0) {
        // Draw donut segment using arc + arc (reverse)
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.arc(
          centerX,
          centerY,
          radius * this.innerRadius,
          endAngle,
          startAngle,
          true
        );
        this.ctx.closePath();
      } else {
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.closePath();
      }

      this.ctx.fillStyle = d.color || this.colors[i % this.colors.length];
      this.ctx.fill();

      // Draw slice border for better separation
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Draw label on slice (only if animation complete and labels enabled)
      if (
        this.showLabels &&
        this.animationProgress >= 1 &&
        angleToDraw === sliceAngle
      ) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius =
          this.innerRadius > 0
            ? (radius * (1 + this.innerRadius)) / 2
            : radius * 0.65;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        // Only show label if slice is big enough (>5%)
        const percentage = (d.value / total) * 100;
        if (percentage > 5) {
          this.ctx.font = "bold 11px Inter, sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";

          // Draw text shadow/outline for readability
          this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          this.ctx.fillText(
            `${percentage.toFixed(0)}%`,
            labelX + 1,
            labelY + 1
          );

          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillText(`${percentage.toFixed(0)}%`, labelX, labelY);
        }
      }

      startAngle = endAngle;
      drawnAngle += angleToDraw;
    }

    // Draw legend at bottom (only when animation complete)
    if (this.showLegend && this.animationProgress >= 1) {
      this.drawLegend(legendHeight, total);
    }
  }

  private drawLegend(legendHeight: number, total: number) {
    const legendY = this.height - legendHeight + 15;
    const itemWidth = 100;
    const itemsPerRow = Math.floor(this.width / itemWidth);
    const startX =
      (this.width - Math.min(this.pieData.length, itemsPerRow) * itemWidth) / 2;

    this.ctx.font = "11px Inter, sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    this.pieData.forEach((d, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + col * itemWidth + 10;
      const y = legendY + row * 18;

      // Color box
      this.ctx.fillStyle = d.color || this.colors[i % this.colors.length];
      this.ctx.fillRect(x, y - 5, 10, 10);
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y - 5, 10, 10);

      // Label text with percentage
      const percentage = (d.value / total) * 100;
      const labelText =
        d.label.length > 8 ? d.label.substring(0, 8) + "…" : d.label;
      this.ctx.fillStyle = "#94a3b8"; // Gray text
      this.ctx.fillText(`${labelText} (${percentage.toFixed(0)}%)`, x + 14, y);
    });
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
