use anchor_lang::prelude::*;

use mpl_core::{instructions::CreateCollectionV2CpiBuilder, ID as MPL_CORE_ID};

use crate::types::CreateCollectionArgs;

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub collection: Signer<'info>,

    /// CHECK: This is the authority of the collection and will be checked by the mpl_core program
    pub update_authority: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: this account is checked by the address constraint
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl<'info> CreateCollection<'info> {
    pub fn create_collection(&mut self, args: CreateCollectionArgs) -> Result<()> {
        let update_authority = match &self.update_authority {
            Some(update_authority) => Some(update_authority.to_account_info()),
            None => None,
        };

        CreateCollectionV2CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .collection(&self.collection.to_account_info())
            .payer(&self.payer.to_account_info())
            .update_authority(update_authority.as_ref())
            .system_program(&self.system_program.to_account_info())
            .name(args.name)
            .uri(args.uri)
            .invoke()?;

        Ok(())
    }
}
