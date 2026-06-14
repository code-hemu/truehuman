import { useEffect, useState } from "react"
import { analyze, type HumanResult } from "truehuman"

const riskColor: Record<string, string> = {
  low: "#166534",
  medium: "#b45309",
  high: "#991b1b",
}

export default function App() {
  const [result, setResult] = useState<HumanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    analyze()
      .then(setResult)
      .catch((e: unknown) => setError((e as Error).message))
  }, [])

  if (error) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>❌ Error</h1>
        <p style={{ color: "#991b1b" }}>{error}</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>🛡️ truehuman + React</h1>
        <p>Analyzing browser…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        🛡️ truehuman + React
      </h1>

      <ResultRow label="Human" value={result.human ? "✅ Yes" : "❌ No"} />
      <ResultRow label="Score" value={`${result.score}/100`} />
      <ResultRow
        label="Risk"
        value={result.risk}
        valueColor={riskColor[result.risk]}
      />
      <ResultRow
        label="Fingerprint"
        value={`${result.fingerprint.slice(0, 32)}…`}
      />

      {result.signals.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: ".5rem" }}>Detected Signals</h2>
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
                  margin: "2px 4px 2px 0",
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ResultRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <p style={{ margin: ".5rem 0" }}>
      <strong>{label}:</strong>{" "}
      <span style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </p>
  )
}
