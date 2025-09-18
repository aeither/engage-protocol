import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '../components/Header';

function ContractDebugPage() {
  return (
    <div>
      <Header />
      
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🔧 Contract Debug (Legacy)</h1>
          <p className="text-lg text-muted-foreground mb-6">
            This page was migrated to Solana. Visit the new Web3.js demo instead.
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
      </div>
    </div>
  );
}

export const Route = createFileRoute('/contract')({
  component: ContractDebugPage,
});