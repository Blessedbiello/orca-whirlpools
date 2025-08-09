use anchor_lang::prelude::*;
use crate::{
    state::{RegistryConfig, HookSubmission},
    events::HookSubmitted,
    errors::ErrorCode,
};

#[derive(Accounts)]
#[instruction(program_id: Pubkey)]
pub struct SubmitHookForApproval<'info> {
    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry_config.bump
    )]
    pub registry_config: Account<'info, RegistryConfig>,

    #[account(
        init,
        payer = submitter,
        space = HookSubmission::LEN,
        seeds = [b"submission", program_id.as_ref()],
        bump
    )]
    pub hook_submission: Account<'info, HookSubmission>,

    #[account(mut)]
    pub submitter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SubmitHookForApproval>,
    program_id: Pubkey,
    metadata_uri: String,
    governance_proposal_id: Option<Pubkey>,
) -> Result<()> {
    // Validate input parameters
    require!(metadata_uri.len() <= 256, ErrorCode::MetadataUriTooLong);
    require!(program_id != Pubkey::default(), ErrorCode::InvalidProgramId);
    
    // Check that the program exists and is executable
    let program_account = ctx.remaining_accounts.get(0)
        .ok_or(ErrorCode::ProgramNotExecutable)?;
    require!(program_account.key() == program_id, ErrorCode::InvalidProgramId);
    require!(program_account.executable, ErrorCode::ProgramNotExecutable);

    let registry_config = &mut ctx.accounts.registry_config;
    let hook_submission = &mut ctx.accounts.hook_submission;
    let bump = ctx.bumps.hook_submission;

    // Initialize the submission
    hook_submission.initialize(
        program_id,
        ctx.accounts.submitter.key(),
        metadata_uri.clone(),
        governance_proposal_id,
        registry_config.review_period_seconds,
        bump,
    )?;

    // Update registry statistics
    registry_config.total_submissions += 1;

    emit!(HookSubmitted {
        program_id,
        submitter: ctx.accounts.submitter.key(),
        metadata_uri,
        governance_proposal_id,
        review_ends_at: hook_submission.review_ends_at,
    });

    Ok(())
}