use anchor_lang::prelude::*;

use mpl_core::{
    instructions::AddPluginV1CpiBuilder,
    types::{FreezeDelegate, Plugin, PluginAuthority, UpdateAuthority},
    ID as MPL_CORE_ID,
};

#[derive(Accounts)]
pub struct FreezeAsset<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub owner: Signer<'info>,

    pub update_authority: Option<Signer<'info>>,

    // #[account(
    //     mut,
    //     has_one = owner,
    //     constraint = asset.update_authority == UpdateAuthority::Collection(collection.key()),
    // )]
    #[account(mut)]
    /// CHECK: This is the asset account
    pub asset: UncheckedAccount<'info>,

    // #[account(mut, has_one = update_authority)]
    #[account(mut)]
    /// CHECK: This is the asset collection
    pub collection: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core Program and is validated with the address
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl<'info> FreezeAsset<'info> {
    pub fn freeze_asset(&mut self) -> Result<()> {
        let collection = match &self.collection {
            Some(collection) => Some(collection.to_account_info()),
            None => None,
        };

        let update_authority = match &self.update_authority {
            Some(update_authority) => Some(update_authority.to_account_info()),
            None => None,
        };

        AddPluginV1CpiBuilder::new(&self.mpl_core_program.to_account_info())
            .asset(&self.asset.to_account_info())
            .collection(collection.as_ref())
            .payer(&self.payer.to_account_info())
            .authority(update_authority.as_ref())
            .system_program(&self.system_program.to_account_info())
            .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: true }))
            .init_authority(PluginAuthority::UpdateAuthority)
            .invoke()?;

        Ok(())
    }
}
