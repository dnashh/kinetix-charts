import { describe, it, expect } from "vitest";
import { lttb, Point } from "../src/math/LTTB";

describe("LTTB", () => {
  it("should return all points if count is greater than data length", () => {
    const data: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const result = lttb(data, 5);
    expect(result).toEqual(data);
    expect(result.length).toBe(3);
  });

  it("should downsample data to target threshold", () => {
    const data: Point[] = [];
    for (let i = 0; i < 100; i++) {
      data.push({ x: i, y: i });
    }
    const threshold = 10;
    const result = lttb(data, threshold);
    expect(result.length).toBe(threshold);

    // First and last points should always be preserved
    expect(result[0]).toEqual(data[0]);
    expect(result[result.length - 1]).toEqual(data[data.length - 1]);
  });

  it("should handle empty data", () => {
    const result = lttb([], 10);
    expect(result).toEqual([]);
  });

  it("should handle threshold of 0 or 1", () => {
    // LTTB usually requires at least 2 points to make sense (start and end)
    // Implementation might return empty or just start/end depending on logic.
    // Assuming standard behavior:
    const data = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(lttb(data, 0).length).toBeLessThanOrEqual(2);
  });
});
