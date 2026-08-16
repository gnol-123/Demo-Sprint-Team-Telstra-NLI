'use client'

import { useState, useMemo } from 'react'
import { Users, Trash2, AlertTriangle } from 'lucide-react'
import { useCollection } from '@/hooks/useFirestore'
import { getTeamMembersCollection } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { where } from 'firebase/firestore'
import { deleteTeamMemberAction } from './actions'

const ROLE_LABELS: Record<string, string> = {
  PM: 'Project Manager',
  DEV: 'Developer',
  QA: 'QA Engineer',
  UX: 'UX Designer',
  BA: 'Business Analyst',
}

export function TeamList() {
  const teamRef = useMemo(() => getTeamMembersCollection(), [])
  const constraints = useMemo(() => [where('_schemaVersion', '==', 1)], [])

  const { data: members, loading, error } = useCollection(teamRef, ...constraints)
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )

  if (error) {
    console.error('Error fetching team members:', error)
    return <p className="text-red-500">Error fetching team members.</p>
  }

  if (members.length === 0) {
    return (
      <EmptyState
        title="No team members yet"
        description="Be the first to join the team."
        icon={Users}
      />
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteTeamMemberAction()
    setDeleting(false)
    setConfirmTarget(null)
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {members.map((member) => {
        const isOwn = member.uid === user?.uid

        return (
          <div
            key={member.uid}
            className="relative flex flex-col items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center"
          >
            {confirmTarget === member.uid ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Leave the team?
                </p>
                <p className="text-xs text-zinc-500">
                  This will remove your member profile. You can rejoin later.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Removing...' : 'Remove'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(null)}
                    disabled={deleting}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName ?? ''}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      (member.displayName ?? member.email ?? '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {member.displayName ?? member.email}
                      {isOwn && (
                        <span className="ml-1.5 text-xs font-normal text-zinc-400">(you)</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-zinc-500">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </p>
                    {member.blurb && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {member.blurb}
                      </p>
                    )}
                    {member.createdAt && (
                      <p className="mt-2 text-xs text-zinc-400">
                        Joined {formatDate(member.createdAt.toDate())}
                      </p>
                    )}
                  </div>
                </div>
                {isOwn && (
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(member.uid)}
                    disabled={deleting}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950"
                    aria-label="Leave team"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
