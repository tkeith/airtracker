import { hashKey } from "./hashKey";

export function encrypt(num: number, key: string): number {
  const keyHash = hashKey(key);
  return num ^ keyHash; // XOR operation
}

export function decrypt(encryptedNum: number, key: string): number {
  const keyHash = hashKey(key);
  return encryptedNum ^ keyHash; // XOR operation (since XOR is its own inverse)
}
