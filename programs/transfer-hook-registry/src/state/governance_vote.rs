use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GovernanceVote {
    /// The hook submission being voted on
    pub submission: Pubkey,         // 32
    /// The voter
    pub voter: Pubkey,              // 32
    /// Vote (true = approve, false = reject)
    pub vote: bool,                 // 1
    /// Voting weight (for future weighted voting)
    pub weight: u64,                // 8
    /// Timestamp when vote was cast
    pub voted_at: i64,              // 8
    /// Optional rationale for the vote
    pub rationale: String,          // 4 + up to 256 bytes
    /// Bump seed for PDA
    pub bump: u8,                   // 1
    /// Reserved space
    pub reserved: [u8; 32],        // 32
}

impl GovernanceVote {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8 + 8 + 4 + 256 + 1 + 32;

    pub fn initialize(
        &mut self,
        submission: Pubkey,
        voter: Pubkey,
        vote: bool,
        rationale: String,
        bump: u8,
    ) -> Result<()> {
        let clock = Clock::get()?;
        
        self.submission = submission;
        self.voter = voter;
        self.vote = vote;
        self.weight = 1; // Default weight, can be enhanced later
        self.voted_at = clock.unix_timestamp;
        self.rationale = rationale;
        self.bump = bump;
        Ok(())
    }

    pub fn seeds(&self) -> [&[u8]; 4] {
        [b"vote", self.submission.as_ref(), self.voter.as_ref(), &[self.bump]]
    }
}