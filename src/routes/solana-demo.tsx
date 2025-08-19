import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSolana } from '../hooks/useSolana';
import { SolanaWalletConnection } from '../components/SolanaWalletConnection';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';
import GlobalHeader from '../components/GlobalHeader';

function SolanaDemoPage() {
  const { sendSOL, requestAirdrop, getBalance, balance, loading, connected, publicKey, connection } = useSolana();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customBalance, setCustomBalance] = useState<number | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    try {
      const signature = await sendSOL(recipient, parseFloat(amount));
      setTxSignature(signature);
      setRecipient('');
      setAmount('');
      toast.success('Transaction successful!', {
        description: `Sent ${amount} SOL`,
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleAirdrop = async () => {
    try {
      const signature = await requestAirdrop(1);
      toast.success('Airdrop successful!', {
        description: 'Received 1 SOL',
      });
    } catch (error) {
      console.error('Airdrop failed:', error);
      toast.error('Airdrop failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleCheckCustomBalance = async () => {
    if (!customAddress) return;
    
    try {
      const address = new PublicKey(customAddress);
      const balance = await getBalance(address);
      setCustomBalance(balance);
      toast.success('Balance fetched successfully');
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Error fetching balance', {
        description: 'Invalid address or network error',
      });
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await getBalance();
      toast.success('Balance refreshed');
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Error refreshing balance');
    }
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <GlobalHeader showBackButton backTo="/landing" backText="← Back to Landing" />
      
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🔗 Solana Web3.js Demo</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Test Solana transactions, check balances, and interact with the blockchain
          </p>
          <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <strong>Network:</strong> Testnet | <strong>RPC:</strong> {connection.rpcEndpoint}
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="quiz-card rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">💳 Wallet Connection</h2>
          <SolanaWalletConnection />
        </div>

        {!connected ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Please connect your wallet to start testing Solana features
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Balance & Airdrop */}
            <div className="quiz-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">💰 Balance & Airdrop</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your Balance:</span>
                    <span className="text-lg font-bold">
                      {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
                    </span>
                  </div>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={loading}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    🔄 Refresh Balance
                  </button>
                </div>

                <button
                  onClick={handleAirdrop}
                  disabled={loading}
                  className="w-full bg-green-500 text-white p-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Requesting...' : '🪂 Request 1 SOL Airdrop (Devnet)'}
                </button>

                <p className="text-xs text-gray-500">
                  Note: Airdrops only work on Devnet and have rate limits
                </p>
              </div>
            </div>

            {/* Send Transaction */}
            <div className="quiz-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">📤 Send SOL</h2>
              
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter Solana address (base58)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.000000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0.0"
                    max={balance || 0}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {balance ? balance.toFixed(4) : '0'} SOL
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !recipient || !amount || parseFloat(amount) <= 0}
                  className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : '💸 Send SOL'}
                </button>
              </form>
            </div>

            {/* Balance Checker */}
            <div className="quiz-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">🔍 Check Any Address Balance</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Solana Address
                  </label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter any Solana address"
                  />
                </div>
                
                <button
                  onClick={handleCheckCustomBalance}
                  disabled={!customAddress || loading}
                  className="w-full bg-purple-500 text-white p-3 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  🔍 Check Balance
                </button>

                {customBalance !== null && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Balance:</span>
                      <span className="text-lg font-bold">{customBalance.toFixed(4)} SOL</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Result */}
            <div className="quiz-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">📋 Latest Transaction</h2>
              
              {txSignature ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      ✅ Transaction Successful!
                    </p>
                    <p className="text-xs text-green-600 break-all mb-3">
                      <strong>Signature:</strong> {txSignature}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        🔗 View on Solana Explorer
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(txSignature)}
                        className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                      >
                        📋 Copy Signature
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions yet</p>
                  <p className="text-sm">Send SOL to see transaction details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Info */}
        <div className="mt-12 quiz-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">ℹ️ What's Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-bold">Wallet Connection</h3>
              <p className="text-sm text-gray-600">Connect Phantom, Solflare, and more</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-bold">Balance Checking</h3>
              <p className="text-sm text-gray-600">Check SOL balance for any address</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">📤</div>
              <h3 className="font-bold">Send Transactions</h3>
              <p className="text-sm text-gray-600">Transfer SOL between addresses</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">🪂</div>
              <h3 className="font-bold">Devnet Airdrop</h3>
              <p className="text-sm text-gray-600">Get test SOL for development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/solana-demo')({
  component: SolanaDemoPage,
});