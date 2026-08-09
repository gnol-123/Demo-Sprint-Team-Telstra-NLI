'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { registerTeamMember, type RegisterTeamMemberInput } from '@/lib/validations/team'
import { registerTeamMemberAction } from './actions'

const ROLE_LABELS: Record<string, string> = {
  PM: 'Project Manager',
  DEV: 'Developer',
  QA: 'QA Engineer',
  UX: 'UX Designer',
  BA: 'Business Analyst',
}

export function RegisterTeamMemberForm() {
  const router = useRouter()
  const { profile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterTeamMemberInput>({
    resolver: zodResolver(registerTeamMember),
    defaultValues: {
      displayName: profile?.displayName ?? '',
      email: profile?.email ?? '',
    },
  })

  const onSubmit = async (data: RegisterTeamMemberInput) => {
    const formData = new FormData()
    formData.append('displayName', data.displayName)
    formData.append('email', data.email)
    formData.append('role', data.role)
    if (data.blurb) formData.append('blurb', data.blurb)

    const result = await registerTeamMemberAction(formData)

    if (result.success) {
      toast.success("You've joined the team!")
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to join team')
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Join the Team</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Add yourself as a team member. You can only join once.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="displayName" className="text-sm font-medium">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? 'displayName-error' : undefined}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Your full name"
            {...register('displayName')}
          />
          {errors.displayName && (
            <p id="displayName-error" className="text-xs text-red-500" role="alert">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 shadow-sm disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            aria-invalid={!!errors.role}
            aria-describedby={errors.role ? 'role-error' : undefined}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
            {...register('role')}
          >
            <option value="">Select a role...</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p id="role-error" className="text-xs text-red-500" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="blurb" className="text-sm font-medium">
            Short Bio <span className="text-zinc-400">(optional)</span>
          </label>
          <textarea
            id="blurb"
            rows={3}
            aria-invalid={!!errors.blurb}
            aria-describedby={errors.blurb ? 'blurb-error' : undefined}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="A few words about yourself..."
            {...register('blurb')}
          />
          {errors.blurb && (
            <p id="blurb-error" className="text-xs text-red-500" role="alert">
              {errors.blurb.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Joining...' : 'Join Team'}
        </button>
      </form>
    </div>
  )
}
