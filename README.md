<p align="center">
  <h1 align="center">📊 Kinetix Charts</h1>
  <p align="center">
    <strong>High-performance, dependency-free charting library</strong><br>
    Built with TypeScript and HTML5 Canvas
  </p>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#chart-types">Chart Types</a> •
  <a href="#api-reference">API</a> •
  <a href="#features">Features</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **High Performance** | Canvas-based rendering handles 100k+ data points smoothly |
| 📦 **Zero Dependencies** | No external runtime dependencies - just import and use |
| 📐 **Responsive** | Automatically adapts to container size changes |
| 📉 **LTTB Downsampling** | Largest-Triangle-Three-Buckets algorithm for efficient large dataset rendering |
| 🖱️ **Interactive** | Built-in pan, zoom, and tooltip support |
| 🎨 **Themeable** | Light and dark themes with customizable colors |
| 🏷️ **Auto Legend** | Smart legend that moves to avoid data occlusion |
| 📊 **Multiple Types** | Line, Bar, Scatter, Pie/Donut, and Stacked charts |
| ✨ **Animations** | Smooth render animations for all chart types |

## 📦 Installation

```bash
npm install kinetix-charts
```

```bash
# or with bun
bun add kinetix-charts
```

## 🚀 Quick Start

### 1. Create a container

```html
<div id="chart" style="width: 100%; height: 400px;"></div>
```

### 2. Initialize a chart

```typescript
import { Chart } from 'kinetix-charts';

const container = document.getElementById('chart');

const chart = new Chart(container, {
  theme: 'dark',
  series: [
    {
      type: 'line',
      name: 'Revenue',
      color: '#6366f1',
      data: [
        { x: 0, y: 10 },
        { x: 1, y: 25 },
        { x: 2, y: 18 },
        { x: 3, y: 35 },
        { x: 4, y: 28 }
      ]
    }
  ]
});
```

That's it! The chart will render with pan, zoom, and tooltips enabled by default.

---

## 📊 Chart Types

### Line Chart

Best for time-series and continuous data.

```typescript
import { Chart, LineSeries } from 'kinetix-charts';

const chart = new Chart(container);
chart.series = [];

const line = new LineSeries(container, 1);
line.setScales(chart.xScale, chart.yScale);
line.color = '#6366f1';
line.name = 'Series A';
line.setData([
  { x: 0, y: 10 },
  { x: 1, y: 25 },
  { x: 2, y: 18 }
]);

chart.addSeries(line);
```

### Bar Chart

Supports both numeric and categorical (text) X-axis values.

```typescript
import { Chart, BarSeries } from 'kinetix-charts';

const chart = new Chart(container);
chart.series = [];

const bar = new BarSeries(container, 1);
bar.setScales(chart.xScale, chart.yScale);
bar.color = '#22c55e';
bar.name = 'Sales';

// Categorical data - text labels on X-axis
bar.setData([
  { x: 'Jan', y: 45 },
  { x: 'Feb', y: 62 },
  { x: 'Mar', y: 38 },
  { x: 'Apr', y: 71 }
]);

chart.addSeries(bar);
```

### Scatter Plot

For displaying correlation between two variables.

```typescript
import { Chart, ScatterSeries } from 'kinetix-charts';

const chart = new Chart(container);
chart.series = [];

const scatter = new ScatterSeries(container, 1);
scatter.setScales(chart.xScale, chart.yScale);
scatter.color = '#f59e0b';
scatter.radius = 5;
scatter.name = 'Data Points';
scatter.setData([
  { x: 10, y: 20 },
  { x: 25, y: 45 },
  { x: 40, y: 30 }
]);

chart.addSeries(scatter);
```

### Pie / Donut Chart

For showing proportions of a whole.

```typescript
import { Chart, PieSeries } from 'kinetix-charts';

const chart = new Chart(container);
chart.series = [];

const pie = new PieSeries(container, 1);

// For donut chart, set innerRadius (0-1)
pie.innerRadius = 0.5;

pie.setData([
  { label: 'Direct', value: 35, color: '#6366f1' },
  { label: 'Organic', value: 28, color: '#22c55e' },
  { label: 'Referral', value: 22, color: '#f59e0b' },
  { label: 'Social', value: 15, color: '#ec4899' }
]);

chart.addSeries(pie);

// Hide axes for pie charts
chart.update({
  xAxis: { visible: false },
  yAxis: { visible: false }
});
```

### Stacked Bar Chart

Use the `stack()` utility to prepare data for stacking.

