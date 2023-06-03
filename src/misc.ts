/**
 * Calculates the value of a pulse wave at a given time and frequency.
 * @param time - The time value at which to calculate the pulse wave.
 * @param freq - The frequency of the pulse wave. Default value is 1.
 * @returns The value of the pulse wave at the given time and frequency.
 */
export function pulse(time: number, freq: number = 1): number {
  return 0.5 * (1 + Math.sin(2 * Math.PI * freq * time));
}

/**
 * Performs a linear interpolation between two numbers.
 * @param a The start value.
 * @param b The end value.
 * @param t The interpolation factor (0-1).
 * @returns The interpolated value.
 */
export function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

/**
 * Performs spherical linear interpolation between two numbers.
 * @param a The start value.
 * @param b The end value.
 * @param t The interpolation factor, between 0 and 1.
 * @returns The interpolated value.
 */
export function slerp(a: number, b: number, t: number): number {
  const theta = Math.acos(Math.min(Math.max(a / b, -1), 1)) * t;
  return a * Math.cos(theta) + b * Math.sin(theta);
}
