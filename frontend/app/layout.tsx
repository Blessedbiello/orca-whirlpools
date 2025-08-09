import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from './components/WalletProvider'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Transfer Hook Trading - Orca Whirlpools',
  description: 'Create and trade Token-2022 assets with Transfer Hooks on Orca Whirlpools',
  keywords: ['Solana', 'DeFi', 'AMM', 'Token-2022', 'Transfer Hooks', 'Orca'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}