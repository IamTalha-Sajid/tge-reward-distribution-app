'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import RegistryDevTab from '@/components/RegistryDevTab';
import RegistryProdTab from '@/components/RegistryProdTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('registry-dev');
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  // Network IDs
  const RCADE_TRIALS_CHAIN_ID = 7785; // Dev/testnet
  const RCADE_MAINNET_CHAIN_ID = 101069; // Prod/mainnet

  // Switch network when tab changes
  useEffect(() => {
    if (!isConnected) return;

    const targetChainId = activeTab === 'registry-dev' ? RCADE_TRIALS_CHAIN_ID : RCADE_MAINNET_CHAIN_ID;
    
    if (chainId !== targetChainId) {
      switchChain({ chainId: targetChainId });
    }
  }, [activeTab, isConnected, chainId, switchChain]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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
                  activeTab === 'registry-dev'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => handleTabChange('registry-dev')}
              >
                Registry Dev (Testnet)
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'registry-prod'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => handleTabChange('registry-prod')}
              >
                Registry Prod (Mainnet)
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'registry-dev' && <RegistryDevTab />}
              {activeTab === 'registry-prod' && <RegistryProdTab />}
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
