use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ApprovalStatus {
    Pending,       // Submitted, awaiting review
    UnderReview,   // Risk assessment in progress
    Approved,      // Approved for use
    Rejected,      // Rejected
    Suspended,     // Previously approved but now suspended
    Deprecated,    // Deprecated/outdated
}

impl Default for ApprovalStatus {
    fn default() -> Self {
        ApprovalStatus::Pending
    }
}

#[account]
pub struct HookSubmission {
    /// The Transfer Hook program ID being evaluated
    pub program_id: Pubkey,                 // 32
    /// Submitter of the hook program
    pub submitter: Pubkey,                  // 32
    /// Current approval status
    pub status: ApprovalStatus,             // 1 + padding
    /// Timestamp when submission was created
    pub submitted_at: i64,                  // 8
    /// Timestamp when review period ends
    pub review_ends_at: i64,                // 8
    /// Timestamp when status was last updated  
    pub last_updated_at: i64,               // 8
    /// URI pointing to metadata (documentation, source code, etc.)
    pub metadata_uri: String,               // 4 + up to 256 bytes
    /// Optional governance proposal ID
    pub governance_proposal_id: Option<Pubkey>, // 1 + 32
    /// Total votes for approval
    pub votes_for: u64,                     // 8
    /// Total votes against approval
    pub votes_against: u64,                 // 8
    /// Risk assessment score (0-100, higher = more risky)
    pub risk_score: u8,                     // 1
    /// Whether automated risk assessment passed
    pub automated_checks_passed: bool,      // 1
    /// Bump seed for PDA
    pub bump: u8,                           // 1
    /// Reserved space for future fields
    pub reserved: [u8; 64],                 // 64
}

impl HookSubmission {
    // Conservative estimate allowing for string serialization overhead
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 4 + 256 + 1 + 32 + 8 + 8 + 1 + 1 + 1 + 64;

    pub fn initialize(
        &mut self,
        program_id: Pubkey,
        submitter: Pubkey,
        metadata_uri: String,
        governance_proposal_id: Option<Pubkey>,
        review_period_seconds: u64,
        bump: u8,
    ) -> Result<()> {
        let clock = Clock::get()?;
        
        self.program_id = program_id;
        self.submitter = submitter;
        self.status = ApprovalStatus::Pending;
        self.submitted_at = clock.unix_timestamp;
        self.review_ends_at = clock.unix_timestamp + review_period_seconds as i64;
        self.last_updated_at = clock.unix_timestamp;
        self.metadata_uri = metadata_uri;
        self.governance_proposal_id = governance_proposal_id;
        self.votes_for = 0;
        self.votes_against = 0;
        self.risk_score = 0;
        self.automated_checks_passed = false;
        self.bump = bump;
        Ok(())
    }

    pub fn seeds(&self) -> Vec<Vec<u8>> {
        vec![b"submission".to_vec(), self.program_id.to_bytes().to_vec(), vec![self.bump]]
    }

    pub fn is_review_period_ended(&self) -> Result<bool> {
        let clock = Clock::get()?;
        Ok(clock.unix_timestamp >= self.review_ends_at)
    }

    pub fn can_be_finalized(&self) -> bool {
        matches!(self.status, ApprovalStatus::UnderReview)
    }

    pub fn update_status(&mut self, new_status: ApprovalStatus) -> Result<()> {
        let clock = Clock::get()?;
        self.status = new_status;
        self.last_updated_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn add_vote(&mut self, approve: bool) {
        if approve {
            self.votes_for += 1;
        } else {
            self.votes_against += 1;
        }
    }

    pub fn get_approval_ratio(&self) -> f64 {
        let total_votes = self.votes_for + self.votes_against;
        if total_votes == 0 {
            0.0
        } else {
            self.votes_for as f64 / total_votes as f64
        }
    }
}

impl Default for HookSubmission {
    fn default() -> Self {
        Self {
            program_id: Pubkey::default(),
            submitter: Pubkey::default(),
            status: ApprovalStatus::default(),
            submitted_at: 0,
            review_ends_at: 0,
            last_updated_at: 0,
            metadata_uri: String::new(),
            governance_proposal_id: None,
            votes_for: 0,
            votes_against: 0,
            risk_score: 0,
            automated_checks_passed: false,
            bump: 0,
            reserved: [0; 64],
        }
    }
}