'use client'

import { ArrowRight, Zap, Shield, Coins } from 'lucide-react'

export function Hero() {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold gradient-text">
          Trade Token-2022 with Transfer Hooks
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The first comprehensive solution for creating, managing, and trading Token-2022 assets
          with Transfer Hooks on Orca Whirlpools. Safe, secure, and scalable.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center min-w-48 card-hover">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Coins className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Token Creation</h3>
          <p className="text-sm text-gray-600">Create Token-2022 with custom Transfer Hooks</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center min-w-48 card-hover">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Safety First</h3>
          <p className="text-sm text-gray-600">Automated risk assessment and community governance</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center min-w-48 card-hover">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Seamless Trading</h3>
          <p className="text-sm text-gray-600">Trade on proven Orca Whirlpools infrastructure</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-orca-50 rounded-2xl p-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Powered by Orca&apos;s Battle-Tested Infrastructure
          </h2>
          <p className="text-gray-700">
            Built on top of Orca Whirlpools&apos; existing Token-2022 support with enhanced
            Transfer Hook registry and automated TokenBadge approval system.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span>✅ Audited Smart Contracts</span>
            <span>•</span>
            <span>✅ Community Governance</span>
            <span>•</span>
            <span>✅ Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}