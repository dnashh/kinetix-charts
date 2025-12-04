export type ScaleType = "linear" | "log" | "time" | "categorical";

export interface Scale {
  type: ScaleType;
  domain: any[]; // [number, number] or string[]
  range: [number, number];
  toPixels(value: number | string): number;
  invert(pixels: number): number | string;
}

export class LinearScale implements Scale {
  type: ScaleType = "linear";
  domain: [number, number];
  range: [number, number];

  constructor(domain: [number, number], range: [number, number]) {
    this.domain = domain;
    this.range = range;
  }

  toPixels(value: number): number {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
  }

  invert(pixels: number): number {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    return d0 + ((pixels - r0) / (r1 - r0)) * (d1 - d0);
  }
}

export class LogScale implements Scale {
  type: ScaleType = "log";
  domain: [number, number];
  range: [number, number];

  constructor(domain: [number, number], range: [number, number]) {
    this.domain = domain;
    this.range = range;
  }

  toPixels(value: number): number {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    const logD0 = Math.log(d0);
    const logD1 = Math.log(d1);
    return r0 + ((Math.log(value) - logD0) / (logD1 - logD0)) * (r1 - r0);
  }

  invert(pixels: number): number {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    const logD0 = Math.log(d0);
    const logD1 = Math.log(d1);
    const logValue = logD0 + ((pixels - r0) / (r1 - r0)) * (logD1 - logD0);
    return Math.exp(logValue);
  }
}

export class CategoricalScale implements Scale {
  type: ScaleType = "categorical";
  domain: string[];
  range: [number, number];
  padding: number = 0.5;

  constructor(domain: string[], range: [number, number]) {
    this.domain = domain;
    this.range = range;
  }

  toPixels(value: string | number): number {
    // If value is number (index), use it directly
    let index = typeof value === "number" ? value : this.domain.indexOf(value);
    if (index === -1) return 0; // Fallback

    const [r0, r1] = this.range;
    const step = (r1 - r0) / this.domain.length;
    // Center the point in the band
    return r0 + step * index + step / 2;
  }

  invert(pixels: number): string {
    const [r0, r1] = this.range;
    const step = (r1 - r0) / this.domain.length;
    const index = Math.floor((pixels - r0) / step);
    if (index >= 0 && index < this.domain.length) {
      return this.domain[index];
    }
    return "";
  }
}
