interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

export function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-3 font-sans text-sm font-medium transition-colors ${
        isActive
          ? 'text-ad-text-heading'
          : 'text-ad-text-muted hover:text-ad-text-secondary'
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-ad-accent" />
      )}
    </button>
  )
}
