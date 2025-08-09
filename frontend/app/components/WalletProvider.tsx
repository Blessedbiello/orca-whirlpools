'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

// Simplified wallet interface for demo purposes
export interface Wallet {
  publicKey: PublicKey | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
}

interface WalletContextType {
  wallet: Wallet | null
  connection: Connection
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

// Mock wallet implementation for demo
class MockWallet implements Wallet {
  publicKey: PublicKey | null = null
  connected: boolean = false

  async connect(): Promise<void> {
    // Simulate wallet connection
    this.publicKey = new PublicKey('11111111111111111111111111111112') // Mock public key
    this.connected = true
  }

  disconnect(): void {
    this.publicKey = null
    this.connected = false
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected) {
      throw new Error('Wallet not connected')
    }
    // In a real app, this would prompt user to sign
    return transaction
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.connected) {
      throw new Error('Wallet not connected')
    }
    return transactions
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<MockWallet | null>(null)
  const [connection] = useState(() => new Connection('https://api.devnet.solana.com', 'confirmed'))

  useEffect(() => {
    setWallet(new MockWallet())
  }, [])

  return (
    <WalletContext.Provider value={{ wallet, connection }}>
      {children}
    </WalletContext.Provider>
  )
}