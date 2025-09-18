import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { Header } from "../components/Header";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Trophy, Search, ExternalLink, Copy, Crown, Sparkles } from "../components/icons";
import { useToast } from "../hooks/use-toast";

interface Winner {
  id: string;
  campaignName: string;
  campaignPartner: string;
  prize: string;
  prizeValue: string;
  walletAddress: string;
  xHandle: string;
  winDate: Date;
  transactionId?: string;
  claimed: boolean;
}

// Mock winners data
const mockWinners: Winner[] = [
  {
    id: "1",
    campaignName: "Solana Summer Giveaway",
    campaignPartner: "Phantom Wallet",
    prize: "100 SOL",
    prizeValue: "$2,400 USD",
    walletAddress: "8kF7xR9mQ2vN3pL6wY4hZ1tB5sC9dE2fG3hJ6kL7mN8pQ",
    xHandle: "@cryptoking2024",
    winDate: new Date("2024-01-15"),
    transactionId: "5KJc9Y8qVgXhR2mN4pL7wB6sF3nH8jK9mQ1xZ5vC7bN2E",
    claimed: true,
  },
  {
    id: "2",
    campaignName: "NFT Collection Drop",
    campaignPartner: "Magic Eden",
    prize: "Rare DeGods NFT",
    prizeValue: "15 SOL (~$360)",
    walletAddress: "9mF8sR1nQ4vP2xL5wC6tD7eH9jK3mN8pQ5rS2vX7bM4E",
    xHandle: "@nftcollector",
    winDate: new Date("2024-01-12"),
    transactionId: "6LKd0Z9rVhYiS3oP8xM7nF4gI1jL5mQ9wE2tR6bC8hN3F",
    claimed: true,
  },
  {
    id: "3",
    campaignName: "DeFi Yield Boost",
    campaignPartner: "Jupiter Exchange",
    prize: "JUP Token Airdrop",
    prizeValue: "50,000 JUP (~$2,500)",
    walletAddress: "4nG7sT2pR6xM9wF5eH8jK1mQ3vB6sC9dL7pN8qS4rX2E",
    xHandle: "@defimaster",
    winDate: new Date("2024-01-10"),
    claimed: false,
  },
  {
    id: "4",
    campaignName: "Gaming Tournament Prize",
    campaignPartner: "Star Atlas",
    prize: "ATLAS Token Bundle",
    prizeValue: "100,000 ATLAS (~$500)",
    walletAddress: "7pL9sN3qT6xR8wG5fJ2mK4vC1bH9eS8dM7nQ5tP4rY1F",
    xHandle: "@gamerpro",
    winDate: new Date("2024-01-08"),
    transactionId: "8NqF2X7rWhZjU4oP9yN8mG5gJ2kM6pR0xF3tS7cD9iO4G",
    claimed: true,
  },
  {
    id: "5",
    campaignName: "Community Builder Reward",
    campaignPartner: "Solana Foundation",
    prize: "Solana Hackathon Prize",
    prizeValue: "25 SOL (~$600)",
    walletAddress: "2bH5tF9qW3xP7mR6eK8jL4sC9dG1nM5pQ8vB7fN3rX6E",
    xHandle: "@solanadev",
    winDate: new Date("2024-01-05"),
    claimed: false,
  },
];

function WinnersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "claimed" | "unclaimed">("all");
  const { toast } = useToast();

  const filteredWinners = mockWinners.filter((winner) => {
    const matchesSearch = 
      winner.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.xHandle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.campaignPartner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === "all" || 
      (filter === "claimed" && winner.claimed) || 
      (filter === "unclaimed" && !winner.claimed);
    
    return matchesSearch && matchesFilter;
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const copyTransaction = (txId: string) => {
    navigator.clipboard.writeText(txId);
    toast({
      title: "Transaction ID Copied", 
      description: "Transaction ID copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-primary p-4 rounded-full w-fit mx-auto mb-6 shadow-primary">
            <Crown className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">
            🏆 Winners 🏆
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrate our lucky winners! See who's claimed amazing prizes from our Solana lottery campaigns.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card p-6 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mockWinners.length}</p>
            <p className="text-sm text-muted-foreground">Total Winners</p>
          </Card>
          <Card className="glass-card p-6 text-center">
            <Sparkles className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mockWinners.filter(w => w.claimed).length}</p>
            <p className="text-sm text-muted-foreground">Prizes Claimed</p>
          </Card>
          <Card className="glass-card p-6 text-center">
            <Crown className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">$8,360+</p>
            <p className="text-sm text-muted-foreground">Total Prize Value</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by campaign, X handle, or partner..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-gradient-primary" : ""}
            >
              All Winners
            </Button>
            <Button
              variant={filter === "claimed" ? "default" : "outline"}
              onClick={() => setFilter("claimed")}
              className={filter === "claimed" ? "bg-gradient-primary" : ""}
            >
              Claimed
            </Button>
            <Button
              variant={filter === "unclaimed" ? "default" : "outline"}
              onClick={() => setFilter("unclaimed")}
              className={filter === "unclaimed" ? "bg-gradient-primary" : ""}
            >
              Pending
            </Button>
          </div>
        </div>

        {/* Winners List */}
        <div className="space-y-4">
          {filteredWinners.length > 0 ? (
            filteredWinners.map((winner, index) => (
              <Card key={winner.id} className="glass-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Rank & Trophy */}
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-primary p-3 rounded-full shadow-primary">
                      {index === 0 ? (
                        <Crown className="h-6 w-6 text-white" />
                      ) : (
                        <Trophy className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">#{index + 1}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(winner.winDate)}</p>
                    </div>
                  </div>

                  {/* Winner Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{winner.campaignName}</h3>
                      <p className="text-sm text-muted-foreground">by {winner.campaignPartner}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">X:</span>
                        <span className="font-mono font-medium text-accent">{winner.xHandle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Wallet:</span>
                        <span className="font-mono text-white">{formatAddress(winner.walletAddress)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAddress(winner.walletAddress)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://solscan.io/account/${winner.walletAddress}`, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {winner.transactionId && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">TX:</span>
                        <span className="font-mono text-white">{formatAddress(winner.transactionId)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTransaction(winner.transactionId!)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://solscan.io/tx/${winner.transactionId}`, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Prize & Status */}
                  <div className="text-right space-y-3">
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <p className="font-bold text-accent">{winner.prize}</p>
                      <p className="text-sm text-muted-foreground">{winner.prizeValue}</p>
                    </div>
                    
                    {winner.claimed ? (
                      <Badge className="bg-success/20 text-success border-success/30">
                        ✓ Claimed
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        ⏳ Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No winners found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/winners')({
  component: WinnersPage,
})