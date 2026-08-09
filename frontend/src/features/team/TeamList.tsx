'use client'

import { Users } from 'lucide-react'
import { useCollection } from '@/hooks/useFirestore'
import { getTeamMembersCollection } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { FullPageSpinner } from '@/components/shared/LoadingSpinner'
import { where } from 'firebase/firestore'

const ROLE_LABELS: Record<string, string> = {
  PM: 'Project Manager',
  DEV: 'Developer',
  QA: 'QA Engineer',
  UX: 'UX Designer',
  BA: 'Business Analyst',
}

export function TeamList() {
  const {
    data: members,
    loading,
    error,
  } = useCollection(getTeamMembersCollection(), where('_schemaVersion', '==', 1))
  const { user } = useAuth()

  if (loading) return <FullPageSpinner />

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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {members.map((member) => (
        <div
          key={member.uid}
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
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
                {member.uid === user?.uid && (
                  <span className="ml-1.5 text-xs font-normal text-zinc-400">(you)</span>
                )}
              </p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">
                {ROLE_LABELS[member.role] ?? member.role}
              </p>
              {member.blurb && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{member.blurb}</p>
              )}
              {member.createdAt && (
                <p className="mt-2 text-xs text-zinc-400">
                  Joined {formatDate(member.createdAt.toDate())}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
