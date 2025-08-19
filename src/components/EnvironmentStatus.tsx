import { useSolana } from '../hooks/useSolana';

export const EnvironmentStatus = () => {
  const { connection, connected, balance } = useSolana();
  
  const getStatusColor = (condition: boolean) => condition ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (condition: boolean) => condition ? '✅' : '❌';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-gray-800 mb-3">🔍 System Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Environment:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {import.meta.env.MODE}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Wallet Connected:</span>
          <span className={getStatusColor(connected)}>
            {getStatusIcon(connected)} {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>SOL Balance:</span>
          <span className={getStatusColor(balance !== null && balance > 0.001)}>
            {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Network:</span>
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-32 truncate">
            {connection.rpcEndpoint.includes('testnet') ? '✅ Testnet' : '⚠️ Other'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>RPC Custom:</span>
          <span className={getStatusColor(!!import.meta.env.VITE_SOLANA_RPC_URL)}>
            {getStatusIcon(!!import.meta.env.VITE_SOLANA_RPC_URL)} 
            {import.meta.env.VITE_SOLANA_RPC_URL ? 'Set' : 'Default'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Ready for Quiz:</span>
          <span className={getStatusColor(connected && balance !== null && balance > 0.001)}>
            {getStatusIcon(connected && balance !== null && balance > 0.001)}
            {connected && balance !== null && balance > 0.001 ? 'Ready' : 'Not Ready'}
          </span>
        </div>
      </div>
      
      {(!connected || balance === null || balance <= 0.001) && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>⚠️ Action Required:</strong>
          <ul className="mt-1 ml-4 list-disc">
            {!connected && <li>Connect your Phantom wallet</li>}
            {connected && (balance === null || balance <= 0.001) && (
              <li>Get testnet SOL: <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">faucet.solana.com</a></li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
