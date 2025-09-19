import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolana } from '../hooks/useSolana';
import { Button } from './ui/button';

export function Header() {
  const { connected, wallet } = useWallet();
  const { balance, publicKey } = useSolana();
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
          >
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold hidden sm:block">Engage Protocol</span>
            <span className="text-xl font-bold sm:hidden">Engage</span>
          </Link>
        </motion.div>

        {/* Center - Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Campaigns
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-primary hover:text-white transition-colors cursor-pointer">
            <span>🎫</span>
            <span>My Tickets</span>
            <div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
              56
            </div>
          </div>
          <Link
            to="/winners"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Winners
          </Link>
          <Link
            to="/mint"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Mint NFT
          </Link>
          <Link
            to="/profile"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Profile
          </Link>
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Admin
          </Link>
        </nav>

        {/* Right side - SOL Balance and Connect Button */}
        <motion.div 
          className="flex items-center gap-3" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          {/* SOL Balance Display */}
          {connected && balance !== null && balance > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
              <div className="text-primary text-sm font-semibold flex items-center gap-1.5">
                <span>⚡</span>
                <span className="hidden sm:inline">{balance.toFixed(4)} SOL</span>
                <span className="sm:hidden">{balance.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Solana Wallet Connect Button */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <WalletMultiButton className="!bg-gradient-primary !text-white !border-none !rounded-lg !px-4 !py-2 !text-sm !font-semibold !h-auto !min-h-0" />
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}

export default Header; 