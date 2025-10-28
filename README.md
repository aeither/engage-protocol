# Engage Protocol

A Web3 engagement and learning platform built on Solana that transforms social interactions and educational activities into rewarding experiences. Users earn cryptocurrency by participating in campaigns, completing quizzes, and engaging with partner communities.

## DEMO

https://dailywiser-solana.vercel.app/

## Overview

Engage Protocol bridges Web2 social engagement with Web3 token economics, creating a sustainable ecosystem where users, creators, and protocols all benefit. Whether you're learning about blockchain, engaging with partner campaigns, or creating educational content, Engage Protocol rewards meaningful participation.

**The Future of Engage-to-Earn & Learn-to-Earn**

Built on Solana's high-performance blockchain, Engage Protocol delivers instant rewards, low transaction costs, and a seamless user experience that makes Web3 accessible to everyone.

## The Problem

### Current State of Engagement & Learning
- **Low Engagement**: Traditional platforms struggle to maintain user motivation
- **No Real Rewards**: Users engage but receive nothing tangible in return
- **Creator Monetization**: Content creators lack sustainable revenue streams
- **Web2 Limitations**: Centralized platforms control user data and rewards
- **Isolated Communities**: No cross-platform incentives or interoperability

### Market Opportunity
- **$250B+ Global EdTech Market** growing at 16% annually
- **Social Media Engagement** market worth $150B+
- **Web3 Social & Education** next frontier with $50B+ potential
- **Token-Gated Communities** creating new engagement models

## The Solution

### Engage Protocol: Multi-Dimensional Engagement Platform

Engage Protocol combines **campaign raffles**, **gamified quizzes**, **NFT creation**, and **community guilds** to create the most comprehensive engagement platform in Web3.

**Core Value Proposition:**
- **Engage to Earn**: Complete campaigns and earn raffle tickets for prizes
- **Learn to Earn**: Take quizzes and earn SOL rewards based on performance
- **Create to Earn**: Mint NFT quizzes and earn royalties from players
- **Build to Earn**: Join guilds, contribute to treasuries, win battles together

## Key Features

### Campaign & Raffle System
The heart of Engage Protocol's engagement mechanics:

- **Partner Campaigns**: Protocols and brands create campaigns with token/NFT prizes
- **Unlimited Ticket Earning**: More interactions = more tickets = better odds
- **Multiple Actions**: Follow, like, retweet, reply to earn tickets
- **Real-time Tracking**: Live leaderboards show your rank and ticket count
- **Transparent Results**: On-chain winner selection (coming soon)
- **Active Partners**: Phantom, Jupiter, Magic Eden, Raydium, Metaplex, Orca

**How It Works:**
```
Join Campaign → Complete Social Actions → Earn Tickets →
Repeat for More Tickets → Wait for Drawing → Win Prizes
```

### Quiz & Learning System

Learn about blockchain, DeFi, NFTs, and Web3 while earning real SOL rewards:

**Solo Quiz Mode:**
- **Entry Fee**: 0.001 SOL minimum (affordable for everyone)
- **Multiple Topics**: Blockchain Fundamentals, Web3 Gaming, Layer 2, DeFi, NFTs
- **Time Limit**: 1 hour to complete each quiz
- **On-Chain Rewards**: Instant settlement via Solana smart contract

**Reward Structure:**
- **0-1 correct answers**: Entry fee goes to vault (try again!)
- **2 correct answers**: Entry fee refunded + 5-25% bonus
- **3 correct answers**: Entry fee refunded + 10-90% bonus
- **All correct**: Maximum bonus reward!

**Quiz Topics Available:**
- Blockchain Fundamentals
- Web3 Gaming & Metaverse
- Layer 2 Solutions & Scaling
- DeFi Protocols & Strategies
- NFT Standards & Marketplaces
- Solana Ecosystem Deep Dive

### NFT Minting & Creator Economy

Empower creators with tools to monetize educational content:

- **Simple NFT Creation**: Mint directly on Solana Devnet
- **Quiz NFTs**: Create educational quizzes as tradable NFTs
- **Automatic Royalties**: EIP-2981 standard for creator earnings
- **Play-to-Earn**: Players pay to take quiz, creators earn royalties
- **Metaplex Integration**: Industry-standard NFT infrastructure
- **Achievement Badges**: On-chain proof of learning milestones

**Creator Revenue Model:**
```
Create Quiz → Mint as NFT → Set Play Fee →
Users Play Quiz → Earn Royalties → Track Performance
```

### Guild System

Build communities and compete together:

- **Guild Creation**: Form guilds with friends or community members
- **Shared Treasury**: Pool SOL for guild battles and rewards
- **Guild Battles**: Challenge other guilds in quiz competitions
- **Collaborative Rewards**: Win together, share rewards together
- **Member Management**: Track contributions and achievements
- **Reputation System**: Build guild reputation through victories

