import * as anchor from "@coral-xyz/anchor";

import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function generateAndAirdropSigner(provider: anchor.AnchorProvider): Promise<Keypair> {
    const keypair = Keypair.generate();
    const signature = await provider.connection.requestAirdrop(keypair.publicKey, 5 * LAMPORTS_PER_SOL);
    const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
    });
    return keypair;
}