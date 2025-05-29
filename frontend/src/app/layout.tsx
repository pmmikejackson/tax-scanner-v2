import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tax Scanner - Restaurant Sales Tax Lookup',
  description: 'Find accurate sales tax rates for restaurants by state, county, and city. Starting with Texas data.',
  keywords: 'sales tax, restaurant, Texas, tax lookup, tax rates',
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
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Tax Scanner
                  </h1>
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    v2.0
                  </span>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="#" className="text-gray-500 hover:text-gray-900">
                    About
                  </a>
                  <a href="#" className="text-gray-500 hover:text-gray-900">
                    API
                  </a>
                  <a href="#" className="text-gray-500 hover:text-gray-900">
                    Contact
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                © 2025 Tax Scanner. Built for restaurant owners and managers.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 