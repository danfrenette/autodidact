import { Crosshair } from '@phosphor-icons/react'

export function RegistrationMark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Crosshair
        size={20}
        weight="thin"
        className="text-ad-border opacity-50"
      />
    </div>
  )
}
