use anchor_lang::prelude::*;

declare_id!("A8UEmdwPDW5pqsU7iMEvwDn2C7fC6bsZGoRceukLzadE");

#[doc(hidden)]
pub mod errors;
#[doc(hidden)]
pub mod events;
#[doc(hidden)]
pub mod instructions;
pub mod state;
#[doc(hidden)]
pub mod utils;

use crate::state::*;
use instructions::*;

#[program]
pub mod transfer_hook_registry {
    use super::*;

    /// Initializes the Transfer Hook Registry with global configuration
    pub fn initialize_registry(
        ctx: Context<InitializeRegistry>,
        authority: Pubkey,
        governance_threshold: u64,
        review_period_seconds: u64,
    ) -> Result<()> {
        instructions::initialize_registry::handler(ctx, authority, governance_threshold, review_period_seconds)
    }

    /// Submits a Transfer Hook program for registry approval
    pub fn submit_hook_for_approval(
        ctx: Context<SubmitHookForApproval>,
        program_id: Pubkey,
        metadata_uri: String,
        governance_proposal_id: Option<Pubkey>,
    ) -> Result<()> {
        instructions::submit_hook_for_approval::handler(ctx, program_id, metadata_uri, governance_proposal_id)
    }

    /// Performs automated risk assessment of a Transfer Hook program
    pub fn assess_hook_risk(
        ctx: Context<AssessHookRisk>,
    ) -> Result<()> {
        instructions::assess_hook_risk::handler(ctx)
    }

    /// Casts a governance vote on a pending Transfer Hook submission
    pub fn cast_governance_vote(
        ctx: Context<CastGovernanceVote>,
        vote: bool, // true = approve, false = reject
        rationale: String,
    ) -> Result<()> {
        instructions::cast_governance_vote::handler(ctx, vote, rationale)
    }

    /// Finalizes approval status after review period
    pub fn finalize_hook_approval(
        ctx: Context<FinalizeHookApproval>,
    ) -> Result<()> {
        instructions::finalize_hook_approval::handler(ctx)
    }

    /// Updates the approval status of a previously approved hook
    pub fn update_hook_status(
        ctx: Context<UpdateHookStatus>,
        new_status: ApprovalStatus,
        reason: String,
    ) -> Result<()> {
        instructions::update_hook_status::handler(ctx, new_status, reason)
    }

    /// Creates a TokenBadge for approved Transfer Hooks automatically
    pub fn auto_approve_token_badge(
        ctx: Context<AutoApproveTokenBadge>,
        whirlpools_config: Pubkey,
        token_mint: Pubkey,
    ) -> Result<()> {
        instructions::auto_approve_token_badge::handler(ctx, whirlpools_config, token_mint)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_program_id() {
        // Verify program ID matches declared ID
        assert_eq!(
            crate::ID,
            "THRxN7x8Z2Jb3fZ2nSzGBHpv5d8DvVhEjT1rLqK8ABCD".parse().unwrap()
        );
    }
}