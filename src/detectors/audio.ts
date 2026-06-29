export function checkAudioBaseLatency(): {
  value: number;
  codes: (string | number)[];
} {
  const codes: (string | number)[] = [];

  const AC =
    window.AudioContext ||
    (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

  if (!AC) {
    codes.push(85.1);

    return {
      value: -1,
      codes,
    };
  }

  try {
    const ctx = new AC();

    const latency = ctx.baseLatency;

    void ctx.close().catch(() => {});

    if (!Number.isFinite(latency)) {
      codes.push(85.2);

      return {
        value: -3,
        codes,
      };
    }

    // Optional anomaly checks (very low-weight)
    if (latency <= 0 || latency > 1) {
      codes.push(85.4);
    }

    return {
      value: latency,
      codes,
    };
  } catch {
    codes.push(85.3);

    return {
      value: -4,
      codes,
    };
  }
}