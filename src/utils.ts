import * as wasm from "./wasm/lyra_utils_wasm";
import type { TokenScore } from "./lyra";

const baseId = Date.now().toString().slice(5);
let lastId = 0;

const k = 1024;
const nano = BigInt(1e3);
const milli = BigInt(1e6);
const second = BigInt(1e9);

export const isServer = typeof window === "undefined";

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNanoseconds(value: number | bigint): string {
  if (typeof value === "number") {
    value = BigInt(value);
  }

  if (value < nano) {
    return `${value}ns`;
  } else if (value < milli) {
    return `${value / nano}μs`;
  } else if (value < second) {
    return `${value / milli}ms`;
  }

  return `${value / second}s`;
}

export function getNanosecondsTime(): bigint {
  if (typeof process !== "undefined" && process.hrtime !== undefined) {
    return process.hrtime.bigint();
  }

  if (typeof performance !== "undefined") {
    return BigInt(Math.floor(performance.now() * 1e6));
  }

  // @todo: fallback to V8 native method to get microtime
  return BigInt(0);
}

export function uniqueId(): string {
  return `${baseId}-${lastId++}`;
}

export function getOwnProperty<T = unknown>(object: Record<string, T>, property: string): T | undefined {
  return Object.hasOwn(object, property) ? object[property] : undefined;
}

export function getTokenFrequency(token: string, tokens: string[]): number {
  let count = 0;

  for (const t of tokens) {
    if (t === token) {
      count++;
    }
  }

  return count;
}

// Adapted from https://github.com/lovasoa/fast_array_intersect
// MIT Licensed (https://github.com/lovasoa/fast_array_intersect/blob/master/LICENSE)
// while on tag https://github.com/lovasoa/fast_array_intersect/tree/v1.1.0
export function intersectTokenScores(arrays: TokenScore[][]): TokenScore[] {
  const { data } = wasm.intersectTokenScores({ data: arrays });
  return data;
}

export function insertSortedValue(
  arr: TokenScore[],
  el: TokenScore,
  compareFn = sortTokenScorePredicate,
): TokenScore[] {
  let low = 0;
  let high = arr.length;
  let mid;

  while (low < high) {
    mid = (low + high) >>> 1;
    if (compareFn(el, arr[mid]) < 0) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  arr.splice(low, 0, el);

  return arr;
}

export function includes<T>(array: T[] | readonly T[], element: T): boolean {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === element) {
      return true;
    }
  }
  return false;
}

export function sortTokenScorePredicate(a: TokenScore, b: TokenScore): number {
  return b[1] - a[1];
}
