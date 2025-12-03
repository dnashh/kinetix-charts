export abstract class Layer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean = true;

  constructor(container: HTMLElement, zIndex: number = 0) {
    this.zIndex = zIndex;
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = zIndex.toString();

    // Append to container
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get 2D context");
    }
    this.ctx = ctx;

    // Initial size
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.resize(this.width, this.height);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  abstract draw(): void;
}
