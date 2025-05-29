import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import VersionInfo from '@/components/VersionInfo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tax Scanner v2 - Restaurant Sales Tax Lookup',
  description: 'Get accurate sales tax rates for your restaurant by state, county, and city. Currently supporting Texas with official government data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Tax Scanner v2
              </h1>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>
                    Data sourced from the Texas Comptroller's office. 
                    Tax rates are updated quarterly and should be verified for compliance.
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  © 2025 Tax Scanner v2
                </div>
              </div>
            </div>
          </footer>
        </div>
        <VersionInfo />
      </body>
    </html>
  )
} 