export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(data))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

export function fnv1a(data: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
