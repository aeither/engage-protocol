import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { useSolana } from "../hooks/useSolana";

export const SolanaWalletConnection = () => {
  const { connected, wallet } = useWallet();
  const { balance, publicKey } = useSolana();

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-2">
        <WalletMultiButton />
        {connected && <WalletDisconnectButton />}
      </div>
      
      {connected && publicKey && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Connected: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </p>
          {balance !== null && (
            <p className="text-sm text-gray-600">
              Balance: {balance.toFixed(4)} SOL
            </p>
          )}
          <p className="text-xs text-gray-500">
            Wallet: {wallet?.adapter.name}
          </p>
        </div>
      )}
    </div>
  );
};