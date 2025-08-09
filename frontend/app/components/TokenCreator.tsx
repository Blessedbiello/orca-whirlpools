'use client'

import { useState } from 'react'
import { useWallet } from './WalletProvider'
import { Plus, Info, Code, FileText, Shield, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface TransferHookTemplate {
  id: string
  name: string
  description: string
  features: string[]
  riskLevel: 'low' | 'medium' | 'high'
  programId?: string
}

const TRANSFER_HOOK_TEMPLATES: TransferHookTemplate[] = [
  {
    id: 'royalty',
    name: 'Royalty Collection',
    description: 'Automatically collect royalties on token transfers',
    features: ['Creator royalties', 'Marketplace support', 'Configurable rates'],
    riskLevel: 'low',
  },
  {
    id: 'compliance',
    name: 'KYC/AML Compliance',
    description: 'Ensure transfers comply with regulatory requirements',
    features: ['Whitelist validation', 'Geographic restrictions', 'Identity verification'],
    riskLevel: 'medium',
  },
  {
    id: 'logging',
    name: 'Transfer Logging',
    description: 'Log all transfer events for analytics and compliance',
    features: ['Event logging', 'Analytics tracking', 'Audit trails'],
    riskLevel: 'low',
  },
  {
    id: 'custom',
    name: 'Custom Hook',
    description: 'Deploy your own Transfer Hook program',
    features: ['Custom logic', 'Full control', 'Advanced features'],
    riskLevel: 'high',
  },
]

export function TokenCreator() {
  const { wallet } = useWallet()
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    description: '',
    supply: '',
    transferHook: '',
    customProgramId: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateToken = async () => {
    if (!wallet?.connected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.name || !formData.symbol || !formData.supply) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsCreating(true)

    try {
      // In a real implementation, this would:
      // 1. Create the Token-2022 mint with Transfer Hook extension
      // 2. Submit the hook to the registry for approval
      // 3. Create initial token supply
      
      toast.loading('Creating Token-2022 with Transfer Hook...', { id: 'create-token' })
      
      // Simulate token creation process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockMintAddress = 'TokenMint' + Math.random().toString(36).substr(2, 9)
      
      toast.success(
        `Token created successfully! Mint: ${mockMintAddress}`,
        { id: 'create-token', duration: 6000 }
      )

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        decimals: 9,
        description: '',
        supply: '',
        transferHook: '',
        customProgramId: '',
      })

    } catch (error) {
      toast.error('Failed to create token', { id: 'create-token' })
      console.error('Token creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const selectedTemplate = TRANSFER_HOOK_TEMPLATES.find(t => t.id === formData.transferHook)

  return (
    <div className="space-y-8">
      {/* Token Metadata */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Token Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., My Token"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder="e.g., MTK"
              className="input-field"
              maxLength={8}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimals
            </label>
            <select
              name="decimals"
              value={formData.decimals}
              onChange={handleInputChange}
              className="input-field"
            >
              {[0, 2, 6, 8, 9].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Supply *
            </label>
            <input
              type="number"
              name="supply"
              value={formData.supply}
              onChange={handleInputChange}
              placeholder="e.g., 1000000"
              className="input-field"
              min="0"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your token and its use case..."
            rows={3}
            className="input-field"
          />
        </div>
      </div>

      {/* Transfer Hook Selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Transfer Hook
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What are Transfer Hooks?</p>
              <p>
                Transfer Hooks allow you to run custom logic every time your token is transferred.
                This enables features like royalties, compliance checks, or custom business logic.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRANSFER_HOOK_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                formData.transferHook === template.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleInputChange({
                target: { name: 'transferHook', value: template.id }
              } as any)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  template.riskLevel === 'low' 
                    ? 'bg-green-100 text-green-800'
                    : template.riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {template.riskLevel === 'low' && <Shield className="w-3 h-3 mr-1" />}
                  {template.riskLevel === 'medium' && <Info className="w-3 h-3 mr-1" />}
                  {template.riskLevel === 'high' && <Zap className="w-3 h-3 mr-1" />}
                  {template.riskLevel}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="space-y-1">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-500">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {formData.transferHook === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Program ID
            </label>
            <input
              type="text"
              name="customProgramId"
              value={formData.customProgramId}
              onChange={handleInputChange}
              placeholder="Enter your Transfer Hook program ID"
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Make sure your Transfer Hook program is deployed and registered in our registry.
            </p>
          </div>
        )}
      </div>

      {/* Creation Summary */}
      {selectedTemplate && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Creation Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span className="font-medium">{formData.name || 'Unnamed'} ({formData.symbol || 'TBD'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supply:</span>
              <span className="font-medium">{formData.supply || 'TBD'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transfer Hook:</span>
              <span className="font-medium">{selectedTemplate.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`font-medium ${
                selectedTemplate.riskLevel === 'low' ? 'text-green-600' :
                selectedTemplate.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {selectedTemplate.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreateToken}
          disabled={isCreating || !wallet?.connected || !formData.name || !formData.symbol || !formData.supply || !formData.transferHook}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Creating Token...' : 'Create Token'}</span>
        </button>
      </div>
    </div>
  )
}