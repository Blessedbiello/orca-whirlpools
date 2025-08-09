use anchor_lang::prelude::*;
use crate::{
    state::{HookSubmission, GovernanceVote, ApprovalStatus},
    events::GovernanceVoteCast,
    errors::ErrorCode,
};

#[derive(Accounts)]
pub struct CastGovernanceVote<'info> {
    #[account(mut)]
    pub hook_submission: Account<'info, HookSubmission>,

    #[account(
        init,
        payer = voter,
        space = GovernanceVote::LEN,
        seeds = [b"vote", hook_submission.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub governance_vote: Account<'info, GovernanceVote>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CastGovernanceVote>,
    vote: bool,
    rationale: String,
) -> Result<()> {
    let hook_submission = &mut ctx.accounts.hook_submission;
    let governance_vote = &mut ctx.accounts.governance_vote;

    // Validate submission is in correct status for voting
    require!(
        matches!(hook_submission.status, ApprovalStatus::UnderReview),
        ErrorCode::InvalidStatusTransition
    );

    // Check that review period hasn't ended
    require!(
        !hook_submission.is_review_period_ended()?,
        ErrorCode::ReviewPeriodEnded
    );

    // Validate rationale length
    require!(rationale.len() <= 256, ErrorCode::RationaleTooLong);

    let bump = *ctx.bumps.get("governance_vote").unwrap();

    // Initialize the vote
    governance_vote.initialize(
        hook_submission.key(),
        ctx.accounts.voter.key(),
        vote,
        rationale,
        bump,
    )?;

    // Update submission vote counts
    hook_submission.add_vote(vote);

    emit!(GovernanceVoteCast {
        submission: hook_submission.key(),
        program_id: hook_submission.program_id,
        voter: ctx.accounts.voter.key(),
        vote,
        total_votes_for: hook_submission.votes_for,
        total_votes_against: hook_submission.votes_against,
    });

    Ok(())
}