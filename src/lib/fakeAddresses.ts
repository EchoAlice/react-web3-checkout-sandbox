import type { HexAddress } from "../types";

const HEX = "0123456789abcdef";

function hash(input: string, salt: string): number {
  let h = 2166136261 >>> 0;
  const s = `${salt}::${input}`;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deriveHex(input: string, salt: string, length: number): string {
  let out = "";
  let seed = hash(input, salt);
  for (let i = 0; i < length; i += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    out += HEX[seed & 0xf];
  }
  return out;
}

export function deriveEoa(email: string): HexAddress {
  return `0x${deriveHex(email, "eoa", 40)}`;
}

export function deriveSmartWallet(email: string): HexAddress {
  return `0x${deriveHex(email, "smart-wallet", 40)}`;
}

export function fakeUserOpHash(seed: string): string {
  return `0x${deriveHex(seed, "userop", 64)}`;
}

export function fakeOrderId(seed: string): string {
  return `ord_${deriveHex(seed, "order", 12)}`;
}
