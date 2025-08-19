import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/GlobalHeader';

function DemoPage() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <GlobalHeader />
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎮 DailyWiser Demo</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Experience the full DailyWiser journey on Solana
          </p>
          
          <Link
            to="/solana-demo"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold 
                       hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto w-fit"
          >
            <span>🚀</span>
            Try Solana Web3.js Demo
          </Link>
        </div>

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

export const Route = createFileRoute('/demo')({
  component: DemoPage,
});