import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

function App() {
  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box border title="autodidact">
        <text>Ready to learn.</text>
      </box>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
