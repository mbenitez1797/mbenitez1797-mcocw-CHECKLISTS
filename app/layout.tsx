import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Housekeeping Forecast System',
  description: 'AGM Checklist Upload and Inventory Number Mapping System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
