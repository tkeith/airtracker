function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

export function encrypt(num: number, key: string): number {
  const keyHash = hashKey(key);
  return num ^ keyHash; // XOR operation
}

export function decrypt(encryptedNum: number, key: string): number {
  const keyHash = hashKey(key);
  return encryptedNum ^ keyHash; // XOR operation (since XOR is its own inverse)
}