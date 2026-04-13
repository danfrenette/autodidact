interface BootRowProps {
  label: string
  status: string
  isRequired?: boolean
}

export function BootRow({ label, status, isRequired }: BootRowProps) {
  const statusColor = isRequired ? 'text-ad-accent' : 'text-ad-text-secondary'

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] tracking-wider">
      <span className="whitespace-nowrap text-ad-text-secondary">{label}</span>
      <span className="flex-1 border-b border-dotted border-ad-border" />
      <span className={`whitespace-nowrap ${statusColor}`}>{status}</span>
    </div>
  )
}
