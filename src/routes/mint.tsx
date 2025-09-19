import { Metaplex, walletAdapterIdentity, toBigNumber } from '@metaplex-foundation/js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { Header } from "../components/Header";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";

function MintNFTPage() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  
  const [mintedNFT, setMintedNFT] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [nftData, setNftData] = useState({
    name: "Test NFT",
    symbol: "TST", 
    description: "Devnet NFT Mint Test",
  });

  const handleMint = async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      console.log("🚀 Starting NFT mint process...");
      console.log("📍 Wallet address:", wallet.publicKey.toBase58());
      console.log("🌐 Connection endpoint:", connection.rpcEndpoint);
      
      // Create Metaplex instance for devnet
      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet));

      console.log("📤 Uploading metadata...");
      // Upload minimal metadata (required for Metaplex NFTs)
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: nftData.name,
        symbol: nftData.symbol,
        description: nftData.description,
        image: "", // Required property, can be empty for test
        attributes: [],
        properties: {},
      });

      console.log("📋 Metadata URI:", uri);

      console.log("🎨 Creating NFT...");
      // Create NFT - capture the full response object
      const { nft, response } = await metaplex.nfts().create({
        uri,
        name: nftData.name,
        symbol: nftData.symbol,
        sellerFeeBasisPoints: 0, // 0% royalties
        maxSupply: toBigNumber(1),
      });

      // Log all the important details for debugging
      console.log("✅ NFT Created Successfully!");
      console.log("🎯 NFT Mint Address:", nft.mint.address.toBase58());
      console.log("📝 Transaction Signature:", response.signature);
      console.log("🔗 Full Response Object:", response);
      console.log("🎨 Full NFT Object:", nft);

      setMintedNFT(nft.mint.address.toBase58());
      setTransactionSignature(response.signature);
      
      toast({
        title: "✅ NFT Minted Successfully!",
        description: `NFT minted at: ${nft.mint.address.toBase58()}`,
      });

    } catch (error) {
      console.error("❌ NFT minting error:", error);
      console.error("🔍 Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Minting failed: ${errorMessage}`);
      
      toast({
        title: "❌ Minting Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetMint = () => {
    setMintedNFT(null);
    setTransactionSignature(null);
    setError("");
    setNftData({
      name: "Test NFT",
      symbol: "TST",
      description: "Devnet NFT Mint Test",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">NFT</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mint NFT on Solana Devnet</h1>
              <p className="text-sm text-muted-foreground">
                Create a test NFT on Solana devnet using Metaplex standard
              </p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Wallet Status:</span>
              <Badge variant={wallet.connected ? "default" : "outline"}>
                {wallet.connected ? "✅ Connected" : "❌ Not Connected"}
              </Badge>
              {wallet.connected && wallet.publicKey && (
                <code className="text-xs bg-muted/20 px-2 py-1 rounded">
                  {wallet.publicKey.toBase58().slice(0, 8)}...{wallet.publicKey.toBase58().slice(-8)}
                </code>
              )}
            </div>
            <WalletMultiButton />
          </div>

          {/* Network Info */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <div className="text-blue-400 font-medium mb-2">Network Information</div>
            <div className="text-sm text-blue-300 space-y-1">
              <div><strong>Network:</strong> Solana Devnet</div>
              <div><strong>RPC Endpoint:</strong> {connection.rpcEndpoint}</div>
              <div><strong>Standard:</strong> Metaplex NFT</div>
              <div><strong>Cost:</strong> Free (testnet)</div>
            </div>
          </div>

          {/* Debug Panel */}
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
            <div className="text-yellow-400 font-medium mb-2">Debug Information</div>
            <div className="text-sm text-yellow-300 space-y-1">
              <div><strong>Wallet Connected:</strong> {wallet.connected ? "✅ Yes" : "❌ No"}</div>
              <div><strong>Wallet Public Key:</strong> {wallet.publicKey ? wallet.publicKey.toBase58() : "Not available"}</div>
              <div><strong>Can Sign Transactions:</strong> {wallet.signTransaction ? "✅ Yes" : "❌ No"}</div>
              <div><strong>Connection Status:</strong> {connection ? "✅ Connected" : "❌ Not connected"}</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
              <div className="text-red-400 font-medium">Error</div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          {/* NFT Configuration */}
          {!mintedNFT && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">NFT Configuration</h2>
                
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="nft-name" className="block text-sm font-medium text-white mb-2">Name</label>
                    <input
                      id="nft-name"
                      type="text"
                      value={nftData.name}
                      onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-muted/10 border border-muted rounded-lg text-white"
                      placeholder="Enter NFT name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nft-symbol" className="block text-sm font-medium text-white mb-2">Symbol</label>
                    <input
                      id="nft-symbol"
                      type="text"
                      value={nftData.symbol}
                      onChange={(e) => setNftData(prev => ({ ...prev, symbol: e.target.value }))}
                      className="w-full p-3 bg-muted/10 border border-muted rounded-lg text-white"
                      placeholder="Enter NFT symbol"
                      maxLength={10}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nft-description" className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      id="nft-description"
                      value={nftData.description}
                      onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-muted/10 border border-muted rounded-lg text-white"
                      placeholder="Enter NFT description"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleMint}
                    disabled={!wallet.connected || isLoading || !nftData.name.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Minting NFT...
                      </div>
                    ) : (
                      'Mint NFT on Devnet'
                    )}
                  </Button>
                  
                  {!wallet.connected && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Connect your wallet to start minting
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {mintedNFT && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✅</span>
                <h2 className="text-lg font-semibold text-white">NFT Minted Successfully!</h2>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                  <div className="text-green-400 font-medium mb-2">NFT Details</div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {nftData.name}</div>
                    <div><strong>Symbol:</strong> {nftData.symbol}</div>
                    <div><strong>Description:</strong> {nftData.description}</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                  <div className="text-blue-400 font-medium mb-2">Mint Address</div>
                  <div className="text-xs text-blue-300 font-mono bg-black/20 p-2 rounded break-all">
                    {mintedNFT}
                  </div>
                  <div className="mt-2">
                    <a 
                      href={`https://explorer.solana.com/address/${mintedNFT}?cluster=devnet`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-sm"
                    >
                      View NFT on Solana Explorer (Devnet)
                    </a>
                  </div>
                </div>

                {transactionSignature && (
                  <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                    <div className="text-purple-400 font-medium mb-2">Transaction Signature</div>
                    <div className="text-xs text-purple-300 font-mono bg-black/20 p-2 rounded break-all">
                      {transactionSignature}
                    </div>
                    <div className="mt-2">
                      <a 
                        href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline text-sm"
                      >
                        View Transaction on Solana Explorer (Devnet)
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={resetMint} variant="outline">
                  Mint Another NFT
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/mint')({
  component: MintNFTPage,
});