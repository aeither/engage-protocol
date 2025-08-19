// Solana network configuration for DailyWiser
export const SOLANA_NETWORKS = {
  devnet: {
    name: 'Solana Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    symbol: 'SOL',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '1.0']
  },
  testnet: {
    name: 'Solana Testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    symbol: 'SOL',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '1.0']
  },
  'mainnet-beta': {
    name: 'Solana Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    symbol: 'SOL',
    multiplier: 1,
    defaultAmounts: ['0.01', '0.1', '0.5']
  }
} as const;

// Current network (for testing and development)
export const CURRENT_NETWORK = SOLANA_NETWORKS.testnet;

// Export for compatibility
export const SUPPORTED_CHAINS = [CURRENT_NETWORK] as const;
export const SUPPORTED_CHAIN_IDS = ['testnet'] as const;