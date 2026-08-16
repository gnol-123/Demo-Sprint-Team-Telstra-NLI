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
    <div className="space-y-12">
      <div className="fixed top-0 right-6 z-10 flex h-16 items-center">
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Team 17 × Telstra – Robotics and NLI
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-zinc-400">
          Co-designing the next generation of seamless connectivity solutions for regional
          enterprise infrastructure.
        </p>
        {!hasJoined && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Join Team
          </button>
        )}
      </div>

      <TeamList />

      {showForm && <RegisterTeamMemberForm onSuccess={() => setShowForm(false)} />}
    </div>
  )
}
