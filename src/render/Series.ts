import { Layer } from "./Layer";
import { Scale } from "../math/Scale";
import { Point } from "../math/Transform";

export abstract class Series extends Layer {
  xScale: Scale | null = null;
  yScale: Scale | null = null;
  data: Point[] = [];
  visibleData: Point[] = [];
  color?: string;
  name: string = "Series";

  // Animation support
  protected animationProgress: number = 1; // 0-1, 1 = fully rendered
  protected animationDuration: number = 600; // ms
  protected animationStartTime: number = 0;
  protected animationEnabled: boolean = true;
  protected isAnimating: boolean = false;
  protected animationFrameId: number | null = null;

  setScales(xScale: Scale, yScale: Scale) {
    this.xScale = xScale;
    this.yScale = yScale;
  }

  setData(data: Point[]) {
    this.data = data;
    this.updateVisibleData();
    // Trigger animation on data update
    if (this.animationEnabled) {
      this.startAnimation();
    }
  }

  /** Start the render animation */
  startAnimation() {
    this.animationProgress = 0;
    this.animationStartTime = performance.now();
    this.isAnimating = true;
    this.animateFrame();
  }

  /** Animation frame loop */
  protected animateFrame() {
    if (!this.isAnimating) return;

    const elapsed = performance.now() - this.animationStartTime;
    this.animationProgress = Math.min(1, elapsed / this.animationDuration);

    // Use easeOutCubic for smooth animation
    this.animationProgress = 1 - Math.pow(1 - this.animationProgress, 3);

    this.draw();

    if (this.animationProgress < 1) {
      this.animationFrameId = requestAnimationFrame(() => this.animateFrame());
    } else {
      this.isAnimating = false;
      this.animationProgress = 1;
    }
  }

  /** Disable animation for this series */
  disableAnimation() {
    this.animationEnabled = false;
    this.animationProgress = 1;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /** Enable animation for this series */
  enableAnimation(duration: number = 600) {
    this.animationEnabled = true;
    this.animationDuration = duration;
  }

  abstract updateVisibleData(): void;

  // For tooltip hit testing
  abstract getDataAt(point: Point): Point | null;
}
