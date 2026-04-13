type AuthTab = 'signin' | 'signup'

interface AuthTabsProps {
  activeTab: AuthTab
  onTabChange: (tab: AuthTab) => void
}

export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  const baseClasses = 'px-8 py-3 text-[13px] uppercase tracking-wider transition-colors'
  const activeClasses = 'border-b-2 border-ad-accent font-semibold text-ad-text-heading'
  const inactiveClasses = 'border-b-2 border-transparent font-medium text-ad-text-muted hover:text-ad-text-secondary'

  return (
    <div className="flex border-b border-ad-border">
      <button
        type="button"
        onClick={() => onTabChange('signin')}
        className={`${baseClasses} ${activeTab === 'signin' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeTab === 'signin'}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onTabChange('signup')}
        className={`${baseClasses} ${activeTab === 'signup' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeTab === 'signup'}
      >
        Sign Up
      </button>
    </div>
  )
}
