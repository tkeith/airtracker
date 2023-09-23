export function intToFloat(int: number): number {
  return int / 10 ** 6;
}

export function floatToInt(float: number): number {
  return Math.round(float * 10 ** 6);
}
