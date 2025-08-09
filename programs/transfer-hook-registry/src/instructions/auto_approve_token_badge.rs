use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use spl_token_2022::extension::{BaseStateWithExtensions, ExtensionType, StateWithExtensions};
use crate::{
    state::{HookSubmission, ApprovalStatus},
    events::TokenBadgeAutoApproved,
    errors::ErrorCode,
};

// External program accounts - these would be from Orca Whirlpools
#[derive(Accounts)]
pub struct AutoApproveTokenBadge<'info> {
    // Registry accounts
    #[account(
        seeds = [b"submission", hook_submission.program_id.as_ref()],
        bump = hook_submission.bump
    )]
    pub hook_submission: Account<'info, HookSubmission>,

    // Token accounts
    #[account(constraint = token_mint.key() == token_mint.key())]
    pub token_mint: InterfaceAccount<'info, Mint>,

    // Orca Whirlpools accounts (would need to be imported from Orca program)
    /// CHECK: Whirlpools config account - validated by Orca program
    #[account(mut)]
    pub whirlpools_config: UncheckedAccount<'info>,

    /// CHECK: TokenBadge PDA - will be created by Orca program
    #[account(mut)]
    pub token_badge: UncheckedAccount<'info>,

    /// CHECK: Config extension account for TokenBadge authority
    pub config_extension: UncheckedAccount<'info>,

    // Signers
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Authority for TokenBadge creation (from config extension)
    pub token_badge_authority: Signer<'info>,

    // Programs
    /// CHECK: Orca Whirlpools program
    #[account(constraint = whirlpool_program.key() == whirlpool_program_id())]
    pub whirlpool_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<AutoApproveTokenBadge>,
    whirlpools_config: Pubkey,
    token_mint: Pubkey,
) -> Result<()> {
    let hook_submission = &ctx.accounts.hook_submission;
    let token_mint_account = &ctx.accounts.token_mint;

    // Verify hook is approved
    require!(
        matches!(hook_submission.status, ApprovalStatus::Approved),
        ErrorCode::HookNotApproved
    );

    // Verify token has Transfer Hook extension
    let mint_info = token_mint_account.to_account_info();
    let mint_data = mint_info.try_borrow_data()?;
    let mint_with_extension = StateWithExtensions::<spl_token_2022::state::Mint>::unpack(&mint_data)?;
    
    // Check for Transfer Hook extension
    let transfer_hook_config = mint_with_extension.get_extension::<spl_token_2022::extension::transfer_hook::TransferHook>();
    require!(transfer_hook_config.is_ok(), ErrorCode::NoTransferHookExtension);
    
    let transfer_hook = transfer_hook_config.unwrap();
    
    // Verify the Transfer Hook program matches our approved submission
    let hook_program_id = Option::<Pubkey>::from(transfer_hook.program_id);
    require!(
        hook_program_id.is_some(),
        ErrorCode::NoTransferHookExtension
    );
    let hook_program_id = hook_program_id.unwrap();
    require!(
        hook_program_id == hook_submission.program_id,
        ErrorCode::IncompatibleHook
    );

    // Mock CPI call to Orca Whirlpools initialize_token_badge instruction
    // In production, this would make a real CPI call to Orca's program
    initialize_token_badge_mock(
        ctx.accounts.whirlpools_config.key(),
        ctx.accounts.token_mint.key(),
        hook_submission.program_id,
    )?;

    let clock = Clock::get()?;

    emit!(TokenBadgeAutoApproved {
        whirlpools_config,
        token_mint,
        hook_program: hook_submission.program_id,
        approved_at: clock.unix_timestamp,
    });

    Ok(())
}

// Helper function to get Orca Whirlpools program ID
fn whirlpool_program_id() -> Pubkey {
    // This would be the actual Orca Whirlpools program ID
    "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc".parse().unwrap()
}

// Mock CPI function - in real implementation this would use Orca SDK
fn initialize_token_badge_mock(
    whirlpools_config: Pubkey,
    token_mint: Pubkey,
    hook_program: Pubkey,
) -> Result<()> {
    // This would make the actual CPI call to Orca's initialize_token_badge instruction
    // For now, we'll just log the parameters
    msg!(
        "TokenBadge would be created for mint {} with hook {} in config {}",
        token_mint,
        hook_program,
        whirlpools_config
    );
    Ok(())
}