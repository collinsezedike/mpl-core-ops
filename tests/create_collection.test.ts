import { expect } from "chai";
import { describe, before, it } from "node:test";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { generateAndAirdropSigner, assertCollectionData } from "./helpers";

describe("Collections", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.mplCoreOps as Program<MplCoreOps>;

	let alice: Keypair;
	let aliceCollection: Keypair;
	const aliceCollectionName = "ALICE COLLECTION";
	const aliceCollectionURI = "https://alice.collection.uri.json";
	const aliceCollectionArgs = {
		name: aliceCollectionName,
		uri: aliceCollectionURI,
	};

	let bob: Keypair;
	let bobCollection: Keypair;
	const bobCollectionName = "BOB COLLECTION";
	const bobCollectionURI = "https://bob.collection.uri.json";
	const bobCollectionArgs = {
		name: bobCollectionName,
		uri: bobCollectionURI,
	};

	let john: Keypair;
	let johnCollection: Keypair;
	const johnCollectionName = "JOHN COLLECTION";
	const johnCollectionURI = "https://johh.collection.uri.json";
	const johnCollectionArgs = {
		name: johnCollectionName,
		uri: johnCollectionURI,
	};

	let jane: Keypair;

	before(async () => {
		alice = await generateAndAirdropSigner(provider);
		bob = await generateAndAirdropSigner(provider);
		john = await generateAndAirdropSigner(provider);
		jane = await generateAndAirdropSigner(provider);

		aliceCollection = Keypair.generate();
		bobCollection = Keypair.generate();
		johnCollection = Keypair.generate();
	});

	it("creates Alice collection with Alice as the update authority", async () => {
		await program.methods
			.createCollection(aliceCollectionArgs)
			.accountsStrict({
				payer: alice.publicKey,
				collection: aliceCollection.publicKey,
				updateAuthority: alice.publicKey,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([alice, aliceCollection])
			.rpc();

		const accountInfo = await provider.connection.getAccountInfo(
			aliceCollection.publicKey
		);
		expect(accountInfo).not.to.be.null;
		expect(accountInfo.owner.toString()).to.eql(
			MPL_CORE_PROGRAM_ID.toString()
		);
		expect(
			assertCollectionData(
				accountInfo.data,
				aliceCollectionName,
				aliceCollectionURI
			)
		).to.be.true;
	});

	it("creates Bob collection without any update authority", async () => {
		await program.methods
			.createCollection(bobCollectionArgs)
			.accountsStrict({
				payer: bob.publicKey,
				collection: bobCollection.publicKey,
				updateAuthority: null,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([bob, bobCollection])
			.rpc();

		const accountInfo = await provider.connection.getAccountInfo(
			bobCollection.publicKey
		);
		expect(accountInfo).not.to.be.null;
		expect(accountInfo.owner.toString()).to.eql(
			MPL_CORE_PROGRAM_ID.toString()
		);
		expect(
			assertCollectionData(
				accountInfo.data,
				bobCollectionName,
				bobCollectionURI
			)
		).to.be.true;
	});

	it("creates John collection with Jane as the update authority", async () => {
		await program.methods
			.createCollection(johnCollectionArgs)
			.accountsStrict({
				payer: john.publicKey,
				collection: johnCollection.publicKey,
				updateAuthority: jane.publicKey,
				systemProgram: SYSTEM_PROGRAM_ID,
				mplCoreProgram: MPL_CORE_PROGRAM_ID,
			})
			.signers([john, johnCollection])
			.rpc();

		const accountInfo = await provider.connection.getAccountInfo(
			johnCollection.publicKey
		);
		expect(accountInfo).not.to.be.null;
		expect(accountInfo.owner.toString()).to.eql(
			MPL_CORE_PROGRAM_ID.toString()
		);
		expect(
			assertCollectionData(
				accountInfo.data,
				johnCollectionName,
				johnCollectionURI
			)
		).to.be.true;
	});

	it("fails if Alice tries to create a collection again with the same pubkey", async () => {
		let transactionFailed = false;
		try {
			await program.methods
				.createCollection(aliceCollectionArgs)
				.accountsStrict({
					payer: alice.publicKey,
					collection: aliceCollection.publicKey, // already initialized
					updateAuthority: alice.publicKey,
					systemProgram: SYSTEM_PROGRAM_ID,
					mplCoreProgram: MPL_CORE_PROGRAM_ID,
				})
				.signers([alice, aliceCollection])
				.rpc();
		} catch (error) {
			transactionFailed = true;
			expect(error.message).to.contains("already in use");
		} finally {
			expect(transactionFailed).to.be.true;
		}
	});
});
