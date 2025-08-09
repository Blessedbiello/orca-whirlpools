'use client'

import { useState } from 'react'
import { Hero } from './components/Hero'
import { TokenCreator } from './components/TokenCreator'
import { PoolCreator } from './components/PoolCreator'
import { TradingInterface } from './components/TradingInterface'
import { RegistryDashboard } from './components/RegistryDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'

export default function Home() {
  const [activeTab, setActiveTab] = useState('create-token')

  return (
    <div className="space-y-8">
      <Hero />
      
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create-token" className="text-sm font-medium">
              Create Token
            </TabsTrigger>
            <TabsTrigger value="create-pool" className="text-sm font-medium">
              Create Pool
            </TabsTrigger>
            <TabsTrigger value="trade" className="text-sm font-medium">
              Trade
            </TabsTrigger>
            <TabsTrigger value="registry" className="text-sm font-medium">
              Registry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-token" className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">
                Create Token-2022 with Transfer Hook
              </h2>
              <TokenCreator />
            </div>
          </TabsContent>

          <TabsContent value="create-pool" className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">
                Create Liquidity Pool
              </h2>
              <PoolCreator />
            </div>
          </TabsContent>

          <TabsContent value="trade" className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">
                Trade Tokens with Transfer Hooks
              </h2>
              <TradingInterface />
            </div>
          </TabsContent>

          <TabsContent value="registry" className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">
                Transfer Hook Registry
              </h2>
              <RegistryDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}