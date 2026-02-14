import type { SelectOption } from "@opentui/core"
import { useCallback } from "react"

type Props = {
  onSelect: (value: string) => void
}

const options: SelectOption[] = [
  { name: "Text file", description: "Ingest a .txt or plain text file", value: "text" },
  { name: "PDF", description: "Ingest a PDF document", value: "pdf" },
]

export function MainMenu({ onSelect }: Props) {
  const handleSelect = useCallback(
    (_index: number, option: SelectOption | null) => {
      if (option?.value) onSelect(option.value)
    },
    [onSelect],
  )

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <text style={{ marginBottom: 1 }}>What would you like to learn from?</text>
      <box border title="source type" style={{ width: 50 }}>
        <select options={options} onSelect={handleSelect} focused />
      </box>
    </box>
  )
}
