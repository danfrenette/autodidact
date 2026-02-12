import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState, useEffect } from "react"
import { Backend } from "./backend.ts"

const backend = new Backend()

function App() {
  const [status, setStatus] = useState("connecting...")

  useEffect(() => {
    backend.request("ping").then((result) => {
      setStatus(`backend v${result.version}: ${result.status}`)
    }).catch(() => {
      setStatus("failed to connect")
    })
  }, [])

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box border title="autodidact">
        <text>{status}</text>
      </box>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
