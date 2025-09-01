# 🎨 MPL Core Operations

This project demonstrates how to build, interact with, and test **NFT operations** on Solana using the [Metaplex Core (MPL Core)](https://developers.metaplex.com/core) program and [Anchor](https://www.anchor-lang.com/).

## 📚 Overview

MPL Core Operations is a comprehensive implementation of Metaplex's Core NFT standard on Solana. It provides a robust framework for creating and managing digital assets with features like collections, freezing, transferring, and burning. The project serves as both a reference implementation and a practical toolkit for developers building NFT applications on Solana.

## ✨ Features

### Implemented Features

-   **Creating Collections**
    -   Create and initialize NFT collections with customizable metadata
    -   Support for different update authority configurations:
        -   Self as update authority
        -   Another wallet as update authority
        -   No update authority (immutable collections)
    -   Validate collection data (name, URI, update authority)
    -   Prevent unauthorized re-initialization

-   **Creating Assets**
    -   Mint new assets into collections or as standalone NFTs
    -   Support for optional update authorities
    -   Flexible ownership assignment
    -   Enforce constraints (e.g., not both collection & update authority at the same time)

-   **Freezing Assets**
    -   Freeze assets to prevent further transfers
    -   Support freezing by collection authority or update authority
    -   Verify transfer restrictions on frozen assets
    -   Ensure only authorized signers can freeze

-   **Transferring Assets**
    -   Transfer assets between wallets
    -   Validate ownership and authority
    -   Attempted transfers of frozen assets fail with proper errors
    -   Assets can be safely transferred when not frozen

-   **Burning Assets**
    -   Permanently remove assets from circulation
    -   Validate that burned assets can no longer be transferred or fetched
    -   Ensure only authorized signers can burn assets

### Upcoming Features

-   **Transfer Delegates**
    -   Delegate transfer authority to third-party wallets
    -   Configurable delegation permissions
    -   Revocable delegation rights

-   **Freeze Delegates**
    -   Allow designated wallets to freeze/unfreeze assets
    -   Granular control over freeze permissions
    -   Support for time-limited freeze authority

-   **Burn Delegates**
    -   Delegate burn authority to third-party wallets
    -   Configurable burn permissions
    -   Revocable burn rights

-   **Update Delegate Plugin**
    -   Extensible plugin system for delegating update authority
    -   Customizable update permissions
    -   Integration with existing delegate systems

## 🔍 Technical Details

### MPL Core Integration

This project integrates with the official Metaplex Core program, which provides the fundamental NFT primitives on Solana. The MPL Core program handles:

- Asset creation and management
- Collection verification
- Ownership tracking
- Transfer logic
- Freezing and burning mechanisms

Our Anchor program serves as a wrapper around these core functions, providing a more developer-friendly interface and additional validation.

### Account Structure

- **Collections**: On-chain accounts storing collection metadata, including name, URI, and update authority
- **Assets**: On-chain accounts representing individual NFTs, with links to collections when applicable
- **Authorities**: Various authority types (update, collection) that control different aspects of assets

## 📂 Project Structure

```
├── Anchor.toml                      # Anchor configuration
├── Cargo.toml                       # Rust dependencies
├── programs/
│   └── mpl_core_ops/                # Anchor program implementing MPL Core operations
│       ├── src/
│       │   ├── lib.rs               # Program entry points
│       │   ├── instructions/        # Implementation of each instruction
│       │   │   ├── create_collection.rs
│       │   │   ├── create_asset.rs
│       │   │   ├── freeze_asset.rs
│       │   │   ├── transfer_asset.rs
│       │   │   ├── burn_asset.rs
│       │   │   └── mod.rs
│       │   └── types.rs             # Type definitions
│       └── Cargo.toml               # Program-specific dependencies
├── tests/
│   ├── helpers.ts                   # Reusable helper functions
│   ├── create_collection.test.ts    # Tests for creating NFT collections
│   ├── create_asset.tests.ts        # Tests for creating/minting NFT assets
│   ├── freeze_asset.test.ts         # Tests for freezing assets and blocking transfers
│   ├── transfer_asset.test.ts       # Tests for transferring assets between owners
│   └── burn_asset.test.ts           # Tests for burning (destroying) NFT assets
└── README.md
```

## 🛠️ Usage

### ⚡ Prerequisites

Make sure you have Rust, Solana, Yarn and Anchor installed. Follow [the official Solana documentation](http://solana.com/en/docs/intro/installation) to install them.

Also, configure Solana CLI to run against localhost:

```bash
solana config set --url localhost
```

### 🏗️ Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mpl-core-ops.git
cd mpl-core-ops
```

2. Build the program:

```bash
anchor build
```

3. Install dependencies:

```bash
yarn install
```

4. Run the tests:

```bash
anchor test
```

### 📝 Example: Creating a Collection

```typescript
// Generate a new keypair for the collection
const collectionKeypair = Keypair.generate();

// Create the collection
await program.methods
  .createCollection({
    name: "MY COLLECTION",
    uri: "https://example.com/collection.json",
  })
  .accountsStrict({
    payer: wallet.publicKey,
    collection: collectionKeypair.publicKey,
    updateAuthority: wallet.publicKey,
    systemProgram: SYSTEM_PROGRAM_ID,
    mplCoreProgram: MPL_CORE_PROGRAM_ID,
  })
  .signers([wallet, collectionKeypair])
  .rpc();
```

### 📝 Example: Creating an Asset

```typescript
// Generate a new keypair for the asset
const assetKeypair = Keypair.generate();

// Create the asset
await program.methods
  .createAsset({
    name: "MY ASSET",
    uri: "https://example.com/asset.json",
    collection: collectionPublicKey, // Optional, can be null
  })
  .accountsStrict({
    payer: wallet.publicKey,
    asset: assetKeypair.publicKey,
    owner: wallet.publicKey,
    updateAuthority: wallet.publicKey, // Optional, can be null
    collection: collectionPublicKey, // Optional, can be null
    systemProgram: SYSTEM_PROGRAM_ID,
    mplCoreProgram: MPL_CORE_PROGRAM_ID,
  })
  .signers([wallet, assetKeypair])
  .rpc();
```

## 🔐 Security Considerations

- **Authority Validation**: All operations verify that the signer has the appropriate authority
- **Frozen Asset Protection**: Transfers of frozen assets are blocked at the protocol level
- **Ownership Verification**: Asset operations validate the correct ownership
- **Collection Integrity**: Collection relationships are verified for all collection-based operations

## 🚧 Notes

- Uses the official MPL Core program for NFT primitives
- The mpl_core_ops Anchor program is a thin wrapper to simplify interactions
- Buffer decoding is included to inspect raw on-chain account data for collections
- All operations are tested with multiple scenarios to ensure robustness

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request