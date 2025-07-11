import registryABI from './abi/registry.json';

export const REGISTRY_DEV_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_DEV_ADDRESS || '';
export const REGISTRY_PROD_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_PROD_ADDRESS || '';

export const CONTRACTS = {
  registryDev: {
    address: REGISTRY_DEV_ADDRESS,
    abi: registryABI,
  },
  registryProd: {
    address: REGISTRY_PROD_ADDRESS,
    abi: registryABI,
  },
} as const; 