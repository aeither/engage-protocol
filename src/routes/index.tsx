import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import Header from '../components/Header'
import { TestnetNotice } from '../components/TestnetNotice'

interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: number;
  estimatedTime: string;
  category: string;
}

// General Knowledge Quizzes
const GENERAL_KNOWLEDGE_QUIZZES: Quiz[] = [
  {
    id: "ai-generated",
    title: "AI Generated Quiz",
    description: "Face a randomly generated quiz on blockchain fundamentals, Web3 gaming, Layer 2 solutions, and metaverse concepts",
    icon: "🤖",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "AI Generated"
  },
  {
    id: "solana-fundamentals",
    title: "Solana Fundamentals",
    description: "Master the basics of Solana blockchain, SPL tokens, and the Solana ecosystem",
    icon: "⚡",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "Solana"
  },
  {
    id: "solana-defi",
    title: "Solana DeFi",
    description: "Explore decentralized finance on Solana: Serum, Raydium, and yield opportunities",
    icon: "🌊",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "DeFi"
  }
];

// Protocol Specific Quizzes
const PROTOCOL_QUIZZES: Quiz[] = [
  {
    id: "pump-fun",
    title: "Pump.fun",
    description: "Master the leading meme coin launchpad on Solana with bonding curves and fair launches",
    icon: "🚀",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "Launchpad"
  },
  {
    id: "marginfi",
    title: "MarginFi",
    description: "Explore advanced margin trading and lending with automated risk monitoring",
    icon: "💰",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "Lending"
  },
  {
    id: "kamino-finance",
    title: "Kamino Finance",
    description: "Understand the comprehensive DeFi suite with leading TVL on Solana",
    icon: "🏦",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "DeFi Suite"
  }
];

function HomePage() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId);
    // Navigate to quiz using TanStack Router
    navigate({ to: '/quiz-game', search: { quiz: quizId } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Hero Section - Modern Solana-focused */}
        <div className="text-center mb-16">
          {/* Powered by Solana Badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="text-2xl">⚡</div>
            <span className="text-lg font-medium text-primary">Powered by Solana</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Learn Solana,<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Earn Rewards</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
            Master Solana concepts through interactive quizzes. Build your Web3 knowledge while earning real tokens and NFT badges.
          </p>
        </div>

        {/* Rewards Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl sm:text-4xl mr-3">🎯</span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Solana Learning Rewards</h2>
            </div>
            <div className="bg-white rounded-xl p-4 mb-4 border border-purple-100">
              <p className="text-lg sm:text-xl font-bold text-primary mb-1">
                Earn SOL tokens + Exclusive NFT Badges
              </p>
              <p className="text-sm text-muted-foreground">
                Complete quizzes and unlock achievements
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/quiz-game"
                search={{ quiz: "ai-generated" }}
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-primary-foreground 
                           rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                🚀 Start Learning
              </Link>
              <Link
                to="/landing"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary border border-primary
                           rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                📖 Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Testnet Notice */}
        <TestnetNotice />
        
        {/* Quiz Categories */}
        <div id="topics" className="mb-8 sm:mb-12">
          {/* General Knowledge Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                📚 General Knowledge
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Master the fundamentals of blockchain, Solana ecosystem, and Web3 concepts
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {GENERAL_KNOWLEDGE_QUIZZES.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  isSelected={selectedQuiz === quiz.id}
                  onSelect={() => handleQuizSelect(quiz.id)}
                  delay={`${index * 200}ms`}
                />
              ))}
            </div>
          </div>

          {/* Protocol Specific Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                🏛️ Protocol Mastery
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deep dive into specific Solana protocols and platforms
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PROTOCOL_QUIZZES.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  isSelected={selectedQuiz === quiz.id}
                  onSelect={() => handleQuizSelect(quiz.id)}
                  delay={`${(GENERAL_KNOWLEDGE_QUIZZES.length + index) * 200}ms`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, isSelected, onSelect, delay }: {
  quiz: Quiz;
  isSelected: boolean;
  onSelect: () => void;
  delay: string;
}) {
  return (
    <div
      onClick={onSelect}
      className={`quiz-card rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 animate-bounce-in group
                  ${isSelected 
                    ? 'ring-2 ring-primary quiz-glow scale-105' 
                    : 'hover:scale-105 hover:quiz-button-glow'
                  }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="text-2xl sm:text-4xl mr-3 sm:mr-4 group-hover:animate-celebrate">
          {quiz.icon}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-1">
            {quiz.title}
          </h3>
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {quiz.category}
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-3 sm:mb-4 leading-relaxed text-xs sm:text-sm">
        {quiz.description}
      </p>
      
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="flex items-center">
          <span className="mr-1">📝</span>
          {quiz.questions} questions
        </span>
        <span className="flex items-center">
          <span className="mr-1">⏱️</span>
          {quiz.estimatedTime}
        </span>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})