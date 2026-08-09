import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'

export default async function TeampageLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  )
}
