import { useState } from 'react';
import { useSolana } from '../hooks/useSolana';
import { useWallet } from '@solana/wallet-adapter-react';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connected, publicKey, connection, balance } = useSolana();
  const { wallet } = useWallet();

  if (import.meta.env.MODE === 'production' && !import.meta.env.VITE_SHOW_DEBUG) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold"
      >
        🔍 Debug
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg p-4 shadow-lg w-80 text-sm">
          <h3 className="font-bold mb-2">🔍 Debug Info</h3>
          
          <div className="space-y-2 text-xs">
            <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Network:</strong> {connection.rpcEndpoint}</div>
            <div><strong>Wallet Connected:</strong> {connected ? '✅' : '❌'}</div>
            <div><strong>Wallet Type:</strong> {wallet?.adapter.name || 'None'}</div>
            <div><strong>Public Key:</strong> {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'None'}</div>
            <div><strong>SOL Balance:</strong> {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...</div>
            
            <div className="mt-3 pt-2 border-t">
              <strong>Environment Variables:</strong>
              <div>VITE_SOLANA_RPC_URL: {import.meta.env.VITE_SOLANA_RPC_URL || 'Not set'}</div>
            </div>
            
            <div className="mt-3 pt-2 border-t">
              <strong>Quick Tests:</strong>
              <div className="flex gap-2 mt-1">
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  onClick={() => {
                    console.log('🔍 Full Debug State:', {
                      environment: import.meta.env.MODE,
                      network: connection.rpcEndpoint,
                      connected,
                      publicKey: publicKey?.toString(),
                      balance,
                      wallet: wallet?.adapter.name,
                      url: window.location.href,
                      timestamp: new Date().toISOString()
                    });
                  }}
                >
                  Log State
                </button>
                <button 
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  onClick={async () => {
                    try {
                      const response = await fetch(connection.rpcEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          jsonrpc: '2.0',
                          id: 1,
                          method: 'getHealth'
                        })
                      });
                      const result = await response.json();
                      console.log('🌐 Network Health:', result);
                      alert(`Network Status: ${result.result || 'Connected'}`);
                    } catch (error) {
                      console.error('❌ Network test failed:', error);
                      alert(`Network Error: ${error}`);
                    }
                  }}
                >
                  Test Network
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
