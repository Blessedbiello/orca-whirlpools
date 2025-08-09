'use client'

import { useState, useEffect } from 'react'
import { useWallet } from './WalletProvider'
import { ArrowDownUp, RefreshCw, TrendingUp, AlertCircle, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Pool {
  id: string
  tokenA: { symbol: string; mint: string; hasTransferHook: boolean }
  tokenB: { symbol: string; mint: string; hasTransferHook: boolean }
  tvl: number
  volume24h: number
  fee: number
  price: number
}

const MOCK_POOLS: Pool[] = [
  {
    id: 'sol-usdc',
    tokenA: { symbol: 'SOL', mint: 'So11...112', hasTransferHook: false },
    tokenB: { symbol: 'USDC', mint: 'EPj...t1v', hasTransferHook: false },
    tvl: 1250000,
    volume24h: 340000,
    fee: 0.3,
    price: 94.25,
  },
  {
    id: 'art-sol',
    tokenA: { symbol: 'ART', mint: 'ROY...pqr', hasTransferHook: true },
    tokenB: { symbol: 'SOL', mint: 'So11...112', hasTransferHook: false },
    tvl: 85000,
    volume24h: 12000,
    fee: 0.3,
    price: 0.0532,
  },
  {
    id: 'comp-usdc',
    tokenA: { symbol: 'COMP', mint: 'COM...st', hasTransferHook: true },
    tokenB: { symbol: 'USDC', mint: 'EPj...t1v', hasTransferHook: false },
    tvl: 145000,
    volume24h: 8500,
    fee: 1.0,
    price: 12.87,
  },
]

export function TradingInterface() {
  const { wallet } = useWallet()
  const [selectedPool, setSelectedPool] = useState<Pool>(MOCK_POOLS[0])
  const [swapData, setSwapData] = useState({
    fromAmount: '',
    toAmount: '',
    fromToken: selectedPool.tokenA,
    toToken: selectedPool.tokenB,
    slippage: 0.5,
  })
  const [isSwapping, setIsSwapping] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)

  // Update swap data when pool changes
  useEffect(() => {
    setSwapData(prev => ({
      ...prev,
      fromToken: selectedPool.tokenA,
      toToken: selectedPool.tokenB,
      fromAmount: '',
      toAmount: '',
    }))
  }, [selectedPool])

  // Calculate output amount and price impact
  useEffect(() => {
    if (swapData.fromAmount && parseFloat(swapData.fromAmount) > 0) {
      const fromAmount = parseFloat(swapData.fromAmount)
      const outputAmount = fromAmount * selectedPool.price * (1 - selectedPool.fee / 100)
      const impact = Math.min((fromAmount / (selectedPool.tvl * 0.1)) * 100, 15) // Simplified calculation
      
      setSwapData(prev => ({
        ...prev,
        toAmount: outputAmount.toFixed(6)
      }))
      setPriceImpact(impact)
    } else {
      setSwapData(prev => ({ ...prev, toAmount: '' }))
      setPriceImpact(0)
    }
  }, [swapData.fromAmount, selectedPool])

  const handleFlipTokens = () => {
    setSwapData(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }))
    setPriceImpact(0)
  }

  const handleSwap = async () => {
    if (!wallet?.connected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!swapData.fromAmount || parseFloat(swapData.fromAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsSwapping(true)

    try {
      toast.loading('Preparing swap transaction...', { id: 'swap' })

      // In a real implementation, this would:
      // 1. Build swap transaction with Transfer Hook accounts
      // 2. Calculate precise slippage and price impact
      // 3. Execute swap through Orca Whirlpools
      // 4. Handle Transfer Hook execution

      await new Promise(resolve => setTimeout(resolve, 3000))

      const hasHook = swapData.fromToken.hasTransferHook || swapData.toToken.hasTransferHook
      
      toast.success(
        `Swap completed! ${swapData.fromAmount} ${swapData.fromToken.symbol} → ${swapData.toAmount} ${swapData.toToken.symbol}${hasHook ? ' (Transfer Hooks executed)' : ''}`,
        { id: 'swap', duration: 6000 }
      )

      // Reset form
      setSwapData(prev => ({
        ...prev,
        fromAmount: '',
        toAmount: '',
      }))

    } catch (error) {
      toast.error('Swap failed', { id: 'swap' })
      console.error('Swap error:', error)
    } finally {
      setIsSwapping(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: amount > 1000000 ? 'compact' : 'standard',
    }).format(amount)
  }

  const hasTransferHook = swapData.fromToken.hasTransferHook || swapData.toToken.hasTransferHook

  return (
    <div className="space-y-8">
      {/* Pool Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Pool</h3>
        
        <div className="grid gap-4">
          {MOCK_POOLS.map((pool) => (
            <button
              key={pool.id}
              onClick={() => setSelectedPool(pool)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedPool.id === pool.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{pool.tokenA.symbol}</span>
                    <span className="text-gray-400">/</span>
                    <span className="font-semibold">{pool.tokenB.symbol}</span>
                  </div>
                  
                  {(pool.tokenA.hasTransferHook || pool.tokenB.hasTransferHook) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Transfer Hook
                    </span>
                  )}
                  
                  <span className="text-sm text-gray-500">{pool.fee}% fee</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="text-right">
                    <div className="font-medium">TVL</div>
                    <div>{formatCurrency(pool.tvl)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">24h Volume</div>
                    <div>{formatCurrency(pool.volume24h)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Price</div>
                    <div>${pool.price.toFixed(4)}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Swap Interface */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Swap Tokens</h3>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">From</label>
              <div className="text-sm text-gray-500">
                Balance: 1,234.56 {swapData.fromToken.symbol}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="0.0"
                value={swapData.fromAmount}
                onChange={(e) => setSwapData(prev => ({ ...prev, fromAmount: e.target.value }))}
                className="flex-1 text-2xl font-semibold bg-transparent border-none outline-none"
                step="any"
              />
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <span className="font-semibold">{swapData.fromToken.symbol}</span>
                {swapData.fromToken.hasTransferHook && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center">
            <button
              onClick={handleFlipTokens}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowDownUp className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">To</label>
              <div className="text-sm text-gray-500">
                Balance: 567.89 {swapData.toToken.symbol}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="0.0"
                value={swapData.toAmount}
                readOnly
                className="flex-1 text-2xl font-semibold bg-transparent border-none outline-none text-gray-600"
              />
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <span className="font-semibold">{swapData.toToken.symbol}</span>
                {swapData.toToken.hasTransferHook && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {swapData.fromAmount && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rate</span>
                <span className="font-medium">
                  1 {swapData.fromToken.symbol} = {selectedPool.price.toFixed(6)} {swapData.toToken.symbol}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price Impact</span>
                <span className={`font-medium ${
                  priceImpact > 5 ? 'text-red-600' : priceImpact > 2 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trading Fee</span>
                <span className="font-medium">{selectedPool.fee}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Slippage Tolerance</span>
                <span className="font-medium">{swapData.slippage}%</span>
              </div>
            </div>
          )}

          {/* Transfer Hook Warning */}
          {hasTransferHook && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Transfer Hook Active</p>
                  <p>
                    This swap involves tokens with Transfer Hooks. Additional logic will be executed during the transfer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={
              isSwapping || 
              !wallet?.connected || 
              !swapData.fromAmount ||
              parseFloat(swapData.fromAmount) <= 0
            }
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwapping ? 'Swapping...' : !wallet?.connected ? 'Connect Wallet' : 'Swap'}
          </button>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Total Value Locked</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(selectedPool.tvl)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">24h Volume</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(selectedPool.volume24h)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Fee Tier</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {selectedPool.fee}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <ArrowDownUp className="w-4 h-4" />
            <span className="text-sm font-medium">Current Price</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${selectedPool.price.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  )
}