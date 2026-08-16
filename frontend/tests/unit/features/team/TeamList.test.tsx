import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TeamList } from '@/features/team/TeamList'
import { useCollection } from '@/hooks/useFirestore'
import { useAuth } from '@/hooks/useAuth'
import { deleteTeamMemberAction } from '@/features/team/actions'

vi.mock('@/hooks/useFirestore', () => ({
    useCollection: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

vi.mock('@/features/team/actions', () => ({
    deleteTeamMemberAction: vi.fn(),
}))

vi.mock('@/lib/firebase/firestore', () => ({
    getTeamMembersCollection: vi.fn(() => ({})),
}))

const mockMembers = [
    {
    uid: 'user-1',
    displayName: 'Remi',
    email: 'Remi@example.com',
    role: 'DEV',
    blurb: 'Remielle Dan <3',
    photoURL: null,
    createdAt: { toDate: () => new Date('2026-01-01') },
    },
    {
    uid: 'user-2',
    displayName: 'Yeva',
    email: 'Yeva@example.com',
    role: 'BA',
    blurb: null,
    photoURL: null,
    createdAt: { toDate: () => new Date('2026-01-02') },
    },
]

describe('TeamList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows a loading spinner while data is loading', () => {
        vi.mocked(useCollection).mockReturnValue({ data: [], loading: true, error: null } as any)
        vi.mocked(useAuth).mockReturnValue({ user: null } as any)

        render(<TeamList />)

        expect(screen.queryByText('No team members yet')).not.toBeInTheDocument()
    })

    it('shows an error message when fetching fails', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: [],
            loading: false,
            error: new Error('fetch failed'),
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: null } as any)

        render(<TeamList />)

        expect(screen.getByText('Error fetching team members.')).toBeInTheDocument()
    })

    it('shows an empty state when there are no members', () => {
        vi.mocked(useCollection).mockReturnValue({ data: [], loading: false, error: null } as any)
        vi.mocked(useAuth).mockReturnValue({ user: null } as any)

        render(<TeamList />)

        expect(screen.getByText('No team members yet')).toBeInTheDocument()
        expect(screen.getByText('Be the first to join the team.')).toBeInTheDocument()
    })

    it('renders a card for each member with name and role', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
        } as any)
    vi.mocked(useAuth).mockReturnValue({ user: { uid: 'someone-else' } } as any)

        render(<TeamList />)

        expect(screen.getByText('Remi')).toBeInTheDocument()
        expect(screen.getByText('Developer')).toBeInTheDocument()
        expect(screen.getByText('Yeva')).toBeInTheDocument()
        expect(screen.getByText('Business Analyst')).toBeInTheDocument()
    })

    it('renders blurb only when present', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
            } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'someone-else' } } as any)

        render(<TeamList />)

        expect(screen.getByText('Remielle Dan <3')).toBeInTheDocument()
    })

    it('marks the current user\'s own card with "(you)"', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user-1' } } as any)

        render(<TeamList />)

        expect(screen.getByText('(you)')).toBeInTheDocument()
    })

    it('only shows the leave-team button on the current user\'s own card', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user-1' } } as any)

        render(<TeamList />)

        const leaveButtons = screen.getAllByLabelText('Leave team')
        expect(leaveButtons).toHaveLength(1)
    })

    it('shows a confirmation prompt when the leave-team button is clicked', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user-1' } } as any)

        render(<TeamList />)

        fireEvent.click(screen.getByLabelText('Leave team'))

        expect(screen.getByText('Leave the team?')).toBeInTheDocument()
        expect(
            screen.getByText('This will remove your member profile. You can rejoin later.')
        ).toBeInTheDocument()
    })

    it('cancels the leave-team confirmation without calling the delete action', () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user-1' } } as any)

        render(<TeamList />)

        fireEvent.click(screen.getByLabelText('Leave team'))
        fireEvent.click(screen.getByText('Cancel'))

        expect(screen.queryByText('Leave the team?')).not.toBeInTheDocument()
        expect(deleteTeamMemberAction).not.toHaveBeenCalled()
    })

    it('calls deleteTeamMemberAction when Remove is confirmed', async () => {
        vi.mocked(useCollection).mockReturnValue({
            data: mockMembers,
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user-1' } } as any)
        vi.mocked(deleteTeamMemberAction).mockResolvedValue({ success: true })

        render(<TeamList />)

        fireEvent.click(screen.getByLabelText('Leave team'))
        fireEvent.click(screen.getByText('Remove'))

        await waitFor(() => {
        expect(deleteTeamMemberAction).toHaveBeenCalledOnce()
        })
    })

    it('shows initial when photo URL is missing', () => {
        const memberNoPhoto = { ...mockMembers[0], photoURL: null }
        vi.mocked(useCollection).mockReturnValue({
            data: [memberNoPhoto],
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'someone-else' } } as any)

        render(<TeamList />)

        expect(screen.getByText('R')).toBeInTheDocument()
    })

    it('shortens a very long blurb and reveals it using "read more"', () => {
        const memberLongBlurb = { ...mockMembers[0], blurb: 'A'.repeat(500) }
        vi.mocked(useCollection).mockReturnValue({
            data: [memberLongBlurb],
            loading: false,
            error: null,
        } as any)
        vi.mocked(useAuth).mockReturnValue({ user: { uid: 'someone-else' } } as any)

        render(<TeamList />)

        expect(screen.getByText('read more')).toBeInTheDocument()

        fireEvent.click(screen.getByText('read more'))
        expect(screen.getByText('A'.repeat(500))).toBeInTheDocument()
    })
})