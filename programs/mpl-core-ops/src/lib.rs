pub mod instructions;
pub mod types;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use types::*;

declare_id!("htfkB267FHfayF1w33dg8an7JgEX7ubkqkadyrBgzvf");

#[program]
pub mod mpl_core_ops {
    use super::*;

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        args: CreateCollectionArgs,
    ) -> Result<()> {
        ctx.accounts.create_collection(args)
    }

    pub fn create_asset(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
        ctx.accounts.create_asset(args)
    }

    pub fn freeze_asset(ctx: Context<FreezeAsset>) -> Result<()> {
        ctx.accounts.freeze_asset()
    }

    pub fn transfer_asset(ctx: Context<TransferAsset>) -> Result<()> {
        ctx.accounts.transfer_asset()
    }

    pub fn burn_asset(ctx: Context<BurnAsset>) -> Result<()> {
        ctx.accounts.burn_asset()
    }
}
