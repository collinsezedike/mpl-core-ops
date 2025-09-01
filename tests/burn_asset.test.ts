import { expect } from "chai";
import { describe, before, it } from "node:test";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair, PublicKey } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { generateAndAirdropSigner, createNewAsset } from "./helpers";

describe("Burn Assets", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.mplCoreOps as Program<MplCoreOps>;

	let alice: Keypair;
	let aliceAsset: PublicKey;
	let aliceCollection: PublicKey;

	let bob: Keypair;

	before(async () => {
		alice = await generateAndAirdropSigner();
		bob = await generateAndAirdropSigner();

		({ asset: aliceAsset, collection: aliceCollection } =
			await createNewAsset(alice, alice.publicKey, true));
	});

	it("burns Alice asset", async () => {
		await program.methods
			.burnAsset()
			.accountsStrict({
				payer: alice.publicKey,
				asset: aliceAsset,
				collection: aliceCollection,
				authority: null,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([alice])
			.rpc();
	});


	it("fails if Alice tries to transfer a burnt asset", async () => {
		let transactionFailed = false;
		try {
			await program.methods
				.transferAsset()
				.accountsStrict({
					payer: alice.publicKey,
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
			expect(error.message).to.contains("Invalid Authority");
		} finally {
			expect(transactionFailed).to.be.true;
		}
	});

});