### Social Integration

Native integration with popular Web3 social platforms:

- **Twitter/X OAuth**: Verified identity and profile linking
- **Farcaster Frames**: Native Frame SDK for viral social quizzes
- **Action Tracking**: Automatic follow, like, retweet, reply detection
- **Profile System**: Social reputation across all platforms
- **Engagement Analytics**: Track your social impact

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│         React + TypeScript + Tailwind CSS + Framer          │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐    ┌──────▼──────┐    ┌───────▼────────┐
│  TanStack     │    │   Solana    │    │    Hono        │
│  Router +     │    │   Web3.js   │    │    Backend     │
│  React Query  │    │   Metaplex  │    │   (Vercel)     │
└───────────────┘    └─────────────┘    └────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐    ┌──────▼──────┐    ┌───────▼────────┐
│   Quiz Game   │    │   NFT Mint  │    │  Twitter/X     │
│   Contract    │    │   Program   │    │   OAuth API    │
│  (Solana)     │    │  (Metaplex) │    │   Proxy        │
└───────────────┘    └─────────────┘    └────────────────┘
```

### Technical Stack

```
Frontend: React 18 + TypeScript + Vite
Routing: TanStack React Router v1.87
State: React Query 5.45 + React Context
UI: Tailwind CSS 4 + Framer Motion 11
Blockchain: Solana Web3.js + Metaplex JS
Wallets: Phantom, Solflare, Torus, Ledger
Backend: Hono (Modern Web Server)
Deployment: Vercel + Railway
Smart Contracts: Anchor Framework + Rust
Network: Solana Devnet/Testnet
```

## Smart Contracts

### Quiz Game Contract

Deployed on Solana Devnet: `2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk`

**Core Functions:**

```rust
// Initialize game state and vault
initialize(ctx: Context<Initialize>)

// Start quiz with SOL entry fee
start_quiz(ctx: Context<StartQuiz>, quiz_id: String, user_answer: u64)

// Complete quiz and claim rewards
complete_quiz(ctx: Context<CompleteQuiz>, final_answer: u64)

// Authority functions
withdraw(ctx: Context<Withdraw>, amount: u64)
update_vault(ctx: Context<UpdateVault>)
fund_vault(ctx: Context<FundVault>)
```

**State Management:**

```rust
GameState {
  authority: Pubkey,        // Admin address
  vault: Pubkey,           // Reward distribution vault
  total_games: u64,        // Total quizzes played
  total_rewards: u64,      // Total SOL distributed
}

QuizSession {
  active: bool,            // Session status
  user_answer: u64,        // User's submitted answer
  amount_paid: u64,        // Entry fee in lamports
  timestamp: i64,          // Session start time
  quiz_id: String,         // Quiz identifier
  user: Pubkey,           // Player address
}
```

**Reward Mechanics:**

- Perfect score (3+ correct): 10-90% bonus
- Good score (2+ correct): 5-25% bonus
- Poor score (0-1 correct): Entry fee to vault
- Minimum entry: 0.001 SOL (1,000,000 lamports)
- Time limit: 1 hour per session

### Future Contracts

**QuizDuel.sol** - PvP Quiz Battles
```
- Commit-reveal scheme for fair play
- Escrow entry fees
- Winner-takes-all reward distribution
- Topic-based matchmaking
```

**GuildSystem.sol** - Community Management
```
- Guild creation and treasury
- Member management
- Guild-vs-Guild battles
- Reward distribution
```

**QuizNFT.sol** - Creator Economy
```
- NFT quiz creation
- EIP-2981 royalty standards
- Play-to-earn mechanics
- Creator analytics
```

## User Flows

### 1. Campaign Engagement Flow
```
Connect Wallet → View Active Campaigns → Join Campaign →
Complete Social Actions (Follow/Like/Retweet/Reply) →
Earn More Tickets → Check Leaderboard → Win Prizes
```

### 2. Quiz Learning Flow
```
Select Quiz Topic → Pay Entry Fee (0.001 SOL) →
Answer Questions → Submit Answers → View Score →
Receive SOL Reward (Based on Performance)
```

### 3. NFT Creation Flow
```
Connect Solana Wallet → Create Quiz Content →
Set Play Fee & Royalty % → Mint as NFT →
Users Play → Earn Royalties
```

### 4. Guild Participation Flow
```
Create/Join Guild → Contribute to Treasury →
Participate in Guild Battles → Win Battles →
Share Rewards → Build Guild Reputation
```

## Quick Start

### For Users

1. **Visit the Platform**: https://dailywiser-solana.vercel.app/
2. **Connect Wallet**: Use Phantom, Solflare, or any Solana wallet
3. **Link Social Account**: Connect Twitter/X for campaign participation
4. **Start Engaging**:
   - Join campaigns and earn raffle tickets
   - Take quizzes and earn SOL rewards
   - Mint NFTs and build your collection
   - Join guilds and compete with friends

### For Developers

```bash
# Clone repository
git clone https://github.com/your-org/engage-protocol.git
cd engage-protocol

