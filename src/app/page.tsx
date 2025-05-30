'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import TreasuryTab from '@/components/TreasuryTab';
import SourceTokenTab from '@/components/SourceTokenTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'treasury' | 'sourceToken'>('treasury');
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TGE Reward Distribution</h1>
          <ConnectButton />
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 mb-8">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'treasury'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('treasury')}
              >
                Admin Actions
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'sourceToken'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('sourceToken')}
              >
                User Actions
              </button>
            </div>

            {activeTab === 'treasury' ? <TreasuryTab /> : <SourceTokenTab />}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Please connect your wallet to access the TGE Reward Distribution interface
            </p>
          </div>
        )}
    </div>
    </main>
  );
}
