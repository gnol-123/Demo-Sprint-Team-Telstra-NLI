import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignInPage from '@/app/(auth)/auth/signin/page'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}))

describe('SignInPage — invalid login', () => {
    it('shows an error toast when credentials are invalid', async () => {

        const signInWithEmail = vi.fn().mockRejectedValue(new Error('invalid credentials'))
    
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            signInWithEmail,
            signInWithGoogle: vi.fn(),
        } as any)

        render(<SignInPage />)

        fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
            target: { value: 'wrong@example.com' },
        })

        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'wrongpassword' },
        })

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid email or password')
        })
    })
})