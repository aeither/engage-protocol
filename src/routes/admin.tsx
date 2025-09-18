import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Calendar, Users, Trophy } from "../components/icons";
import { useToast } from "../hooks/use-toast";
import { mockCampaigns, type Campaign } from "../data/mockCampaigns";
import { Header } from "../components/Header";

function AdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    partner: "",
    prize: "",
    prizeValue: "",
    maxParticipants: "",
    durationDays: "7",
  });

  const handleCreateCampaign = () => {
    if (!formData.name || !formData.partner || !formData.prize || !formData.prizeValue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(formData.durationDays));

    const newCampaign: Campaign = {
      id: (campaigns.length + 1).toString(),
      name: formData.name,
      partner: formData.partner,
      prize: formData.prize,
      prizeValue: formData.prizeValue,
      status: "active",
      endDate,
      participants: 0,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
    };

    setCampaigns([newCampaign, ...campaigns]);
    
    toast({
      title: "Campaign Created! ✨",
      description: `${formData.name} campaign is now live`,
    });

    // Reset form
    setFormData({
      name: "",
      partner: "",
      prize: "",
      prizeValue: "",
      maxParticipants: "",
      durationDays: "7",
    });
    
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case "finished":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Finished</Badge>;
      case "claimed":
        return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">Claimed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage lottery campaigns and monitor performance</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Solana Summer Giveaway"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner">Partner/Sponsor *</Label>
                  <Input
                    id="partner"
                    placeholder="e.g. Phantom Wallet"
                    value={formData.partner}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, partner: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prize">Prize *</Label>
                    <Input
                      id="prize"
                      placeholder="e.g. 100 SOL"
                      value={formData.prize}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prize: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeValue">Value *</Label>
                    <Input
                      id="prizeValue"
                      placeholder="e.g. $2,400 USD"
                      value={formData.prizeValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prizeValue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      placeholder="Optional"
                      value={formData.maxParticipants}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={formData.durationDays} onValueChange={(value: string) => setFormData({ ...formData, durationDays: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleCreateCampaign} className="w-full bg-gradient-primary hover:opacity-90">
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/20 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {campaigns.reduce((total, campaign) => total + campaign.participants, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="glass-card">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">All Campaigns</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {campaign.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{campaign.partner}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{campaign.prize}</p>
                        <p className="text-sm text-muted-foreground">{campaign.prizeValue}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {campaign.participants}
                      {campaign.maxParticipants && ` / ${campaign.maxParticipants}`}
                    </TableCell>
                    <TableCell className="text-white">{formatDate(campaign.endDate)}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})