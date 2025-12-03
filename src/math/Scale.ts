export type ScaleType = "linear" | "log" | "time";

export interface Scale {
  type: ScaleType;
  domain: [number, number];
  range: [number, number];
  toPixels(value: number): number;
  invert(pixels: number): number;
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
