use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct RiskFlags {
    /// Program has upgrade authority (higher risk)
    pub has_upgrade_authority: bool,
    /// Program executable is verified (lower risk)
    pub is_verified_build: bool,
    /// Program performs token transfers (higher risk)
    pub performs_token_transfers: bool,
    /// Program requests excessive accounts (higher risk)
    pub requests_many_accounts: bool,
    /// Program can block transfers (higher risk)
    pub can_block_transfers: bool,
    /// Program has been audited (lower risk)
    pub is_audited: bool,
    /// Program source code is publicly available (lower risk)
    pub source_code_available: bool,
    /// Program follows best practices (lower risk)
    pub follows_best_practices: bool,
}

impl Default for RiskFlags {
    fn default() -> Self {
        RiskFlags {
            has_upgrade_authority: true,  // Assume worst case by default
            is_verified_build: false,
            performs_token_transfers: false,
            requests_many_accounts: false,
            can_block_transfers: false,
            is_audited: false,
            source_code_available: false,
            follows_best_practices: false,
        }
    }
}

#[account]
#[derive(Default)]
pub struct RiskAssessment {
    /// The hook submission this assessment belongs to
    pub submission: Pubkey,             // 32
    /// Overall risk score (0-100, higher = more risky)
    pub overall_score: u8,              // 1
    /// Individual risk flags
    pub risk_flags: RiskFlags,          // 8 (8 bools)
    /// Automated assessment completed timestamp
    pub assessed_at: i64,               // 8
    /// Assessor (program or authority)
    pub assessor: Pubkey,               // 32
    /// Additional notes from assessment
    pub notes: String,                  // 4 + up to 512 bytes
    /// Whether manual review is recommended
    pub requires_manual_review: bool,   // 1
    /// Bump seed for PDA
    pub bump: u8,                       // 1
    /// Reserved space
    pub reserved: [u8; 32],            // 32
}

impl RiskAssessment {
    pub const LEN: usize = 8 + 32 + 1 + 8 + 8 + 32 + 4 + 512 + 1 + 1 + 32;

    pub fn initialize(
        &mut self,
        submission: Pubkey,
        assessor: Pubkey,
        bump: u8,
    ) -> Result<()> {
        let clock = Clock::get()?;
        
        self.submission = submission;
        self.overall_score = 50; // Default medium risk
        self.risk_flags = RiskFlags::default();
        self.assessed_at = clock.unix_timestamp;
        self.assessor = assessor;
        self.notes = String::new();
        self.requires_manual_review = true; // Default to requiring manual review
        self.bump = bump;
        Ok(())
    }

    pub fn seeds(&self) -> [&[u8]; 3] {
        [b"risk_assessment", self.submission.as_ref(), &[self.bump]]
    }

    pub fn calculate_risk_score(&mut self) {
        let mut score: u8 = 0;
        
        // Risk factors that increase score (bad)
        if self.risk_flags.has_upgrade_authority { score += 15; }
        if self.risk_flags.performs_token_transfers { score += 25; }
        if self.risk_flags.requests_many_accounts { score += 10; }
        if self.risk_flags.can_block_transfers { score += 20; }
        
        // Risk factors that decrease score (good)  
        if self.risk_flags.is_verified_build { score = score.saturating_sub(15); }
        if self.risk_flags.is_audited { score = score.saturating_sub(20); }
        if self.risk_flags.source_code_available { score = score.saturating_sub(10); }
        if self.risk_flags.follows_best_practices { score = score.saturating_sub(10); }
        
        self.overall_score = score.min(100);
        
        // Recommend manual review for high-risk programs
        self.requires_manual_review = score > 60;
    }

    pub fn is_low_risk(&self) -> bool {
        self.overall_score <= 30
    }

    pub fn is_high_risk(&self) -> bool {
        self.overall_score >= 70
    }

    pub fn passes_automated_checks(&self) -> bool {
        // Basic criteria for automated approval
        !self.risk_flags.performs_token_transfers &&
        !self.risk_flags.can_block_transfers &&
        self.risk_flags.source_code_available &&
        self.overall_score <= 40
    }
}