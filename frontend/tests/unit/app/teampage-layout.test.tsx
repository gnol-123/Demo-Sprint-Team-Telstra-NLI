import { describe, it, expect, vi, beforeEach } from 'vitest'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'
import TeampageLayout from '@/app/(teampage)/layout'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/actions/auth.actions', () => ({ getServerSession: vi.fn() }))

describe('TeampageLayout — auth guard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('redirects to /auth/signin when there is no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await TeampageLayout({ children: <div>content</div> })

    expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })

    it('renders children when a session exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ uid: 'user-1' } as any)

    const result = await TeampageLayout({ children: <div>content</div> })

    expect(redirect).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
    })
})