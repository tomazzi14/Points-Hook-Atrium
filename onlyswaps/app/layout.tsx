import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'

import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'OnlySwaps - Swap & Earn',
  description: 'Trade on Uniswap v4. Earn loyalty points. Exclusive rewards for your network.',
}

export const viewport: Viewport = {
  themeColor: '#00AFF0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <Providers>{children}</Providers>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-card text-card-foreground border-border',
            },
          }}
        />
      </body>
    </html>
  )
}