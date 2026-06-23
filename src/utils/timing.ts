export function measureDuration<T>(
  fn: () => T,
): { duration: number; value: T } {
  const start = performance.now()

  const value = fn()

  return {
    duration: Number((performance.now() - start).toFixed(3)),
    value,
  }
}
