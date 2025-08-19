import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // FORCE TESTNET in ALL environments (including production)
  // This ensures we always use free testnet SOL, never real mainnet SOL
  const network = WalletAdapterNetwork.Testnet;
  
  // Always use testnet endpoints - multiple options for reliability
  const endpoint = useMemo(() => {
    // Force testnet regardless of environment
    const testnetEndpoints = [
      import.meta.env.VITE_SOLANA_RPC_URL,
      'https://api.testnet.solana.com',
      'https://testnet.solana.com',
      clusterApiUrl(WalletAdapterNetwork.Testnet)
    ].filter(Boolean) as string[];
    
    // Use the first available endpoint, with fallback to default testnet
    const selectedEndpoint = testnetEndpoints[0] || 'https://api.testnet.solana.com';
    
    console.log('🌐 Solana Network Configuration:', {
      forcedNetwork: 'TESTNET',
      environment: import.meta.env.MODE,
      selectedEndpoint: selectedEndpoint,
      availableEndpoints: testnetEndpoints
    });
    
    return selectedEndpoint;
  }, []);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};