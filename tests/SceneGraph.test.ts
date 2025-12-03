import { describe, it, expect, beforeEach } from "vitest";
import { SceneGraph } from "../src/core/SceneGraph";
import { Layer } from "../src/render/Layer";

// Mock Layer for testing
class MockLayer extends Layer {
  drawCalled = false;
  resizeCalled = false;

  draw() {
    this.drawCalled = true;
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    this.resizeCalled = true;
  }
}

describe("SceneGraph", () => {
  let container: HTMLElement;
  let sceneGraph: SceneGraph;

  beforeEach(() => {
    container = document.createElement("div");
    // Mock getBoundingClientRect
    container.getBoundingClientRect = () => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Mock Canvas getContext
    HTMLCanvasElement.prototype.getContext = ((contextId: string) => {
      if (contextId === "2d") {
        return {
          clearRect: () => {},
          scale: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fillStyle: "",
          font: "",
          textAlign: "",
          textBaseline: "",
          fillText: () => {},
          lineWidth: 0,
          strokeStyle: "",
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any;

    sceneGraph = new SceneGraph(container);
  });

  it("should initialize with container dimensions", () => {
    expect(sceneGraph.width).toBe(800);
    expect(sceneGraph.height).toBe(600);
  });

  it("should add layers and sort by zIndex", () => {
    const layer1 = new MockLayer(container, 10);
    const layer2 = new MockLayer(container, 1);

    sceneGraph.addLayer(layer1);
    sceneGraph.addLayer(layer2);

    expect(sceneGraph.layers.length).toBe(2);
    expect(sceneGraph.layers[0]).toBe(layer2); // zIndex 1
    expect(sceneGraph.layers[1]).toBe(layer1); // zIndex 10
  });

  it("should resize layers when added", () => {
    const layer = new MockLayer(container, 1);
    sceneGraph.addLayer(layer);
    expect(layer.resizeCalled).toBe(true);
    expect(layer.width).toBe(800);
    expect(layer.height).toBe(600);
  });

  it("should call draw on all layers during render", () => {
    const layer1 = new MockLayer(container, 1);
    const layer2 = new MockLayer(container, 2);
    sceneGraph.addLayer(layer1);
    sceneGraph.addLayer(layer2);

    sceneGraph.render();

    expect(layer1.drawCalled).toBe(true);
    expect(layer2.drawCalled).toBe(true);
  });
});
