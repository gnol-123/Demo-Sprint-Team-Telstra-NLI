'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { registerTeamMember, type RegisterTeamMemberInput } from '@/lib/validations/team'
import { uploadTeamPhoto } from '@/lib/firebase/storage'
import { registerTeamMemberAction } from './actions'

const ROLE_LABELS: Record<string, string> = {
  PM: 'Project Manager',
  DEV: 'Developer',
  QA: 'QA Engineer',
  UX: 'UX Designer',
  BA: 'Business Analyst',
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

interface RegisterTeamMemberFormProps {
  onSuccess?: () => void
}

export function RegisterTeamMemberForm({ onSuccess }: RegisterTeamMemberFormProps) {
  const router = useRouter()
  const { profile, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Photo must be under 2MB')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const removePhoto = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [photoPreview])

  const onSubmit = async (data: RegisterTeamMemberInput) => {
    if (!user) return

    let photoURL: string | undefined

    if (photoFile) {
      setUploading(true)
      try {
        photoURL = await uploadTeamPhoto(user.uid, photoFile)
      } catch {
        toast.error('Failed to upload photo')
        setUploading(false)
        return
      }
    }

    const formData = new FormData()
    formData.append('displayName', data.displayName)
    formData.append('email', data.email)
    formData.append('role', data.role)
    if (data.blurb) formData.append('blurb', data.blurb)
    if (photoURL) formData.append('photoURL', photoURL)

    const result = await registerTeamMemberAction(formData)

    setUploading(false)

    if (result.success) {
      toast.success("You've joined the team!")
      onSuccess?.()
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to join team')
    }
  }

  const isBusy = isSubmitting || uploading

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Join the Team</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Add yourself as a team member. You can only join once.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Photo <span className="text-zinc-400">(optional)</span>
          </label>

          {photoPreview ? (
            <div className="relative inline-block">
              <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-white hover:bg-zinc-900"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragging
                  ? 'border-zinc-400 bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-800'
                  : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              <Upload className="mb-2 h-5 w-5 text-zinc-400" />
              <p className="text-sm text-zinc-500">Drag & drop a photo, or click to browse</p>
              <p className="mt-1 text-xs text-zinc-400">PNG, JPG up to 2MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

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
          disabled={isBusy}
          className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isBusy ? 'Joining...' : 'Join Team'}
        </button>
      </form>
    </div>
  )
}
