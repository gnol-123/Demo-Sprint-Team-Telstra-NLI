import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'

export default async function TeampageLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-100">
      <header className="border-b border-zinc-800/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/telstra-logo.svg" alt="" aria-hidden="true" className="h-8 w-auto" />
            <div className="leading-none">
              <p className="text-sm font-bold tracking-wide text-white">TELSTRA</p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.15em] text-blue-500">
                PARTNER NETWORK
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2 pr-24 text-sm">
            <span className="text-zinc-500">Projects</span>
            <span className="text-zinc-700">/</span>
            <span className="font-medium text-zinc-100">Team 17 Showcase</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-16">{children}</main>

      <footer className="mt-auto border-t border-zinc-800/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs text-zinc-500">
          <p>© 2025 Telstra × Team 17. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-zinc-300">
              Security Policy
            </a>
            <a href="#" className="transition-colors hover:text-zinc-300">
              Terms of Collaboration
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
