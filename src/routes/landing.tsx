import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { TestnetNotice } from '../components/TestnetNotice'

function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating Orbs Background */}
      <FloatingOrbs />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
          {/* Powered by Solana */}
          <motion.div 
            className="flex items-center gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-2xl">⚡</div>
            <span className="text-lg font-medium text-primary">Powered by Solana</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Unlock the <span className="bg-gradient-primary bg-clip-text text-transparent">Future</span> of<br />
            Web3
          </motion.h1>

          {/* Description */}
          <motion.div 
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
              Discover, learn, and earn through gamified Solana experiences.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Collect badges, build your persona, and mint exclusive NFTs.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              to="/solana-demo"
              className="px-8 py-4 bg-gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold 
                         hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>🚀</span>
              Start Your Journey
            </Link>
            <button className="text-lg font-medium text-foreground hover:text-primary transition-colors">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* What You'll Unlock Section */}
        <div className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            {/* Testnet Notice */}
            <TestnetNotice />
            {/* Section Header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-medium text-lg mb-4 tracking-wider uppercase">
                Identity & Reputation
              </p>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8">
                What You'll <span className="bg-gradient-primary bg-clip-text text-transparent">Unlock</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Build your Web3 identity through achievements, recognition, and<br />
                exclusive digital collectibles
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <UnlockCard
                icon="🏆"
                title="XP Badges"
                description="On-chain, collectible badges that reflect your milestones. Collect. Flex. Repeat."
                delay={0.2}
              />
              <UnlockCard
                icon="👑"
                title="Persona"
                description="Title-style badges that define your role. Earned through milestones to reflect your status within the community."
                delay={0.4}
              />
              <UnlockCard
                icon="🎨"
                title="Open Mint NFTs"
                description="Sequentially numbered tokens marking your place in the community's history. A permanent, on-chain record."
                delay={0.6}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large purple orb */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-500/20 blur-xl"
        style={{ top: '10%', left: '5%' }}
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Medium blue orb */}
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/15 to-cyan-500/15 blur-lg"
        style={{ top: '60%', right: '10%' }}
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Small green orb */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-500/10 blur-md"
        style={{ bottom: '20%', left: '15%' }}
        animate={{
          y: [0, -10, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Tiny pink orb */}
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-pink-400/15 to-purple-500/15 blur-sm"
        style={{ top: '30%', right: '25%' }}
        animate={{
          y: [0, 12, 0],
          x: [0, -6, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </div>
  );
}

function UnlockCard({ icon, title, description, delay }: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-4">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export const Route = createFileRoute('/landing')({
  component: LandingPage,
}) 