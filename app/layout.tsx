import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { AuthGuard } from "@/components/auth-guard"

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Canteen',
  description: 'AI Builders Hackathon — Premium Ordering System',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen selection:bg-orange-500/30 bg-[#080808]`}>


        <AuthGuard>
          <main className="relative">
            {children}
          </main>
        </AuthGuard>

        <Toaster
          richColors
          theme="dark"
          position="bottom-left"
          closeButton

          toastOptions={{
            style: {
              background: 'rgba(20, 20, 20, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}