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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-950/40">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-sm font-medium text-zinc-200">Leave the team?</p>
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
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-zinc-600 bg-zinc-800 text-lg font-medium text-zinc-400">
                  {member.photoURL ? (
                    <img
                      src={member.photoURL}
                      alt={member.displayName ?? ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (member.displayName ?? member.email ?? '?').charAt(0).toUpperCase()
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {member.displayName ?? member.email}
                  {isOwn && <span className="ml-1.5 text-xs font-normal text-zinc-500">(you)</span>}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {ROLE_LABELS[member.role] ?? member.role}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  {member.blurb ? member.blurb : 'N/A'}
                </p>
                {member.createdAt && (
                  <p className="mt-3 text-[11px] text-zinc-600">
                    Joined {formatDate(member.createdAt.toDate())}
                  </p>
                )}
                {isOwn && (
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(member.uid)}
                    disabled={deleting}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
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
