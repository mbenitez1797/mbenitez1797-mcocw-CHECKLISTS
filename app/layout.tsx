import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { InventoryProvider } from '@/contexts/inventory-context'
import { InventoryBar } from '@/components/inventory-bar'
import { SidebarNav } from '@/components/sidebar-nav'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Front Desk Daily Checklist',
  description: 'Daily checklists for AM, PM, and Night Audit front desk associates to manage arrivals, departures, room inventory, guest issues, and shift handoffs.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <InventoryProvider>
          <InventoryBar />
          <div className="flex">
            <SidebarNav />
            <main className="flex-1 min-h-[calc(100vh-88px)]">
              {children}
            </main>
          </div>
        </InventoryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}






