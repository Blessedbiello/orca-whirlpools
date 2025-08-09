use anchor_lang::prelude::*;

#[account]
pub struct RegistryConfig {
    /// Authority that can update registry settings
    pub authority: Pubkey,              // 32
    /// Minimum threshold for governance approval (in votes)
    pub governance_threshold: u64,       // 8
    /// Review period in seconds before finalization
    pub review_period_seconds: u64,      // 8
    /// Total number of submitted hooks
    pub total_submissions: u64,          // 8
    /// Total number of approved hooks
    pub total_approved: u64,             // 8
    /// Bump seed for PDA
    pub bump: u8,                        // 1
    /// Reserved space for future upgrades
    pub reserved: [u8; 127],            // 127
}

impl RegistryConfig {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 127;

    pub fn initialize(
        &mut self,
        authority: Pubkey,
        governance_threshold: u64,
        review_period_seconds: u64,
        bump: u8,
    ) -> Result<()> {
        self.authority = authority;
        self.governance_threshold = governance_threshold;
        self.review_period_seconds = review_period_seconds;
        self.total_submissions = 0;
        self.total_approved = 0;
        self.bump = bump;
        Ok(())
    }

    pub fn seeds(&self) -> Vec<Vec<u8>> {
        vec![b"registry".to_vec(), vec![self.bump]]
    }
}

impl Default for RegistryConfig {
    fn default() -> Self {
        Self {
            authority: Pubkey::default(),
            governance_threshold: 7500, // 75% default
            review_period_seconds: 604800, // 1 week default
            total_submissions: 0,
            total_approved: 0,
            bump: 0,
            reserved: [0; 127],
        }
    }
}