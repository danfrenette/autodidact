interface Node {
  id: number
  cx: number
  cy: number
  r: number
  isPulsing?: boolean
}

interface Edge {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
}

const NODES: Node[] = [
  { id: 1, cx: 120, cy: 80, r: 4 },
  { id: 2, cx: 280, cy: 60, r: 5 },
  { id: 3, cx: 400, cy: 120, r: 6, isPulsing: true },
  { id: 4, cx: 180, cy: 180, r: 4 },
  { id: 5, cx: 320, cy: 200, r: 3.5 },
  { id: 6, cx: 80, cy: 240, r: 5 },
  { id: 7, cx: 220, cy: 280, r: 4 },
  { id: 8, cx: 360, cy: 260, r: 3 },
  { id: 9, cx: 140, cy: 340, r: 3.5 },
  { id: 10, cx: 300, cy: 340, r: 4 },
  { id: 11, cx: 440, cy: 180, r: 3 },
  { id: 12, cx: 60, cy: 140, r: 3 },
  { id: 13, cx: 480, cy: 100, r: 4 },
  { id: 14, cx: 420, cy: 300, r: 3.5 },
  { id: 15, cx: 200, cy: 400, r: 3 },
  { id: 16, cx: 380, cy: 380, r: 14, isPulsing: true },
  { id: 17, cx: 100, cy: 360, r: 3 },
  { id: 18, cx: 460, cy: 240, r: 8 },
]

const EDGES: Edge[] = [
  { id: 1, x1: 120, y1: 80, x2: 280, y2: 60 },
  { id: 2, x1: 280, y1: 60, x2: 400, y2: 120 },
  { id: 3, x1: 120, y1: 80, x2: 180, y2: 180 },
  { id: 4, x1: 180, y1: 180, x2: 320, y2: 200 },
  { id: 5, x1: 320, y1: 200, x2: 400, y2: 120 },
  { id: 6, x1: 180, y1: 180, x2: 80, y2: 240 },
  { id: 7, x1: 80, y1: 240, x2: 220, y2: 280 },
  { id: 8, x1: 220, y1: 280, x2: 320, y2: 200 },
  { id: 9, x1: 220, y1: 280, x2: 140, y2: 340 },
  { id: 10, x1: 220, y1: 280, x2: 300, y2: 340 },
  { id: 11, x1: 400, y1: 120, x2: 440, y2: 180 },
  { id: 12, x1: 320, y1: 200, x2: 360, y2: 260 },
  { id: 13, x1: 360, y1: 260, x2: 440, y2: 180 },
  { id: 14, x1: 80, y1: 240, x2: 60, y2: 140 },
  { id: 15, x1: 60, y1: 140, x2: 120, y2: 80 },
  { id: 16, x1: 400, y1: 120, x2: 480, y2: 100 },
  { id: 17, x1: 360, y1: 260, x2: 420, y2: 300 },
  { id: 18, x1: 300, y1: 340, x2: 420, y2: 300 },
  { id: 19, x1: 140, y1: 340, x2: 200, y2: 400 },
  { id: 20, x1: 300, y1: 340, x2: 380, y2: 380 },
  { id: 21, x1: 440, y1: 180, x2: 480, y2: 100 },
  { id: 22, x1: 440, y1: 180, x2: 460, y2: 240 },
  { id: 23, x1: 420, y1: 300, x2: 460, y2: 240 },
  { id: 24, x1: 100, y1: 360, x2: 140, y2: 340 },
]

export function ConstellationField() {
  return (
    <div className="relative w-full max-w-[640px]">
      <svg viewBox="0 0 560 440" className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        {EDGES.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="var(--ad-surface-elevated)"
            strokeWidth="1"
          />
        ))}

        {NODES.map((node) => (
          <circle
            key={node.id}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={node.isPulsing ? 'var(--ad-accent)' : 'var(--ad-border)'}
            className={node.isPulsing ? 'animate-pulse' : ''}
          />
        ))}
      </svg>
    </div>
  )
}
