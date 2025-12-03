import { describe, it, expect } from "vitest";
import { LinearScale } from "../src/math/Scale";

describe("LinearScale", () => {
  it("should map domain to range correctly", () => {
    const scale = new LinearScale([0, 100], [0, 500]);
    expect(scale.toPixels(0)).toBe(0);
    expect(scale.toPixels(50)).toBe(250);
    expect(scale.toPixels(100)).toBe(500);
  });

  it("should invert pixels to domain correctly", () => {
    const scale = new LinearScale([0, 100], [0, 500]);
    expect(scale.invert(0)).toBe(0);
    expect(scale.invert(250)).toBe(50);
    expect(scale.invert(500)).toBe(100);
  });

  it("should handle inverted range (e.g., Y axis)", () => {
    const scale = new LinearScale([0, 100], [500, 0]);
    expect(scale.toPixels(0)).toBe(500);
    expect(scale.toPixels(50)).toBe(250);
    expect(scale.toPixels(100)).toBe(0);
  });

  it("should handle negative domain values", () => {
    const scale = new LinearScale([-100, 100], [0, 200]);
    expect(scale.toPixels(-100)).toBe(0);
    expect(scale.toPixels(0)).toBe(100);
    expect(scale.toPixels(100)).toBe(200);
  });
});
