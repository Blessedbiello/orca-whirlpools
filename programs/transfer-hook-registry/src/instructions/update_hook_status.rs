use anchor_lang::prelude::*;
use crate::{
    state::{RegistryConfig, HookSubmission, ApprovalStatus},
    events::HookStatusUpdated,
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct UpdateHookStatus<'info> {
    #[account(
        seeds = [b"registry"],
        bump = registry_config.bump
    )]
    pub registry_config: Account<'info, RegistryConfig>,

    #[account(mut)]
    pub hook_submission: Account<'info, HookSubmission>,

    #[account(constraint = authority.key() == registry_config.authority @ ErrorCode::Unauthorized)]
    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateHookStatus>,
    new_status: ApprovalStatus,
    reason: String,
) -> Result<()> {
    let hook_submission = &mut ctx.accounts.hook_submission;

    // Validate status transition is allowed
    validate_status_transition(&hook_submission.status, &new_status)?;

    let old_status = hook_submission.status.clone();
    hook_submission.update_status(new_status.clone())?;

    emit!(HookStatusUpdated {
        program_id: hook_submission.program_id,
        old_status,
        new_status,
        reason,
        updated_by: ctx.accounts.authority.key(),
    });

    Ok(())
}

fn validate_status_transition(
    current_status: &ApprovalStatus,
    new_status: &ApprovalStatus,
) -> Result<()> {
    use ApprovalStatus::*;

    let valid_transition = match (current_status, new_status) {
        // From Pending
        (Pending, UnderReview) => true,
        (Pending, Rejected) => true,
        
        // From UnderReview
        (UnderReview, Approved) => true,
        (UnderReview, Rejected) => true,
        
        // From Approved
        (Approved, Suspended) => true,
        (Approved, Deprecated) => true,
        
        // From Suspended
        (Suspended, Approved) => true,
        (Suspended, Deprecated) => true,
        
        // From Rejected - only to deprecated allowed
        (Rejected, Deprecated) => true,
        
        // Same status (no change)
        (a, b) if a == b => true,
        
        // All other transitions are invalid
        _ => false,
    };

    require!(valid_transition, ErrorCode::InvalidStatusTransition);
    Ok(())
}