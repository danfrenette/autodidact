type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageHeader({ description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-ad-text-muted">
        {eyebrow}
      </p>
      <h1 className="font-serif text-3xl font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
        {title}
      </h1>
      <p className="max-w-xl text-sm leading-5 text-ad-text-muted">
        {description}
      </p>
    </header>
  )
}
