import { Layer } from "../render/Layer";

export class SceneGraph {
  container: HTMLElement;
  layers: Layer[] = [];
  width: number = 0;
  height: number = 0;
  pixelRatio: number = window.devicePixelRatio || 1;

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateDimensions();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.updateDimensions();
      this.resizeLayers();
      this.render();
    });
    resizeObserver.observe(container);
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
    // Sort by zIndex
    this.layers.sort((a, b) => a.zIndex - b.zIndex);
    // Initial resize
    layer.resize(this.width, this.height);
  }

  updateDimensions() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    for (const layer of this.layers) {
      layer.resize(this.width, this.height);
    }
  }

  resizeLayers() {
    for (const layer of this.layers) {
      layer.resize(this.width, this.height);
    }
  }

  render() {
    for (const layer of this.layers) {
      if (layer.visible) {
        layer.draw();
      }
    }
  }
}
