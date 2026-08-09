'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TeamList } from '@/features/team/TeamList'
import { RegisterTeamMemberForm } from '@/features/team/RegisterTeamMemberForm'
import { useCollection } from '@/hooks/useFirestore'
import { getTeamMembersCollection } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { where } from 'firebase/firestore'

export default function TeamPage() {
  const { data: members } = useCollection(
    getTeamMembersCollection(),
    where('_schemaVersion', '==', 1)
  )
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)

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
      </div>

      <TeamList />

      {showForm && <RegisterTeamMemberForm />}
    </div>
  )
}
