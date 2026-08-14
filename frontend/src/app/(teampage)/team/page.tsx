'use client'

import { useState, useMemo } from 'react'
import { Plus, LogOut } from 'lucide-react'
import { TeamList } from '@/features/team/TeamList'
import { RegisterTeamMemberForm } from '@/features/team/RegisterTeamMemberForm'
import { useCollection } from '@/hooks/useFirestore'
import { getTeamMembersCollection } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { where } from 'firebase/firestore'
import { FullPageSpinner } from '@/components/shared/LoadingSpinner'

export default function TeamPage() {
  const memberRef = useMemo(() => getTeamMembersCollection(), [])
  const constraints = useMemo(() => [where('_schemaVersion', '==', 1)], [])

  const { data: members } = useCollection(memberRef, ...constraints)
  const { user, signOut } = useAuth()
  const [showForm, setShowForm] = useState(false)

  if (!user) return <FullPageSpinner />

  const hasJoined = members.some((m) => m.uid === user?.uid)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!hasJoined && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Join Team
            </button>
          )}
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </div>

      <TeamList />

      {showForm && <RegisterTeamMemberForm onSuccess={() => setShowForm(false)} />}
    </div>
  )
}
