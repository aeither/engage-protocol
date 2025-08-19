export const TestnetNotice = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🧪</div>
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">
            🌐 Testnet Only - Free to Play!
          </h3>
          <p className="text-blue-800 text-sm leading-relaxed mb-3">
            This app uses <strong>Solana Testnet</strong> exclusively - you never spend real money! 
            All transactions use free test SOL that you can get from faucets.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a 
              href="https://faucet.solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              🚰 Get Free Testnet SOL
            </a>
            <span className="text-blue-500 text-sm">•</span>
            <a 
              href="https://docs.solana.com/clusters#testnet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              📖 Learn about Testnet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
