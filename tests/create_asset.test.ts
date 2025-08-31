import { expect } from "chai";
import { describe, before, it } from "node:test";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair, PublicKey } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { generateAndAirdropSigner, createNewCollection } from "./helpers";

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
	const bobAssetName = "BOB ASSET";
	const bobAssetURI = "https://bob.asset.uri.json";
	const bobAssetArgs = {
		name: bobAssetName,
		uri: bobAssetURI,
	};

	let jane: Keypair;
	let janeAsset: Keypair;
	const janeAssetName = "JANE ASSET";
	const janeAssetURI = "https://jane.asset.uri.json";
	const janeAssetArgs = {
		name: janeAssetName,
		uri: janeAssetURI,
	};

	let john: Keypair;
	let johnAsset: Keypair;
	let johnCollection: PublicKey;
	const johnAssetName = "JOHN ASSET";
	const johnAssetURI = "https://john.asset.uri.json";
	const johnAssetArgs = {
		name: johnAssetName,
		uri: johnAssetURI,
	};

	before(async () => {
		alice = await generateAndAirdropSigner();
		bob = await generateAndAirdropSigner();
		jane = await generateAndAirdropSigner();
		john = await generateAndAirdropSigner();

		aliceAsset = Keypair.generate();
		bobAsset = Keypair.generate();
		janeAsset = Keypair.generate();
		johnAsset = Keypair.generate();

		aliceCollection = await createNewCollection(alice.publicKey);
		johnCollection = await createNewCollection(john.publicKey);
	});

	it("creates Alice asset with Alice collection", async () => {
		await program.methods
			.createAsset(aliceAssetArgs)
			.accountsStrict({
				payer: alice.publicKey,
				asset: aliceAsset.publicKey,
				authority: alice.publicKey,
				owner: alice.publicKey,
				collection: aliceCollection,
				updateAuthority: null,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([alice, aliceAsset])
			.rpc();
	});

	it("creates Bob asset with Bob as the update authority", async () => {
		await program.methods
			.createAsset(bobAssetArgs)
			.accountsStrict({
				payer: bob.publicKey,
				asset: bobAsset.publicKey,
				authority: bob.publicKey,
				owner: bob.publicKey,
				collection: null,
				updateAuthority: bob.publicKey,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([bob, bobAsset])
			.rpc();
	});

	it("creates Jane asset without a collection and update authority", async () => {
		await program.methods
			.createAsset(janeAssetArgs)
			.accountsStrict({
				payer: jane.publicKey,
				asset: janeAsset.publicKey,
				authority: jane.publicKey,
				owner: jane.publicKey,
				collection: null,
				updateAuthority: null,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([jane, janeAsset])
			.rpc();
	});

	it("fails if John tries to create an asset with both a collection and an update authority", async () => {
		let transactionFailed = false;
		try {
			await program.methods
				.createAsset(johnAssetArgs)
				.accountsStrict({
					payer: john.publicKey,
					asset: johnAsset.publicKey,
					authority: john.publicKey,
					owner: john.publicKey,
					collection: johnCollection,
					updateAuthority: john.publicKey,
					systemProgram: SYSTEM_PROGRAM_ID,
					mplCoreProgram: MPL_CORE_PROGRAM_ID,
				})
				.signers([john, johnAsset])
				.rpc();
		} catch (error) {
			transactionFailed = true;
			expect(error.message).to.contains(
				"Cannot specify both an update authority and collection on an asset"
			);
		} finally {
			expect(transactionFailed).to.be.true;
		}
	});

	it("fails if Alice tries to recreate Alice's asset with update authority but no collection", async () => {
		let transactionFailed = false;
		try {
			await program.methods
				.createAsset(aliceAssetArgs)
				.accountsStrict({
					payer: alice.publicKey,
					asset: aliceAsset.publicKey,
					authority: alice.publicKey,
					owner: alice.publicKey,
					collection: null,
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
