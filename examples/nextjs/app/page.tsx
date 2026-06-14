import { HumanCheck } from "./human-check.js"

export default function Home() {
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        🛡️ truehuman + Next.js
      </h1>
      <HumanCheck />
    </main>
  )
}
