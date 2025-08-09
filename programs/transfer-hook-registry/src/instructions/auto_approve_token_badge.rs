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
    let mint_data = token_mint_account.to_account_info().try_borrow_data()?;
    let mint_with_extension = StateWithExtensions::<spl_token_2022::state::Mint>::unpack(&mint_data)?;
    
    // Check for Transfer Hook extension
    let transfer_hook_config = mint_with_extension.get_extension::<spl_token_2022::extension::transfer_hook::TransferHook>();
    require!(transfer_hook_config.is_ok(), ErrorCode::NoTransferHookExtension);
    
    let transfer_hook = transfer_hook_config.unwrap();
    
    // Verify the Transfer Hook program matches our approved submission
    require!(
        transfer_hook.program_id.is_some(),
        ErrorCode::NoTransferHookExtension
    );
    
    let hook_program_id = transfer_hook.program_id.unwrap();
    require!(
        hook_program_id == hook_submission.program_id,
        ErrorCode::IncompatibleHook
    );

    // Prepare CPI call to Orca Whirlpools initialize_token_badge instruction
    let initialize_token_badge_accounts = InitializeTokenBadgeCPI {
        whirlpools_config: ctx.accounts.whirlpools_config.to_account_info(),
        whirlpools_config_extension: ctx.accounts.config_extension.to_account_info(),
        token_badge: ctx.accounts.token_badge.to_account_info(),
        token_mint: ctx.accounts.token_mint.to_account_info(),
        token_badge_authority: ctx.accounts.token_badge_authority.to_account_info(),
        funder: ctx.accounts.payer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.whirlpool_program.to_account_info(),
        initialize_token_badge_accounts,
    );

    // Make CPI call to create TokenBadge
    // This would call the actual Orca instruction
    initialize_token_badge_cpi(cpi_ctx)?;

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

// Mock structure for CPI - in real implementation this would come from Orca SDK
pub struct InitializeTokenBadgeCPI<'info> {
    pub whirlpools_config: AccountInfo<'info>,
    pub whirlpools_config_extension: AccountInfo<'info>,
    pub token_badge: AccountInfo<'info>,
    pub token_mint: AccountInfo<'info>,
    pub token_badge_authority: AccountInfo<'info>,
    pub funder: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

// Mock CPI function - in real implementation this would be from Orca SDK
fn initialize_token_badge_cpi<'info>(
    _ctx: CpiContext<'_, '_, '_, 'info, InitializeTokenBadgeCPI<'info>>,
) -> Result<()> {
    // This would make the actual CPI call to Orca's initialize_token_badge instruction
    // For now, we'll just return success
    msg!("CPI call to initialize_token_badge would happen here");
    Ok(())
}