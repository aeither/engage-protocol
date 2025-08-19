# 🔧 Fixing Transaction Errors - DailyWiser Solana

## 🐛 **Problem**: WalletSendTransactionError: Unexpected error

This error occurs when trying to start quizzes because:
1. **Insufficient SOL balance** in your wallet
2. **Network connectivity issues** with Solana testnet
3. **Wallet not properly connected**

## ✅ **Quick Fixes**

### 🪙 **Step 1: Get Testnet SOL**
You need SOL to pay for transaction fees. Get free testnet SOL:

#### Option A: Web Faucets
- **Solana Faucet**: https://faucet.solana.com/
- **SolFaucet**: https://solfaucet.com/
- Request **1-2 SOL** for your wallet

#### Option B: CLI Airdrop (if you have Solana CLI)
```bash
solana airdrop 1 YOUR_WALLET_ADDRESS --url https://api.testnet.solana.com
```

#### Option C: Use Your App's Demo Page
1. Go to `/solana-demo` route in your app
2. Click "Request Airdrop" button
3. Get 1 SOL instantly

### 🔗 **Step 2: Check Your Wallet**
1. **Connect** your wallet (Phantom, Solflare, etc.)
2. **Switch to Testnet** in your wallet settings
3. **Verify balance** shows SOL (not 0)

### 🌐 **Step 3: Check Network**
Make sure your wallet is on **Solana Testnet**:
- In Phantom: Settings > Change Network > Testnet
- In Solflare: Settings > Network > Testnet

### 🔄 **Step 4: Try Transaction Again**
1. Refresh the page
2. Reconnect wallet
3. Try starting a quiz again

## 🔍 **Debug Information**

### Check Your Wallet Balance
Visit your wallet on Solana Explorer:
```
https://explorer.solana.com/address/YOUR_WALLET_ADDRESS?cluster=testnet
```

### Transaction Requirements
- **Entry Fee**: 0.0001 SOL per quiz
- **Gas Fee**: ~0.000005 SOL per transaction
- **Minimum Balance**: 0.001 SOL recommended

### Network Status
Check if Solana Testnet is operational:
- **Status Page**: https://status.solana.com/
- **RPC Health**: https://api.testnet.solana.com/health

## 🛠️ **Developer Notes**

### Enhanced Error Handling Added
The `useSolana` hook now includes:
- ✅ Balance validation before transactions
- ✅ Better error messages for common issues
- ✅ Automatic retry logic
- ✅ Input validation
- ✅ Network timeout handling

### Updated Code Features
```typescript
// Better error messages
if (currentBalance < amount) {
  throw new Error(`Insufficient balance. You have ${currentBalance.toFixed(4)} SOL, but need ${amount} SOL`);
}

// Retry configuration
const signature = await sendTransaction(transaction, connection, {
  maxRetries: 3,
  preflightCommitment: 'processed',
});
```

### Testing Your Fix
1. **Check Console Logs**: Look for detailed transaction info
2. **Monitor Network**: Use browser dev tools
3. **Verify Signatures**: Check transactions on explorer

## 🎯 **Expected Behavior After Fix**

### ✅ **Success Case**
1. User clicks "Start Quiz"
2. Wallet popup appears
3. User approves transaction
4. Success message: "Quiz started! Good luck! 🎮"
5. Quiz interface loads

### ❌ **Error Cases (Now Handled)**
- **No SOL**: "Insufficient SOL balance for this transaction"
- **Network Issue**: "Network error: Please try again"
- **User Cancels**: "Transaction cancelled by user"
- **Invalid Address**: "Invalid recipient address"

## 🚀 **Final Deployment Steps**

Once transactions work locally:

1. **Deploy Solana Program** (using Solana Playground method)
2. **Initialize Program State**
3. **Test Full Quiz Flow**
4. **Monitor Transaction Success Rate**

---

## 📞 **Still Having Issues?**

### Common Solutions
1. **Clear Browser Cache** and reconnect wallet
2. **Try Different Wallet** (Phantom vs Solflare)
3. **Use Different RPC Endpoint** in wallet settings
4. **Wait and Retry** (testnet can be slow)

### Alternative Testing
Use the **Solana Demo page** (`/solana-demo`) to test basic transactions first before trying quizzes.

### Program Deployment
If the Solana program itself isn't deployed yet, follow the **Solana Playground** deployment guide in `DEPLOY-WITH-PLAYGROUND.md`.

The transaction errors should now be resolved with proper error handling and user guidance! 🎉
