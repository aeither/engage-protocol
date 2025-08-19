import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { toast } from 'sonner'
import { useSolana } from '../hooks/useSolana'
import GlobalHeader from '../components/GlobalHeader'
import { DebugPanel } from '../components/DebugPanel'
import { EnvironmentStatus } from '../components/EnvironmentStatus'

interface QuizSearchParams {
  quiz?: string
  mode?: string
}

// AI Quiz Topics for random generation - General Knowledge
const AI_QUIZ_TOPICS_GENERAL = [
  {
    topic: "Blockchain Fundamentals",
    questions: [
      {
        question: "What is a hash function in blockchain?",
        options: ["A compression algorithm", "A one-way mathematical function", "A database query", "A network protocol"],
        correct: 1
      },
      {
        question: "What is the purpose of a Merkle tree in blockchain?",
        options: ["Store user data", "Efficiently verify large data structures", "Mine new blocks", "Create wallets"],
        correct: 1
      },
      {
        question: "What is a 51% attack?",
        options: ["Stealing 51% of coins", "Controlling majority of network hash rate", "Hacking 51% of nodes", "Owning 51% of tokens"],
        correct: 1
      }
    ]
  },
  {
    topic: "Web3 Gaming",
    questions: [
      {
        question: "What are play-to-earn games?",
        options: ["Free games", "Games where players earn real value", "Subscription games", "Offline games"],
        correct: 1
      },
      {
        question: "What is GameFi?",
        options: ["Game Finance integration", "Game development tool", "Gaming console", "Game streaming platform"],
        correct: 0
      },
      {
        question: "What are in-game NFTs typically used for?",
        options: ["Game graphics", "Unique digital assets ownership", "Game performance", "Player authentication"],
        correct: 1
      }
    ]
  },
  {
    topic: "Layer 2 Solutions",
    questions: [
      {
        question: "What is the main purpose of Layer 2 solutions?",
        options: ["Replace blockchains", "Scale blockchain transactions", "Mine cryptocurrency", "Store data"],
        correct: 1
      },
      {
        question: "What is a rollup?",
        options: ["A wallet type", "A scaling solution that bundles transactions", "A consensus mechanism", "A token standard"],
        correct: 1
      },
      {
        question: "What is the Lightning Network?",
        options: ["Bitcoin Layer 2 solution", "Ethereum scaling solution", "New blockchain", "Mining algorithm"],
        correct: 0
      }
    ]
  },
  {
    topic: "Metaverse & Virtual Worlds",
    questions: [
      {
        question: "What is the metaverse in Web3 context?",
        options: ["A game", "Virtual interconnected worlds with ownership", "Social media platform", "Video streaming service"],
        correct: 1
      },
      {
        question: "What role do NFTs play in virtual worlds?",
        options: ["Game currency", "Digital land and asset ownership", "Player authentication", "Game graphics"],
        correct: 1
      },
      {
        question: "What is virtual land in the metaverse?",
        options: ["Game levels", "Ownable digital real estate", "Server space", "Graphics assets"],
        correct: 1
      }
    ]
  }
]

// AI Quiz Topics for Protocol Deep Dives
const AI_QUIZ_TOPICS_PROTOCOLS = [
  {
    topic: "Pump.fun",
    questions: [
      {
        question: "What is Pump.fun primarily known for?",
        options: ["NFT marketplace", "Meme coin launchpad on Solana", "DeFi lending protocol", "Cross-chain bridge"],
        correct: 1
      },
      {
        question: "What happens when a token on Pump.fun reaches its bonding curve goal?",
        options: ["It gets burned", "Liquidity migrates to Raydium", "Trading stops", "It becomes an NFT"],
        correct: 1
      },
      {
        question: "What is the main appeal of Pump.fun for token creators?",
        options: ["High fees", "No upfront liquidity required", "Guaranteed success", "Anonymous trading only"],
        correct: 1
      }
    ]
  },
  {
    topic: "MarginFi",
    questions: [
      {
        question: "What type of protocol is MarginFi?",
        options: ["DEX aggregator", "Margin trading and lending protocol", "Liquid staking service", "NFT marketplace"],
        correct: 1
      },
      {
        question: "What is a key feature of MarginFi's lending pools?",
        options: ["Fixed interest rates", "Automated risk monitoring", "No liquidation risk", "Unlimited borrowing"],
        correct: 1
      },
      {
        question: "Which tokens can users primarily borrow and lend on MarginFi?",
        options: ["Only SOL", "SOL, USDC, BONK and other tokens", "Only stablecoins", "Only meme coins"],
        correct: 1
      }
    ]
  },
  {
    topic: "Kamino Finance",
    questions: [
      {
        question: "What is Kamino Finance's primary focus?",
        options: ["Token swapping", "Automated market making and lending", "NFT trading", "Cross-chain bridging"],
        correct: 1
      },
      {
        question: "What makes Kamino significant in the Solana ecosystem?",
        options: ["Lowest fees", "Leading TVL among Solana protocols", "Fastest transactions", "Most tokens listed"],
        correct: 1
      },
      {
        question: "What type of services does Kamino's DeFi platform offer?",
        options: ["Only lending", "Comprehensive DeFi suite with AMM and lending", "Only staking", "Only yield farming"],
        correct: 1
      }
    ]
  }
]

