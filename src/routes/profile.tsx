import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Twitter, User, Wallet, Link, Unlink } from "../components/icons";
import { useToast } from "../hooks/use-toast";
import { XOAuthAPI } from "../libs/api";

function ProfilePage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isTwitterLinked, setIsTwitterLinked] = useState(false);
  
  const { toast } = useToast();

  // Check for existing Twitter token and load profile on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('x_access_token');
    if (existingToken) {
      setIsTwitterLinked(true);
      fetchUserProfile(existingToken);
    }
    
    // Load wallet address (you can integrate with your wallet connection here)
    loadWalletAddress();
  }, []);

  const loadWalletAddress = () => {
    // This is a placeholder - integrate with your actual wallet connection
    // For now, we'll use a mock address
    setWalletAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const userData = await XOAuthAPI.getUserProfile(accessToken);
      setUserProfile(userData.data);
      setProfileImage(userData.data.profile_image_url || '');
      setUserName(userData.data.name || '');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "⚠️ Profile Fetch Warning",
        description: "Couldn't load Twitter profile details.",
        variant: "destructive",
      });
    }
  };

  const handleLinkTwitter = () => {
    // Navigate to Twitter linking page
    window.location.href = '/twitter';
  };

  const handleUnlinkTwitter = () => {
    // Remove Twitter token and clear profile data
    localStorage.removeItem('x_access_token');
    setUserProfile(null);
    setProfileImage('');
    setUserName('');
    setIsTwitterLinked(false);
    
    toast({
      title: "✅ Twitter Unlinked",
      description: "Your Twitter account has been unlinked successfully.",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        toast({
          title: "✅ Profile Image Updated",
          description: "Your profile image has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-8">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-white">User Profile</h1>
              <p className="text-sm text-muted-foreground">
                Manage your profile information and connected accounts
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Profile Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {userName || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click image to upload new photo
                  </p>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="p-4 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-white">Wallet Address</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-black/20 p-2 rounded break-all">
                  {walletAddress}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 text-xs"
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                >
                  Copy Address
                </Button>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
              
              {/* Twitter Account */}
              <div className="p-4 bg-muted/10 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Twitter className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-medium text-white">Twitter</h3>
                      <p className="text-sm text-muted-foreground">
                        {isTwitterLinked ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isTwitterLinked ? "default" : "outline"}>
                    {isTwitterLinked ? "✅ Linked" : "❌ Not Linked"}
                  </Badge>
                </div>

                {isTwitterLinked && userProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={userProfile.profile_image_url} 
                        alt="Twitter Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          @{userProfile.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userProfile.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUnlinkTwitter}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Unlink className="w-3 h-3 mr-1" />
                        Unlink Twitter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your Twitter account to link it with your profile
                    </p>
                    <Button 
                      onClick={handleLinkTwitter}
                      size="sm"
                      className="text-xs"
                    >
                      <Link className="w-3 h-3 mr-1" />
                      Link Twitter Account
                    </Button>
                  </div>
                )}
              </div>

              {/* Additional Connected Accounts Placeholder */}
              <div className="p-4 bg-muted/5 rounded-lg border border-dashed border-muted-foreground/20">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    More social accounts coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="mt-8 pt-6 border-t border-muted/20">
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Export Profile Data
              </Button>
              <Button variant="outline" size="sm">
                Privacy Settings
              </Button>
              <Button variant="outline" size="sm">
                Account Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});
