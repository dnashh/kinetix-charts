import { LegendLayer } from "../render/LegendLayer";
import { SceneGraph } from "./SceneGraph";
import { LinearScale, CategoricalScale, Scale } from "../math/Scale";
import { GridLayer } from "../render/GridLayer";
import { AxisLayer } from "../render/AxisLayer";
import { Series } from "../render/Series";
import { LineSeries } from "../render/LineSeries";
import { BarSeries } from "../render/BarSeries";
import { PieSeries } from "../render/PieSeries";
import { ScatterSeries } from "../render/ScatterSeries";
import { Point } from "../math/Transform";
import { InteractionManager } from "./InteractionManager";
import { ChartConfig, SeriesConfig } from "../types";

export class Chart {
  container: HTMLElement;
  sceneGraph: SceneGraph;
  gridLayer: GridLayer;
  axisLayer: AxisLayer;
  legendLayer: LegendLayer;
  series: Series[] = [];
  xScale: Scale;
  yScale: LinearScale;
  interactionManager: InteractionManager;
  tooltip: HTMLElement;

  padding = { top: 20, right: 20, bottom: 40, left: 60 };

  constructor(container: HTMLElement, config?: ChartConfig) {
    this.container = container;
    this.container.style.position = "relative"; // Ensure relative positioning for tooltip
    this.container.style.overflow = "hidden";

    this.sceneGraph = new SceneGraph(container);

    // Initialize Scales with Padding
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.xScale = new LinearScale(
      [0, 100],
      [this.padding.left, width - this.padding.right]
    );
    // Y scale inverted (0 at bottom)
    this.yScale = new LinearScale(
      [0, 100],
      [height - this.padding.bottom, this.padding.top]
    );

    // Initialize Layers
    this.gridLayer = new GridLayer(container, 0);
    this.gridLayer.setScales(this.xScale, this.yScale);
    this.gridLayer.visible = false; // Hide grid by default

    this.axisLayer = new AxisLayer(container, 1);
    this.axisLayer.setScales(this.xScale, this.yScale);

    this.legendLayer = new LegendLayer(container, 100);

    this.sceneGraph.addLayer(this.gridLayer);
    this.sceneGraph.addLayer(this.axisLayer);
    this.sceneGraph.addLayer(this.legendLayer);

    // Interaction
    this.interactionManager = new InteractionManager(this);

    // Tooltip
    this.tooltip = document.createElement("div");
    this.tooltip.style.position = "absolute";
    this.tooltip.style.display = "none";
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    this.tooltip.style.color = "white";
    this.tooltip.style.padding = "8px";
    this.tooltip.style.borderRadius = "4px";
    this.tooltip.style.fontSize = "12px";
    this.tooltip.style.zIndex = "100";
    this.container.appendChild(this.tooltip);

    if (config) {
      this.update(config);
    } else {
      // Default Series (for backward compatibility/demo)
      const lineSeries = new LineSeries(container, 1);
      lineSeries.setScales(this.xScale, this.yScale);

      // Generate random test data
      const data: Point[] = [];
      for (let i = 0; i <= 100; i++) {
        data.push({ x: i, y: 20 + Math.random() * 60 });
      }
      lineSeries.setData(data);

      // Initial render
      this.sceneGraph.render();
    }
  }

  colors: string[] = [
    "#ef4444", // Red
    "#f59e0b", // Amber
    "#10b981", // Green
    "#3b82f6", // Blue
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#6366f1", // Indigo
  ];

  // Store initial extent for bounds
  maxExtent: { x: [number, number]; y: [number, number] } | null = null;

