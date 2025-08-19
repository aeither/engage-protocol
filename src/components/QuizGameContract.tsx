import { Link } from '@tanstack/react-router';
import { useSolana } from '../hooks/useSolana';

// Available quiz configurations
const QUIZ_CONFIGS = {
  'web3-basics': {
    id: 'web3-basics',
    title: 'Web3 Basics',
    description: 'Test your knowledge of blockchain fundamentals',
    questions: 5
  },
  'defi-fundamentals': {
    id: 'defi-fundamentals', 
    title: 'DeFi Fundamentals',
    description: 'Learn about decentralized finance protocols',
    questions: 5
  },
  'solana-dev': {
    id: 'solana-dev',
    title: 'Solana Development',
    description: 'Learn about the Solana blockchain ecosystem',
    questions: 5
  }
} as const;

function QuizGameContract() {
  const { connected, balance } = useSolana();

  if (!connected) {
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#111827", marginBottom: "1rem" }}>🔗 Connect Your Wallet</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Please connect your Solana wallet to start playing quiz games and earning SOL rewards.
        </p>
        
        <Link
          to="/solana-demo"
          style={{
            backgroundColor: "#58CC02",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          🚀 Try Solana Web3.js Demo
        </Link>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem"
    }}>
      <h1 style={{ 
        color: "hsl(var(--primary))", 
        textAlign: "center", 
        marginBottom: "2rem",
        fontSize: "2rem",
        fontWeight: 800
      }}>
        🍋 DailyWiser Quiz Game
      </h1>

      {/* Current Balance */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        border: "1px solid hsl(var(--border))",
        boxShadow: "var(--shadow-card)",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#111827", marginBottom: "1rem", fontWeight: 800 }}>💰 Your SOL Balance</h3>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(var(--primary))" }}>
          {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Available for quiz entry fees and rewards
        </p>
      </div>

      {/* Game Rules */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        border: "1px solid hsl(var(--border))",
        boxShadow: "var(--shadow-card)"
      }}>
        <h3 style={{ color: "#111827", marginBottom: "1rem", fontWeight: 800 }}>📋 How It Works (Coming Soon):</h3>
        <ul style={{ 
          color: "#374151", 
          lineHeight: "1.7",
          paddingLeft: "1.5rem",
          margin: 0
        }}>
          <li>🎯 Choose a quiz topic below</li>
          <li>📝 Answer all questions correctly</li>
          <li>💰 Pay small SOL entry fee (~0.01 SOL)</li>
          <li>🏆 Earn SOL rewards for perfect scores</li>
          <li>🎨 Mint achievement NFTs on Solana</li>
        </ul>
      </div>

      {/* Available Quizzes */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "2rem",
        marginBottom: "2rem",
        border: "1px solid hsl(var(--border))",
        boxShadow: "var(--shadow-card)"
      }}>
        <h3 style={{ color: "#111827", marginBottom: "1.5rem", textAlign: "center", fontWeight: 800 }}>
          🎮 Select a Quiz (Coming Soon)
        </h3>
        
        <div style={{ 
          display: "grid", 
          gap: "1rem", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
        }}>
          {Object.values(QUIZ_CONFIGS).map((quiz) => (
            <div
              key={quiz.id}
              style={{
                background: "#f8f9fa",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                padding: "1.5rem",
                textAlign: "center",
                opacity: 0.7,
                position: "relative"
              }}
            >
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#fbbf24",
                color: "white",
                fontSize: "0.7rem",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontWeight: "600"
              }}>
                Coming Soon
              </div>
              <h4 style={{ color: "#111827", marginBottom: "0.5rem", fontWeight: 700 }}>{quiz.title}</h4>
              <p style={{ color: "#374151", fontSize: "0.9rem", margin: "0 0 0.5rem 0" }}>
                {quiz.description}
              </p>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: 0 }}>
                {quiz.questions} questions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "2rem",
        border: "1px solid hsl(var(--border))",
        boxShadow: "var(--shadow-card)",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#111827", marginBottom: "1rem", fontWeight: 800 }}>🚀 Ready to Start?</h3>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          While we build the quiz games, try out our Solana Web3.js demo to test wallet integration and transactions.
        </p>
        
        <Link
          to="/solana-demo"
          style={{
            backgroundColor: "#58CC02",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          🔗 Try Solana Web3.js Demo
        </Link>
      </div>
    </div>
  );
}

export default QuizGameContract;