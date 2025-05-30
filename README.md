# TGE Reward Distribution App

A Next.js application for managing TGE (Token Generation Event) reward distribution with wallet connection and contract interaction functionality.

## Features

- Wallet connection using RainbowKit
- Treasury Management
  - Send source tokens to recipients
- Source Token Management
  - View unclaimed tokens
  - Initiate token unlock
  - Fulfill token unlock

## Prerequisites

- Node.js 18+ and npm
- WalletConnect Project ID (get it from [WalletConnect Cloud](https://cloud.walletconnect.com/))
- Contract addresses for:
  - Treasury
  - Source Token
  - Target Token
  - Delegation Hub
  - Registry

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   NEXT_PUBLIC_TREASURY_ADDRESS=your_treasury_contract_address
   NEXT_PUBLIC_SOURCE_TOKEN_ADDRESS=your_source_token_contract_address
   NEXT_PUBLIC_TARGET_TOKEN_ADDRESS=your_target_token_contract_address
   NEXT_PUBLIC_DELEGATION_HUB_ADDRESS=your_delegation_hub_contract_address
   NEXT_PUBLIC_REGISTRY_ADDRESS=your_registry_contract_address
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Connect your wallet using the "Connect Wallet" button
2. Choose between Treasury Management and Source Token Management tabs
3. For Treasury Management:
   - Enter recipient address and amount to send source tokens
4. For Source Token Management:
   - View your unclaimed tokens
   - Enter amount to initiate unlock
   - Fulfill unlock when ready

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- wagmi
- RainbowKit
- viem
