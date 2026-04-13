import { createFileRoute } from '@tanstack/react-router'

// Google brand icon (official colors)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export const Route = createFileRoute('/design')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw new Error('Not Found')
    }
  },
  component: DesignPage,
})

function DesignPage() {
  return (
    <main className="min-h-screen bg-[#0e0e11] text-[#e8e8ec]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-8 font-serif text-3xl font-bold">Design System Sandbox</h1>
        
        <section className="mb-12 rounded-lg border border-[#2a2a30] bg-[#131316] p-6">
          <h2 className="mb-4 text-xl font-semibold">Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#64646c]">PP Neue York (Display)</p>
              <p className="font-serif text-4xl font-extrabold uppercase tracking-tight">Autodidact</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#64646c]">Karla (UI/Body)</p>
              <p className="text-base">Turn scattered sources into structured knowledge.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#64646c]">Departure Mono (Data/Status)</p>
              <p className="font-mono text-sm tracking-wider">OPERATOR AUTHENTICATION</p>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-lg border border-[#2a2a30] bg-[#131316] p-6">
          <h2 className="mb-4 text-xl font-semibold">Color Tokens</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { name: 'Base', value: '#131316' },
              { name: 'Sidebar', value: '#0e0e11' },
              { name: 'Surface', value: '#1a1a1e' },
              { name: 'Border', value: '#2a2a30' },
              { name: 'Mid', value: '#64646c' },
              { name: 'Light Mid', value: '#a0a0a8' },
              { name: 'Body', value: '#c8c8d0' },
              { name: 'Heading', value: '#e8e8ec' },
              { name: 'Accent', value: '#c8352e' },
            ].map(({ name, value }) => (
              <div key={name} className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded border border-[#2a2a30]"
                  style={{ backgroundColor: value }}
                />
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="font-mono text-xs text-[#64646c]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-lg border border-[#2a2a30] bg-[#131316] p-6">
          <h2 className="mb-4 text-xl font-semibold">Auth Components</h2>
          
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-[#64646c]">Auth Tabs</p>
            <div className="flex border-b border-[#2a2a30]">
              <button className="border-b-2 border-[#c8352e] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[#e8e8ec]">
                Sign In
              </button>
              <button className="border-b-2 border-transparent px-8 py-3 text-sm font-medium uppercase tracking-wider text-[#64646c]">
                Sign Up
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-[#64646c]">OAuth Button</p>
            <button className="flex w-full max-w-sm items-center justify-center gap-3 rounded border border-[#2a2a30] bg-[#1a1a1e] px-4 py-3.5 text-sm font-medium text-[#e8e8ec] transition-colors hover:border-[#64646c]">
              <GoogleIcon className="h-4 w-4" />
              Continue with Google
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-[#64646c]">Boot Sequence Row</p>
            <div className="flex max-w-md items-center gap-2 font-mono text-xs tracking-wider">
              <span className="text-[#a0a0a8]">OPERATOR AUTH</span>
              <span className="flex-1 border-b border-dotted border-[#2a2a30]" />
              <span className="text-[#c8352e]">REQUIRED</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#2a2a30] bg-[#131316] p-6">
          <h2 className="mb-4 text-xl font-semibold">Auth Page Preview</h2>
          <p className="text-sm text-[#64646c]">
            Full auth page composition coming in Phase 4. This sandbox will be used to
            validate components before wiring real auth behavior.
          </p>
        </section>
      </div>
    </main>
  )
}
