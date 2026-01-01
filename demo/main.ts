/**
 * Kinetix Charts Demo
 * Showcases all chart types and features
 */

import {
  Chart,
  LineSeries,
  BarSeries,
  ScatterSeries,
  PieSeries,
  stack,
} from "../src/index";
import type { ChartConfig } from "../src/types";

// ============================================
// Data Generators
// ============================================

function generateLineData(count: number): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = [];
  let value = 50;

  for (let i = 0; i < count; i++) {
    // Random walk with trend
    value += (Math.random() - 0.48) * 10;
    value = Math.max(10, Math.min(100, value));
    data.push({ x: i, y: value });
  }

  return data;
}

function generateCategoricalData(): { x: string; y: number }[] {
  const prefixes = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Sigma",
    "Omega",
    "Nova",
    "Apex",
    "Core",
    "Edge",
  ];
  const count = 5 + Math.floor(Math.random() * 6); // 5-10 categories

  return prefixes.slice(0, count).map((name) => ({
    x: name,
    y: Math.floor(10000 + Math.random() * 40000),
  }));
}

function generateScatterData(count: number): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
    });
  }

  return data;
}

function generatePieData(): { label: string; value: number; color?: string }[] {
  return [
    { label: "Direct", value: 35, color: "#6366f1" },
    { label: "Organic", value: 28, color: "#22c55e" },
    { label: "Referral", value: 22, color: "#f59e0b" },
    { label: "Social", value: 15, color: "#ec4899" },
  ];
}

function generateStackedData(): { x: number; y: number }[][] {
  const series1: { x: number; y: number }[] = [];
  const series2: { x: number; y: number }[] = [];
  const series3: { x: number; y: number }[] = [];

  for (let i = 0; i < 10; i++) {
    series1.push({ x: i * 10, y: 10 + Math.random() * 30 });
    series2.push({ x: i * 10, y: 10 + Math.random() * 30 });
    series3.push({ x: i * 10, y: 10 + Math.random() * 30 });
  }

  return [series1, series2, series3];
}

function generateLargeDataset(count: number): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = [];
  let value = 50;

  for (let i = 0; i < count; i++) {
    value += (Math.random() - 0.5) * 5;
    value = Math.max(0, Math.min(100, value));
    data.push({ x: i, y: value });
  }

  return data;
}

// ============================================
// Chart Registry (for theme updates)
// ============================================

const charts: Chart[] = [];
let currentTheme: "dark" | "light" = "dark";

function registerChart(chart: Chart): Chart {
  charts.push(chart);
  return chart;
}

// ============================================
// Chart Creation Functions
// ============================================

function createLineChart(): void {
  const container = document.getElementById("chart-line");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new LineSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#6366f1";
  series.name = "Revenue";
  series.setData(generateLineData(50));

  chart.addSeries(series);
  chart.update({ theme: currentTheme });
  registerChart(chart);
}

function createMultiLineChart(): void {
  const container = document.getElementById("chart-multiline");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  // Generate data with same X values for all series
  const data1: { x: number; y: number }[] = [];
  const data2: { x: number; y: number }[] = [];
  const data3: { x: number; y: number }[] = [];

  let v1 = 50,
    v2 = 40,
    v3 = 30;
  for (let i = 0; i < 30; i++) {
    v1 += (Math.random() - 0.45) * 8;
    v2 += (Math.random() - 0.5) * 6;
    v3 += (Math.random() - 0.55) * 5;
    v1 = Math.max(10, Math.min(90, v1));
    v2 = Math.max(10, Math.min(90, v2));
    v3 = Math.max(10, Math.min(90, v3));
    data1.push({ x: i, y: v1 });
    data2.push({ x: i, y: v2 });
    data3.push({ x: i, y: v3 });
  }

  const series1 = new LineSeries(container, 1);
  series1.setScales(chart.xScale, chart.yScale);
  series1.color = "#6366f1";
  series1.name = "Revenue";
  series1.setData(data1);

  const series2 = new LineSeries(container, 2);
  series2.setScales(chart.xScale, chart.yScale);
  series2.color = "#22c55e";
  series2.name = "Expenses";
  series2.setData(data2);

  const series3 = new LineSeries(container, 3);
  series3.setScales(chart.xScale, chart.yScale);
  series3.color = "#f59e0b";
  series3.name = "Profit";
  series3.setData(data3);

  chart.addSeries(series1);
  chart.addSeries(series2);
  chart.addSeries(series3);
  chart.update({ theme: currentTheme });
  registerChart(chart);
}

function createBarChart(): void {
  const container = document.getElementById("chart-bar");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new BarSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#22c55e";
  series.name = "Sales";
  series.setData(generateCategoricalData());

  chart.addSeries(series);
  chart.update({ theme: currentTheme });
  registerChart(chart);
}

function createScatterChart(): void {
  const container = document.getElementById("chart-scatter");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new ScatterSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#f59e0b";
  series.radius = 5;
  series.name = "Data Points";
  series.setData(generateScatterData(60));

  chart.addSeries(series);
  chart.update({ theme: currentTheme });
  registerChart(chart);
}

