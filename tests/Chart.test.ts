import { describe, it, expect, beforeEach, vi } from "vitest";
import { Chart } from "../src/core/Chart";
import { CategoricalScale } from "../src/math/Scale";

describe("Chart Features", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock getBoundingClientRect
    container.getBoundingClientRect = () => ({
      width: 500,
      height: 300,
      top: 0,
      left: 0,
      right: 500,
      bottom: 300,
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
          fill: () => {},
          fillStyle: "",
          font: "",
          textAlign: "",
          textBaseline: "",
          fillText: () => {},
          lineWidth: 0,
          strokeStyle: "",
          fillRect: () => {},
          measureText: () => ({ width: 10 }),
          save: () => {},
          restore: () => {},
          drawImage: () => {},
          translate: () => {},
          roundRect: () => {},
          arc: () => {},
          clip: () => {},
          closePath: () => {},
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any;

    // Mock toDataURL
    HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,mock";
  });

  it("should handle strict categorical mode correctly", () => {
    const chart = new Chart(container, {
      width: 500,
      height: 300,
      xAxis: { type: "categorical" },
      series: [
        {
          name: "Series 1",
          type: "line",
          data: [
            { x: "2020", y: 10 },
            { x: "2021", y: 20 },
            { x: 100, y: 30 }, // Should be converted to string "100"
          ],
        },
      ],
    });

    const scale = (chart as any).xScale;
    expect(scale).toBeInstanceOf(CategoricalScale);
    expect(scale.domain).toContain("2020");
    expect(scale.domain).toContain("2021");
    expect(scale.domain).toContain("100"); // Numeric value converted to string
  });

  it("should enablement scrollable mode when configured", () => {
    const chart = new Chart(container, {
      width: 200,
      height: 300,
      xAxis: {
        type: "categorical",
        scrollable: true,
      },
      series: [
        {
          name: "Series 1",
          type: "line",
          data: Array.from({ length: 50 }, (_, i) => ({
            x: `Item ${i}`,
            y: i,
          })),
        },
      ],
    });

    // Check if wrapper has expanded width (mock environment might not fully render layout)
    // But we can check internal state if accessible or side effects
    const wrapper = (chart as any).wrapper;
    // In jsdom/happy-dom, clientWidth might be zero if not attached/rendered,
    // but style.width should be set.
    // Actually, logic sets style.width based on data length.

    // Force update to run logic
    chart.update({});

    // Expect overflow-x to be auto on container
    expect(container.style.overflowX).toBe("auto");
  });

  it("should support Control Panel API: setSeriesVisibility / toggleSeries", () => {
    const chart = new Chart(container, {
      width: 500,
      height: 300,
      series: [
        { name: "S1", type: "line", data: [{ x: 1, y: 1 }] },
        { name: "S2", type: "line", data: [{ x: 1, y: 2 }] },
      ],
    });

    // Initial state
    expect(chart.getSeriesInfo()[0].visible).toBe(true);

    // Hide S1
    chart.setSeriesVisibility(0, false);
    expect(chart.getSeriesInfo()[0].visible).toBe(false);

    // Toggle S1 back
    chart.toggleSeries(0);
    expect(chart.getSeriesInfo()[0].visible).toBe(true);
  });

  it("should support Control Panel API: updateAxis", () => {
    const chart = new Chart(container, {
      width: 500,
      height: 300,
      series: [{ name: "S1", type: "line", data: [{ x: 1, y: 1 }] }],
    });

    chart.updateAxis({ visible: false });
    expect((chart as any).axisLayer.config.visible).toBe(false);
  });

  it("getCanvasImage should return a data URL", () => {
    const chart = new Chart(container, {
      width: 500,
      height: 300,
      series: [{ name: "S1", type: "line", data: [{ x: 1, y: 1 }] }],
    });

    // Mock canvas methods for jsdom environment if needed
    // happy-dom usually supports basic canvas
    const dataUrl = chart.getCanvasImage({});
    expect(dataUrl).toContain("data:image/png");
  });

  it("getCanvasImage should restore state after custom size export", () => {
    const chart = new Chart(container, {
      width: 500,
      height: 300,
      series: [{ name: "S1", type: "line", data: [{ x: 1, y: 1 }] }],
    });

    const wrapper = (chart as any).wrapper;
    const originalWidth = wrapper.style.width;

    // Export with custom width
    chart.getCanvasImage({ width: 1000, height: 600 });

    // Should be restored
    expect(wrapper.style.width).toBe(originalWidth);
  });
});
