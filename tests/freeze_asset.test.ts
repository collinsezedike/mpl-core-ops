import { expect } from "chai";
import { describe, before, it } from "node:test";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair, PublicKey } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { generateAndAirdropSigner, createNewAsset } from "./helpers";

describe("Freeze Assets", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.mplCoreOps as Program<MplCoreOps>;

	let alice: Keypair;
	let aliceAsset: PublicKey;
	let aliceCollection: PublicKey;

	let bob: Keypair;
	let bobAsset: PublicKey;

	let jane: Keypair;
	let janeAsset: PublicKey;

	let john: Keypair;
	let johnAsset: PublicKey;
	let johnCollection: PublicKey;

	before(async () => {
		alice = await generateAndAirdropSigner();
		bob = await generateAndAirdropSigner();
		jane = await generateAndAirdropSigner();
		john = await generateAndAirdropSigner();

		({ asset: aliceAsset, collection: aliceCollection } = await createNewAsset(alice, alice.publicKey, true));
		({ asset: bobAsset } = await createNewAsset(bob, bob.publicKey, false));
		({ asset: janeAsset } = await createNewAsset(jane, null, true));
		({ asset: johnAsset } = await createNewAsset(john, null, false));
	});

	it("freezes Alice asset", async () => {
		await program.methods
			.freezeAsset()
			.accountsStrict({
				payer: alice.publicKey,
				owner: alice.publicKey,
				asset: aliceAsset,
				collection: aliceCollection,
				updateAuthority: null,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([alice])
			.rpc();
	});

	it("freezes Bob asset with Bob as the update authority", async () => {
		await program.methods
			.freezeAsset()
			.accountsStrict({
				payer: bob.publicKey,
				owner: bob.publicKey,
				asset: bobAsset,
				collection: null,
				updateAuthority: bob.publicKey,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([bob])
			.rpc();
	});

	it("fails if Alice tries to transfer a frozen asset", async () => {
		let transactionFailed = false;
		try {
			await program.methods
				.transferAsset()
				.accountsStrict({
					payer: john.publicKey,
					asset: aliceAsset,
					authority: alice.publicKey,
					newOwner: bob.publicKey,
					collection: aliceCollection,
					systemProgram: SYSTEM_PROGRAM_ID,
					mplCoreProgram: MPL_CORE_PROGRAM_ID,
				})
				.signers([alice])
				.rpc();
		} catch (error) {
			transactionFailed = true;
			console.log(error);
			// expect(error.message).to.contains(
			// 	"Cannot specify both an update authority and collection on an asset"
			// );
		} finally {
			expect(transactionFailed).to.be.true;
		}
	});

	// it("creates Jane asset without a collection and update authority", async () => {
	// 	await program.methods
	// 		.createAsset(janeAssetArgs)
	// 		.accountsStrict({
	// 			payer: jane.publicKey,
	// 			asset: janeAsset.publicKey,
	// 			authority: jane.publicKey,
	// 			owner: jane.publicKey,
	// 			collection: null,
	// 			updateAuthority: null,
	// 			systemProgram: SYSTEM_PROGRAM_ID,
	// 			mplCoreProgram: MPL_CORE_PROGRAM_ID,
	// 		})
	// 		.signers([jane, janeAsset])
	// 		.rpc();
	// });

	// it("fails if John tries to create an asset with both a collection and an update authority", async () => {
	// 	let transactionFailed = false;
	// 	try {
	// 		await program.methods
	// 			.createAsset(johnAssetArgs)
	// 			.accountsStrict({
	// 				payer: john.publicKey,
	// 				asset: johnAsset.publicKey,
	// 				authority: john.publicKey,
	// 				owner: john.publicKey,
	// 				collection: johnCollection,
	// 				updateAuthority: john.publicKey,
	// 				systemProgram: SYSTEM_PROGRAM_ID,
	// 				mplCoreProgram: MPL_CORE_PROGRAM_ID,
	// 			})
	// 			.signers([john, johnAsset])
	// 			.rpc();
	// 	} catch (error) {
	// 		transactionFailed = true;
	// 		expect(error.message).to.contains(
	// 			"Cannot specify both an update authority and collection on an asset"
	// 		);
	// 	} finally {
	// 		expect(transactionFailed).to.be.true;
	// 	}
	// });

	// it("fails if Alice tries to recreate Alice's asset with update authority but no collection", async () => {
	// 	let transactionFailed = false;
	// 	try {
	// 		await program.methods
	// 			.createAsset(aliceAssetArgs)
	// 			.accountsStrict({
	// 				payer: alice.publicKey,
	// 				asset: aliceAsset.publicKey,
	// 				authority: alice.publicKey,
	// 				owner: alice.publicKey,
	// 				collection: null,
	// 				updateAuthority: alice.publicKey,
	// 				systemProgram: SYSTEM_PROGRAM_ID,
	// 				mplCoreProgram: MPL_CORE_PROGRAM_ID,
	// 			})
	// 			.signers([alice, aliceAsset])
	// 			.rpc();
	// 	} catch (error) {
	// 		transactionFailed = true;
	// 		expect(error.message).to.contains("already in use");
	// 	} finally {
	// 		expect(transactionFailed).to.be.true;
	// 	}
	// });
});
