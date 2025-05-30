'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const rcadeTrials = {
  id: 7785,
  name: 'RCade Trials',
  network: 'rcade-trials',
  nativeCurrency: {
    decimals: 18,
    name: 'RCADE',
    symbol: 'RCADE',
  },
  rpcUrls: {
    default: {
      http: ['https://rcade-trials.rpc.caldera.xyz/http'],
    },
    public: {
      http: ['https://rcade-trials.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    default: { name: 'RCade Explorer', url: 'https://rcade-trials.explorer.caldera.xyz/' },
  },
  testnet: true,
} as const;

const chains = [rcadeTrials] as const;

const config = getDefaultConfig({
  appName: 'TGE Reward Distribution',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { config }; 