use anchor_lang::prelude::*;
use crate::{
    state::{RegistryConfig},
    events::RegistryInitialized,
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = payer,
        space = RegistryConfig::LEN,
        seeds = [b"registry"],
        bump
    )]
    pub registry_config: Account<'info, RegistryConfig>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeRegistry>,
    authority: Pubkey,
    governance_threshold: u64,
    review_period_seconds: u64,
) -> Result<()> {
    require!(governance_threshold > 0, ErrorCode::InsufficientVotes);
    require!(review_period_seconds > 0, ErrorCode::ReviewPeriodNotEnded);

    let registry_config = &mut ctx.accounts.registry_config;
    let bump = ctx.bumps.registry_config;

    registry_config.initialize(
        authority,
        governance_threshold,
        review_period_seconds,
        bump,
    )?;

    emit!(RegistryInitialized {
        authority,
        governance_threshold,
        review_period_seconds,
    });

    Ok(())
}