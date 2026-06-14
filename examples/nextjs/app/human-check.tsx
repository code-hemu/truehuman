"use client"

import { useEffect, useState } from "react"
import { analyze, type HumanResult } from "truehuman"

const riskColor: Record<string, string> = {
  low: "#166534",
  medium: "#b45309",
  high: "#991b1b",
}

export function HumanCheck() {
  const [result, setResult] = useState<HumanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    analyze()
      .then(setResult)
      .catch((e: unknown) => setError((e as Error).message))
  }, [])

  if (error) {
    return <p style={{ color: "#991b1b" }}>❌ {error}</p>
  }

  if (!result) {
    return <p>Analyzing browser…</p>
  }

  return (
    <div>
      <p>
        <strong>Human:</strong>{" "}
        <span style={{ color: result.human ? "#166534" : "#991b1b" }}>
          {result.human ? "✅ Yes" : "❌ No"}
        </span>
      </p>
      <p>
        <strong>Score:</strong> {result.score}/100
      </p>
      <p>
        <strong>Risk:</strong>{" "}
        <span style={{ color: riskColor[result.risk] }}>{result.risk}</span>
      </p>
      <p>
        <strong>Fingerprint:</strong>{" "}
        <code>{result.fingerprint.slice(0, 32)}…</code>
      </p>
      {result.signals.length > 0 && (
        <>
          <p><strong>Signals detected:</strong></p>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {result.signals.map((s) => (
              <li
                key={s}
                style={{
                  display: "inline-block",
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "2px 10px",
                  borderRadius: 6,
                  fontSize: ".8rem",
                  margin: "2px 4px",
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
