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
      className={`relative pb-3 font-sans text-[13px] font-medium transition-colors ${
        isActive
          ? 'text-ad-text-heading'
          : 'text-ad-text-muted hover:text-ad-text-secondary'
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ad-accent" />
      )}
    </button>
  )
}
