import { Buffer } from "node:buffer";
import bs58 from "bs58";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";

import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.mplCoreOps as Program<MplCoreOps>;

export async function generateAndAirdropSigner(): Promise<Keypair> {
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
    collectionData: Buffer,
    expectedName: string,
    expectedUri: string,
    expectedUpdateAuthority: PublicKey
) {
    let offset = 0;

    // Discriminator (1 byte)
    offset += 1;

    // Update Authority (32 bytes)
    const updateAuthBytes = collectionData.subarray(offset, offset + 32);
    const updateAuthority = bs58.encode(updateAuthBytes);
    offset += 32;

    // Name length (u32 LE)
    const nameLen = collectionData.readUInt32LE(offset);
    offset += 4;

    // Name string
    const name = collectionData
        .subarray(offset, offset + nameLen)
        .toString("utf8");
    offset += nameLen;

    // URI length (u32 LE)
    const uriLen = collectionData.readUInt32LE(offset);
    offset += 4;
    // URI string
    const uri = collectionData
        .subarray(offset, offset + uriLen)
        .toString("utf8");

    const hasName = name === expectedName;
    const hasUri = uri === expectedUri;
    const hasUpdateAuthority =
        updateAuthority === expectedUpdateAuthority?.toBase58();

    if (!hasName || !hasUri || !hasUpdateAuthority) {
        throw new Error(
            `Collection data mismatch\n` +
            `Expected name="${expectedName}" found=${name}\n` +
            `Expected uri="${expectedUri}" found=${uri}\n` +
            `Expected update authority="${expectedUpdateAuthority}" found=${updateAuthority}`
        );
    }

    return true;
}

export async function createNewCollection(
    updateAuthority: PublicKey | null
): Promise<PublicKey> {
    const payer = await generateAndAirdropSigner();
    const collection = Keypair.generate();
    const collectionArgs = {
        name: "NEW COLLECTION",
        uri: "https://new.collection.uri.json",
    };

    await program.methods
        .createCollection(collectionArgs)
        .accountsStrict({
            payer: payer.publicKey,
            collection: collection.publicKey,
            updateAuthority: updateAuthority,
            systemProgram: SYSTEM_PROGRAM_ID,
            mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([payer, collection])
        .rpc();

    return collection.publicKey;
}

export async function createNewAsset(
    updateAuthority: PublicKey | null,
    owner: PublicKey,
    inCollection: boolean
): Promise<PublicKey> {
    const payer = await generateAndAirdropSigner();
    const collection = await createNewCollection(updateAuthority);
    const asset = Keypair.generate();
    const assetArgs = { name: "NEW ASSET", uri: "https://new.asset.uri.json" };

    await program.methods
        .createAsset(assetArgs)
        .accountsStrict({
            payer: payer.publicKey,
            collection: inCollection ? collection : null,
            asset: asset.publicKey,
            authority: owner,
            owner,
            updateAuthority: inCollection ? null : updateAuthority,
            systemProgram: SYSTEM_PROGRAM_ID,
            mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([payer, asset])
        .rpc();

    return asset.publicKey;
}
