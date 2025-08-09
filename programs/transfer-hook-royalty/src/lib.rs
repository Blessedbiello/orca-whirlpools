use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::Token2022,
    token_interface::{Mint, TokenAccount},
};
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("7NsQqWLbikjv3kWqujtb2YQGToY4LSdn35egQs4AJEHC");

#[program]
pub mod transfer_hook_royalty {
    use super::*;

    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // Define the extra accounts needed for the transfer hook
        let account_metas = vec![
            ExtraAccountMeta::new_with_seeds(
                &[Seed::Literal {
                    bytes: b"royalty_vault".to_vec(),
                }],
                false, // is_signer
                true,  // is_writable
            )?,
        ];

        // Calculate account size and set the data
        let account_size = ExtraAccountMetaList::size_of(account_metas.len())?;
        ctx.accounts.extra_account_meta_list.realloc(account_size, false)?;
        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
            &account_metas,
        )?;

        Ok(())
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        // This is called for every token transfer
        msg!("Transfer Hook: Processing transfer of {} tokens", amount);

        let source_token_info = &ctx.accounts.source_token;
        let destination_token_info = &ctx.accounts.destination_token;
        let mint_info = &ctx.accounts.mint;
        let royalty_vault = &ctx.accounts.royalty_vault;

        msg!("Source: {}", source_token_info.key());
        msg!("Destination: {}", destination_token_info.key());
        msg!("Mint: {}", mint_info.key());
        msg!("Royalty Vault: {}", royalty_vault.key());

        // Calculate royalty (2.5% in this example)
        let royalty_amount = amount
            .checked_mul(250)  // 2.5% = 250 basis points
            .unwrap()
            .checked_div(10000)
            .unwrap();

        if royalty_amount > 0 {
            msg!("Collecting royalty: {} tokens", royalty_amount);
            
            // In a real implementation, you would:
            // 1. Transfer royalty_amount from source to royalty_vault
            // 2. Update the actual transfer amount to (amount - royalty_amount)
            // 
            // For this demo, we'll just log the action
            msg!("Royalty of {} tokens would be transferred to vault", royalty_amount);
        }

        msg!("Transfer Hook: Completed successfully");
        Ok(())
    }

    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)?;

        match instruction {
            TransferHookInstruction::Execute { amount } => {
                // This is a simplified fallback - in production you'd need proper context creation
                msg!("Transfer hook fallback executed with amount: {}", amount);
                Ok(())
            }
            _ => return Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: ExtraAccountMetaList Account, must use these seeds
    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    pub mint: InterfaceAccount<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    #[account(
        token::mint = mint,
        token::authority = owner,
    )]
    pub source_token: InterfaceAccount<'info, TokenAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        token::mint = mint,
    )]
    pub destination_token: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: source token account owner, can be SystemAccount or PDA owned by another program
    pub owner: UncheckedAccount<'info>,

    /// CHECK: ExtraAccountMetaList Account,
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    /// Royalty vault PDA
    /// CHECK: Royalty vault account
    #[account(
        mut,
        seeds = [b"royalty_vault"],
        bump,
    )]
    pub royalty_vault: UncheckedAccount<'info>,
}

#[error_code]
pub enum TransferHookError {
    #[msg("Invalid transfer amount")]
    InvalidAmount,
    #[msg("Royalty calculation overflow")]
    RoyaltyOverflow,
}