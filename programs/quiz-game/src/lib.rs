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
        quiz_session.bump = ctx.bumps.quiz_session;

        emit!(QuizStarted {
            user: ctx.accounts.user.key(),
            quiz_id,
            user_answer,
            amount,
            timestamp: quiz_session.timestamp,
        });

        msg!("Quiz started for user: {}, amount: {} lamports", ctx.accounts.user.key(), amount);
        Ok(())
    }

    pub fn complete_quiz(
        ctx: Context<CompleteQuiz>,
        correct_answer_count: u8,
    ) -> Result<()> {
        let quiz_session = &mut ctx.accounts.quiz_session;
        require!(quiz_session.active, QuizError::NoActiveQuiz);
        require!(
            quiz_session.user == ctx.accounts.user.key(),
            QuizError::UnauthorizedUser
        );

        // Check if quiz session has expired (1 hour = 3600 seconds)
        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time - quiz_session.timestamp;
        require!(time_elapsed <= 3600, QuizError::QuizExpired);

        // Mark as inactive
        quiz_session.active = false;

        let initial_amount = quiz_session.amount_paid;
        let mut total_reward = initial_amount; // Base reward = amount paid back

        // Calculate bonus based on performance
        let bonus_lamports = if correct_answer_count >= 3 {
            // Perfect score: 10% to 90% bonus
            let seed = (current_time as u64) ^ (ctx.accounts.user.key().to_bytes()[0] as u64);
            let bonus_percent = 10 + (seed % 81); // 10-90%
            (initial_amount * bonus_percent) / 100
        } else if correct_answer_count >= 2 {
            // Good score: 5% to 25% bonus
            let seed = (current_time as u64) ^ (ctx.accounts.user.key().to_bytes()[0] as u64);
            let bonus_percent = 5 + (seed % 21); // 5-25%
            (initial_amount * bonus_percent) / 100
        } else {
            // Poor performance: no bonus (lose the SOL paid)
            total_reward = 0;
            0
        };

        total_reward += bonus_lamports;

        // Transfer reward from vault to user if there's a reward
        if total_reward > 0 {
            let vault_balance = ctx.accounts.vault.to_account_info().lamports();
            require!(vault_balance >= total_reward, QuizError::InsufficientVaultFunds);

            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= total_reward;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += total_reward;
        }

        // Update game statistics
        let game_state = &mut ctx.accounts.game_state;
        game_state.total_games += 1;
        game_state.total_rewards += total_reward;

        emit!(QuizCompleted {
            user: ctx.accounts.user.key(),
            quiz_id: quiz_session.quiz_id.clone(),
            success: correct_answer_count >= 2,
            reward: total_reward,
            correct_answers: correct_answer_count,
            bonus_lamports,
        });

        msg!("Quiz completed for user: {}, reward: {} lamports", ctx.accounts.user.key(), total_reward);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault_balance = ctx.accounts.vault.to_account_info().lamports();
        require!(amount <= vault_balance, QuizError::InsufficientFunds);
        require!(amount > 0, QuizError::InvalidAmount);

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

        msg!("Withdrew {} lamports from vault", amount);
        Ok(())
    }

    pub fn update_vault(ctx: Context<UpdateVault>, new_vault: Pubkey) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        let old_vault = game_state.vault;
        game_state.vault = new_vault;

        emit!(VaultUpdated { old_vault, new_vault });
        msg!("Vault updated from {} to {}", old_vault, new_vault);
        Ok(())
    }

    pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
        require!(amount > 0, QuizError::InvalidAmount);

        // Transfer SOL from authority to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(transfer_ctx, amount)?;

        msg!("Vault funded with {} lamports", amount);
        Ok(())
    }
}

// Account structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameState::INIT_SPACE,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the vault account that will hold SOL
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartQuiz<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + QuizSession::INIT_SPACE,
        seeds = [b"quiz_session", user.key().as_ref()],
        bump
    )]
    pub quiz_session: Account<'info, QuizSession>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the vault account
    pub vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteQuiz<'info> {
    #[account(
        mut,
        seeds = [b"quiz_session", user.key().as_ref()],
        bump = quiz_session.bump
    )]
    pub quiz_session: Account<'info, QuizSession>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the vault account
    pub vault: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        has_one = authority,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the vault account
    pub vault: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateVault<'info> {
    #[account(
        mut, 
        has_one = authority,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(
        has_one = authority,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the vault account
    pub vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

// Data structures
#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub authority: Pubkey,        // 32 bytes
    pub vault: Pubkey,           // 32 bytes
    pub total_games: u64,        // 8 bytes
    pub total_rewards: u64,      // 8 bytes
}

#[account]
#[derive(InitSpace)]
pub struct QuizSession {
    pub active: bool,            // 1 byte
    pub user_answer: u64,        // 8 bytes
    pub amount_paid: u64,        // 8 bytes
    pub timestamp: i64,          // 8 bytes
    #[max_len(50)]
    pub quiz_id: String,         // 4 + 50 bytes
    pub user: Pubkey,           // 32 bytes
    pub bump: u8,               // 1 byte
}

// Events
#[event]
pub struct QuizStarted {
    pub user: Pubkey,
    #[index]
    pub quiz_id: String,
    pub user_answer: u64,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct QuizCompleted {
    pub user: Pubkey,
    #[index]
    pub quiz_id: String,
    pub success: bool,
    pub reward: u64,
    pub correct_answers: u8,
    pub bonus_lamports: u64,
}

#[event]
pub struct VaultUpdated {
    pub old_vault: Pubkey,
    pub new_vault: Pubkey,
}

// Errors
#[error_code]
pub enum QuizError {
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Quiz ID cannot be empty")]
    EmptyQuizId,
    #[msg("User already has an active quiz")]
    ActiveQuizExists,
    #[msg("No active quiz session found")]
    NoActiveQuiz,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
    #[msg("Insufficient funds in vault for rewards")]
    InsufficientVaultFunds,
    #[msg("Quiz session has expired (1 hour limit)")]
    QuizExpired,
    #[msg("Minimum amount required is 0.001 SOL")]
    MinimumAmountRequired,
}