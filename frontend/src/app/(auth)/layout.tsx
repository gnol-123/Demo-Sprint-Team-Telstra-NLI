import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // dot background
    <div
      className="flex min-h-screen items-center justify-center bg-black px-4"
      style={{
        backgroundImage: 'radial-gradient(rgba(41, 35, 124, 0.47) 1px, transparent 2px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
