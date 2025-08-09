use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Registry is not initialized")]
    RegistryNotInitialized,

    #[msg("Unauthorized access - invalid authority")]
    Unauthorized,

    #[msg("Hook program already submitted for approval")]
    HookAlreadySubmitted,

    #[msg("Hook submission not found")]
    SubmissionNotFound,

    #[msg("Review period has not ended yet")]
    ReviewPeriodNotEnded,

    #[msg("Review period has already ended")]
    ReviewPeriodEnded,

    #[msg("Cannot finalize submission in current status")]
    CannotFinalize,

    #[msg("Voter has already voted on this submission")]
    AlreadyVoted,

    #[msg("Invalid approval status transition")]
    InvalidStatusTransition,

    #[msg("Risk assessment not completed")]
    RiskAssessmentIncomplete,

    #[msg("Hook program has too high risk score for auto-approval")]
    RiskScoreTooHigh,

    #[msg("Insufficient governance votes for approval")]
    InsufficientVotes,

    #[msg("Hook program is not approved for use")]
    HookNotApproved,

    #[msg("Metadata URI exceeds maximum length")]
    MetadataUriTooLong,

    #[msg("Rationale exceeds maximum length")]
    RationaleTooLong,

    #[msg("Invalid program ID - cannot be system program")]
    InvalidProgramId,

    #[msg("Hook program does not exist or is not executable")]
    ProgramNotExecutable,

    #[msg("Assessment notes exceed maximum length")]
    AssessmentNotesTooLong,

    #[msg("Transfer Hook is not compatible with Whirlpools")]
    IncompatibleHook,

    #[msg("Token mint does not have Transfer Hook extension")]
    NoTransferHookExtension,

    #[msg("Whirlpools config does not match")]
    WhirlpoolsConfigMismatch,
}