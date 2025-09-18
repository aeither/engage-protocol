export interface Campaign {
  id: string;
  name: string;
  partner: string;
  prize: string;
  prizeValue: string;
  status: "active" | "finished" | "claimed";
  endDate: Date;
  participants: number;
  maxParticipants?: number;
  tweetId?: string;
  description?: string;
  requirements?: string[];
  ticketsEarned?: number;
  userRegistered?: boolean;
  winner?: {
    address: string;
    displayName: string;
    tickets: number;
    claimedAt?: Date;
  };
}

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Solana Summer Giveaway",
    partner: "Phantom Wallet",
    prize: "10 SOL",
    prizeValue: "$2,505 USD",
    status: "active",
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    participants: 127,
    maxParticipants: 500,
    tweetId: "1738901234567890123",
    description: "Win 10 SOL by engaging with Phantom Wallet throughout the campaign! Follow once, then interact with ALL their posts during the campaign period for unlimited tickets.",
    requirements: ["Follow @phantom", "Follow @engageprotocol", "Engage with any Phantom posts", "Like, retweet, reply to multiple posts", "More interactions = more tickets!"],
    ticketsEarned: 15, // Higher numbers due to multi-post interactions
    userRegistered: true,
  },
  {
    id: "2",
    name: "Jupiter DEX Launch",
    partner: "Jupiter Exchange",
    prize: "JUP Token Airdrop",
    prizeValue: "2,000 JUP (~$1,142)",
    status: "active",
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    participants: 89,
    maxParticipants: 200,
    tweetId: "1738901234567890124",
    description: "Celebrate Jupiter's latest DEX features! Engage with ALL Jupiter posts throughout the campaign to maximize your JUP token chances.",
    requirements: ["Follow @JupiterExchange", "Follow @engageprotocol", "Interact with multiple Jupiter posts", "Like, retweet, reply to any Jupiter content", "Continuous engagement rewarded"],
    ticketsEarned: 23, // Active engagement with multiple posts
    userRegistered: true,
  },
  {
    id: "3",
    name: "Magic Eden NFT Drop",
    partner: "Magic Eden",
    prize: "Rare DeGods NFT",
    prizeValue: "2 SOL (~$501)",
    status: "finished",
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    participants: 156,
    maxParticipants: 300,
    tweetId: "1738901234567890125",
    description: "Win an exclusive DeGods NFT from Magic Eden's latest collection reveal!",
    requirements: ["Follow @MagicEden", "Follow @engageprotocol", "Like the tweet", "Retweet", "Reply with favorite trait"],
    ticketsEarned: 12,
    userRegistered: true,
    winner: {
      address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      displayName: "@cryptowhale_nft",
      tickets: 47,
      claimedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  },
  {
    id: "4",
    name: "Raydium LP Rewards",
    partner: "Raydium",
    prize: "RAY Token Bundle",
    prizeValue: "500 RAY (~$750)",
    status: "active",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    participants: 67,
    maxParticipants: 150,
    tweetId: "1738901234567890126",
    description: "Join Raydium's liquidity provider celebration! Engage for your chance to win RAY tokens.",
    requirements: ["Follow @RaydiumProtocol", "Follow @engageprotocol", "Like the tweet", "Retweet"],
    ticketsEarned: 0,
    userRegistered: false,
  },
  {
    id: "5",
    name: "Metaplex Creator Rewards",
    partner: "Metaplex",
    prize: "Creator Fund Grant",
    prizeValue: "4 SOL (~$1,002)",
    status: "active",
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    participants: 34,
    maxParticipants: 100,
    tweetId: "1738901234567890127",
    description: "Support Metaplex creators! Engage with all Metaplex posts during the campaign to win SOL for your NFT project.",
    requirements: ["Follow @metaplex", "Follow @engageprotocol", "Engage with creator posts", "Share your project ideas in replies", "Multiple interactions = more chances"],
    ticketsEarned: 18, // Multiple creator post interactions
    userRegistered: true,
  },
  {
    id: "6",
    name: "Orca Whale Pool",
    partner: "Orca",
    prize: "ORCA Token Rewards",
    prizeValue: "300 ORCA (~$450)",
    status: "finished",
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    participants: 76,
    maxParticipants: 150,
    tweetId: "1738901234567890128",
    description: "Dive into Orca's latest AMM features! Past campaign winner announced.",
    requirements: ["Follow @orca_so", "Follow @engageprotocol", "Like the tweet", "Retweet"],
    ticketsEarned: 0,
    userRegistered: false,
    winner: {
      address: "5fNfvyp5czQVX77yoACa3JJVEhdRaWjPuazuWgjhTqEH", 
      displayName: "@defi_orca_fan",
      tickets: 31,
      claimedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  },
];

// Helper functions for campaign management
export const getActiveCampaigns = () => mockCampaigns.filter(c => c.status === "active");
export const getFinishedCampaigns = () => mockCampaigns.filter(c => c.status === "finished");
export const getUserCampaigns = (userRegistered: boolean) => mockCampaigns.filter(c => c.userRegistered === userRegistered);
export const getCampaignById = (id: string) => mockCampaigns.find(c => c.id === id);

// Mock user data
export interface UserTickets {
  campaignId: string;
  campaignName: string;
  tickets: number;
  actions: {
    like: boolean;
    retweet: boolean;
    reply: boolean;
    quote: boolean;
  };
  lastUpdated: Date;
}

export const mockUserTickets: UserTickets[] = [
  {
    campaignId: "1",
    campaignName: "Solana Summer Giveaway",
    tickets: 15, // Join (1) + Follow (1) + Multiple post interactions: 5 likes (5) + 3 retweets (3) + 3 replies (6) = 15
    actions: { like: true, retweet: true, reply: true, quote: false },
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    campaignId: "2",
    campaignName: "Jupiter DEX Launch",
    tickets: 23, // Join (1) + Follow (1) + Active multi-post engagement: 8 likes (8) + 6 retweets (6) + 4 replies (8) = 23  
    actions: { like: true, retweet: true, reply: true, quote: true },
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    campaignId: "5",
    campaignName: "Metaplex Creator Rewards",
    tickets: 18, // Join (1) + Follow (1) + Creator engagement: 6 likes (6) + 4 retweets (4) + 3 project replies (6) = 18
    actions: { like: true, retweet: true, reply: true, quote: false },
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
];

export const getTotalUserTickets = () => 
  mockUserTickets.reduce((total, campaign) => total + campaign.tickets, 0);

export const getUserTicketsForCampaign = (campaignId: string) =>
  mockUserTickets.find(t => t.campaignId === campaignId);