  update(config: ChartConfig) {
    // Add series from config
    if (config.series) {
      // Clear existing series only if new series are provided
      this.series = [];
      this.sceneGraph.layers = this.sceneGraph.layers.filter(
        (l) => !(l instanceof Series)
      );

      config.series.forEach((s) => {
        this.addSeries(s);
      });
    }

    // After setting data, calculate max extent
    // We need to iterate over all series to find global min/max
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;

    const stringXValues = new Set<string>();
    let hasStringX = false;

    // Helper to check points
    const checkPoints = (points: Point[]) => {
      points.forEach((p) => {
        if (typeof p.x === "number") {
          if (p.x < xMin) xMin = p.x;
          if (p.x > xMax) xMax = p.x;
        } else {
          hasStringX = true;
          stringXValues.add(String(p.x));
        }

        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        // Check y0 for stacked
        if ((p as any).y0 !== undefined) {
          if ((p as any).y0 < yMin) yMin = (p as any).y0;
          if ((p as any).y0 > yMax) yMax = (p as any).y0;
        }
      });
    };

    // We need to access the data from config or series
    // Since we just rebuilt series, let's use them
    // We need to access the data from config or series
    // Since we just rebuilt series, let's use them
    this.series.forEach((s) => {
      checkPoints(s.data);
    });

    /*
    const debugId = 'chart-debug-' + Math.random();
    let debugEl = document.getElementById('chart-debug');
    if (!debugEl) {
        debugEl = document.createElement('div');
        debugEl.id = 'chart-debug';
        debugEl.style.position = 'fixed';
        debugEl.style.bottom = '10px';
        debugEl.style.right = '10px';
        debugEl.style.background = 'rgba(0,0,0,0.8)';
        debugEl.style.color = 'white';
        debugEl.style.padding = '10px';
        debugEl.style.zIndex = '9999';
        document.body.appendChild(debugEl);
    }
    debugEl.innerHTML = `
      hasStringX: ${hasStringX}<br>
      xMin: ${xMin}<br>
      Series: ${this.series.length}<br>
      First Point X: ${this.series[0]?.data[0]?.x} (${typeof this.series[0]?.data[0]?.x})
    `;
    */

    // Handle Categorical Scale
    if (hasStringX) {
      // Switch to CategoricalScale
      const domain = Array.from(stringXValues);
      // Re-initialize xScale as CategoricalScale
      const range = this.xScale.range;
      this.xScale = new CategoricalScale(domain, range);

      // Update all series with new scale
      this.series.forEach((s) => s.setScales(this.xScale, this.yScale));
      this.gridLayer.setScales(this.xScale, this.yScale);
      this.axisLayer.setScales(this.xScale, this.yScale);
    } else {
      // Ensure LinearScale (if we switched back from categorical, or just init)
      if (this.xScale instanceof CategoricalScale) {
        const range = this.xScale.range;
        this.xScale = new LinearScale([0, 100], range); // Temp domain

        this.series.forEach((s) => s.setScales(this.xScale, this.yScale));
        this.gridLayer.setScales(this.xScale, this.yScale);
        this.axisLayer.setScales(this.xScale, this.yScale);
      }
    }

    if (xMin !== Infinity || hasStringX) {
      // Add 15% buffer
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      const xBuffer = xRange * 0.15;
      const yBuffer = yRange * 0.15;

      this.maxExtent = {
        x: [xMin - xBuffer, xMax + xBuffer],
        y: [yMin - yBuffer, yMax + yBuffer],
      };

      // Check if we have any PieSeries
      const hasPieSeries = this.series.some((s) => s instanceof PieSeries);

      // Set initial domain to this extent (or config provided)
      // If config provided specific axis range, use that, but keep maxExtent for clamping
      if (
        config.xAxis &&
        (config.xAxis.min !== undefined || config.xAxis.max !== undefined)
      ) {
        this.xScale.domain = [
          config.xAxis.min !== undefined
            ? config.xAxis.min
            : this.maxExtent.x[0],
          config.xAxis.max !== undefined
            ? config.xAxis.max
            : this.maxExtent.x[1],
        ];
      } else {
        this.xScale.domain = [...this.maxExtent.x];
      }

      // Update Axis Config
      const defaultAxisVisible = !hasPieSeries;

      this.axisLayer.config = {
        ...this.axisLayer.config,
        visible: defaultAxisVisible,
        theme: config.theme || "light", // Pass theme
        ...config.xAxis,
      };

      if (config.xAxis && config.xAxis.visible !== undefined) {
        this.axisLayer.config.visible = config.xAxis.visible;
      }

      if (config.yAxis && config.yAxis.visible !== undefined) {
        this.axisLayer.config.visible = config.yAxis.visible;
      }

      // Update Legend
      this.legendLayer.setTheme(config.theme || "light");
      this.legendLayer.setSeries(this.series);

      // Force hide for PieSeries if it was implicitly visible
      if (hasPieSeries) {
        this.axisLayer.config.visible = false;
      }

      // Initial Y Scale
      this.updateYScale();
    }

    this.sceneGraph.render();
  }

