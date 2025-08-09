'use client'

import { useState } from 'react'
import { useWallet } from './WalletProvider'
import { Search, Plus, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface TokenInfo {
  mint: string
  symbol: string
  name: string
  hasTransferHook: boolean
  isApproved: boolean
  riskLevel?: 'low' | 'medium' | 'high'
}

const MOCK_TOKENS: TokenInfo[] = [
  {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    hasTransferHook: false,
    isApproved: true,
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    hasTransferHook: false,
    isApproved: true,
  },
  {
    mint: 'ROYALTY123abc456def789ghi012jkl345mno678pqr',
    symbol: 'ART',
    name: 'Art Token',
    hasTransferHook: true,
    isApproved: true,
    riskLevel: 'low',
  },
  {
    mint: 'COMPLIANCE456def789ghi012jkl345mno678pqr890st',
    symbol: 'COMP',
    name: 'Compliant Token',
    hasTransferHook: true,
    isApproved: true,
    riskLevel: 'medium',
  },
]

const FEE_TIERS = [
  { rate: 0.01, label: '0.01%', description: 'Very stable pairs' },
  { rate: 0.05, label: '0.05%', description: 'Stable pairs' },
  { rate: 0.3, label: '0.30%', description: 'Most pairs' },
  { rate: 1.0, label: '1.00%', description: 'Volatile pairs' },
]

export function PoolCreator() {
  const { wallet } = useWallet()
  const [formData, setFormData] = useState({
    tokenA: '',
    tokenB: '',
    feeTier: 0.3,
    priceRange: {
      lower: '',
      upper: '',
    },
    initialLiquidity: {
      amountA: '',
      amountB: '',
    },
  })
  const [tokenSearch, setTokenSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const filteredTokens = MOCK_TOKENS.filter(token =>
    token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    token.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
  )

  const selectedTokenA = MOCK_TOKENS.find(t => t.mint === formData.tokenA)
  const selectedTokenB = MOCK_TOKENS.find(t => t.mint === formData.tokenB)
  const hasTransferHookToken = selectedTokenA?.hasTransferHook || selectedTokenB?.hasTransferHook

  const handleTokenSelect = (mint: string, position: 'A' | 'B') => {
    setFormData(prev => ({
      ...prev,
      [`token${position}`]: mint
    }))
  }

  const handleCreatePool = async () => {
    if (!wallet?.connected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.tokenA || !formData.tokenB) {
      toast.error('Please select both tokens')
      return
    }

    if (formData.tokenA === formData.tokenB) {
      toast.error('Cannot create pool with the same token')
      return
    }

    setIsCreating(true)

    try {
      toast.loading('Creating liquidity pool...', { id: 'create-pool' })

      // In a real implementation, this would:
      // 1. Check if tokens have required TokenBadge approvals
      // 2. Create the Whirlpool with appropriate fee tier
      // 3. Add initial liquidity
      // 4. Handle Transfer Hook accounts in remaining_accounts

      await new Promise(resolve => setTimeout(resolve, 4000))

      const poolAddress = 'Pool' + Math.random().toString(36).substr(2, 9)

      toast.success(
        `Pool created successfully! Address: ${poolAddress}`,
        { id: 'create-pool', duration: 6000 }
      )

      // Reset form
      setFormData({
        tokenA: '',
        tokenB: '',
        feeTier: 0.3,
        priceRange: { lower: '', upper: '' },
        initialLiquidity: { amountA: '', amountB: '' },
      })

    } catch (error) {
      toast.error('Failed to create pool', { id: 'create-pool' })
      console.error('Pool creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Token Selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Token Pair</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token A */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Token A *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tokens..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredTokens.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => handleTokenSelect(token.mint, 'A')}
                  className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 flex items-center justify-between ${
                    formData.tokenA === token.mint ? 'bg-primary-50' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {token.hasTransferHook && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        token.isApproved 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Hook {token.isApproved ? '✓' : '⏳'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Token B */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Token B *
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredTokens.filter(t => t.mint !== formData.tokenA).map((token) => (
                <button
                  key={token.mint}
                  onClick={() => handleTokenSelect(token.mint, 'B')}
                  className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 flex items-center justify-between ${
                    formData.tokenB === token.mint ? 'bg-primary-50' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {token.hasTransferHook && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        token.isApproved 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Hook {token.isApproved ? '✓' : '⏳'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Hook Warning */}
      {hasTransferHookToken && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Transfer Hook Detected</p>
              <p>
                One or more selected tokens have Transfer Hooks. Make sure they are approved 
                in the registry and you understand their behavior before creating the pool.
              </p>
              <div className="mt-2 space-y-1">
                {selectedTokenA?.hasTransferHook && (
                  <div className="text-xs">
                    • {selectedTokenA.symbol}: {selectedTokenA.isApproved ? '✅ Approved' : '⏳ Pending approval'}
                  </div>
                )}
                {selectedTokenB?.hasTransferHook && (
                  <div className="text-xs">
                    • {selectedTokenB.symbol}: {selectedTokenB.isApproved ? '✅ Approved' : '⏳ Pending approval'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee Tier Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Fee Tier
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEE_TIERS.map((tier) => (
            <button
              key={tier.rate}
              onClick={() => setFormData(prev => ({ ...prev, feeTier: tier.rate }))}
              className={`p-3 rounded-lg border text-center transition-all ${
                formData.feeTier === tier.rate
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{tier.label}</div>
              <div className="text-xs text-gray-500 mt-1">{tier.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range (Simplified) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Price Range (Optional)
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lower Price
            </label>
            <input
              type="number"
              placeholder="Auto"
              value={formData.priceRange.lower}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, lower: e.target.value }
              }))}
              className="input-field"
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upper Price
            </label>
            <input
              type="number"
              placeholder="Auto"
              value={formData.priceRange.upper}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, upper: e.target.value }
              }))}
              className="input-field"
              step="any"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Leave empty for full range liquidity. Concentrated liquidity allows for better capital efficiency.
        </p>
      </div>

      {/* Initial Liquidity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Initial Liquidity</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedTokenA?.symbol || 'Token A'} Amount
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={formData.initialLiquidity.amountA}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                initialLiquidity: { ...prev.initialLiquidity, amountA: e.target.value }
              }))}
              className="input-field"
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedTokenB?.symbol || 'Token B'} Amount
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={formData.initialLiquidity.amountB}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                initialLiquidity: { ...prev.initialLiquidity, amountB: e.target.value }
              }))}
              className="input-field"
              step="any"
            />
          </div>
        </div>
      </div>

      {/* Create Pool Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreatePool}
          disabled={
            isCreating || 
            !wallet?.connected || 
            !formData.tokenA || 
            !formData.tokenB ||
            formData.tokenA === formData.tokenB
          }
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Creating Pool...' : 'Create Pool'}</span>
        </button>
      </div>
    </div>
  )
}