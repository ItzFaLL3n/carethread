import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareThread – Hospital Patient Records',
  description:
    'Secure, role-based hospital patient-records system for doctors, nurses, receptionists and patients.',
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
