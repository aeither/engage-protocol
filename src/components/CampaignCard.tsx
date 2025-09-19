import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Clock, Users, ExternalLink, Ticket, Twitter, Heart, Repeat, MessageCircle, Trophy } from "./icons";
import { useToast } from "../hooks/use-toast";
import type { Campaign } from "../data/mockCampaigns";
import { openPartnerTwitter, getPartnerTwitterHandle } from "../data/mockCampaigns";

interface CampaignCardProps {
  campaign: Campaign;
  isWalletConnected: boolean;
  userHasJoined: boolean;
}

export function CampaignCard({ campaign, isWalletConnected, userHasJoined }: CampaignCardProps) {
  const [isJoined, setIsJoined] = useState(userHasJoined);
  const [showDetails, setShowDetails] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleJoinCampaign = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to join campaigns",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    
    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsJoined(true);
    setIsJoining(false);
    
    toast({
      title: "Welcome to the Raffle! 🎉",
      description: `You earned 1 ticket for joining! Now interact with ALL ${campaign.partner} posts during the campaign for unlimited tickets!`,
    });
    
    // Show additional reward toast after a delay
    setTimeout(() => {
      toast({
        title: "🚀 Innovation Unlocked!",
        description: "Unlike other platforms - interact with ANY post from this protocol to earn more tickets!",
      });
    }, 2000);
  };

  const handleVerifyAction = (action: string) => {
    const ticketCount = action.includes("+2") ? 2 : 1;
    toast({
      title: "Ticket Earned! 🎫",
      description: `${action} - You earned ${ticketCount} raffle ticket${ticketCount > 1 ? 's' : ''}!`,
    });
    // In a real app, you'd update the campaign.ticketsEarned here
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case "active":
        return <Badge className="bg-success/20 text-success border-success/30">🟢 Active</Badge>;
      case "finished":
        return <Badge className="bg-warning/20 text-warning border-warning/30">🟡 Finished</Badge>;
      case "claimed":
        return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">🔒 Claimed</Badge>;
    }
  };

  const getTimeRemaining = () => {
    if (campaign.status === "finished") return "Ended";
    
    const now = new Date();
    const diff = campaign.endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getProgressPercentage = () => {
    if (!campaign.maxParticipants) return 0;
    return (campaign.participants / campaign.maxParticipants) * 100;
  };

  return (
    <>
      <Card className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col" onClick={() => setShowDetails(true)}>
        <div className="space-y-4 flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">by {campaign.partner}</p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Prize */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <p className="font-bold text-accent">{campaign.prize}</p>
            <p className="text-sm text-muted-foreground">{campaign.prizeValue}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-white">{getTimeRemaining()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-white">{campaign.participants.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress Bar */}
          {campaign.maxParticipants && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Participants</span>
                <span>{campaign.participants}/{campaign.maxParticipants}</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          )}

          {/* User Tickets */}
          {isJoined && campaign.ticketsEarned && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  <span className="text-base font-bold text-primary">
                    {campaign.ticketsEarned} Tickets
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    Multi-post
                  </span>
                  {campaign.status === "active" && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 mb-2">
                <div className="text-xs text-center text-primary/90 font-medium mb-1">Your Current Position</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{width: `${campaign.userStats?.percentile || Math.min((campaign.ticketsEarned / 30) * 100, 100)}%`}}></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rank: #{campaign.userStats?.rank || 'N/A'}</span>
                  <span>Top {campaign.userStats?.percentile || Math.floor((campaign.ticketsEarned || 0) / 30 * 100)}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-2">
                  <span>• Follow: {campaign.userStats?.actions.follows || 1} ticket ✓</span>
                  <span>• Likes: {campaign.userStats?.actions.likes || Math.floor((campaign.ticketsEarned || 0) / 3)} posts</span>
                  <span>• Retweets: {campaign.userStats?.actions.retweets || Math.floor((campaign.ticketsEarned || 0) / 4)} posts</span>
                  <span>• Replies: {campaign.userStats?.actions.replies || Math.floor((campaign.ticketsEarned || 0) / 5)} posts</span>
                </div>
              </div>
            </div>
          )}

          {/* Winner Display or No Participation Message for Finished Campaigns */}
          {campaign.status === "finished" && !userHasJoined && (
            <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-400/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-medium text-gray-300">Campaign Ended</span>
              </div>
              <div className="text-xs text-center text-gray-400 bg-gray-500/5 rounded-lg p-2">
                💡 You didn't participate in this campaign. Join active campaigns to win prizes!
              </div>
            </div>
          )}

          {/* Winner Display for Finished Campaigns */}
          {campaign.status === "finished" && campaign.winner && userHasJoined && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-base font-bold text-yellow-300">🎉 Winner Announced!</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Winner:</span>
                  <span className="text-sm font-bold text-yellow-200">{campaign.winner.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Winning Tickets:</span>
                  <span className="text-sm font-bold text-primary">{campaign.winner.tickets} tickets</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet:</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {campaign.winner.address.slice(0, 4)}...{campaign.winner.address.slice(-4)}
                  </span>
                </div>
              {campaign.winner.claimedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    ✓ Prize Claimed
                  </span>
                </div>
              )}
              </div>
              {!userHasJoined ? (
                <div className="mt-3 text-xs text-center text-yellow-300/70 bg-yellow-500/5 rounded-lg p-2">
                  💡 You didn't participate in this campaign. Join active campaigns to win!
                </div>
              ) : (
                <div className="mt-3 text-xs text-center text-red-300/70 bg-red-500/5 rounded-lg p-2">
                  😢 You had {campaign.ticketsEarned || 0} tickets but didn't win this time. Keep trying!
                </div>
              )}
            </div>
          )}

        </div>
        
        {/* Action Button - Always at bottom */}
        <div className="mt-4">
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (campaign.status === "active" && !isJoined) {
                handleJoinCampaign();
              } else {
                setShowDetails(true);
              }
            }}
            className={`w-full ${
              campaign.status === "active" && !isJoined
                ? "bg-gradient-primary hover:opacity-90"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            disabled={(campaign.status !== "active" && !isJoined) || isJoining}
          >
            {isJoining
              ? "Joining Raffle..."
              : campaign.status === "active" && !isJoined
              ? "Join Campaign"
              : isJoined
              ? "View Details"
              : campaign.status === "finished"
              ? "Campaign Ended"
              : "Details"
            }
          </Button>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="glass-card max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{campaign.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Partner:</span>
                <span className="text-white font-medium">{campaign.partner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prize:</span>
                <div className="text-right">
                  <p className="text-accent font-bold">{campaign.prize}</p>
                  <p className="text-xs text-muted-foreground">{campaign.prizeValue}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ends:</span>
                <span className="text-white">{campaign.endDate.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            {campaign.description && (
              <div>
                <h4 className="font-semibold text-white mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              </div>
            )}

            {/* Requirements */}
            {campaign.requirements && (
              <div>
                <h4 className="font-semibold text-white mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {campaign.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-success">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Protocol Engagement (if joined and active) */}
            {isJoined && campaign.status === "active" && (
              <div>
                <h4 className="font-semibold text-white mb-3">Keep Earning Throughout Campaign! 🎫</h4>
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-white mb-3">
                    <strong>🚀 Innovative System:</strong> Interact with ALL {campaign.partner} posts during the campaign period!
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-red-500/10 border border-red-300/30 rounded-lg">
                      <Heart className="h-5 w-5 text-red-400 mx-auto mb-1" />
                      <div className="text-xs text-red-300">Like any post</div>
                      <div className="text-xs font-bold text-red-200">+1 ticket</div>
                    </div>
                    <div className="text-center p-2 bg-green-500/10 border border-green-300/30 rounded-lg">
                      <Repeat className="h-5 w-5 text-green-400 mx-auto mb-1" />
                      <div className="text-xs text-green-300">Retweet any post</div>
                      <div className="text-xs font-bold text-green-200">+1 ticket</div>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 border border-blue-300/30 rounded-lg col-span-2">
                      <MessageCircle className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                      <div className="text-xs text-blue-300">Reply to any post</div>
                      <div className="text-xs font-bold text-blue-200">+2 tickets</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openPartnerTwitter(campaign.partner);
                      const twitterHandle = getPartnerTwitterHandle(campaign.partner);
                      toast({
                        title: "Opening Twitter Profile",
                        description: `Visit @${twitterHandle} to interact with their posts and earn tickets!`,
                      });
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300/30"
                  >
                    <ExternalLink className="h-4 w-4 text-purple-400" />
                    <span className="text-xs">Find Posts</span>
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerifyAction("Engagement verified (+tickets)")}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-300/30"
                  >
                    <Ticket className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs">Verify Actions</span>
                  </Button>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-3">
                  <p className="text-xs text-green-200 text-center mb-1">
                    <strong>🎯 Innovation:</strong> No limits on interactions!
                  </p>
                  <p className="text-xs text-green-300/80 text-center">
                    The more you engage with {campaign.partner} posts, the more tickets you earn!
                  </p>
                </div>
              </div>
            )}

            {/* Join Button */}
            {!isJoined && campaign.status === "active" && (
              <Button
                onClick={handleJoinCampaign}
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={!isWalletConnected || isJoining}
              >
                {isJoining
                  ? "Joining..."
                  : !isWalletConnected 
                  ? "Connect Wallet to Join" 
                  : "Join Campaign"
                }
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}