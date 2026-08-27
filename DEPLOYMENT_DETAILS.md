# 🔮 ChronoCast — Deployment & Smart Contract Submission Details

## 📋 Smart Contract Details

- **Project Name:** ChronoCast — Decentralized Prediction & Binary Oracle Protocol
- **Network:** Stellar Testnet (Protocol 22 / Soroban v22)
- **Contract Name:** `PredictionVaultContract`
- **Smart Contract Language:** Rust (`soroban-sdk v22.0.11`)
- **Primary Deployed Contract ID:** `CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4`
- **Stellar.Expert Contract Explorer:** https://stellar.expert/explorer/testnet/contract/CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4

## 🔗 Transaction Hashes & Bytecode

- **Contract Deployment Transaction Hash:** `95e00937dd4f8d0e8443939c21ad973c9f99b0a8e2ead02d7452be6340bae208`
- **Deployment Transaction Explorer Link:** https://stellar.expert/explorer/testnet/tx/95e00937dd4f8d0e8443939c21ad973c9f99b0a8e2ead02d7452be6340bae208
- **WASM Bytecode Hash:** `2be4c53b8edc496d66d6cdcf733ac0126e52ab07d49c8214a4be274f39a2a2aa`
- **WASM Binary Size:** 7,876 bytes
- **Deployer Account Address (G-Key):** `GBG3UISDEQU5OCRREYVL7I2B3AVORLWU4DESSLK2O35FZOQWDMEPVYBT`
- **Verified On-Chain Market #1 Creation Transaction Hash:** `59fe4e4a17fe151876fe6203b4aaa6089d2833045a01529677b5fe6b4ab25909`
- **Market #1 Explorer Link:** https://stellar.expert/explorer/testnet/tx/59fe4e4a17fe151876fe6203b4aaa6089d2833045a01529677b5fe6b4ab25909
- **Verified On-Chain Market #2 Creation Transaction Hash:** `ae2502b2eb3fef65126e3d26f2e9eb56a591fd7c6c43d851df7c5ba9234984d8`
- **Market #2 Explorer Link:** https://stellar.expert/explorer/testnet/tx/ae2502b2eb3fef65126e3d26f2e9eb56a591fd7c6c43d851df7c5ba9234984d8

## 🧪 Unit Test Verification

- **Automated Tests:** 4 / 4 Passing Unit Tests (`cargo test`)
  1. `test_create_and_fetch_market` (PASSED)
  2. `test_stake_prediction_and_volume` (PASSED)
  3. `test_resolve_market_and_stats` (PASSED)
  4. `test_nonexistent_market_panic` (PASSED)

## 🌐 Endpoints & Infrastructure

- **Stellar Horizon URL:** `https://horizon-testnet.stellar.org`
- **Soroban RPC URL:** `https://soroban-testnet.stellar.org`
- **Network Passphrase:** `Test SDF Network ; September 2015`
- **Frontend Development Server:** `http://localhost:5177/`
