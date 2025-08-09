use anchor_lang::prelude::*;
use crate::state::ApprovalStatus;

#[event]
pub struct RegistryInitialized {
    pub authority: Pubkey,
    pub governance_threshold: u64,
    pub review_period_seconds: u64,
}

#[event] 
pub struct HookSubmitted {
    pub program_id: Pubkey,
    pub submitter: Pubkey,
    pub metadata_uri: String,
    pub governance_proposal_id: Option<Pubkey>,
    pub review_ends_at: i64,
}

#[event]
pub struct RiskAssessmentCompleted {
    pub submission: Pubkey,
    pub program_id: Pubkey,
    pub risk_score: u8,
    pub automated_checks_passed: bool,
    pub requires_manual_review: bool,
}

#[event]
pub struct GovernanceVoteCast {
    pub submission: Pubkey,
    pub program_id: Pubkey,
    pub voter: Pubkey,
    pub vote: bool,
    pub total_votes_for: u64,
    pub total_votes_against: u64,
}

#[event]
pub struct HookApprovalFinalized {
    pub program_id: Pubkey,
    pub status: ApprovalStatus,
    pub final_votes_for: u64,
    pub final_votes_against: u64,
    pub risk_score: u8,
}

#[event]
pub struct HookStatusUpdated {
    pub program_id: Pubkey,
    pub old_status: ApprovalStatus,
    pub new_status: ApprovalStatus,
    pub reason: String,
    pub updated_by: Pubkey,
}

#[event]
pub struct TokenBadgeAutoApproved {
    pub whirlpools_config: Pubkey,
    pub token_mint: Pubkey,
    pub hook_program: Pubkey,
    pub approved_at: i64,
}