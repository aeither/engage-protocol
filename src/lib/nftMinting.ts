import { Metaplex, walletAdapterIdentity, toBigNumber } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface NFTData {
  name: string;
  symbol: string;
  description: string;
}

export interface MintResult {
  mintAddress: string;
  transactionSignature: string;
  nft: any;
}

export class NFTMintingError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'NFTMintingError';
  }
}

export async function mintNFT(
  wallet: WalletContextState,
  connection: Connection,
  nftData: NFTData
): Promise<MintResult> {
  console.log("🔍 NFT Minting Library Debug:");
  console.log("- Wallet object:", wallet);
  console.log("- Wallet connected:", wallet.connected);
  console.log("- Wallet publicKey:", wallet.publicKey?.toBase58());
  console.log("- Wallet signTransaction function:", !!wallet.signTransaction);
  console.log("- Connection:", connection);
  console.log("- NFT Data:", nftData);

  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    const error = `Wallet validation failed: connected=${wallet.connected}, publicKey=${!!wallet.publicKey}, signTransaction=${!!wallet.signTransaction}`;
    console.error("❌ " + error);
    throw new NFTMintingError('Wallet not connected or missing required capabilities: ' + error);
  }

  console.log("🚀 Starting NFT mint process...");
  console.log("📍 Wallet address:", wallet.publicKey.toBase58());
  console.log("🌐 Connection endpoint:", connection.rpcEndpoint);
  
  console.log("🔧 Creating Metaplex instance...");
  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet));
  console.log("✅ Metaplex instance created successfully");

  console.log("📤 Using pre-hosted metadata (temporary hack)...");
  
  let uri: string;
  
  try {
    console.log("⚠️ Upload disabled due to Irys/Bundlr issues");
    uri = "https://api.jsonbin.io/v3/b/68ccc4ad43b1c97be947bfd7";
    console.log("📋 Using fallback metadata URI:", uri);
    
  } catch (uploadError) {
    console.warn("⚠️ Upload failed, using fallback metadata:", uploadError);
    uri = "https://api.jsonbin.io/v3/b/68ccc4ad43b1c97be947bfd7";
    console.log("📋 Using fallback metadata URI:", uri);
  }

  console.log("🎨 Creating NFT...");
  console.log("🔧 NFT Creation Parameters:", {
    uri,
    name: nftData.name,
    symbol: nftData.symbol,
    sellerFeeBasisPoints: 0,
    maxSupply: 1,
  });
  
  try {
    const { nft, response } = await metaplex.nfts().create({
      uri,
      name: nftData.name,
      symbol: nftData.symbol,
      sellerFeeBasisPoints: 0,
      maxSupply: toBigNumber(1),
    });

    console.log("✅ NFT Created Successfully!");
    console.log("🎯 NFT Mint Address:", nft.mint.address.toBase58());
    console.log("📝 Transaction Signature:", response.signature);
    console.log("🔗 Full Response Object:", response);
    console.log("🎨 Full NFT Object:", nft);

    return {
      mintAddress: nft.mint.address.toBase58(),
      transactionSignature: response.signature,
      nft
    };
  } catch (error) {
    console.error("❌ NFT minting error:", error);
    console.error("🔍 Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new NFTMintingError(`Minting failed: ${errorMessage}`, error instanceof Error ? error : undefined);
  }
}

export function getExplorerUrl(address: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

export function getTransactionUrl(signature: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}