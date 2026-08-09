'use server'

import { requireAuth } from '@/actions/auth.actions'
import { adminDb } from '@/lib/firebase/admin'
import { registerTeamMember } from '@/lib/validations/team'
import type { ActionResult } from '@/types'

export async function registerTeamMemberAction(data: FormData): Promise<ActionResult> {
    const session = await requireAuth()

    const displayName = data.get('displayName')
    const email = data.get('email')
    const role = data.get('role')
    const blurb = data.get('blurb')
    const photoURL = data.get('photoURL')

    const parsedData = registerTeamMember.safeParse({
        displayName,
        email,
        role,
        blurb,
        photoURL: photoURL || undefined,
    })

    if (!parsedData.success) {
        return {
            success: false,
            error: 'Failed to register team member. Please check your input and try again.',
        }
    }

    try {
        await adminDb.collection('team_members').doc(session.uid).set({
            uid: session.uid,
            displayName: parsedData.data.displayName,
            photoURL: parsedData.data.photoURL || null,
            email: parsedData.data.email,
            role: parsedData.data.role,
            blurb: parsedData.data.blurb ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
            _schemaVersion: 1,
        })

        return {
            success: true,
        }
    } catch (error) {
        console.error('Error registering team member:', error)
        return {
            success: false,
            error: 'Failed to register team member. Please try again.',
        }
    }
}
