'use client'

import { TeamList } from '@/features/team/TeamList'
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

  const hasJoined = members.some((m) => m.uid === user?.uid)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
      </div>

      <TeamList />
    </div>
  )
}
