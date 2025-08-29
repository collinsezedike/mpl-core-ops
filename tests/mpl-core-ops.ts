import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MplCoreOps } from "../target/types/mpl_core_ops";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

import { Keypair, PublicKey } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { generateAndAirdropSigner } from "./helpers";

describe("mpl-core-ops", () => {
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
	const johnCollectionURI = "https://jonh.collection.uri.json";
	const johnCollectionArgs = {
		name: johnCollectionName,
		uri: johnCollectionURI,
	};

	before(async () => {
		alice = await generateAndAirdropSigner(provider);
		bob = await generateAndAirdropSigner(provider);
		john = await generateAndAirdropSigner(provider);

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
	});
});
