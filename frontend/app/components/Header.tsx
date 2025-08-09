'use client'

import { useState } from 'react'
import { useWallet } from './WalletProvider'
import { Wallet, Settings, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export function Header() {
  const { wallet } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!wallet) return

    try {
      setIsConnecting(true)
      await wallet.connect()
      toast.success('Wallet connected successfully!')
    } catch (error) {
      toast.error('Failed to connect wallet')
      console.error('Wallet connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    if (!wallet) return
    
    wallet.disconnect()
    toast.success('Wallet disconnected')
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Transfer Hook Trading
              </h1>
              <p className="text-sm text-gray-600">Powered by Orca Whirlpools</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="https://docs.orca.so/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>Docs</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/orca-so/whirlpools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Devnet</span>
            </div>

            {wallet?.connected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-primary-50 px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">
                    {wallet.publicKey ? formatAddress(wallet.publicKey.toBase58()) : 'Unknown'}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !wallet}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}