import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trophy, Copy, ExternalLink, Sparkles } from "./icons";
import { useToast } from "../hooks/use-toast";

interface Winner {
  campaignName: string;
  prize: string;
  prizeValue: string;
  walletAddress: string;
  transactionId: string;
  claimed: boolean;
}

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner;
}

export function WinnerModal({ isOpen, onClose, winner }: WinnerModalProps) {
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(winner.walletAddress);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const copyTransaction = () => {
    navigator.clipboard.writeText(winner.transactionId);
    toast({
      title: "Transaction ID Copied",
      description: "Transaction ID copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <Trophy className="h-6 w-6 text-primary" />
            Winner Announcement!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Celebration Animation */}
          <div className="text-center space-y-3">
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-white">Congratulations!</p>
              <p className="text-sm text-muted-foreground">
                You won the {winner.campaignName}
              </p>
            </div>
          </div>

          {/* Prize Details */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
            <Sparkles className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-xl font-bold text-accent">{winner.prize}</p>
            <p className="text-sm text-muted-foreground">{winner.prizeValue}</p>
          </div>

          {/* Winner Details */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Winning Wallet</p>
              <div className="flex items-center gap-2 bg-secondary/20 rounded-lg p-2">
                <span className="font-mono text-white text-sm flex-1">
                  {formatAddress(winner.walletAddress)}
                </span>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://solscan.io/account/${winner.walletAddress}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
              <div className="flex items-center gap-2 bg-secondary/20 rounded-lg p-2">
                <span className="font-mono text-white text-sm flex-1">
                  {formatAddress(winner.transactionId)}
                </span>
                <Button variant="ghost" size="sm" onClick={copyTransaction}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://solscan.io/tx/${winner.transactionId}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Claim Status */}
          <div className="text-center">
            {winner.claimed ? (
              <Badge className="bg-success/20 text-success border-success/30">
                ✓ Prize Claimed
              </Badge>
            ) : (
              <Badge className="bg-warning/20 text-warning border-warning/30">
                ⏳ Awaiting Claim
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(`https://solscan.io/tx/${winner.transactionId}`, '_blank')}
              className="flex-1"
            >
              View on Solscan
            </Button>
            <Button onClick={onClose} className="flex-1 bg-gradient-primary">
              Awesome!
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center">
            Winners are selected using provably fair randomness. 
            All draws are transparent and verifiable.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}