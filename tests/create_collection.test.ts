import { expect } from "chai";
import { describe, before, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair, PublicKey } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID, fetchCollection, mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { generateAndAirdropSigner } from "./helpers";

describe("Collections", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.mplCoreOps as Program<MplCoreOps>;

	const umi = createUmi("http://127.0.0.1:8899").use(mplCore());

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

	it("creates alice collection", async () => {
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

		const accountInfo = await provider.connection.getAccountInfo(aliceCollection.publicKey);
		expect(accountInfo).not.to.be.null;
		expect(accountInfo.owner.toString()).to.eql(MPL_CORE_PROGRAM_ID.toString());

		const collection = await fetchCollection(umi, aliceCollection.publicKey.toString());
		expect(collection.updateAuthority.toString()).to.eql(alice.publicKey.toString());
		expect(collection.name).to.eql(aliceCollectionName);
		expect(collection.uri).to.eql(aliceCollectionURI);
	});

	it("creates bob collection without any update authority", async () => {
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

		const accountInfo = await provider.connection.getAccountInfo(bobCollection.publicKey);
		expect(accountInfo).not.to.be.null;
		expect(accountInfo.owner.toString()).to.eql(MPL_CORE_PROGRAM_ID.toString());

		const collection = await fetchCollection(umi, bobCollection.publicKey.toString());
		expect(collection.updateAuthority).to.be.null;
		expect(collection.name).to.eql(bobCollectionName);
		expect(collection.uri).to.eql(bobCollectionURI);
	});

	it("creates john collection with jane as the update authority", async () => {
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

		const accountInfo = await provider.connection.getAccountInfo(johnCollection.publicKey);
		expect(accountInfo).not.to.be.null;
		expect(accountInfo.owner.toString()).to.eql(MPL_CORE_PROGRAM_ID.toString());

		const collection = await fetchCollection(umi, johnCollection.publicKey.toString());
		expect(collection.updateAuthority.toString()).to.eql(jane.publicKey.toString());
		expect(collection.name).to.eql(johnCollectionName);
		expect(collection.uri).to.eql(johnCollectionURI);
	});

	it("fails if Alice tries to reuse the same collection pubkey", async () => {
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
				.signers([alice])
				.rpc()
		} catch (error) {
			transactionFailed = true;
			console.log(error)
			// expect(error.message).to.contains(
			// 	"AnchorError caused by account: auction. Error Code: InvalidHouse"
			// );
		} finally {
			expect(transactionFailed).to.be.true;
		}
	});
});
