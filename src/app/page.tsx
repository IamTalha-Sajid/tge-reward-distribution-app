'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import TreasuryTab from '@/components/TreasuryTab';
import SourceTokenTab from '@/components/SourceTokenTab';
import RegistryTab from '@/components/RegistryTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('source');
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
                  activeTab === 'source'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('source')}
              >
                Source Token
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'treasury'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('treasury')}
              >
                Treasury
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'registry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('registry')}
              >
                Registry
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'source' && <SourceTokenTab />}
              {activeTab === 'treasury' && <TreasuryTab />}
              {activeTab === 'registry' && <RegistryTab />}
            </div>
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
