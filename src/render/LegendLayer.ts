import { Layer } from "./Layer";
import { Series } from "./Series";

export class LegendLayer extends Layer {
  private position: "top-right" | "top-left" = "top-right";
  private series: Series[] = [];
  private padding = 10;
  private itemHeight = 20;
  private itemGap = 10;
  private colorBoxSize = 12;
  private fontSize = 12;
  private fontFamily = "Inter, sans-serif";
  private backgroundColor = "rgba(255, 255, 255, 0.8)";
  private borderColor = "#e2e8f0";
  private textColor = "#0f172a";

  // Bounding box of the legend for hit testing
  private bounds = { x: 0, y: 0, width: 0, height: 0 };

  constructor(container: HTMLElement, zIndex: number = 100) {
    super(container, zIndex);

    // Add mouse move listener to container to handle hover
    // We attach to canvas because it's on top
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));

    // Check for dark mode preference or inherit?
    // Ideally we should get theme from Chart, but for now we can default or check CSS
  }

  setTheme(theme: "light" | "dark") {
    if (theme === "dark") {
      this.backgroundColor = "rgba(15, 23, 42, 0.8)";
      this.borderColor = "#334155";
      this.textColor = "#f8fafc";
    } else {
      this.backgroundColor = "rgba(255, 255, 255, 0.8)";
      this.borderColor = "#e2e8f0";
      this.textColor = "#0f172a";
    }
  }

  handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if mouse is inside current legend bounds
    if (
      x >= this.bounds.x &&
      x <= this.bounds.x + this.bounds.width &&
      y >= this.bounds.y &&
      y <= this.bounds.y + this.bounds.height
    ) {
      // Switch position
      if (this.position === "top-right") {
        this.position = "top-left";
        this.draw();
      } else if (this.position === "top-left") {
        // If already top-left and hovered, maybe switch back or to bottom?
        // Let's just toggle for now. If user chases it, it's a feature :P
        // Actually, if it moves under the mouse, it will keep toggling.
        // We should only move if it's UNDER the mouse.
        // If we move it to top-left, and mouse is at top-right, it's fine.
        // If mouse follows to top-left, we move to top-right.
        this.position = "top-right";
        this.draw();
      }
    }
  }

  setSeries(series: Series[]) {
    this.series = series;
  }

  draw() {
    const series = this.series;
    this.clear();

    if (series.length === 0) return;

    // Calculate dimensions
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    let maxWidth = 0;
    series.forEach((s) => {
      const width = this.ctx.measureText(s.name).width;
      if (width > maxWidth) maxWidth = width;
    });

    const boxWidth =
      maxWidth + this.colorBoxSize + this.itemGap + this.padding * 2;
    const boxHeight = series.length * this.itemHeight + this.padding * 2;

    // Determine position
    let x = 0;
    let y = this.padding;

    if (this.position === "top-right") {
      x = this.width - boxWidth - this.padding;
    } else {
      x = this.padding;
    }

    // Update bounds
    this.bounds = { x, y, width: boxWidth, height: boxHeight };

    // Draw Background
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.strokeStyle = this.borderColor;
    this.ctx.lineWidth = 1;

    // Round rect
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, boxWidth, boxHeight, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw Items
    series.forEach((s, i) => {
      const itemY = y + this.padding + i * this.itemHeight;
      const textY = itemY + this.itemHeight / 2 + this.fontSize / 3; // Vertically center text

      // Color Box
      this.ctx.fillStyle = s.color || "#000";
      this.ctx.fillRect(
        x + this.padding,
        itemY + (this.itemHeight - this.colorBoxSize) / 2,
        this.colorBoxSize,
        this.colorBoxSize
      );

      // Text
      this.ctx.fillStyle = this.textColor;
      this.ctx.fillText(
        s.name,
        x + this.padding + this.colorBoxSize + this.itemGap,
        textY
      );
    });
  }
}
