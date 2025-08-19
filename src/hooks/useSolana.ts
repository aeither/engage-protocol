import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  SendTransactionError
} from "@solana/web3.js";
import { useCallback, useState, useEffect } from "react";

export const useSolana = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch balance automatically when wallet connects
  useEffect(() => {
    if (publicKey && connection) {
      getBalance();
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  // Get balance
  const getBalance = useCallback(async (address?: PublicKey) => {
    const targetAddress = address || publicKey;
    if (!targetAddress) return null;

    try {
      const balance = await connection.getBalance(targetAddress);
      const solBalance = balance / LAMPORTS_PER_SOL;
      setBalance(solBalance);
      return solBalance;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
    }
  }, [connection, publicKey]);

  // Send SOL (similar to wagmi's useSendTransaction)
  const sendSOL = useCallback(async (
    to: string, 
    amount: number
  ) => {
    if (!publicKey || !sendTransaction) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    try {
      // Validate inputs
      if (!to || to.trim() === '') {
        throw new Error("Invalid recipient address");
      }
      
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Check if we have enough balance
      const currentBalance = await getBalance();
      if (currentBalance !== null && currentBalance < amount) {
        throw new Error(`Insufficient balance. You have ${currentBalance.toFixed(4)} SOL, but need ${amount} SOL`);
      }

      const toPublicKey = new PublicKey(to);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Check minimum transaction amount
      if (lamports < 1000) { // Less than 0.000001 SOL
        throw new Error("Amount too small. Minimum is 0.000001 SOL");
      }

      // Get recent blockhash for the transaction with commitment
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      );

      console.log('Sending transaction:', {
        from: publicKey.toString(),
        to: toPublicKey.toString(),
        amount: amount,
        lamports: lamports
      });

      const signature = await sendTransaction(transaction, connection, {
        maxRetries: 3,
        preflightCommitment: 'processed',
      });
      
      console.log('Transaction signature:', signature);
      
      // Wait for confirmation with timeout
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('Transaction confirmed');
      
      // Update balance after successful transaction
      setTimeout(() => getBalance(), 1000); // Small delay for balance update
      
      return signature;
    } catch (error) {
      console.error("Send transaction error:", error);
      
      // Better error handling
      if (error instanceof Error) {
        if (error.message.includes('insufficient')) {
          throw new Error("Insufficient SOL balance for this transaction");
        }
        if (error.message.includes('blockhash')) {
          throw new Error("Network error: Please try again");
        }
        if (error.message.includes('User rejected')) {
          throw new Error("Transaction cancelled by user");
        }
        throw error;
      }
      
      if (error instanceof SendTransactionError) {
        throw new Error(`Transaction failed: ${error.message}`);
      }
      
      throw new Error("Unknown transaction error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction, connection, getBalance]);

  // Request airdrop (useful for devnet testing)
  const requestAirdrop = useCallback(async (amount: number = 1) => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    try {
      const lamports = amount * LAMPORTS_PER_SOL;
      const signature = await connection.requestAirdrop(publicKey, lamports);
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Update balance after airdrop
      await getBalance();
      
      return signature;
    } catch (error) {
      console.error("Airdrop error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, getBalance]);

  return {
    sendSOL,
    getBalance,
    requestAirdrop,
    balance,
    loading,
    connected: !!publicKey,
    publicKey,
    connection
  };
};