import { useCallback, useState } from "react"

type Props = {
  sourceType: string
  onSubmit: (path: string) => void
  onBack: () => void
}

export function FileInput({ sourceType, onSubmit, onBack }: Props) {
  const [path, setPath] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(() => {
    if (path.trim().length === 0) {
      setError("Please enter a file path")
      return
    }
    setError(null)
    onSubmit(path.trim())
  }, [path, onSubmit])

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <text style={{ marginBottom: 1 }}>
        Enter path to your <strong>{sourceType}</strong> file
      </text>

      <box border title="file path" style={{ width: 60, height: 3 }}>
        <input
          placeholder={`/path/to/file.${sourceType === "pdf" ? "pdf" : "txt"}`}
          onInput={setPath}
          onSubmit={handleSubmit}
          focused
        />
      </box>

      {error && <text fg="red" style={{ marginTop: 1 }}>{error}</text>}

      <text fg="#666666" style={{ marginTop: 1 }}>Enter to submit | Esc to go back</text>
    </box>
  )
}
