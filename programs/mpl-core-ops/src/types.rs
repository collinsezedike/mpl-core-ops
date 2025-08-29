use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateCollectionArgs {
    pub name: String,
    pub uri: String,
}
