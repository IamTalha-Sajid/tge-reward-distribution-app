import treasuryABI from './abi/treasury.json';
import sourceTokenABI from './abi/source-token.json';
import targetTokenABI from './abi/target-token.json';
import erc20ABI from './abi/erc20.json';

export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '';
export const SOURCE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SOURCE_TOKEN_ADDRESS || '';
export const TARGET_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TARGET_TOKEN_ADDRESS || '';
export const DELEGATION_HUB_ADDRESS = process.env.NEXT_PUBLIC_DELEGATION_HUB_ADDRESS || '';
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
  targetToken: {
    address: TARGET_TOKEN_ADDRESS,
    abi: targetTokenABI,
  },
  erc20: {
    abi: erc20ABI,
  },
}; 