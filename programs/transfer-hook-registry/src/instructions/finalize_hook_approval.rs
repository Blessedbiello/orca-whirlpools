use anchor_lang::prelude::*;
use crate::{
    state::{RegistryConfig, HookSubmission, RiskAssessment, ApprovalStatus},
    events::HookApprovalFinalized,
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct FinalizeHookApproval<'info> {
    #[account(
        seeds = [b"registry"],
        bump = registry_config.bump
    )]
    pub registry_config: Account<'info, RegistryConfig>,

    #[account(mut)]
    pub hook_submission: Account<'info, HookSubmission>,

    #[account(
        seeds = [b"risk_assessment", hook_submission.key().as_ref()],
        bump = risk_assessment.bump
    )]
    pub risk_assessment: Account<'info, RiskAssessment>,

    pub finalizer: Signer<'info>,
}

pub fn handler(ctx: Context<FinalizeHookApproval>) -> Result<()> {
    let registry_config = &ctx.accounts.registry_config;
    let hook_submission = &mut ctx.accounts.hook_submission;
    let risk_assessment = &ctx.accounts.risk_assessment;

    // Verify submission can be finalized
    require!(
        hook_submission.can_be_finalized(),
        ErrorCode::CannotFinalize
    );

    // Check that review period has ended
    require!(
        hook_submission.is_review_period_ended()?,
        ErrorCode::ReviewPeriodNotEnded
    );

    // Determine final approval status
    let final_status = determine_approval_status(
        hook_submission,
        risk_assessment,
        registry_config.governance_threshold,
    );

    let _old_status = hook_submission.status.clone();
    hook_submission.update_status(final_status.clone())?;

    // Update registry statistics if approved
    if matches!(final_status, ApprovalStatus::Approved) {
        // Note: We can't modify registry_config here as it's not mutable
        // This would need to be handled in a separate instruction or
        // the account would need to be mutable
    }

    emit!(HookApprovalFinalized {
        program_id: hook_submission.program_id,
        status: final_status,
        final_votes_for: hook_submission.votes_for,
        final_votes_against: hook_submission.votes_against,
        risk_score: risk_assessment.overall_score,
    });

    Ok(())
}

fn determine_approval_status(
    submission: &HookSubmission,
    risk_assessment: &RiskAssessment,
    governance_threshold: u64,
) -> ApprovalStatus {
    // Auto-approve if automated checks passed and low risk
    if submission.automated_checks_passed && risk_assessment.is_low_risk() {
        return ApprovalStatus::Approved;
    }

    // Check governance votes
    let total_votes = submission.votes_for + submission.votes_against;
    
    if total_votes < governance_threshold {
        return ApprovalStatus::Rejected;
    }

    let approval_ratio = submission.get_approval_ratio();
    
    // Require higher approval threshold for higher risk programs
    let required_ratio = if risk_assessment.is_high_risk() {
        0.75 // 75% approval for high risk
    } else {
        0.60 // 60% approval for medium risk
    };

    if approval_ratio >= required_ratio {
        ApprovalStatus::Approved
    } else {
        ApprovalStatus::Rejected
    }
}