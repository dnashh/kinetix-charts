import { Chart } from "./Chart";

export class InteractionManager {
  chart: Chart;
  isDragging: boolean = false;
  lastX: number = 0;
  lastY: number = 0;

  constructor(chart: Chart) {
    this.chart = chart;
    this.attachListeners();
  }

  attachListeners() {
    const canvas = this.chart.sceneGraph.container; // Actually container div

    canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    canvas.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    });
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.chart.container.style.cursor = "grabbing";
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      this.chart.pan(dx, dy);

      this.lastX = e.clientX;
      this.lastY = e.clientY;
    } else {
      // Hover logic for tooltips
      const rect = this.chart.container.getBoundingClientRect();
      const scrollLeft = this.chart.container.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top;
      this.chart.handleHover(x, y);
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.chart.container.style.cursor = "default";
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect = this.chart.container.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Zoom factor
    const zoomIntensity = 0.001;
    const zoom = Math.exp(-e.deltaY * zoomIntensity);

    this.chart.zoom(zoom, x);
  }
}
