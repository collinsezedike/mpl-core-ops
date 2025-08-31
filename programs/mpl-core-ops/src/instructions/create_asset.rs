use anchor_lang::prelude::*;

use mpl_core::{instructions::CreateV2CpiBuilder, ID as MPL_CORE_ID};

use crate::types::CreateAssetArgs;

#[derive(Accounts)]
pub struct CreateAsset<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub asset: Signer<'info>,

    // pub collection: Option<Account<'info, BaseCollectionV1>>,
    // // ❌ Doesn't work due to mismatch between Anchor account types and Core account types.
    #[account(mut)]
    /// CHECK: This is the asset collection
    pub collection: Option<UncheckedAccount<'info>>,

    pub authority: Option<Signer<'info>>,

    /// CHECK: This is the owner of the asset
    pub owner: Option<UncheckedAccount<'info>>,

    /// CHECK: This is the authority of the asset
    pub update_authority: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core Program and is validated with the address
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl<'info> CreateAsset<'info> {
    pub fn create_asset(&mut self, args: CreateAssetArgs) -> Result<()> {
        let collection = match &self.collection {
            Some(collection) => Some(collection.to_account_info()),
            None => None,
        };

        let authority = match &self.authority {
            Some(authority) => Some(authority.to_account_info()),
            None => None,
        };

        let owner = match &self.owner {
            Some(owner) => Some(owner.to_account_info()),
            None => None,
        };

        let update_authority = match &self.update_authority {
            Some(update_authority) => Some(update_authority.to_account_info()),
            None => None,
        };

        CreateV2CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.asset.to_account_info())
            .collection(collection.as_ref())
            .authority(authority.as_ref())
            .payer(&self.payer.to_account_info())
            .owner(owner.as_ref())
            .update_authority(update_authority.as_ref())
            .system_program(&self.system_program.to_account_info())
            .name(args.name)
            .uri(args.uri)
            .invoke()?;

        Ok(())
    }
}
