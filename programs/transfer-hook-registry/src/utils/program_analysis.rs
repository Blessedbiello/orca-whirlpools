use anchor_lang::prelude::*;
use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
};
use crate::state::RiskFlags;

/// Analyzes a Transfer Hook program for risk factors
pub fn analyze_program_risk(program_account: &AccountInfo) -> Result<RiskFlags> {
    let mut risk_flags = RiskFlags::default();

    // Check if program is executable
    if !program_account.executable {
        return Err(ProgramError::InvalidAccountData.into());
    }

    // Analyze program account data for risk indicators
    let program_data = program_account.try_borrow_data()?;
    
    // Basic checks on program structure
    risk_flags.has_upgrade_authority = check_upgrade_authority(&program_data)?;
    risk_flags.is_verified_build = check_verified_build(program_account.key)?;
    risk_flags.source_code_available = check_source_availability(program_account.key)?;
    
    // These would require more sophisticated analysis in a real implementation
    // For now, we'll use heuristics or require manual input
    risk_flags.performs_token_transfers = false; // Would need bytecode analysis
    risk_flags.requests_many_accounts = false;   // Would analyze instruction interfaces
    risk_flags.can_block_transfers = false;      // Would need execution simulation
    risk_flags.is_audited = false;               // Would check audit registry
    risk_flags.follows_best_practices = check_best_practices(&program_data)?;

    Ok(risk_flags)
}

/// Check if program has upgrade authority (indicates higher risk)
fn check_upgrade_authority(program_data: &[u8]) -> Result<bool> {
    // In a real implementation, this would parse the BPF loader state
    // to check if the program has an upgrade authority
    
    // For now, we'll assume programs have upgrade authority unless proven otherwise
    // This is a conservative approach for security
    
    // Basic check: if program data is very small, it might be upgradeable
    if program_data.len() < 1024 {
        return Ok(true); // Likely has upgrade authority
    }
    
    // More sophisticated checks would go here
    Ok(true) // Default to assuming upgrade authority exists
}

/// Check if program has a verified build
fn check_verified_build(program_id: &Pubkey) -> Result<bool> {
    // In a real implementation, this would:
    // 1. Check Solana Verify registry
    // 2. Query build verification services
    // 3. Check for reproducible builds
    
    // For demo purposes, we'll use some heuristics
    let program_id_str = program_id.to_string();
    
    // Check if program ID matches known patterns of verified programs
    // This is just a placeholder - real implementation would query external services
    if program_id_str.starts_with("1234") {
        Ok(true) // Mock: programs starting with "1234" are "verified"
    } else {
        Ok(false) // Default to unverified
    }
}

/// Check if source code is publicly available
fn check_source_availability(program_id: &Pubkey) -> Result<bool> {
    // In a real implementation, this would:
    // 1. Check GitHub repositories
    // 2. Query source code registries
    // 3. Verify source code matches deployed binary
    
    // For demo purposes, we'll use mock logic
    let program_id_str = program_id.to_string();
    
    // Mock: programs with certain patterns have "available" source code
    if program_id_str.contains("abc") {
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Check if program follows best practices
fn check_best_practices(program_data: &[u8]) -> Result<bool> {
    // In a real implementation, this would analyze:
    // 1. Program structure and organization
    // 2. Error handling patterns
    // 3. Security practices
    // 4. Code complexity metrics
    
    // Basic heuristic: larger programs might be more complex
    if program_data.len() > 100_000 {
        Ok(false) // Very large programs might not follow best practices
    } else if program_data.len() > 10_000 {
        Ok(true)  // Medium-sized programs likely follow practices
    } else {
        Ok(false) // Very small programs might be incomplete
    }
}

/// Generate human-readable assessment notes based on risk flags
pub fn generate_assessment_notes(risk_flags: &RiskFlags) -> String {
    let mut notes = Vec::new();

    // Positive indicators
    if risk_flags.is_verified_build {
        notes.push("✅ Program has verified build");
    }
    if risk_flags.source_code_available {
        notes.push("✅ Source code is publicly available");
    }
    if risk_flags.is_audited {
        notes.push("✅ Program has been audited");
    }
    if risk_flags.follows_best_practices {
        notes.push("✅ Program follows development best practices");
    }

    // Risk indicators
    if risk_flags.has_upgrade_authority {
        notes.push("⚠️ Program has upgrade authority");
    }
    if risk_flags.performs_token_transfers {
        notes.push("🚨 Program performs token transfers");
    }
    if risk_flags.can_block_transfers {
        notes.push("🚨 Program can block transfers");
    }
    if risk_flags.requests_many_accounts {
        notes.push("⚠️ Program requests many accounts");
    }

    // Neutral/informational
    if notes.is_empty() {
        notes.push("ℹ️ Basic risk assessment completed - manual review recommended");
    }

    notes.join("; ")
}

#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::pubkey::Pubkey;

    #[test]
    fn test_risk_flags_default() {
        let flags = RiskFlags::default();
        assert!(flags.has_upgrade_authority); // Conservative default
        assert!(!flags.is_verified_build);
    }

    #[test]
    fn test_generate_assessment_notes() {
        let mut flags = RiskFlags::default();
        flags.is_verified_build = true;
        flags.source_code_available = true;
        
        let notes = generate_assessment_notes(&flags);
        assert!(notes.contains("verified build"));
        assert!(notes.contains("publicly available"));
    }
}