use anchor_lang::prelude::*;
use mpl_core::{instructions::BurnV1CpiBuilder, ID as MPL_CORE_ID};

#[derive(Accounts)]
pub struct BurnAsset<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub authority: Option<Signer<'info>>,

    #[account(mut)]
    /// CHECK: This is the asset account
    pub asset: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: This is the asset collection
    pub collection: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core Program and is validated with the address
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl<'info> BurnAsset<'info> {
    pub fn burn_asset(&mut self) -> Result<()> {
        let collection = match &self.collection {
            Some(collection) => Some(collection.to_account_info()),
            None => None,
        };

        let authority = match &self.authority {
            Some(authority) => Some(authority.to_account_info()),
            None => None,
        };

        BurnV1CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.asset.to_account_info())
            .collection(collection.as_ref())
            .payer(&self.payer.to_account_info())
            .authority(authority.as_ref())
            .system_program(Some(&self.system_program.to_account_info()))
            .invoke()?;

        Ok(())
    }
}