// Quiz configurations
const QUIZ_CONFIGS = {
  'ai-generated': {
    id: 'ai-generated',
    title: '🤖 AI Generated Quiz',
    description: 'Face a randomly generated quiz powered by AI on various Web3 topics',
    questions: [] // Will be populated dynamically
  },
  'ai-protocols': {
    id: 'ai-protocols',
    title: '🏛️ Protocol Deep Dive',
    description: 'Challenge yourself with questions about specific Solana protocols and platforms',
    questions: [] // Will be populated dynamically
  },
  'solana-fundamentals': {
    id: 'solana-fundamentals',
    title: 'Solana Fundamentals',
    description: 'Master the basics of Solana blockchain, SPL tokens, and the Solana ecosystem',
    questions: [
      {
        question: "What makes Solana's consensus mechanism unique?",
        options: ["Proof of Work only", "Proof of History + Proof of Stake", "Delegated Proof of Stake", "Proof of Authority"],
        correct: 1
      },
      {
        question: "What are SPL tokens on Solana?",
        options: ["Smart contract tokens", "Solana Program Library tokens", "Staking pool tokens", "Special purpose tokens"],
        correct: 1
      },
      {
        question: "What is the native cryptocurrency of Solana?",
        options: ["SOL", "SOLANA", "SLN", "SOLS"],
        correct: 0
      }
    ]
  },
  'solana-defi': {
    id: 'solana-defi',
    title: 'Solana DeFi',
    description: 'Explore decentralized finance on Solana: Serum, Raydium, and yield opportunities',
    questions: [
      {
        question: "What is Raydium in the Solana ecosystem?",
        options: ["A wallet", "An automated market maker (AMM)", "A lending protocol", "A bridge"],
        correct: 1
      },
      {
        question: "What was Serum known for on Solana?",
        options: ["NFT marketplace", "Decentralized exchange (DEX)", "Lending platform", "Staking protocol"],
        correct: 1
      },
      {
        question: "What is Jupiter in Solana DeFi?",
        options: ["A staking protocol", "A lending platform", "A DEX aggregator", "A yield farming protocol"],
        correct: 2
      }
    ]
  },
  'solana-nfts': {
    id: 'solana-nfts',
    title: 'Solana NFTs',
    description: 'Learn about NFT creation, marketplaces, and the Metaplex ecosystem on Solana',
    questions: [
      {
        question: "What is Metaplex in the Solana ecosystem?",
        options: ["A wallet", "An NFT protocol and toolset", "A DeFi protocol", "A gaming platform"],
        correct: 1
      },
      {
        question: "Which is a popular Solana NFT marketplace?",
        options: ["OpenSea", "Magic Eden", "Foundation", "SuperRare"],
        correct: 1
      },
      {
        question: "What file format is commonly used for Solana NFT metadata?",
        options: ["XML", "JSON", "YAML", "CSV"],
        correct: 1
      }
    ]
  },
  'pump-fun': {
    id: 'pump-fun',
    title: 'Pump.fun',
    description: 'Master the leading meme coin launchpad on Solana',
    questions: [
      {
        question: "What is Pump.fun primarily known for?",
        options: ["NFT marketplace", "Meme coin launchpad on Solana", "DeFi lending protocol", "Cross-chain bridge"],
        correct: 1
      },
      {
        question: "What happens when a token on Pump.fun reaches its bonding curve goal?",
        options: ["It gets burned", "Liquidity migrates to Raydium", "Trading stops", "It becomes an NFT"],
        correct: 1
      },
      {
        question: "What is the main appeal of Pump.fun for token creators?",
        options: ["High fees", "No upfront liquidity required", "Guaranteed success", "Anonymous trading only"],
        correct: 1
      }
    ]
  },
  'marginfi': {
    id: 'marginfi',
    title: 'MarginFi',
    description: 'Explore the advanced margin trading and lending protocol',
    questions: [
      {
        question: "What type of protocol is MarginFi?",
        options: ["DEX aggregator", "Margin trading and lending protocol", "Liquid staking service", "NFT marketplace"],
        correct: 1
      },
      {
        question: "What is a key feature of MarginFi's lending pools?",
        options: ["Fixed interest rates", "Automated risk monitoring", "No liquidation risk", "Unlimited borrowing"],
        correct: 1
      },
      {
        question: "Which tokens can users primarily borrow and lend on MarginFi?",
        options: ["Only SOL", "SOL, USDC, BONK and other tokens", "Only stablecoins", "Only meme coins"],
        correct: 1
      }
    ]
  },
  'kamino-finance': {
    id: 'kamino-finance',
    title: 'Kamino Finance',
    description: 'Understand the comprehensive DeFi suite with leading TVL on Solana',
    questions: [
      {
        question: "What is Kamino Finance's primary focus?",
        options: ["Token swapping", "Automated market making and lending", "NFT trading", "Cross-chain bridging"],
        correct: 1
      },
      {
        question: "What makes Kamino significant in the Solana ecosystem?",
        options: ["Lowest fees", "Leading TVL among Solana protocols", "Fastest transactions", "Most tokens listed"],
        correct: 1
      },
      {
        question: "What type of services does Kamino's DeFi platform offer?",
        options: ["Only lending", "Comprehensive DeFi suite with AMM and lending", "Only staking", "Only yield farming"],
        correct: 1
      }
    ]
  }
} as const