# Install dependencies
pnpm install

# Environment setup
cp .env.example .env.local
# Configure your environment variables:
# - VITE_SOLANA_RPC_URL
# - VITE_QUIZ_GAME_PROGRAM_ID
# - VITE_BACKEND_URL

# Run development server
pnpm dev

# Smart Contract Development
cd contracts
anchor build
anchor test
anchor deploy --provider.cluster devnet
```

### Environment Variables

```bash
# Frontend
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_QUIZ_GAME_PROGRAM_ID=2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk
VITE_BACKEND_URL=https://your-backend.vercel.app

# Backend (Hono)
X_CLIENT_ID=your_twitter_client_id
X_CLIENT_SECRET=your_twitter_client_secret
X_REDIRECT_URI=http://localhost:5173/twitter
CEREBRAS_API_KEY=your_cerebras_api_key
```

## Competitive Advantages

### Why Engage Protocol Wins

1. **Multi-Reward System**: Campaigns, quizzes, NFTs, guilds - multiple ways to earn
2. **Unlimited Engagement**: No caps on ticket earning or interactions
3. **Instant Rewards**: Solana's sub-second finality enables real-time payouts
4. **Low Barrier to Entry**: 0.001 SOL minimum makes it accessible to everyone
5. **Social Integration**: Native Twitter/X and Farcaster support
6. **Creator Economy**: NFT quizzes with automatic royalty distribution
7. **Community Features**: Guilds and collaborative competition
8. **Transparent**: On-chain verification and reward distribution

### Market Positioning

- **Target Audience**: Web3 enthusiasts, crypto learners, content creators, protocol communities
- **Geographic Focus**: Global with emphasis on emerging Web3 markets
- **Revenue Model**: Platform fees, campaign creation fees, NFT marketplace fees
- **Growth Strategy**: Viral social features + partnership campaigns

## Roadmap

### Phase 1: Foundation (Q1 2024) ✅
- [x] Campaign raffle system
- [x] Solo quiz platform with Solana integration
- [x] NFT minting on Solana Devnet
- [x] Twitter/X OAuth integration
- [x] Farcaster Frame support
- [x] Basic leaderboards

### Phase 2: Social & Competition (Q2 2024)
- [ ] PvP Quiz Duels with on-chain escrow
- [ ] Guild system with shared treasuries
- [ ] Advanced campaign analytics
- [ ] Mobile-responsive design improvements
- [ ] Multiple wallet support expansion

### Phase 3: Scale & Monetization (Q3 2024)
- [ ] Mainnet deployment
- [ ] Creator marketplace for quiz NFTs
- [ ] Advanced AI-powered quiz generation
- [ ] Cross-platform campaign support
- [ ] Partnership with major Solana protocols

### Phase 4: Ecosystem & DAO (Q4 2024)
- [ ] DAO governance implementation
- [ ] Community-driven campaign creation
- [ ] Cross-chain reward distribution
- [ ] Enterprise solutions for protocols
- [ ] Engage Protocol token launch

### Phase 5: Future Vision (2025+)
- [ ] Engage Academy: Educational content marketplace
- [ ] AI-powered learning assistants
- [ ] Metaverse integration
- [ ] Multi-chain expansion
- [ ] Global protocol partnerships

## Contributing

We welcome contributions from the community! Whether you're a developer, designer, educator, or Web3 enthusiast, there's a place for you in Engage Protocol.

### Ways to Contribute

- **Code**: Submit PRs for bug fixes, features, or improvements
- **Content**: Create quiz content for the platform
- **Design**: Improve UI/UX and user flows
- **Testing**: Test features and report bugs
- **Documentation**: Improve docs and tutorials
- **Community**: Help users and grow the community

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) for details

## Contact & Community

- **Website**: https://dailywiser-solana.vercel.app/
- **GitHub**: https://github.com/your-org/engage-protocol
- **Twitter**: Coming soon
- **Discord**: Coming soon
- **Email**: Coming soon

## Acknowledgments

Built with love for the Solana ecosystem. Special thanks to:

- Solana Foundation for the incredible blockchain infrastructure
- Metaplex for NFT standards and tools
- Phantom, Solflare, and other wallet providers
- The Web3 education and social communities

---

**Engage Protocol** - Where engagement meets earnings, and learning becomes rewarding.
