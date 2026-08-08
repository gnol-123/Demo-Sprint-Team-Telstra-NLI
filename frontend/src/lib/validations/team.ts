import { z } from 'zod'

export const registerTeamMember = z
  .object({

    uid: z
      .string()
      .min(2, 'UID must be at least 2 characters')
      .max(50, 'UID must be less than 50 characters'),
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    photoURL: z.string().url('Please enter a valid URL').optional(),
    role: z.enum(['PM', 'DEV', 'QA', 'UX', 'BA'], {
      errorMap: () => ({ message: 'Role must be one of PM, DEV, QA, UX, or BA' }),
    }),
    blurb: z.string().max(200, 'Blurb must be less than 200 characters').optional(),
  })

export type RegisterTeamMemberInput = z.infer<typeof registerTeamMember>
