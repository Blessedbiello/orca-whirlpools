// Mock wallet implementation for demo purposes
// In production, this would use @solana/wallet-adapter-react

import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export interface MockWallet {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: Transaction): Promise<Transaction>;
  signAllTransactions?(transactions: Transaction[]): Promise<Transaction[]>;
}

class MockWalletImpl implements MockWallet {
  connected = false;
  connecting = false;
  publicKey: PublicKey | null = null;

  async connect(): Promise<void> {
    this.connecting = true;
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use a deterministic test key for demo
    this.publicKey = new PublicKey('7BgBvyjrZX1YKz4ohtF5AJ5CrrhVBaNZhtsbeHCuFWLs');
    this.connected = true;
    this.connecting = false;
    
    console.log('Mock wallet connected:', this.publicKey.toString());
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.publicKey = null;
    console.log('Mock wallet disconnected');
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected || !this.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    console.log('Mock signing transaction...');
    
    // In a real implementation, this would prompt the user
    // For demo, we'll just return the transaction as-is
    // Note: This won't actually work for real transactions without proper signing
    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    return Promise.all(transactions.map(tx => this.signTransaction(tx)));
  }
}

// Global mock wallet instance
export const mockWallet = new MockWalletImpl();

// Mock connection for demo (devnet)
export const mockConnection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const useWallet = () => {
  return {
    wallet: mockWallet,
    connect: () => mockWallet.connect(),
    disconnect: () => mockWallet.disconnect(),
  };
};