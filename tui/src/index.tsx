import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard, useRenderer } from "@opentui/react"
import { useState, useCallback } from "react"
import { Backend } from "./backend.ts"
import { MainMenu } from "./screens/main-menu.tsx"
import { FileInput } from "./screens/file-input.tsx"

const backend = new Backend()

type Screen = { name: "menu" } | { name: "file-input"; sourceType: string }

function App() {
  const renderer = useRenderer()
  const [screen, setScreen] = useState<Screen>({ name: "menu" })

  useKeyboard((key) => {
    if (key.name === "escape") {
      if (screen.name === "menu") {
        renderer?.destroy()
        backend.shutdown()
        process.exit(0)
      }
      setScreen({ name: "menu" })
    }
  })

  const handleSourceSelect = useCallback((sourceType: string) => {
    setScreen({ name: "file-input", sourceType })
  }, [])

  const handleFileSubmit = useCallback((path: string) => {
    // TODO: next screen — section selection
    backend.request("ping", { path }).then((result) => {
      // placeholder: just log for now
    })
  }, [])

  const handleBack = useCallback(() => {
    setScreen({ name: "menu" })
  }, [])

  switch (screen.name) {
    case "menu":
      return <MainMenu onSelect={handleSourceSelect} />
    case "file-input":
      return <FileInput sourceType={screen.sourceType} onSubmit={handleFileSubmit} onBack={handleBack} />
  }
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
