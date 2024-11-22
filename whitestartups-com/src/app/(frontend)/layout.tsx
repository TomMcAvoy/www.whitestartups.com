import type { Metadata } from 'next'
import { cn } from 'src/utilities/cn'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Navbar from '@components/Navbar'
import CircularGraphic from '@components/CircularGraphic'
import './globals.css'
import ClientWrapper from '@/components/ClientWrapper' // Import the client wrapper component

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialStars = 100
  const initialShootingStars = 10

  return (
    <html lang="en">
      <body className={cn(GeistMono.variable, GeistSans.variable)}>
        <Providers>
          <InitTheme />
          <Header />
          <main>
            <Navbar />
            <ClientWrapper initialStars={initialStars} initialShootingStars={initialShootingStars}>
              {children}
            </ClientWrapper>
          </main>
          <Footer />
          <LivePreviewListener />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://payloadcms.com'),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
