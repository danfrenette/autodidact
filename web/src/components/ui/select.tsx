import { Select as SelectPrimitive } from '@base-ui/react/select'
import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

type SelectOption = {
  label: string
  meta?: string
  value: string
}

type SelectProps = {
  className?: string
  label: string
  mono?: boolean
  onValueChange: (value: string) => void
  options: Array<SelectOption>
  placeholder?: string
  value: string
}

export function Select({
  className,
  label,
  mono = false,
  onValueChange,
  options,
  placeholder = 'Select option',
  value,
}: SelectProps) {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={cn('block space-y-1', className)}>
      <span className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
        {label}
      </span>
      <SelectPrimitive.Root
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue != null) onValueChange(nextValue)
        }}
      >
        <SelectPrimitive.Trigger
          aria-label={label}
          className="group flex min-h-9 w-full items-center justify-between rounded-sm border border-ad-border bg-ad-surface px-3 text-left text-sm text-ad-text-body outline-none transition-colors hover:border-ad-border-hover focus-visible:border-ad-border-hover focus-visible:ring-2 focus-visible:ring-ad-accent/20 data-[popup-open]:border-ad-border-hover"
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {selectedOption ? (
              <SelectValue option={selectedOption} mono={mono} />
            ) : (
              <span className="text-ad-text-muted">{placeholder}</span>
            )}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className="ml-3 text-ad-text-muted transition-transform group-data-[popup-open]:rotate-180">
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner sideOffset={4} className="z-50">
            <SelectPrimitive.Popup className="min-w-[var(--anchor-width)] overflow-hidden rounded-sm border border-ad-border bg-ad-surface-elevated shadow-xl shadow-black/30 outline-none">
              <SelectPrimitive.List>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    className="flex min-h-9 cursor-default items-center justify-between gap-4 border-ad-border px-3 text-sm text-ad-text-body outline-none transition-colors first:border-t-0 not-first:border-t data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-ad-surface-pressed data-[selected]:bg-ad-surface-pressed"
                  >
                    <SelectPrimitive.ItemText>
                      <SelectValue option={option} mono={mono} />
                    </SelectPrimitive.ItemText>
                    {option.meta ? (
                      <span className="text-xs text-ad-text-muted">
                        {option.meta}
                      </span>
                    ) : null}
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}

function SelectValue({
  option,
  mono,
}: {
  option: SelectOption
  mono: boolean
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {!mono ? (
        <span className="size-1.5 shrink-0 rounded-full bg-ad-accent" />
      ) : null}
      <span className={cn('truncate', mono && 'font-mono')}>
        {option.label}
      </span>
    </span>
  )
}

function ChevronDownIcon(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}
