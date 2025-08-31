# 🎨 MPL Core Operations

This project demonstrates how to build, interact with, and test **NFT operations** on Solana using the  
[Metaplex Core (MPL Core)](https://developers.metaplex.com/core) program and [Anchor](https://www.anchor-lang.com/).

---

## ✨ Features

- **Collection Management**
  - Create and initialize NFT collections.
  - Validate collection data (name, URI, update authority).
  - Prevent unauthorized re-initialization.

- **Asset Creation**
  - Mint new assets into collections or as standalone NFTs.
  - Support for optional update authorities.
  - Enforce constraints (e.g., not both collection & update authority at the same time).

- **Freezing Assets**
  - Freeze assets to prevent further transfers.
  - Verify transfer restrictions on frozen assets.
  - Ensure only authorized signers can freeze.

- **Transfers**
  - Attempted transfers of frozen assets fail with proper errors.
  - Assets can be safely transferred when not frozen.

---

## 📂 Project Structure

├── Anchor.toml # Anchor workspace config
├── programs/
│ └── mpl_core_ops/ # Custom Anchor program wrapping MPL Core
├── tests/
│ ├── helpers.ts # Reusable helper functions
│ ├── collections.ts # Tests for collection creation & validation
│ ├── assets.ts # Tests for creating assets
│ ├── freeze.ts # Tests for freezing & transfer restrictions
│ └── decoder.ts # Buffer decoding utilities
└── README.md # You're here

---

## 🛠️ Setup

1. Install dependencies:

```bash
   npm install
```

2. Start a local validator:

```bash
solana-test-validator
```

3. Build and deploy the program:

```bash
anchor build
anchor deploy
```


## 🚧 Notes

- Uses the official MPL Core program for NFT primitives.  
- The mpl_core_ops Anchor program is a thin wrapper to simplify tests.  
- Buffer decoding is included to inspect raw on-chain account data for collections.  