```typescript
import { Chart, BarSeries, stack } from 'kinetix-charts';

const chart = new Chart(container);
chart.series = [];

// Raw data for each series
const series1 = [{ x: 0, y: 20 }, { x: 1, y: 30 }, { x: 2, y: 25 }];
const series2 = [{ x: 0, y: 15 }, { x: 1, y: 20 }, { x: 2, y: 18 }];
const series3 = [{ x: 0, y: 10 }, { x: 1, y: 15 }, { x: 2, y: 12 }];

// Stack the data (adds y0 property for baseline)
const stackedData = stack([series1, series2, series3]);

const colors = ['#6366f1', '#22c55e', '#f59e0b'];
const names = ['Product A', 'Product B', 'Product C'];

stackedData.forEach((data, i) => {
  const bar = new BarSeries(container, 1);
  bar.setScales(chart.xScale, chart.yScale);
  bar.color = colors[i];
  bar.name = names[i];
  bar.setData(data);
  chart.addSeries(bar);
});
```

---

## 📖 API Reference

### Chart

The main chart class that manages rendering and interactions.

```typescript
const chart = new Chart(container: HTMLElement, config?: ChartConfig);
```

#### ChartConfig

```typescript
interface ChartConfig {
  width?: number;          // Optional, defaults to container width
  height?: number;         // Optional, defaults to container height
  padding?: {              // Chart area padding
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  theme?: 'light' | 'dark';
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: SeriesConfig[];
  startFromZero?: boolean;  // Start Y-axis from 0 for positive values (default: true)
  startXFromZero?: boolean; // Start X-axis from 0 for positive values (default: false)
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `update(config)` | Update chart configuration |
| `addSeries(series)` | Add a series to the chart |
| `pan(dx, dy)` | Programmatically pan the chart |
| `zoom(factor, centerPixel)` | Programmatically zoom |

### AxisConfig

```typescript
interface AxisConfig {
  min?: number;                              // Axis minimum
  max?: number;                              // Axis maximum
  visible?: boolean;                         // Show/hide axis
  theme?: 'light' | 'dark';
  type?: 'numeric' | 'datetime' | 'categorical';
  xTickCount?: number;                       // Number of X-axis ticks
  yTickCount?: number;                       // Number of Y-axis ticks
  xLabelFormat?: (val: number) => string;    // Custom X label formatter
  yLabelFormat?: (val: number) => string;    // Custom Y label formatter
  gridColor?: string;
  textColor?: string;
  font?: string;
}
```

### Series Types

#### LineSeries

```typescript
const series = new LineSeries(container, zIndex);
series.color = '#6366f1';
series.name = 'Series Name';
series.setData([{ x: number, y: number }, ...]);
```

#### BarSeries

```typescript
const series = new BarSeries(container, zIndex);
series.color = '#22c55e';
series.barWidth = 0.8;  // 0-1, relative to slot width
series.setData([{ x: number | string, y: number }, ...]);
```

#### ScatterSeries

```typescript
const series = new ScatterSeries(container, zIndex);
series.color = '#f59e0b';
series.radius = 5;
series.setData([{ x: number, y: number }, ...]);
```

#### PieSeries

```typescript
const series = new PieSeries(container, zIndex);
series.innerRadius = 0;       // 0 for pie, 0.5+ for donut
series.showLabels = true;     // Show percentage labels on slices
series.showLegend = true;     // Show legend at bottom
series.setData([{ label: string, value: number, color?: string }, ...]);
```

### Animation Control

All series support render animations by default:

```typescript
// Disable animation for a series
series.disableAnimation();

// Enable animation with custom duration (ms)
series.enableAnimation(800);

// Manually trigger animation
series.startAnimation();
```

---

## 🖱️ Interactions

Interactions are enabled by default for charts with **numeric X-axis**:

| Interaction | Action |
|-------------|--------|
| **Pan** | Click and drag to pan the X-axis |
| **Zoom** | Scroll to zoom in/out |
| **Tooltips** | Hover over data points to see values |

> **Note:** Pan and zoom are disabled for categorical X-axis charts (bar charts with text labels) since all categories should always be visible.

The Y-axis automatically scales to fit the visible data range when panning or zooming.

### Smart Label Formatting

Y-axis labels are automatically formatted for readability:
- Values ≥ 1,000,000 → "1M", "2.5M"
- Values ≥ 1,000 → "10K", "25K"
- Smaller values → displayed normally

You can override this with custom formatters:
```typescript
chart.update({
  yAxis: {
    yLabelFormat: (val) => `$${val.toLocaleString()}`
  }
});
```

### Strict Categorical Mode
If your categorical data looks like numbers (e.g. "2020", "2021") and you want to prevent them from being parsed as numeric values, explicitly set the axis type to 'categorical'.

```typescript
const chart = new Chart(container, {
  xAxis: {
    type: 'categorical', 
    visible: true
  },
  // ...
});
```

### Scrolling for Large Datasets
For charts with a large number of categorical data points, you can enable scrolling.

```typescript
const chart = new Chart(container, {
  xAxis: {
    type: 'categorical',
    scrollable: true // Enables horizontal scrolling
  },
  // ...
});
```

### Histograms (Bar Alignment)
To render histograms using a numeric axis, align the bars to the start of the data point.

```typescript
{
  type: 'bar',
  data: [ ... ],
  barWidth: 1.0, // Full width
  align: 'start', // Align bar to start of X value
  color: '#3b82f6'
}
```

### Control Panel API
The `Chart` instance exposes methods to control series visibility programmatically.

```typescript
// Toggle visibility of series at index 0
chart.toggleSeries(0);

