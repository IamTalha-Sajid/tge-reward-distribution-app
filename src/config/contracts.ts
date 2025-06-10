import treasuryABI from './abi/treasury.json';
import sourceTokenABI from './abi/source-token.json';
import registryABI from './abi/registry.json';

export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '';
export const SOURCE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SOURCE_TOKEN_ADDRESS || '';
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '';

export const CONTRACTS = {
  treasury: {
    address: TREASURY_ADDRESS,
    abi: treasuryABI,
  },
  sourceToken: {
    address: SOURCE_TOKEN_ADDRESS,
    abi: sourceTokenABI,
  },
  registry: {
    address: REGISTRY_ADDRESS,
    abi: registryABI,
  },
} as const; 