  updateYScale() {
    // If categorical, we just use the full dataset for now as we don't support partial view yet
    if (this.xScale instanceof CategoricalScale) {
      // Recalculate full Y range
      let yMin = Infinity;
      let yMax = -Infinity;
      this.series.forEach((s) => {
        s.data.forEach((p) => {
          if (p.y < yMin) yMin = p.y;
          if (p.y > yMax) yMax = p.y;
        });
      });

      if (yMin !== Infinity) {
        const yRange = yMax - yMin;
        const yBuffer =
          yRange * 0.15 || (yMax === 0 ? 1 : Math.abs(yMax) * 0.1);
        this.yScale.domain = [yMin - yBuffer, yMax + yBuffer];
      }
      return;
    }

    const [xMin, xMax] = this.xScale.domain;
    let yMin = Infinity;
    let yMax = -Infinity;

    // Check all series for data in current X range
    this.series.forEach((s) => {
      s.data.forEach((p) => {
        if (p.x >= xMin && p.x <= xMax) {
          if (p.y < yMin) yMin = p.y;
          if (p.y > yMax) yMax = p.y;
          if ((p as any).y0 !== undefined) {
            if ((p as any).y0 < yMin) yMin = (p as any).y0;
            if ((p as any).y0 > yMax) yMax = (p as any).y0;
          }
        }
      });
    });

    if (yMin === Infinity) {
      // Fallback to maxExtent if no data in view (shouldn't happen if x is constrained)
      if (this.maxExtent) {
        this.yScale.domain = [...this.maxExtent.y];
      }
      return;
    }

    const yRange = yMax - yMin;
    const yBuffer = yRange * 0.15 || (yMax === 0 ? 1 : Math.abs(yMax) * 0.1);

    this.yScale.domain = [yMin - yBuffer, yMax + yBuffer];
  }

  addSeries(seriesOrConfig: Series | SeriesConfig) {
    let series: Series;

    if (seriesOrConfig instanceof Series) {
      series = seriesOrConfig;
    } else {
      const seriesConfig = seriesOrConfig;
      switch (seriesConfig.type) {
        case "line":
          series = new LineSeries(this.container, 1);
          (series as LineSeries).setData(seriesConfig.data);
          break;
        case "bar":
          series = new BarSeries(this.container, 1);
          (series as BarSeries).setData(seriesConfig.data);
          if (seriesConfig.barWidth) {
            (series as BarSeries).barWidth = seriesConfig.barWidth;
          }
          break;
        case "pie":
          series = new PieSeries(this.container, 1);
          (series as PieSeries).setData(seriesConfig.data);
          if (seriesConfig.innerRadius) {
            (series as PieSeries).innerRadius = seriesConfig.innerRadius;
          }
          break;
        case "scatter":
          series = new ScatterSeries(this.container, 1);
          (series as ScatterSeries).setData(seriesConfig.data);
          if (seriesConfig.radius) {
            (series as ScatterSeries).radius = seriesConfig.radius;
          }
          break;
        default:
          console.warn(`Unknown series type: ${(seriesConfig as any).type}`);
          return;
      }

      if (seriesConfig.color) {
        series.color = seriesConfig.color;
      }

      if (seriesConfig.name) {
        series.name = seriesConfig.name;
      }
    }

    if (!series.color) {
      // Auto-assign color
      series.color = this.colors[this.series.length % this.colors.length];
    }

    series.setScales(this.xScale, this.yScale);
    this.series.push(series);
    this.sceneGraph.addLayer(series);

    // Re-calculate extent and render
    // We can just call update with current config + new series, but simpler to just re-calc extent here
    // For now, let's just trigger a re-render, but ideally we should update bounds
    // Let's call update with a reconstructed config to be safe and consistent
    // But wait, update() clears series! We need to be careful.
    // Actually, update() logic above rebuilds everything.
    // If we want addSeries to be incremental, we should just update bounds and render.

    // Let's update bounds incrementally
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;

    const checkPoints = (points: Point[]) => {
      points.forEach((p) => {
        if (typeof p.x === "number") {
          if (p.x < xMin) xMin = p.x;
          if (p.x > xMax) xMax = p.x;
        }
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        if ((p as any).y0 !== undefined) {
          if ((p as any).y0 < yMin) yMin = (p as any).y0;
          if ((p as any).y0 > yMax) yMax = (p as any).y0;
        }
      });
    };

    // Re-check all series
    this.series.forEach((s) => {
      checkPoints(s.data);
    });

    if (xMin !== Infinity) {
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      const xBuffer = xRange * 0.15;
      const yBuffer = yRange * 0.15;

      this.maxExtent = {
        x: [xMin - xBuffer, xMax + xBuffer],
        y: [yMin - yBuffer, yMax + yBuffer],
      };

      // Update domains if not locked (simplified logic for now)
      this.xScale.domain = [...this.maxExtent.x];
      this.yScale.domain = [...this.maxExtent.y];
    }

    // Check if we have any PieSeries
    const hasPieSeries = this.series.some((s) => s instanceof PieSeries);

    // Force hide for PieSeries if it was implicitly visible
    if (hasPieSeries) {
      this.axisLayer.config.visible = false;
    }

    if (xMin !== Infinity) {
      // Initial Y Scale
      this.updateYScale();
    }

    this.sceneGraph.render();
  }

