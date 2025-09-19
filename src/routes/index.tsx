import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from "../components/Header";
import { CampaignCard } from "../components/CampaignCard";
import { WinnerModal } from "../components/WinnerModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Filter, Users, Trophy, TrendingUp } from "../components/icons";
import { mockCampaigns, getUserCampaignParticipation } from "../data/mockCampaigns";

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "finished">("all");
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  // Use real wallet connection state
  const wallet = useWallet();
  const isWalletConnected = wallet.connected;

  // Mock winner data
  const mockWinner = {
    campaignName: "Solana Summer Giveaway",
    prize: "100 SOL",
    prizeValue: "$2,400 USD",
    walletAddress: "8kF7xR9mQ2vN3pL6wY4hZ1tB5sC9dE2fG3hJ6kL7mN8pQ",
    transactionId: "5KJc9Y8qVgXhR2mN4pL7wB6sF3nH8jK9mQ1xZ5vC7bN2E",
    claimed: false,
  };

  const filteredCampaigns = mockCampaigns.filter((campaign: any) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.partner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeCampaigns = mockCampaigns.filter((c: any) => c.status === "active").length;
  const totalParticipants = mockCampaigns.reduce((total: number, campaign: any) => total + campaign.participants, 0);
  const totalPrizeValue = "$6,850+"; // Based on current crypto prices

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Win Big on{" "}
              <span className="text-primary">
                Solana
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              🚀 <strong>Revolutionary engagement protocol!</strong> Join campaigns and interact with 
              <strong> ALL protocol posts</strong> throughout the campaign period for unlimited raffle tickets!
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-success/20 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">{activeCampaigns}</p>
                  <p className="text-sm text-muted-foreground">Active Raffles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">{totalParticipants.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">{totalPrizeValue}</p>
                  <p className="text-sm text-muted-foreground">In Prizes</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* My Raffle Tickets Overview */}
      <section className="container mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            🎫 My Raffle Tickets Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-primary mb-2">56</div>
              <div className="text-sm text-muted-foreground">Total Active Tickets</div>
              <div className="text-xs text-primary/70 mt-1">15+23+18 tickets earned</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-success mb-2">4</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
              <div className="text-xs text-success/70 mt-1">Still earning tickets</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-warning mb-2">2</div>
              <div className="text-sm text-muted-foreground">Results Pending</div>
              <div className="text-xs text-warning/70 mt-1">Winners announced soon</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Keep engaging with protocol posts to earn more tickets! Each interaction counts.
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="container mx-auto px-4 pb-16">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns or partners..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-gradient-primary" : ""}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              onClick={() => setFilterStatus("active")}
              className={filterStatus === "active" ? "bg-gradient-primary" : ""}
            >
              Active
              <Badge className="ml-2 bg-success/20 text-success border-success/30">
                {activeCampaigns}
              </Badge>
            </Button>
            <Button
              variant={filterStatus === "finished" ? "default" : "outline"}
              onClick={() => setFilterStatus("finished")}
              className={filterStatus === "finished" ? "bg-gradient-primary" : ""}
            >
              Finished
            </Button>
          </div>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isWalletConnected={isWalletConnected}
                userHasJoined={getUserCampaignParticipation(campaign.id)} // Fixed participation data
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </section>

      {/* Winner Modal */}
      <WinnerModal
        isOpen={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        winner={mockWinner}
      />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})