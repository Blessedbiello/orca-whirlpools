use anchor_lang::prelude::*;
use solana_program::account_info::AccountInfo;
use crate::{
    state::{HookSubmission, RiskAssessment, ApprovalStatus},
    events::RiskAssessmentCompleted,
    errors::ErrorCode,
    utils::program_analysis,
};

#[derive(Accounts)]
pub struct AssessHookRisk<'info> {
    #[account(mut)]
    pub hook_submission: Account<'info, HookSubmission>,

    #[account(
        init,
        payer = assessor,
        space = RiskAssessment::LEN,
        seeds = [b"risk_assessment", hook_submission.key().as_ref()],
        bump
    )]
    pub risk_assessment: Account<'info, RiskAssessment>,

    #[account(mut)]
    pub assessor: Signer<'info>,

    /// CHECK: This is the Transfer Hook program being assessed
    pub hook_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AssessHookRisk>) -> Result<()> {
    let hook_submission = &mut ctx.accounts.hook_submission;
    let risk_assessment = &mut ctx.accounts.risk_assessment;
    let hook_program = &ctx.accounts.hook_program;
    let bump = ctx.bumps.risk_assessment;

    // Verify the hook program matches the submission
    require!(
        hook_program.key() == hook_submission.program_id,
        ErrorCode::InvalidProgramId
    );

    // Initialize risk assessment
    risk_assessment.initialize(
        hook_submission.key(),
        ctx.accounts.assessor.key(),
        bump,
    )?;

    // Perform automated risk analysis
    let risk_flags = program_analysis::analyze_program_risk(hook_program)?;
    risk_assessment.risk_flags = risk_flags;
    risk_assessment.calculate_risk_score();

    // Update submission status and automated checks
    let automated_checks_passed = risk_assessment.passes_automated_checks();
    hook_submission.automated_checks_passed = automated_checks_passed;
    hook_submission.risk_score = risk_assessment.overall_score;
    hook_submission.update_status(ApprovalStatus::UnderReview)?;

    // Add assessment notes
    let notes = program_analysis::generate_assessment_notes(&risk_assessment.risk_flags);
    require!(notes.len() <= 512, ErrorCode::AssessmentNotesTooLong);
    risk_assessment.notes = notes;

    emit!(RiskAssessmentCompleted {
        submission: hook_submission.key(),
        program_id: hook_submission.program_id,
        risk_score: risk_assessment.overall_score,
        automated_checks_passed,
        requires_manual_review: risk_assessment.requires_manual_review,
    });

    Ok(())
}