  pan(dx: number, _dy: number) {
    if (!this.maxExtent) return;

    // X Axis Pan
    if (this.xScale.type === "categorical") {
      // Categorical pan not implemented yet
      return;
    }

    const [xd0, xd1] = this.xScale.domain as [number, number];
    const xRange = xd1 - xd0;
    const xPixelRange = this.xScale.range[1] - this.xScale.range[0];
    const xDomainShift = -(dx / xPixelRange) * xRange;

    let newXd0 = xd0 + xDomainShift;
    let newXd1 = xd1 + xDomainShift;

    // Strict Clamp X
    const [xMax0, xMax1] = this.maxExtent.x;

    // Check if we are trying to pan out of bounds
    if (newXd0 < xMax0) {
      newXd0 = xMax0;
      newXd1 = newXd0 + xRange;
    }
    if (newXd1 > xMax1) {
      newXd1 = xMax1;
      newXd0 = newXd1 - xRange;
    }

    this.xScale.domain = [newXd0, newXd1];

    // Auto-scale Y based on new X
    this.updateYScale();

    this.sceneGraph.render();
  }

  zoom(factor: number, centerPixel: number) {
    if (!this.maxExtent) return;

    if (this.xScale.type === "categorical") {
      // Categorical zoom not implemented yet
      return;
    }

    const [d0, d1] = this.xScale.domain as [number, number];
    const range = d1 - d0;
    const [xMax0, xMax1] = this.maxExtent.x;
    const maxRange = xMax1 - xMax0;

    // Min/Max Zoom Limits
    // Min range: 1% of max extent
    // Max range: 100% of max extent (cannot zoom out further than buffer)
    let newRange = range * (1 / factor);

    if (newRange < maxRange * 0.01) newRange = maxRange * 0.01; // Too zoomed in
    if (newRange > maxRange) newRange = maxRange; // Too zoomed out

    const centerDomain = this.xScale.invert(centerPixel) as number;
    const centerRatio = (centerDomain - d0) / range;

    let newD0 = centerDomain - centerRatio * newRange;
    let newD1 = newD0 + newRange;

    // Strict Clamp to max extent
    if (this.xScale.type === "linear" || this.xScale.type === "time") {
      const [xMax0, xMax1] = this.maxExtent.x;
      if (newD0 < xMax0) {
        newD0 = xMax0;
        newD1 = newD0 + newRange;
      }
      if (newD1 > xMax1) {
        newD1 = xMax1;
        newD0 = newD1 - newRange;
      }
      this.xScale.domain = [newD0, newD1];
    } else {
      // For categorical, we don't really support zoom yet in this way, or we need different logic
      // Just ignore clamp for now or implement index based zoom
    }

    this.updateYScale();
    this.sceneGraph.render();
  }

  handleHover(x: number, y: number) {
    // Check if within chart area
    if (
      x < this.padding.left ||
      x > this.container.clientWidth - this.padding.right ||
      y < this.padding.top ||
      y > this.container.clientHeight - this.padding.bottom
    ) {
      this.tooltip.style.display = "none";
      return;
    }

    let found = false;
    // Iterate in reverse order (top to bottom)
    for (let i = this.series.length - 1; i >= 0; i--) {
      const series = this.series[i];
      const dataPoint = series.getDataAt({ x, y });
      if (dataPoint) {
        this.tooltip.style.display = "block";
        this.tooltip.style.left = `${x + 10}px`;
        this.tooltip.style.top = `${y + 10}px`;

        // Determine formatting based on zoom level
        let xDecimals = 0;
        if (this.xScale.type === "linear" || this.xScale.type === "time") {
          const d = this.xScale.domain as [number, number];
          const xRange = d[1] - d[0];
          xDecimals = xRange < 10 ? 2 : 0;
        }

        const yRange = this.yScale.domain[1] - this.yScale.domain[0];
        const yDecimals = yRange < 10 ? 2 : 0;

        let content = "";
        if (typeof dataPoint.x === "string") {
          content = `X: ${dataPoint.x}<br>Y: ${dataPoint.y.toFixed(2)}`;
        } else {
          content = `X: ${dataPoint.x.toFixed(
            xDecimals
          )}<br>Y: ${dataPoint.y.toFixed(yDecimals)}`;
        }
        if ((dataPoint as any).label) {
          content = `Label: ${(dataPoint as any).label}<br>Value: ${
            (dataPoint as any).value
          }`;
        }

        this.tooltip.innerHTML = content;
        found = true;
        break; // Show first found (topmost)
      }
    }

    if (!found) {
      this.tooltip.style.display = "none";
    }
  }
}