// Set visibility explicitly
chart.setSeriesVisibility(0, false); // Hide
chart.setSeriesVisibility(0, true);  // Show

// Update Axis Configuration
chart.updateAxis({ visible: false, type: 'numeric' });

// Toggle Grid
chart.setGridVisible(true);

// Switch Theme (Light/Dark)
chart.setTheme('dark');

// Update Series Properties
chart.updateSeries(0, { color: '#ef4444', name: 'New Name' });

// Get information about all series
const info = chart.getSeriesInfo();
// Returns: [{ index: 0, name: 'Sales', color: '#ff0000', visible: true, type: 'line' }, ...]

// Export Chart as Image with options
chart.downloadImage('my-chart.png', { 
  scale: 2,               // 2x resolution
  width: 1200,            // Custom width
  height: 600,            // Custom height
  // window: { xMin: 0, xMax: 50 } // Optional zoom/pan window (numeric/index domain)
});

// Get Chart Image as Data URL
const dataUrl = chart.getCanvasImage({ scale: 2 });
```

## Advanced Features

### Delta Mode (Bar Charts)

When your data has minor variations between values (e.g., `[1000, 1002, 1001, 1003]`), the differences are hard to see because bars all look nearly the same height. **Delta Mode** solves this by showing bar heights relative to the minimum value.

```typescript
// Enable delta mode for a bar series
const chart = new Chart(container, {
  series: [{
    type: 'bar',
    name: 'Sales',
    data: [
      { x: 'Mon', y: 1000 },
      { x: 'Tue', y: 1002 },
      { x: 'Wed', y: 1001 },
      { x: 'Thu', y: 1005 }
    ],
    deltaMode: true  // Toggle to enable relative height display
  }]
});
```

**Without deltaMode:** All bars look nearly identical height (all ~1000).  
**With deltaMode:** Bar height differences are magnified, making variations clearly visible.

> **Note:** The actual Y values are still displayed in tooltips. Delta mode only affects the visual representation.

---

## 🎨 Theming

### Built-in Themes

```typescript
// Dark theme (default)
chart.update({ theme: 'dark' });

// Light theme
chart.update({ theme: 'light' });
```

### Custom Colors

Each series accepts a `color` property:

```typescript
const series = new LineSeries(container, 1);
series.color = '#your-color-here';
```

Pie charts support per-slice colors:

```typescript
pie.setData([
  { label: 'A', value: 30, color: '#ef4444' },
  { label: 'B', value: 70, color: '#3b82f6' }
]);
```

---

## ⚡ Performance

Kinetix Charts uses several techniques for high performance:

1. **Canvas Rendering** - Direct canvas drawing instead of DOM manipulation
2. **LTTB Downsampling** - Automatically downsamples large datasets (>2000 points) using the Largest-Triangle-Three-Buckets algorithm, preserving visual shape while reducing render overhead
3. **Efficient Updates** - Only redraws when necessary
4. **Layer Architecture** - Separate canvas layers for different components

### Large Datasets

```typescript
// Works smoothly with 100k+ points
const largeData = [];
for (let i = 0; i < 100000; i++) {
  largeData.push({ x: i, y: Math.sin(i / 1000) * 50 + 50 });
}

const series = new LineSeries(container, 1);
series.setData(largeData);  // LTTB automatically kicks in
```

---

## 🏷️ Legend

A legend is automatically generated based on series names:

```typescript
const series = new LineSeries(container, 1);
series.name = 'Revenue 2024';  // Shows in legend
series.color = '#6366f1';
```

**Behavior:**
- Position: Top-right by default
- Moves to top-left when you hover over it (to prevent blocking data)
- Automatically updates when series are added/removed

---

## 🛠️ Development

### Setup

```bash
git clone https://github.com/dnashh/kinetix-charts.git
cd kinetix-charts
bun install
```

### Commands

```bash
# Start dev server (runs demo)
bun run dev

# Build for production
bun run build

# Run tests
bun test
```

### Project Structure

```
kinetix-charts/
├── src/
│   ├── core/           # Chart, SceneGraph, InteractionManager
│   ├── render/         # Series types, Axis, Grid, Legend layers
│   ├── math/           # Scale classes, Transform, LTTB algorithm
│   ├── utils/          # Stack utility
│   ├── types.ts        # TypeScript interfaces
│   └── index.ts        # Public exports
├── demo/               # Demo application
└── tests/              # Test files
```

---

## 📄 License

MIT © [dnashh](https://github.com/dnashh)
