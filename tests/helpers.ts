import { Buffer } from "node:buffer"
import * as anchor from "@coral-xyz/anchor";

import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function generateAndAirdropSigner(
    provider: anchor.AnchorProvider
): Promise<Keypair> {
    const keypair = Keypair.generate();
    const signature = await provider.connection.requestAirdrop(
        keypair.publicKey,
        5 * LAMPORTS_PER_SOL
    );
    const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
    });
    return keypair;
}

export function assertCollectionData(
    collectionData: Buffer
    expectedName: string,
    expectedUri: string
) {
    const utf8 = collectionData.toString("utf8");

    const hasName = utf8.includes(expectedName);
    const hasUri = utf8.includes(expectedUri);

    if (!hasName || !hasUri) {
        throw new Error(
            `Collection data mismatch\n` +
            `Expected name="${expectedName}" found=${hasName}\n` +
            `Expected uri="${expectedUri}" found=${hasUri}\n` +
            `Full decoded data: ${utf8}`
        );
    }

    return true;
}
