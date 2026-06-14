import type { ReactNode } from "react"

export const metadata = {
  title: "truehuman — Next.js Example",
  description: "Example integrating truehuman with Next.js App Router",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
