import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function TeampageLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="flex min-h-screen bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
