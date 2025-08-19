import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolana } from '../hooks/useSolana';

interface GlobalHeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

function GlobalHeader({ 
  showBackButton = false, 
  backTo = "/", 
  backText = "← Back" 
}: GlobalHeaderProps) {
  const { connected, wallet } = useWallet();
  const { balance, publicKey } = useSolana();
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid hsl(var(--border))",
        padding: "1rem clamp(1rem, 4vw, 2rem)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(16, 24, 40, 0.06)"
      }}
    >
      {/* Left side - Logo and Back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {showBackButton && (
          <Link
            to={backTo}
            style={{
              color: "hsl(var(--primary))",
              textDecoration: "none",
              fontSize: "clamp(0.9rem, 3vw, 1rem)",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#3aaa00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(var(--primary))";
            }}
          >
            <span className="hidden sm:inline">{backText}</span>
            <span className="sm:hidden">←</span>
          </Link>
        )}
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <Link
          to="/"
          style={{
            color: "hsl(var(--primary))",
            textDecoration: "none",
            fontSize: "clamp(1rem, 4vw, 1.5rem)",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          🍋 <span className="hidden sm:inline">DailyWiser</span>
        </Link>
        </motion.div>
      </div>

      {/* Center - Navigation removed (only logo/back remain) */}
      <nav />

      {/* Right side - SOL Balance and Connect Button */}
      <motion.div style={{ display: "flex", alignItems: "center", gap: "1rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* SOL Balance Display */}
        {connected && balance !== null && balance > 0 && (
          <div style={{
            background: "hsl(var(--quiz-selected))",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            border: "1px solid hsl(var(--primary))"
          }}>
            <div style={{
              color: "hsl(var(--primary))",
              fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>⚡</span>
              <span className="hidden sm:inline">{balance.toFixed(4)} SOL</span>
              <span className="sm:hidden">{balance.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {/* Add SOL demo link */}
        {/* {connected && (
          <Link
            to="/solana-demo"
            style={{
              background: "hsl(var(--secondary))",
              color: "hsl(var(--secondary-foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.8rem",
              fontWeight: "600",
              textDecoration: "none",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(var(--primary))";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(var(--secondary))";
              e.currentTarget.style.color = "hsl(var(--secondary-foreground))";
            }}
          >
            <span className="hidden sm:inline">🔗 Web3 Demo</span>
            <span className="sm:hidden">🔗</span>
          </Link>
        )} */}
        
        {/* Solana Wallet Connect Button */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <div style={{
            fontSize: "0.9rem"
          }}>
            <WalletMultiButton style={{
              background: connected ? "hsl(var(--quiz-selected))" : "hsl(var(--primary))",
              color: connected ? "hsl(var(--primary))" : "white",
              border: connected ? "1px solid hsl(var(--primary))" : "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              height: "auto",
              minHeight: "auto"
            }} />
          </div>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}

export default GlobalHeader; 