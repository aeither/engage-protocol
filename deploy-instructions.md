# 🚀 DailyWiser Quiz Game - Solana Program Deployment Guide

## 📋 Prerequisites Setup ✅
- [x] Solana CLI installed and configured for testnet
- [x] Anchor CLI installed (v0.31.1)
- [x] Wallet created: `GrunZjA8EAy9cNMraLXVkXdoo2jCWtZae5TUn1Xu7xSU`
- [x] Program keypair generated: `2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk`
- [x] Program ID updated in code and config

## 🔧 Fixing Build Tools

### Install Full Solana Toolkit
```bash
# Remove Homebrew version
brew uninstall solana

# Install full Solana toolkit
curl --proto '=https' --tlsv1.2 -sSf https://release.solana.com/v1.18.22/install | sh

# Add to PATH (add to ~/.zshrc for persistence)
export PATH="/Users/giovannifulin/.local/share/solana/install/active_release/bin:$PATH"

# Verify build tools
cargo build-sbf --version
```

### Alternative: Use Docker
```bash
# If local installation fails, use Docker
docker run --rm -v $(pwd):/workspace solanalabs/anchor:latest \
  sh -c "cd /workspace && anchor build"
```

## 🪙 Get Testnet SOL

### Method 1: Solana Faucet
```bash
# Request testnet SOL (may be rate limited)
solana airdrop 2

# Check balance
solana balance
```

### Method 2: Web Faucets
- [https://faucet.solana.com/](https://faucet.solana.com/)
- [https://solfaucet.com/](https://solfaucet.com/)

### Method 3: Discord/Community
- Join Solana Discord and request testnet SOL
- Use your wallet address: `GrunZjA8EAy9cNMraLXVkXdoo2jCWtZae5TUn1Xu7xSU`

## 🚀 Deployment Commands

### 1. Build the Program
```bash
cd /Users/giovannifulin/Downloads/dailywiser-solana
anchor build
```

### 2. Deploy to Testnet
```bash
anchor deploy --provider.cluster testnet
```

### 3. Verify Deployment
```bash
# Check program account
solana account 2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk --url https://api.testnet.solana.com

# View on Solana Explorer
echo "https://explorer.solana.com/address/2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk?cluster=testnet"
```

## 📱 Update Frontend

After successful deployment, update the frontend to use the deployed program:

### Update Program Types
```typescript
// src/libs/program-types.ts
export const QUIZ_GAME_PROGRAM_ID = '2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk';
```

### Generate IDL Types (if needed)
```bash
# Generate TypeScript types from IDL
anchor idl build
```

## 🔍 Testing Deployment

### Test Program Interaction
```bash
# Initialize the game state (example)
anchor run test
```

### Frontend Integration
1. Update program ID in frontend constants
2. Test wallet connection
3. Test quiz game functions

## 📊 Monitoring

### View Program on Explorer
- **Testnet Explorer**: https://explorer.solana.com/address/2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk?cluster=testnet
- **Solscan**: https://solscan.io/account/2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk?cluster=testnet

### Check Program Logs
```bash
solana logs 2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk --url https://api.testnet.solana.com
```

## 🚨 Troubleshooting

### Common Issues
1. **Insufficient SOL**: Deployment requires ~2-5 SOL for testnet
2. **Build Tools Missing**: Ensure `cargo build-sbf` is available
3. **Network Issues**: Try different RPC endpoints if needed

### Alternative RPC Endpoints
```bash
# If default testnet is slow
solana config set --url https://api.testnet.solana.com
# or
solana config set --url https://testnet.solana.com
```

## 📝 Important Files

- **Program Source**: `programs/quiz-game/src/lib.rs`
- **Anchor Config**: `Anchor.toml`
- **Program Keypair**: `target/deploy/quiz_game-keypair.json`
- **Wallet Keypair**: `~/.config/solana/id.json`

## 🔐 Security Notes

⚠️ **IMPORTANT**: Save your seed phrases securely!

**Wallet Seed**: `clever neutral soul trophy tuition palace actor reveal wise awesome biology country`
**Program Seed**: `range shiver tomato pipe shop thank stable segment force crush term deny`

These are for TESTNET ONLY - never use for mainnet!

## 🎯 Next Steps After Deployment

1. Test all program functions
2. Update frontend with deployed program ID
3. Test full user flow
4. Monitor program performance
5. Plan mainnet deployment strategy
