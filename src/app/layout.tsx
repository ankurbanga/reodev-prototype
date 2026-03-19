import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reo.Dev — Developer-Led Growth Platform',
  description: 'Identify and convert developer signals into pipeline',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
