# 🚀 DailyWiser - Quick Deployment with Solana Playground

## 🌐 Alternative Deployment Method (Recommended)

Since we're encountering local dependency conflicts, let's use **Solana Playground** - a web-based Solana IDE that handles all the build tools for us.

### 📋 Step 1: Access Solana Playground
1. Go to: **https://beta.solpg.io/**
2. Connect your wallet (use the same wallet we created)
3. Make sure you're on **Testnet** in the network selector

### 📁 Step 2: Import Your Program Code
1. Create a new project
2. Replace the default code with our quiz-game program:

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk");

#[program]
pub mod quiz_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.authority = ctx.accounts.authority.key();
        game_state.vault = ctx.accounts.vault.key();
        game_state.total_games = 0;
        game_state.total_rewards = 0;
        
        msg!("Quiz Game initialized with authority: {}", game_state.authority);
        Ok(())
    }

    pub fn start_quiz(
        ctx: Context<StartQuiz>,
        quiz_id: String,
        user_answer: u64,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, QuizError::InvalidAmount);
        require!(!quiz_id.is_empty(), QuizError::EmptyQuizId);
        require!(amount >= 1000000, QuizError::MinimumAmountRequired); // 0.001 SOL minimum

        let quiz_session = &mut ctx.accounts.quiz_session;
        require!(!quiz_session.active, QuizError::ActiveQuizExists);

        // Transfer SOL from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(transfer_ctx, amount)?;

        // Initialize quiz session
        quiz_session.active = true;
        quiz_session.user_answer = user_answer;
        quiz_session.amount_paid = amount;
        quiz_session.timestamp = Clock::get()?.unix_timestamp;
        quiz_session.quiz_id = quiz_id.clone();
        quiz_session.user = ctx.accounts.user.key();

        // Update game state
        let game_state = &mut ctx.accounts.game_state;
        game_state.total_games += 1;

        emit!(QuizStartedEvent {
            user: ctx.accounts.user.key(),
            quiz_id: quiz_id,
            user_answer: user_answer,
            amount: amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn complete_quiz(
        ctx: Context<CompleteQuiz>,
        correct_answer_count: u8,
    ) -> Result<()> {
        let quiz_session = &mut ctx.accounts.quiz_session;
        require!(quiz_session.active, QuizError::NoActiveQuiz);
        require!(quiz_session.user == ctx.accounts.user.key(), QuizError::UnauthorizedUser);

        // Check if quiz is not expired (1 hour limit)
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time - quiz_session.timestamp <= 3600,
            QuizError::QuizExpired
        );

        let success = correct_answer_count >= 2;
        let mut reward = 0u64;
        let mut bonus_lamports = 0u64;

        if success {
            // Base reward: return the entry fee
            reward = quiz_session.amount_paid;
            
            // Bonus for perfect score (3/3 correct)
            if correct_answer_count == 3 {
                bonus_lamports = quiz_session.amount_paid * 9 / 10; // 90% bonus
                reward += bonus_lamports;
            }
            // Partial bonus for good score (2/3 correct)
            else if correct_answer_count == 2 {
                bonus_lamports = quiz_session.amount_paid * 4 / 10; // 40% bonus
                reward += bonus_lamports;
            }

            // Transfer reward from vault to user
            let vault_balance = ctx.accounts.vault.lamports();
            require!(vault_balance >= reward, QuizError::InsufficientVaultFunds);

            **ctx.accounts.vault.lamports.borrow_mut() -= reward;
            **ctx.accounts.user.lamports.borrow_mut() += reward;
        }

        // Update game state
        let game_state = &mut ctx.accounts.game_state;
        game_state.total_rewards += reward;

        // Deactivate quiz session
        quiz_session.active = false;

        emit!(QuizCompletedEvent {
            user: ctx.accounts.user.key(),
            quiz_id: quiz_session.quiz_id.clone(),
            success: success,
            reward: reward,
            correct_answers: correct_answer_count,
            bonus_lamports: bonus_lamports,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, QuizError::InvalidAmount);

        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= amount, QuizError::InsufficientVaultFunds);

        // Transfer from vault to authority
        **ctx.accounts.vault.lamports.borrow_mut() -= amount;
        **ctx.accounts.authority.lamports.borrow_mut() += amount;

        Ok(())
    }

    pub fn update_vault(ctx: Context<UpdateVault>, new_vault: Pubkey) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        let old_vault = game_state.vault;
        game_state.vault = new_vault;

        emit!(VaultUpdatedEvent {
            old_vault: old_vault,
            new_vault: new_vault,
        });

        Ok(())
    }

    pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
        require!(amount > 0, QuizError::InvalidAmount);

        // Transfer SOL from funder to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.funder.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(transfer_ctx, amount)?;

        Ok(())
    }
}

