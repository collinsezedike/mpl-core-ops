import { expect } from "chai";
import { describe, before, it } from "node:test";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { generateAndAirdropSigner, assertCollectionData } from "./helpers";
import { PublicKey } from "@metaplex-foundation/umi";

describe("Create Assets", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.mplCoreOps as Program<MplCoreOps>;

	let alice: Keypair;
	let aliceAsset: Keypair;
	let aliceCollection: PublicKey;
	const aliceAssetName = "ALICE ASSET";
	const aliceAssetURI = "https://alice.asset.uri.json";
	const aliceAssetArgs = {
		name: aliceAssetName,
		uri: aliceAssetURI,
	};

	let bob: Keypair;
	let bobAsset: Keypair;
	let bobCollection: PublicKey;
	const bobAssetName = "BOB ASSET";
	const bobAssetURI = "https://bob.asset.uri.json";
	const bobAssetArgs = {
		name: bobAssetName,
		uri: bobAssetURI,
	};

	let john: Keypair;
	let johnAsset: Keypair;
	let johnCollection: PublicKey;
	const johnAssetName = "JOHN ASSET";
	const johnAssetURI = "https://johh.asset.uri.json";
	const johnAssetArgs = {
		name: johnAssetName,
		uri: johnAssetURI,
	};

	before(async () => {
		alice = await generateAndAirdropSigner(provider);
		bob = await generateAndAirdropSigner(provider);
		john = await generateAndAirdropSigner(provider);

		aliceAsset = Keypair.generate();
		bobAsset = Keypair.generate();
		johnAsset = Keypair.generate();

		// Create Alice Collection
		// Create Bob Collection
		// Create John Collection
	});


	it("creates alice asset", async () => {
		await program.methods
			.createAsset(aliceAssetArgs)
			.accountsStrict({
				payer: alice.publicKey,
				asset: aliceAsset.publicKey,
				authority: alice.publicKey,
				owner: alice.publicKey,
				collection: aliceCollection,
				updateAuthority: alice.publicKey,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([alice, aliceAsset])
			.rpc();
	});

	it("prevents duplicate asset initialization", async () => {
		let transactionFailed = false;
		try {
			await program.methods
				.createAsset(aliceAssetArgs)
				.accountsStrict({
					payer: alice.publicKey,
					asset: aliceAsset.publicKey,
					authority: alice.publicKey,
					owner: alice.publicKey,
					collection: aliceCollection,
					updateAuthority: alice.publicKey,
					systemProgram: SYSTEM_PROGRAM_ID,
					mplCoreProgram: MPL_CORE_PROGRAM_ID,
				})
				.signers([alice, aliceAsset])
				.rpc();
		} catch (error) {
			transactionFailed = true;
			expect(error.message).to.contains("already in use");
		} finally {
			expect(transactionFailed).to.be.true;
		}
	});
});