function QuizGame() {
  const navigate = useNavigate()
  const { quiz: quizId, mode } = useSearch({ from: '/quiz-game' }) as QuizSearchParams
  const { connected: walletConnected } = useWallet()
  const { sendSOL, loading: solanaLoading, connected, publicKey, connection, balance } = useSolana()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [aiAnswers, setAiAnswers] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(5)
  const [userTimeLeft, setUserTimeLeft] = useState(5)
  const [isAiTurn, setIsAiTurn] = useState(false)
  const [isUserTurn, setIsUserTurn] = useState(true)
  const [gameResult, setGameResult] = useState<'user_wins' | 'ai_wins' | 'tie' | null>(null)
  const [showAiAnswer, setShowAiAnswer] = useState(false)
  const [userTimedOut, setUserTimedOut] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [questionResults, setQuestionResults] = useState<Array<{userAnswered: boolean, userCorrect: boolean, aiCorrect: boolean}>>([])
  const [hasActiveQuiz, setHasActiveQuiz] = useState(false)
  const [activeQuizId, setActiveQuizId] = useState('')
  const [transactionPending, setTransactionPending] = useState(false)
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [matchmakingProgress, setMatchmakingProgress] = useState(0)
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null)
  const [, setAiQuizTopic] = useState('')
  
  const FIXED_ENTRY_AMOUNT = 0.0001 // Fixed entry amount in SOL
  const REWARD_ADDRESS = 'CqYEKmR8DkswU34Vz4uXAWifdD9ku8KWfKi5qTFBfbUY'

  // Function to restart the quiz in AI challenge mode
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setQuizCompleted(false)
    setScore(0)
    setAiScore(0)
    setAiAnswers([])
    setTimeLeft(5)
    setUserTimeLeft(5)
    setIsAiTurn(false)
    setIsUserTurn(true)
    setGameResult(null)
    setShowAiAnswer(false)
    setUserTimedOut(false)
    setQuizStarted(true)
    setQuestionResults([])
  }

  // Generate AI quiz from random topics
  const generateAIQuiz = () => {
    const isProtocolQuiz = quizId === 'ai-protocols'
    const topicsArray = isProtocolQuiz ? AI_QUIZ_TOPICS_PROTOCOLS : AI_QUIZ_TOPICS_GENERAL
    const shuffledTopics = [...topicsArray].sort(() => Math.random() - 0.5)
    const selectedQuestions = []
    const usedTopics = []
    
    // Select one question from each of the first 3 topics
    for (let i = 0; i < 3 && i < shuffledTopics.length; i++) {
      const topic = shuffledTopics[i]
      const randomQuestion = topic.questions[Math.floor(Math.random() * topic.questions.length)]
      selectedQuestions.push(randomQuestion)
      usedTopics.push(topic.topic)
    }
    
    const generatedQuizConfig = {
      id: quizId as string,
      title: isProtocolQuiz ? '🏛️ Protocol Deep Dive' : '🤖 AI Generated Quiz',
      description: `Dynamic quiz covering: ${usedTopics.join(', ')}`,
      questions: selectedQuestions
    }
    
    setGeneratedQuiz(generatedQuizConfig)
    setAiQuizTopic(usedTopics.join(', '))
    return generatedQuizConfig
  }

  const quizConfig = (quizId === 'ai-generated' || quizId === 'ai-protocols') ? generatedQuiz : (quizId ? QUIZ_CONFIGS[quizId as keyof typeof QUIZ_CONFIGS] : null)
  const isAiChallengeMode = mode === 'ai-challenge'

  // AI bot logic - simple but effective
  const getAiAnswer = (question: any) => {
    // AI has a 85% chance of getting the answer correct
    const correctChance = 0.85
    const willAnswerCorrectly = Math.random() < correctChance
    
    if (willAnswerCorrectly) {
      return question.options[question.correct]
    } else {
      // Pick a random wrong answer
      const wrongIndices = question.options
        .map((_: any, index: number) => index)
        .filter((index: number) => index !== question.correct)
      const randomWrongIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)]
      return question.options[randomWrongIndex]
    }
  }

  // Timer effect for user turn in AI challenge mode
  useEffect(() => {
    if (isAiChallengeMode && isUserTurn && userTimeLeft > 0 && !userTimedOut && (quizStarted || (hasActiveQuiz && activeQuizId === quizId))) {
      const timer = setTimeout(() => {
        setUserTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isAiChallengeMode && isUserTurn && userTimeLeft === 0 && !userTimedOut && (quizStarted || (hasActiveQuiz && activeQuizId === quizId))) {
      // User ran out of time - AI wins by default
      setUserTimedOut(true)
      setIsUserTurn(false)
      
      if (quizConfig) {
        const currentQuestion = quizConfig.questions[currentQuestionIndex]
        const aiAnswer = getAiAnswer(currentQuestion)
        const newAiAnswers = [...aiAnswers]
        newAiAnswers[currentQuestionIndex] = aiAnswer
        setAiAnswers(newAiAnswers)
        
        // Record this question result - user timed out, AI gets the win
        const newQuestionResults = [...questionResults]
        const aiCorrect = aiAnswer === currentQuestion.options[currentQuestion.correct]
        newQuestionResults[currentQuestionIndex] = {
          userAnswered: false,
          userCorrect: false,
          aiCorrect: aiCorrect
        }
        setQuestionResults(newQuestionResults)
        
        if (aiCorrect) {
          setAiScore(prev => prev + 1)
        }
        
        // User loses - restart quiz from beginning
        setTimeout(() => {
          // Reset all state to restart the quiz
          setCurrentQuestionIndex(0)
          setUserAnswers([])
          setScore(0)
          setAiScore(0)
          setAiAnswers([])
          setTimeLeft(5)
          setUserTimeLeft(5)
          setIsAiTurn(false)
          setIsUserTurn(true)
          setUserTimedOut(false)
          setShowAiAnswer(false)
          setQuizStarted(true)
          setQuestionResults([])
        }, 2000)
      }
    }
  }, [isAiChallengeMode, isUserTurn, userTimeLeft, userTimedOut, currentQuestionIndex, quizConfig, aiAnswers, quizStarted, hasActiveQuiz, activeQuizId, quizId])

  // Timer effect for AI challenge mode
  useEffect(() => {
    if (isAiChallengeMode && isAiTurn && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isAiChallengeMode && isAiTurn && timeLeft === 0) {
      // AI's turn to answer
      if (quizConfig) {
        const currentQuestion = quizConfig.questions[currentQuestionIndex]
        const aiAnswer = getAiAnswer(currentQuestion)
        const newAiAnswers = [...aiAnswers]
        newAiAnswers[currentQuestionIndex] = aiAnswer
        setAiAnswers(newAiAnswers)
        setShowAiAnswer(true)
        
        // Check if AI got it right
        const aiCorrect = aiAnswer === currentQuestion.options[currentQuestion.correct]
        if (aiCorrect) {
          setAiScore(prev => prev + 1)
        }
        
        // Move to next question or end game
        setTimeout(() => {
          setShowAiAnswer(false)
          setIsAiTurn(false)
          setIsUserTurn(true)
          setTimeLeft(5)
          setUserTimeLeft(5)
          setUserTimedOut(false)
          
          if (currentQuestionIndex < quizConfig.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
          } else {
            // Quiz completed - determine winner
            const finalUserScore = userAnswers.reduce((score, ans, index) => {
              const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
              return score + (isCorrect ? 1 : 0)
            }, 0)
            
            const finalAiScore = newAiAnswers.reduce((score, ans, index) => {
              const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
              return score + (isCorrect ? 1 : 0)
            }, 0)
            
            if (finalUserScore > finalAiScore) {
              setGameResult('user_wins')
            } else if (finalAiScore > finalUserScore) {
              setGameResult('ai_wins')
            } else {
              setGameResult('tie')
            }
            setQuizCompleted(true)
          }
        }, 2000)
      }
    }
  }, [isAiChallengeMode, isAiTurn, timeLeft, currentQuestionIndex, quizConfig, aiAnswers, userAnswers])

  // Matchmaking effect for AI quiz
  useEffect(() => {
    if (isMatchmaking) {
      const interval = setInterval(() => {
        setMatchmakingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsMatchmaking(false)
            setTransactionPending(false)
            
            // Generate AI quiz if needed
            if (quizId === 'ai-generated' || quizId === 'ai-protocols') {
              generateAIQuiz()
            }
            
            // Start the quiz after matchmaking
            setTimeout(() => {
              setQuizStarted(true)
              setHasActiveQuiz(true)
              setActiveQuizId(quizId || '')
            }, 500)
            
            return 100
          }
          return prev + 2
        })
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [isMatchmaking, quizId])

  // Handle quiz start
  const handleStartQuiz = async () => {
    if (!connected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet first'
      })
      return
    }
    
    // For AI generated quiz or AI challenge mode, show matchmaking first
    if (quizId === 'ai-generated' || quizId === 'ai-protocols' || isAiChallengeMode) {
      setTransactionPending(true)
      
      try {
        console.log('🚀 Starting AI quiz transaction...', {
          environment: import.meta.env.MODE,
          network: connection.rpcEndpoint,
          wallet: publicKey?.toString(),
          amount: FIXED_ENTRY_AMOUNT,
          recipient: REWARD_ADDRESS
        })
        
        // Try to send SOL to the reward address as entry fee
        const signature = await sendSOL(REWARD_ADDRESS, FIXED_ENTRY_AMOUNT)
        console.log('✅ Entry fee transaction successful:', signature)
        
        toast.success(isAiChallengeMode ? 'Entry fee paid! Finding AI opponent... 🤖' : 'Entry fee paid! Generating AI quiz... 🎮', {
          description: `Transaction: ${signature.slice(0, 8)}...`
        })
        
        // Start matchmaking after successful transaction
        setIsMatchmaking(true)
        setMatchmakingProgress(0)
        
      } catch (error) {
        console.error('❌ Transaction failed in production:', error)
        
        // More detailed error reporting
        let errorMessage = 'Unknown transaction error'
        let errorDescription = 'Please try again'
        
        if (error instanceof Error) {
          errorMessage = error.message
          if (error.message.includes('insufficient')) {
            errorDescription = 'Get more SOL from faucet: https://faucet.solana.com'
          } else if (error.message.includes('network') || error.message.includes('RPC')) {
            errorDescription = `Network: ${connection.rpcEndpoint} - Try refreshing`
          } else if (error.message.includes('rejected') || error.message.includes('cancelled')) {
            errorDescription = 'Transaction was cancelled by user'
          } else if (error.message.includes('timeout')) {
            errorDescription = 'Network timeout - Vercel servers might be slow'
          }
        }
        
        toast.error(`Transaction failed: ${errorMessage}`, {
          description: errorDescription,
          duration: 8000
        })
        
        // Log detailed debug info for production issues
        console.error('🔍 Debug Info:', {
          error: error,
          errorMessage: error instanceof Error ? error.message : 'Unknown',
          environment: import.meta.env.MODE,
          network: connection.rpcEndpoint,
          walletConnected: !!publicKey,
          walletAddress: publicKey?.toString(),
          balance: balance,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
        
        setTransactionPending(false)
        return // Don't start quiz if transaction fails
      }
    } else {
      // Regular quiz - no matchmaking needed
      if (!quizConfig) {
        toast.error('Quiz configuration not found', {
          description: 'Please select a valid quiz'
        })
        return
      }
      
      setTransactionPending(true)
      
      try {
        console.log('🚀 Starting regular quiz transaction...', {
          environment: import.meta.env.MODE,
          network: connection.rpcEndpoint,
          wallet: publicKey?.toString(),
          quiz: quizConfig.id
        })
        
        // Try to send SOL to the reward address as entry fee
        const signature = await sendSOL(REWARD_ADDRESS, FIXED_ENTRY_AMOUNT)
        console.log('✅ Entry fee transaction successful:', signature)
        
        toast.success('Entry fee paid! Quiz started! Good luck! 🎮', {
          description: `Transaction: ${signature.slice(0, 8)}...`
        })
        
        // Start quiz after successful transaction
        setHasActiveQuiz(true)
        setActiveQuizId(quizConfig.id)
        setQuizStarted(true)
        
      } catch (error) {
        console.error('❌ Regular quiz transaction failed:', error)
        
        // More detailed error reporting
        let errorMessage = 'Transaction failed'
        let errorDescription = 'Please try again'
        
        if (error instanceof Error) {
          errorMessage = error.message
          if (error.message.includes('insufficient')) {
            errorDescription = 'Need more SOL. Get free testnet SOL: https://faucet.solana.com'
          } else if (error.message.includes('network') || error.message.includes('RPC')) {
            errorDescription = `RPC: ${connection.rpcEndpoint} - Network issue`
          } else if (error.message.includes('rejected') || error.message.includes('cancelled')) {
            errorDescription = 'You cancelled the transaction'
          }
        }
        
        toast.error(`❌ ${errorMessage}`, {
          description: `${errorDescription} (Env: ${import.meta.env.MODE})`,
          duration: 10000
        })
        
        // Don't start quiz if transaction fails
        setTransactionPending(false)
        return
      }
      
      setTransactionPending(false)
    }
  }

  // Handle quiz answer submission
  const handleQuizAnswer = (answer: string) => {
    if (!quizConfig || !isUserTurn || userTimedOut) return
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)

    // Check if user got it right
    const userCorrect = answer === quizConfig.questions[currentQuestionIndex].options[quizConfig.questions[currentQuestionIndex].correct]
    if (userCorrect) {
      setScore(prev => prev + 1)
    }

    if (isAiChallengeMode) {
      // Record this question result - user answered in time, so AI gets 0
      const newQuestionResults = [...questionResults]
      newQuestionResults[currentQuestionIndex] = {
        userAnswered: true,
        userCorrect: userCorrect,
        aiCorrect: false // AI loses because user answered first
      }
      setQuestionResults(newQuestionResults)
      
      if (currentQuestionIndex < quizConfig.questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setUserTimeLeft(5)
        setTimeLeft(5)
        setIsUserTurn(true)
        setIsAiTurn(false)
        setUserTimedOut(false)
      } else {
        // Quiz completed - calculate final scores from question results
        const finalUserScore = newQuestionResults.reduce((score, result) => {
          return score + (result.userCorrect ? 1 : 0)
        }, 0)
        
        const finalAiScore = newQuestionResults.reduce((score, result) => {
          return score + (result.aiCorrect ? 1 : 0)
        }, 0)
        
        setScore(finalUserScore)
        setAiScore(finalAiScore)
        
        if (finalUserScore > finalAiScore) {
          setGameResult('user_wins')
        } else if (finalAiScore > finalUserScore) {
          setGameResult('ai_wins')
        } else {
          setGameResult('tie')
        }
        setQuizCompleted(true)
      }
    } else {
      // Regular quiz mode
      if (currentQuestionIndex < quizConfig.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // Quiz completed - calculate final score from all answers
        const finalScore = newAnswers.reduce((score, ans, index) => {
          const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
          return score + (isCorrect ? 1 : 0)
        }, 0)
        
        setScore(finalScore)
        setQuizCompleted(true)
      }
    }
  }

  // Handle complete quiz - mock reward claiming
  const handleCompleteQuiz = async () => {
    if (!connected || !quizConfig) return
    
    try {
      setTransactionPending(true)
      
      // Mock reward calculation (for future smart contract integration)
      // let rewardMultiplier = 100 // Base reward
      // if (isAiChallengeMode) {
      //   if (gameResult === 'user_wins') {
      //     rewardMultiplier = 150 // 50% bonus for beating AI
      //   } else if (gameResult === 'tie') {
      //     rewardMultiplier = 125 // 25% bonus for tie
      //   }
      // } else if (score === quizConfig.questions.length) {
      //   rewardMultiplier = 190 // Up to 90% bonus for perfect score
      // }
      
      // Simulate reward distribution (just a small mock transfer)
      // In a real implementation, this would come from a smart contract
      // const mockReward = FIXED_ENTRY_AMOUNT * (rewardMultiplier / 100)
      
      // For demo purposes, we'll just show success without actual transfer
      // await sendSOL(publicKey.toString(), mockReward)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Rewards claimed! Check your wallet 🎁')
      
      // Reset quiz state
      setHasActiveQuiz(false)
      setActiveQuizId('')
      
      // Navigate to home page after successful claim
      setTimeout(() => {
        navigate({ to: '/' })
      }, 2000)
    } catch (error) {
      console.error('Failed to claim rewards:', error)
      toast.error('Failed to claim rewards. Please try again.')
    } finally {
      setTransactionPending(false)
    }
  }

  // Redirect if no quiz ID or invalid quiz ID (except for AI generated quizzes which get populated later)
  if (!quizId || (!quizConfig && quizId !== 'ai-generated' && quizId !== 'ai-protocols')) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Quiz Not Found</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            The requested quiz could not be found.
          </p>
          <button 
            onClick={() => navigate({ to: '/' })}
            style={{
              backgroundColor: "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Back to Quiz Selection
          </button>
        </div>
      </motion.div>
    )
  }

  // Show matchmaking screen
  if (isMatchmaking) {
    return (
      <motion.div 
        style={{ paddingTop: '80px' }} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "3rem",
            border: "1px solid hsl(var(--border))",
            boxShadow: "var(--shadow-card)"
          }}>
            <div style={{
              fontSize: "4rem",
              marginBottom: "2rem",
              display: "inline-block",
              transform: `rotate(${matchmakingProgress * 3.6}deg)`,
              transition: "transform 0.1s ease"
            }}>
              🤖
            </div>
            
            <h2 style={{ 
              color: "#111827", 
              marginBottom: "1rem", 
              fontSize: "1.75rem", 
              fontWeight: 800 
            }}>
              {quizId === 'ai-generated' ? 'Generating AI Quiz...' : 
               quizId === 'ai-protocols' ? 'Loading Protocol Deep Dive...' : 
               'Finding AI Opponent...'}
            </h2>
            
            <p style={{ 
              color: "#6b7280", 
              marginBottom: "2rem", 
              fontSize: "1.05rem" 
            }}>
              {quizId === 'ai-generated' 
                ? 'Creating a personalized quiz from various Web3 topics...' 
                : quizId === 'ai-protocols'
                ? 'Selecting challenging questions about cutting-edge Solana protocols...'
                : 'Matching you with an AI opponent for the ultimate challenge...'}
            </p>
            
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "1rem"
            }}>
              <div style={{
                width: `${matchmakingProgress}%`,
                height: "100%",
                backgroundColor: "#3b82f6",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }}></div>
            </div>
            
            <p style={{ 
              color: "#3b82f6", 
              fontSize: "0.9rem", 
              fontWeight: 600 
            }}>
              {matchmakingProgress}% Complete
            </p>
            
            <div style={{
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              border: "1px solid #3b82f6"
            }}>
              <p style={{ 
                color: "#1e40af", 
                fontSize: "0.9rem", 
                margin: 0,
                fontStyle: "italic"
              }}>
                {quizId === 'ai-generated' 
                  ? 'Selecting random questions from different Web3 domains...' 
                  : quizId === 'ai-protocols'
                  ? 'Loading expert-level questions from Pump.fun, MarginFi, Kamino...'
                  : 'Preparing AI opponent with 85% accuracy rate...'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Check if user has an active quiz session but for a different quiz
  if (hasActiveQuiz && activeQuizId && activeQuizId !== quizId) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Active Quiz Session</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            You have an active quiz session for "{String(activeQuizId)}". Please complete it first.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => navigate({ to: '/quiz-game', search: { quiz: activeQuizId } })}
              style={{
                backgroundColor: "#58CC02",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Continue Active Quiz
            </button>
            <button 
              onClick={() => navigate({ to: '/landing' })}
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Back to Selection
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // If quiz is completed, show end screen
  if (quizCompleted && quizConfig) {
    const percentage = Math.round((score / quizConfig.questions.length) * 100)
    
    if (isAiChallengeMode) {
      // AI Challenge completion screen
      return (
        <div style={{ paddingTop: '80px' }}>
          <GlobalHeader />
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "2rem",
            textAlign: "center"
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "3rem",
              border: "1px solid hsl(var(--border))",
              boxShadow: "var(--shadow-card)"
            }}>
              {gameResult === 'ai_wins' && (
                <>
                  <h2 style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                    🤖 AI Bot Wins!
                  </h2>
                  <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                    The AI bot scored <strong>{aiScore}</strong> while you scored <strong>{score}</strong> out of {quizConfig.questions.length}.
                  </p>
                  <p style={{ color: "#ef4444", marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 600 }}>
                    You must start over! Try again to beat the AI.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={handleRestartQuiz}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        padding: "1rem 2rem",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🔄 Restart Quiz
                    </button>
                    <button
                      onClick={() => navigate({ to: '/' })}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        padding: "1rem 2rem",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🏠 Back to Home
                    </button>
                  </div>
                </>
              )}
              
              {gameResult === 'user_wins' && (
                <>
                  <h2 style={{ color: "#22c55e", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                    🎉 You Beat the AI!
                  </h2>
                  <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                    You scored <strong>{score}</strong> while the AI scored <strong>{aiScore}</strong> out of {quizConfig.questions.length}.
                  </p>
                  <div style={{
                    background: "#f0fdf4",
                    border: "1px solid #22c55e",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "2rem"
                  }}>
                    <h3 style={{ color: "#14532d", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                      Base Tokens: {FIXED_ENTRY_AMOUNT} SOL × 100 = {FIXED_ENTRY_AMOUNT * 100} Tokens
                    </p>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                      AI Challenge Bonus: 50% extra for beating the bot!
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteQuiz}
                    disabled={transactionPending}
                    style={{
                      backgroundColor: transactionPending ? "#9ca3af" : "#58CC02",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "1rem 2rem",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: transactionPending ? "not-allowed" : "pointer",
                      opacity: transactionPending ? 0.6 : 1
                    }}
                  >
                    {transactionPending ? "Claiming..." : "🎁 Claim Rewards"}
                  </button>
                </>
              )}
              
              {gameResult === 'tie' && (
                <>
                  <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                    🤝 It's a Tie!
                  </h2>
                  <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                    Both you and the AI scored <strong>{score}</strong> out of {quizConfig.questions.length}. Great job!
                  </p>
                  <div style={{
                    background: "#fff7ed",
                    border: "1px solid #f59e0b",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "2rem"
                  }}>
                    <h3 style={{ color: "#92400e", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                      Base Tokens: {FIXED_ENTRY_AMOUNT} SOL × 100 = {FIXED_ENTRY_AMOUNT * 100} Tokens
                    </p>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                      Tie Bonus: 25% extra for matching the AI!
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteQuiz}
                    disabled={transactionPending}
                    style={{
                      backgroundColor: transactionPending ? "#9ca3af" : "#58CC02",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "1rem 2rem",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: transactionPending ? "not-allowed" : "pointer",
                      opacity: transactionPending ? 0.6 : 1
                    }}
                  >
                    {transactionPending ? "Claiming..." : "🎁 Claim Rewards"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )
    } else {
      // Regular quiz completion screen
      return (
        <div style={{ paddingTop: '80px' }}>
          <GlobalHeader />
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "2rem",
            textAlign: "center"
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "3rem",
              border: "1px solid hsl(var(--border))",
              boxShadow: "var(--shadow-card)"
            }}>
              <h2 style={{ color: "#111827", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                🎉 Quiz Completed!
              </h2>
              <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                You scored <strong>{score} out of {quizConfig.questions.length}</strong> questions correctly ({percentage}%).
              </p>
              
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #22c55e",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem"
              }}>
                <h3 style={{ color: "#14532d", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
                <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                  Base Tokens: {FIXED_ENTRY_AMOUNT} SOL × 100 = {FIXED_ENTRY_AMOUNT * 100} Tokens
                </p>
                <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                  Bonus: {score === quizConfig.questions.length ? '10-90% additional tokens for all correct answers!' : 'Better luck next time!'}
                </p>
              </div>

              <button
                onClick={handleCompleteQuiz}
                disabled={transactionPending}
                style={{
                  backgroundColor: transactionPending ? "#9ca3af" : "#58CC02",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  cursor: transactionPending ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  minWidth: "140px",
                  opacity: transactionPending ? 0.6 : 1
                }}
              >
                {transactionPending ? "Claiming..." : "🎁 Claim Rewards"}
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // If quiz is active and user has started it, show current question
  if (quizStarted && quizConfig && !quizCompleted) {
    const currentQuestion = quizConfig.questions[currentQuestionIndex]
    
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "clamp(1rem, 4vw, 2rem)"
        }}>
          {isAiChallengeMode && (
            <div style={{
              background: "#f8fafc",
              border: "2px solid #3b82f6",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>YOU</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>{score}</div>
                </div>
                <div style={{ fontSize: "1.2rem", color: "#6b7280", fontWeight: 600 }}>VS</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>AI BOT</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ef4444" }}>{aiScore}</div>
                </div>
              </div>
              {isUserTurn && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: userTimeLeft <= 2 ? "#fef2f2" : "#dbeafe",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  minWidth: "200px"
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: userTimeLeft <= 2 ? "#dc2626" : "#1d4ed8" }}>
                    ⏰ Your turn:
                  </span>
                  <div style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: userTimeLeft <= 2 ? "#dc2626" : "#1d4ed8",
                    minWidth: "1.5rem"
                  }}>
                    {userTimeLeft}
                  </div>
                  <div style={{
                    width: "60px",
                    height: "6px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${(userTimeLeft / 5) * 100}%`,
                      height: "100%",
                      backgroundColor: userTimeLeft <= 2 ? "#dc2626" : "#22c55e",
                      transition: "all 0.3s ease"
                    }}></div>
                  </div>
                </div>
              )}
              {isAiTurn && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#fee2e2",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px"
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#dc2626" }}>
                    🤖 AI thinking...
                  </span>
                  <div style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "#dc2626",
                    minWidth: "1.5rem"
                  }}>
                    {timeLeft}
                  </div>
                </div>
              )}
              {userTimedOut && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#fef2f2",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "2px solid #dc2626"
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#dc2626" }}>
                    ⏰ Time's up! Restarting quiz...
                  </span>
                </div>
              )}
            </div>
          )}
          
          <h2 style={{ 
            color: "#111827", 
            marginBottom: "2rem", 
            textAlign: "center", 
            fontWeight: 800,
            fontSize: "clamp(1.25rem, 5vw, 1.5rem)"
          }}>
            {isAiChallengeMode ? '🤖 AI Challenge' : quizConfig.title} - Question {currentQuestionIndex + 1} of {quizConfig.questions.length}
          </h2>
          
          {showAiAnswer && aiAnswers[currentQuestionIndex] && (
            <div style={{
              background: "#fef3c7",
              border: "2px solid #f59e0b",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.9rem", color: "#92400e", fontWeight: 600, marginBottom: "0.5rem" }}>
                🤖 AI Bot answered:
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                {aiAnswers[currentQuestionIndex]}
              </div>
              {aiAnswers[currentQuestionIndex] === currentQuestion.options[currentQuestion.correct] && (
                <div style={{ fontSize: "0.8rem", color: "#15803d", marginTop: "0.25rem" }}>✅ Correct!</div>
              )}
              {aiAnswers[currentQuestionIndex] !== currentQuestion.options[currentQuestion.correct] && (
                <div style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "0.25rem" }}>❌ Wrong!</div>
              )}
            </div>
          )}
          
          <div style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "clamp(1.5rem, 5vw, 2rem)",
            border: "1px solid hsl(var(--border))",
            boxShadow: "var(--shadow-card)",
            marginBottom: "2rem"
          }}>
            <h3 style={{ 
              color: "#111827", 
              marginBottom: "1.5rem", 
              fontSize: "clamp(1rem, 4vw, 1.25rem)", 
              fontWeight: 700,
              lineHeight: "1.4"
            }}>
              {currentQuestion.question}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={isAiTurn || userTimedOut || !isUserTurn}
                  style={{
                    backgroundColor: (isAiTurn || userTimedOut || !isUserTurn) ? "#f3f4f6" : "#ffffff",
                    border: "2px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "clamp(0.75rem, 3vw, 1rem)",
                    fontSize: "clamp(0.9rem, 3.5vw, 1rem)",
                    cursor: (isAiTurn || userTimedOut || !isUserTurn) ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                    color: (isAiTurn || userTimedOut || !isUserTurn) ? "#9ca3af" : "#111827",
                    lineHeight: "1.4",
                    minHeight: "clamp(3rem, 12vw, 4rem)",
                    opacity: (isAiTurn || userTimedOut || !isUserTurn) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isAiTurn && !userTimedOut && isUserTurn) {
                      e.currentTarget.style.backgroundColor = "hsl(var(--quiz-selected))"
                      e.currentTarget.style.borderColor = "hsl(var(--primary))"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAiTurn && !userTimedOut && isUserTurn) {
                      e.currentTarget.style.backgroundColor = "#ffffff"
                      e.currentTarget.style.borderColor = "hsl(var(--border))"
                    }
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {isAiTurn && (
              <div style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "#6b7280",
                fontStyle: "italic"
              }}>
                Wait for the AI to answer...
              </div>
            )}
            {userTimedOut && (
              <div style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "1rem",
                color: "#dc2626",
                fontWeight: 600
              }}>
                ⏰ Time expired! Quiz is restarting...
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main quiz start interface
  return (
    <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <GlobalHeader />
      <DebugPanel />
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "clamp(1rem, 4vw, 2rem)"
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "clamp(1.5rem, 6vw, 3rem)",
          border: "1px solid hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
          textAlign: "center"
        }}>
          <h1 style={{ 
            color: "#111827", 
            marginBottom: "1rem", 
            fontSize: "clamp(1.5rem, 6vw, 2rem)", 
            fontWeight: 800 
          }}>
            {quizConfig?.title || "Quiz"}
          </h1>
          <p style={{ 
            color: "#374151", 
            marginBottom: "2rem", 
            fontSize: "clamp(0.9rem, 4vw, 1.05rem)",
            lineHeight: "1.5"
          }}>
            {quizConfig?.description || "Test your knowledge and earn rewards!"}
          </p>
          
          {!connected && (
            <div style={{
              background: "#fef2f2",
              border: "2px solid #ef4444",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "2rem",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#dc2626", marginBottom: "1rem", fontWeight: 700 }}>
                🔗 Connect Your Solana Wallet
              </h3>
              <p style={{ color: "#dc2626", marginBottom: "1rem", fontSize: "0.9rem" }}>
                Please connect your Solana wallet to participate in the quiz.
              </p>
              <WalletMultiButton />
            </div>
          )}
          
          <EnvironmentStatus />
          
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: "12px",
            padding: "clamp(1rem, 4vw, 1.5rem)",
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <h3 style={{ 
              color: "#14532d", 
              marginBottom: "1rem", 
              fontWeight: 800,
              fontSize: "clamp(1rem, 4vw, 1.1rem)"
            }}>{isAiChallengeMode ? '🤖 AI Challenge Info:' : '📋 Quiz Info:'}</h3>
            <ul style={{ 
              color: "#374151", 
              lineHeight: "1.6",
              paddingLeft: "1.5rem",
              margin: 0,
              fontSize: "clamp(0.85rem, 3.5vw, 1rem)"
            }}>
              <li>📝 {quizConfig?.questions.length || 0} questions about {(quizConfig?.title || "quiz").toLowerCase()}</li>
              {isAiChallengeMode ? (
                <>
                  <li>🤖 Race against AI bot that answers in 5 seconds</li>
                  <li>🏁 If AI wins, you must restart the quiz</li>
                  <li>🎯 Beat the AI to earn 50% bonus rewards</li>
                  <li>🤝 Tie with AI to earn 25% bonus rewards</li>
                </>
              ) : (
                <>
                  <li>✅ Get all answers correct for bonus rewards (10-90%)</li>
                  <li>🪙 Receive tokens equal to your entry fee × 100</li>
                  <li>⏰ Complete the quiz to claim your rewards</li>
                </>
              )}
            </ul>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{
              background: "#f0f9ff",
              border: "2px solid #0ea5e9",
              borderRadius: "12px",
              padding: "clamp(0.75rem, 3vw, 1rem)",
              textAlign: "center"
            }}>
              <p style={{ 
                color: "#0c4a6e", 
                margin: "0", 
                fontWeight: 600,
                fontSize: "clamp(0.9rem, 3.5vw, 1rem)"
              }}>
                Entry Fee: {FIXED_ENTRY_AMOUNT} SOL
              </p>
              <p style={{ 
                color: "#0c4a6e", 
                margin: "0.25rem 0 0 0", 
                fontSize: "clamp(0.8rem, 3vw, 0.9rem)"
              }}>
                Earn up to {FIXED_ENTRY_AMOUNT * 190} Tokens!
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            {!isAiChallengeMode && (
              <div style={{
                background: "#f0f9ff",
                border: "2px solid #3b82f6",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                textAlign: "center"
              }}>
                <h4 style={{ color: "#1e40af", margin: "0 0 0.5rem 0", fontWeight: 700 }}>
                  🤖 Want a Challenge?
                </h4>
                <p style={{ color: "#1e40af", margin: "0 0 1rem 0", fontSize: "0.9rem" }}>
                  Face our AI bot! Answer correctly in 5 seconds before it does, or start over!
                </p>
                <button
                  onClick={() => navigate({ to: '/quiz-game', search: { quiz: quizId, mode: 'ai-challenge' } })}
                  disabled={transactionPending || !connected}
                  style={{
                    backgroundColor: transactionPending || !connected ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: transactionPending || !connected ? "not-allowed" : "pointer",
                    marginRight: "0.5rem",
                    opacity: transactionPending || !connected ? 0.6 : 1
                  }}
                >
                  🤖 AI Challenge Mode
                </button>
              </div>
            )}
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleStartQuiz}
                disabled={transactionPending || !connected}
                style={{
                  backgroundColor: transactionPending || !connected ? "#9ca3af" : (isAiChallengeMode ? "#ef4444" : "#58CC02"),
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 6vw, 2rem)",
                  fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
                  fontWeight: 700,
                  cursor: transactionPending || !connected ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: transactionPending || !connected ? 0.6 : 1
                }}
              >
                {transactionPending ? (solanaLoading ? "Sending SOL..." : "Processing...") : (isAiChallengeMode ? "🤖 Start AI Challenge" : "🎮 Start Quiz")}
              </button>
              
              {isAiChallengeMode && (
                <button
                  onClick={() => navigate({ to: '/quiz-game', search: { quiz: quizId } })}
                  disabled={transactionPending}
                  style={{
                    backgroundColor: transactionPending ? "#9ca3af" : "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 6vw, 2rem)",
                    fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
                    fontWeight: 700,
                    cursor: transactionPending ? "not-allowed" : "pointer",
                    opacity: transactionPending ? 0.6 : 1
                  }}
                >
                  🎮 Normal Mode
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const Route = createFileRoute('/quiz-game')({
  component: QuizGame,
  validateSearch: (search): QuizSearchParams => ({
    quiz: search.quiz as string,
    mode: search.mode as string,
  }),
})