// Account contexts
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8, // discriminator + authority + vault + total_games + total_rewards
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the vault account that will receive SOL
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartQuiz<'info> {
    #[account(
        mut,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 1 + 8 + 8 + 8 + 64 + 32 + 1, // discriminator + active + user_answer + amount_paid + timestamp + quiz_id + user + bump
        seeds = [b"quiz_session", user.key().as_ref()],
        bump
    )]
    pub quiz_session: Account<'info, QuizSession>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: This is the vault account that will receive SOL
    #[account(mut, address = game_state.vault)]
    pub vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteQuiz<'info> {
    #[account(
        mut,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        mut,
        seeds = [b"quiz_session", user.key().as_ref()],
        bump
    )]
    pub quiz_session: Account<'info, QuizSession>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: This is the vault account
    #[account(mut, address = game_state.vault)]
    pub vault: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        seeds = [b"game_state"],
        bump,
        has_one = authority
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the vault account
    #[account(mut, address = game_state.vault)]
    pub vault: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateVault<'info> {
    #[account(
        mut,
        seeds = [b"game_state"],
        bump,
        has_one = authority
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub funder: Signer<'info>,
    
    /// CHECK: This is the vault account
    #[account(mut, address = game_state.vault)]
    pub vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

// Account data structures
#[account]
pub struct GameState {
    pub authority: Pubkey,
    pub vault: Pubkey,
    pub total_games: u64,
    pub total_rewards: u64,
}

#[account]
pub struct QuizSession {
    pub active: bool,
    pub user_answer: u64,
    pub amount_paid: u64,
    pub timestamp: i64,
    pub quiz_id: String,
    pub user: Pubkey,
    pub bump: u8,
}

// Events
#[event]
pub struct QuizStartedEvent {
    pub user: Pubkey,
    pub quiz_id: String,
    pub user_answer: u64,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct QuizCompletedEvent {
    pub user: Pubkey,
    pub quiz_id: String,
    pub success: bool,
    pub reward: u64,
    pub correct_answers: u8,
    pub bonus_lamports: u64,
}

#[event]
pub struct VaultUpdatedEvent {
    pub old_vault: Pubkey,
    pub new_vault: Pubkey,
}

// Error codes
#[error_code]
pub enum QuizError {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Quiz ID cannot be empty")]
    EmptyQuizId,
    #[msg("Active quiz session already exists")]
    ActiveQuizExists,
    #[msg("No active quiz session found")]
    NoActiveQuiz,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Insufficient vault funds for reward")]
    InsufficientVaultFunds,
    #[msg("Quiz session has expired")]
    QuizExpired,
    #[msg("Minimum amount of 0.001 SOL required")]
    MinimumAmountRequired,
}
```

### 🔑 Step 3: Set Program Keypair
1. In Solana Playground, go to the wallet/keypair section
2. Import the program keypair we generated:
   - **Program ID**: `2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk`
   - Use the seed phrase: `range shiver tomato pipe shop thank stable segment force crush term deny`

### 💰 Step 4: Get Testnet SOL
1. Use the built-in airdrop feature in Solana Playground
2. Request 2-3 SOL for deployment costs
3. Or use web faucets:
   - https://faucet.solana.com/
   - https://solfaucet.com/

### 🚀 Step 5: Build & Deploy
1. Click **"Build"** button in Playground
2. Once build succeeds, click **"Deploy"**
3. Confirm the transaction in your wallet
4. Copy the deployed program ID

### ✅ Step 6: Verify Deployment
1. Check on Solana Explorer: 
   `https://explorer.solana.com/address/2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk?cluster=testnet`
2. Test your frontend should now work!

### 🎯 Step 7: Initialize the Program (Important!)
After deployment, you need to initialize the game state:

```javascript
// In Solana Playground's client/script section:
import * as anchor from "@coral-xyz/anchor";

const program = anchor.workspace.QuizGame;
const [gameStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("game_state")],
  program.programId
);

// Create a vault keypair
const vault = anchor.web3.Keypair.generate();

// Initialize
const tx = await program.methods
  .initialize()
  .accounts({
    gameState: gameStatePDA,
    authority: provider.wallet.publicKey,
    vault: vault.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([vault])
  .rpc();

console.log("Initialize tx:", tx);
console.log("Vault address:", vault.publicKey.toString());
```

### 🎮 Step 8: Test Your Frontend
Now your frontend should work! Try:
1. Connect wallet on your app
2. Start a quiz 
3. Should work without the previous transaction errors!

---

## 🔧 Alternative: Fix Local Environment

If you prefer to fix the local issues:

### Option A: Use Docker
```bash
# Build with Docker to avoid local conflicts
docker run --rm -v $(pwd):/workspace solanalabs/anchor:latest \
  sh -c "cd /workspace && anchor build && anchor deploy --provider.cluster testnet"
```

### Option B: Downgrade Anchor
```bash
# Use older Anchor version that matches dependencies
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.29.0 --locked
```

---

## 📊 Current Status

✅ **Program Code**: Ready and updated with correct program ID  
✅ **Frontend**: Updated with program ID  
🚧 **Deployment**: Use Solana Playground (recommended) or fix local tools  
🎯 **Next**: Initialize program state after deployment  

The Solana Playground approach is much faster and avoids all the local dependency conflicts!
