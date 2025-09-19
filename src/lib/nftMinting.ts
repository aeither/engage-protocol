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
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new NFTMintingError('Wallet not connected or missing required capabilities');
  }

  console.log("🚀 Starting NFT mint process...");
  console.log("📍 Wallet address:", wallet.publicKey.toBase58());
  console.log("🌐 Connection endpoint:", connection.rpcEndpoint);
  
  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet));

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