function createPieChart(): void {
  const container = document.getElementById("chart-pie");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new PieSeries(container, 1);
  series.setData(generatePieData());

  chart.addSeries(series);
  chart.update({
    theme: currentTheme,
    xAxis: { visible: false },
    yAxis: { visible: false },
  });
  registerChart(chart);
}

function createDonutChart(): void {
  const container = document.getElementById("chart-donut");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new PieSeries(container, 1);
  series.innerRadius = 0.5; // Make it a donut
  series.setData([
    { label: "Mobile", value: 45, color: "#6366f1" },
    { label: "Desktop", value: 35, color: "#22c55e" },
    { label: "Tablet", value: 20, color: "#f59e0b" },
  ]);

  chart.addSeries(series);
  chart.update({
    theme: currentTheme,
    xAxis: { visible: false },
    yAxis: { visible: false },
  });
  registerChart(chart);
}

function createStackedChart(): void {
  const container = document.getElementById("chart-stacked");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container, {
    xAxis: {
      type: "categorical",
      scrollable: true,
    },
  });
  chart.series = [];

  const rawData = generateStackedData();
  const stackedData = stack(rawData);
  const colors = ["#6366f1", "#22c55e", "#f59e0b"];
  const names = ["Product A", "Product B", "Product C"];

  stackedData.forEach((data, i) => {
    const series = new BarSeries(container, 1);
    series.setScales(chart.xScale, chart.yScale);
    series.color = colors[i];
    series.name = names[i];
    series.setData(data);
    chart.addSeries(series);
  });

  chart.update({ theme: currentTheme });
  registerChart(chart);
}

function createLargeDatasetChart(): void {
  const container = document.getElementById("chart-large");
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new LineSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#ec4899";
  series.name = "Time Series";
  series.setData(generateLargeDataset(10000));

  chart.addSeries(series);
  chart.update({ theme: currentTheme });
  registerChart(chart);
}

// ============================================
// Interactive Preview
// ============================================

let previewChart: Chart | null = null;

function updatePreviewChart(): void {
  const container = document.getElementById("chart-preview");
  const typeSelect = document.getElementById("chart-type") as HTMLSelectElement;
  const pointsInput = document.getElementById(
    "data-points"
  ) as HTMLInputElement;

  if (!container || !typeSelect || !pointsInput) return;
  container.innerHTML = "";

  const chartType = typeSelect.value;
  const dataPoints = parseInt(pointsInput.value, 10);

  const config: ChartConfig = {
    theme: currentTheme,
    series: [],
  };

  switch (chartType) {
    case "line":
      config.series = [
        {
          type: "line",
          data: generateLineData(dataPoints),
          color: "#6366f1",
          name: "Line Series",
        },
      ];
      break;

    case "bar":
      config.series = [
        {
          type: "bar",
          data: generateCategoricalData(),
          color: "#22c55e",
          name: "Bar Series",
        },
      ];
      break;

    case "scatter":
      config.series = [
        {
          type: "scatter",
          data: generateScatterData(dataPoints),
          color: "#f59e0b",
          radius: 5,
          name: "Scatter Series",
        },
      ];
      break;

    case "pie":
      config.series = [
        {
          type: "pie",
          data: generatePieData(),
        },
      ];
      config.xAxis = { visible: false };
      config.yAxis = { visible: false };
      break;
  }

  previewChart = new Chart(container, config);
  registerChart(previewChart);
}

// ============================================
// Theme Toggle
// ============================================

function toggleTheme(): void {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.classList.toggle("light-theme", currentTheme === "light");

  // Update all charts
  charts.forEach((chart) => {
    chart.update({ theme: currentTheme });
  });
}

// ============================================
// Event Listeners & Initialization
// ============================================

function initEventListeners(): void {
  // Theme toggle
  document
    .getElementById("theme-toggle")
    ?.addEventListener("click", toggleTheme);

  // Interactive controls
  document
    .getElementById("generate-btn")
    ?.addEventListener("click", updatePreviewChart);
  document
    .getElementById("chart-type")
    ?.addEventListener("change", updatePreviewChart);

  // Data points slider
  const pointsInput = document.getElementById(
    "data-points"
  ) as HTMLInputElement;
  const pointsValue = document.getElementById("data-points-value");

  if (pointsInput && pointsValue) {
    pointsInput.addEventListener("input", () => {
      pointsValue.textContent = pointsInput.value;
    });
  }
}

function init(): void {
  // Create all demo charts
  createLineChart();
  createMultiLineChart();
  createBarChart();
  createScatterChart();
  createPieChart();
  createDonutChart();
  createStackedChart();
  createLargeDatasetChart();

  // Initialize preview
  updatePreviewChart();

  // Setup event listeners
  initEventListeners();

  console.log("🚀 Kinetix Charts Demo loaded");
}

// Start
init();
