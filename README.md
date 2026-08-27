# 🔮 ChronoCast — Neumorphic Prediction & Binary Oracle Market Protocol

[![Stellar Testnet](https://img.shields.io/badge/Network-Stellar_Testnet-7c4dff?style=for-the-badge&logo=stellar)](https://stellar.expert/explorer/testnet)
[![Soroban v22](https://img.shields.io/badge/Smart_Contracts-Soroban_v22-10b981?style=for-the-badge)](https://soroban.stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffd600?style=for-the-badge)](LICENSE)

> **ChronoCast** is a decentralized binary prediction and oracle market protocol built on **Stellar Testnet** using **Soroban Protocol 22 smart contracts**. It features a tactile **Neumorphic (Soft UI)** interface, left-sidebar navigation, on-chain automated probability odds, oracle settlement desk, zero-mock on-chain leaderboards, and real-time transaction lifecycle tracking.

---

## 📋 Smart Contract & On-Chain Deployments

| Parameter | Value / Verified Explorer Link |
| :--- | :--- |
| **Network** | **Stellar Testnet (Protocol 22 / Soroban v22)** |
| **Contract Name** | `PredictionVaultContract` |
| **Primary Deployed Contract ID** | [`CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4`](https://stellar.expert/explorer/testnet/contract/CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4) |
| **WASM Bytecode Hash** | `2be4c53b8edc496d66d6cdcf733ac0126e52ab07d49c8214a4be274f39a2a2aa` |
| **WASM Binary Size** | `7,876 bytes` |
| **Contract Deployment Tx** | [`95e00937dd4f8d0e8443939c21ad973c9f99b0a8e2ead02d7452be6340bae208`](https://stellar.expert/explorer/testnet/tx/95e00937dd4f8d0e8443939c21ad973c9f99b0a8e2ead02d7452be6340bae208) |
| **Verified Market #1 Tx** | [`59fe4e4a17fe151876fe6203b4aaa6089d2833045a01529677b5fe6b4ab25909`](https://stellar.expert/explorer/testnet/tx/59fe4e4a17fe151876fe6203b4aaa6089d2833045a01529677b5fe6b4ab25909) |
| **Verified Market #2 Tx** | [`ae2502b2eb3fef65126e3d26f2e9eb56a591fd7c6c43d851df7c5ba9234984d8`](https://stellar.expert/explorer/testnet/tx/ae2502b2eb3fef65126e3d26f2e9eb56a591fd7c6c43d851df7c5ba9234984d8) |
| **Deployer Public Key** | `GBG3UISDEQU5OCRREYVL7I2B3AVORLWU4DESSLK2O35FZOQWDMEPVYBT` |
| **Horizon RPC Endpoint** | `https://horizon-testnet.stellar.org` |
| **Soroban RPC Endpoint** | `https://soroban-testnet.stellar.org` |
| **Unit Test Coverage** | **4 / 4 Passing Unit Tests (`cargo test`)** |

---

## 💡 Why ChronoCast? (The Problem & Solution)

### The Problem in Traditional Prediction Markets
Centralized prediction platforms charge high transaction gas fees, require complex bridges, and lack instant mobile-ready finality for micro-stakes.

### The ChronoCast Solution
ChronoCast leverages **Soroban Protocol 22** on Stellar to deliver:
* **Sub-Cent Micro-Stakes:** Stake as little as 0.1 XLM with fee costs under 0.00001 XLM (100 stroops).
* **3-5 Second Finality:** Instant on-chain state updates for stakers entering the liquidity pool.
* **Proportional Escrow Payouts:** Smart contract vault locks opposing pools and proportionally distributes 100% of the losing pool to winning stakers upon oracle resolution.
* **Zero Mock Data:** All market odds, total pool volumes, creator statistics, and leaderboard rankings are polled live from Soroban RPC.

---

## 🏗️ System Architecture

```text
[ Market Creator / Staker ] ──> [ Freighter / Testnet Demo Keypair ]
          │
          ▼
[ React + Vite Neumorphic UI ]
          │
          ├───> [ Stellar Horizon Testnet ]  (Native XLM Transfers & Account Balances)
          ├───> [ Stellar Friendbot Faucet ] (1-Click Instant +10,000 XLM Sandbox)
          └───> [ Soroban RPC Node ]         (Smart Contract Execution & Events)
                      │
                      ▼
        [ PredictionVaultContract ]
          ├── create_market       (On-Chain Question, Category & Duration Setup)
          ├── stake_prediction    (YES/NO Liquidity Pool Staking)
          ├── resolve_market      (Oracle Settlement & Winner Declaration)
          ├── tip_market          (Micro-rewards for Market Creators)
          ├── get_market          (Single Market State Inspector)
          ├── get_market_count    (Total Protocol Market Counter)
          └── get_protocol_stats  (Aggregated Volume & Resolution Metrics)
```

---

## ✨ Key Features & Capabilities

1. **Decentralized Binary Outcome Vaults (`PredictionVaultContract`)**
   * Trustless Rust smart contract managing the entire market lifecycle: *Active ➔ Resolved ➔ Claimed*.
   * Real-time odds computation: dynamically calculates YES/NO pool ratios and estimated return multipliers.

2. **Real-Time On-Chain Leaderboard (`PredictionLeaderboard`)**
   * 100% live on-chain ranking querying Soroban RPC for all market creators and stakers.
   * Aggregates total pool volume, market counts, and stakers per creator.
   * Direct deep links to Stellar.Expert explorer for every address.

3. **Interactive Onboarding Walkthrough (`OnboardingGuide`)**
   * 6-step guided modal for new users explaining wallet connection, Friendbot testnet faucet, odds calculations, and oracle resolution.
   * Auto-triggers on first visit and accessible anytime via the **"Guide"** button.

4. **Transaction History Feed (`TxHistorySection`)**
   * Direct integration with Stellar Horizon API to list the last 10 transactions for the connected wallet.
   * Categorizes operations with timestamps, success badges, and Stellar.Expert explorer links.

5. **Live Transaction Lifecycle Tracker (`TxStatusTracker`)**
   * Persistent bottom-left overlay that guides the user through transaction states: *Building → Simulating → Signing → Submitting → Confirmed*.
   * Shows transaction hashes and explorer links upon ledger finality.

6. **Dedicated Oracle Settlement Desk (`OracleDeskSection`)**
   * Creators and authorized oracles can declare verified outcomes (YES won or NO won) on-chain with single-click settlement.

7. **Live Network Health Indicator (`NetworkStatus`)**
   * Continuous Horizon ping measuring latency in milliseconds and displaying the latest ledger sequence number.

8. **Live XLM Price Bar (`XlmPriceBar`)**
   * Real-time XLM/USD pricing from CoinGecko with 24-hour percentage change.

9. **Neumorphic Design System (Soft UI)**
   * Distinctive dual-layer extruded shadows, inset active buttons, clean dark-mode contrast, and responsive layout.

10. **Multi-Wallet Support & Actionable Error Handling**
    * Deep integration with **Freighter Wallet** (`@stellar/freighter-api` v3) and instant zero-install **Testnet Keypair** mode.
    * 3 dedicated error handlers (Extension Not Detected, User Rejected, Insufficient Balance) with actionable recovery links.

---

## 🛠️ How It Was Built (Tech Stack)

* **Smart Contract:** Rust, `soroban-sdk = "22.0.11"`, `wasm32-unknown-unknown`
* **Frontend:** React 18, Vite 6, Vanilla CSS (Neumorphic Soft UI Design System)
* **SDK & Protocol:** `@stellar/stellar-sdk = "16.2.0"`, `@stellar/freighter-api = "3.1.0"`
* **Testing:** Rust unit test suite (`soroban-sdk::testutils`), 4 passing tests
* **CI/CD:** Automated GitHub Actions pipeline (`.github/workflows/ci.yml`)
* **Hosting:** Netlify with automated continuous deployment

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **Rust** (with `wasm32-unknown-unknown` target)
* **Freighter Wallet Extension** ([freighter.app](https://www.freighter.app/))

---

### 2. Run Locally

```bash
# Clone repository
git clone https://github.com/brindaban55/stellar_predict.git
cd stellar_predict

# Navigate to frontend and install dependencies
cd frontend
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:5177](http://localhost:5177) in your browser.

---

### 3. Run Smart Contract Tests

```bash
cd contracts/prediction_vault
cargo test
```

**Test Output:**
```
running 4 tests
test test::test_nonexistent_market_panic - should panic ... ok
test test::test_create_and_fetch_market ... ok
test test::test_stake_prediction_and_volume ... ok
test test::test_resolve_market_and_stats ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; finished in 0.03s
```

---

### 4. Build Contract WASM

```bash
cd contracts/prediction_vault
cargo build --target wasm32-unknown-unknown --release
```

---

## 🌐 Deploy Frontend to Netlify

1. Push your repository to GitHub (`https://github.com/brindaban55/stellar_predict.git`).
2. Log in to [netlify.com](https://netlify.com) and click **"Add New Site → Import from Git"**.
3. Import your repository.
4. Set **Base Directory** to `frontend` and **Publish Directory** to `dist`.
5. Build Command: `npm run build`.
6. Click **"Deploy"**.

---

## 📖 How to Use the DApp

1. **Connect:** Click **"Connect Wallet"** in the top bar and select **Freighter Wallet** or **Instant Testnet Keypair**.
2. **Fund:** Click **"+ Faucet"** to receive free Testnet XLM via Friendbot.
3. **Onboarding:** First-time visitors see an interactive 6-step Getting Started Guide. Re-open via the **"Guide"** button.
4. **Create a Market:** Switch to **Create Market** tab → Enter question, category (*Crypto, Tech, Politics, Sports*), and duration (hours).
5. **Stake on Outcomes:** In **Market Arena**, select any active card → Choose **YES** or **NO** → Enter XLM stake → Confirm transaction.
6. **Oracle Settlement:** In **Oracle Desk**, resolve completed markets by declaring the winning outcome.
7. **Watch Events:** Switch to **Soroban Feed** to observe all on-chain stake and resolution events in real-time.
8. **Transaction History:** View recent wallet transactions in the **History** tab.
9. **Leaderboard:** View top market creators and pool volume in the **Leaderboard** tab.

---

## 🆕 Recent Changes & Feature Additions

| Version | Description |
| :--- | :--- |
| **v1.6** | Rebranded project to ChronoCast across UI, contract metadata, and documentation |
| **v1.5** | Added 100% on-chain PredictionLeaderboard querying Soroban RPC with live sync button and real-time volume aggregation |
| **v1.4** | Added OnboardingGuide (6-step) & TxStatusTracker for real-time lifecycle overlay |
| **v1.3** | Added 3 wallet error types (Not Installed, Rejected, Insufficient Balance) with contextual guidance |
| **v1.2** | Added NetworkStatus indicator (polls Horizon every 30s) + live XLM price ticker |
| **v1.1** | Added TxHistorySection querying Horizon testnet transactions |
| **v1.0** | Core PredictionArena with live odds calculator, staking modal, and OracleDesk |
| **v0.9** | Sidebar navigation dock with category indicators and active states |
| **v0.8** | Neumorphic design system with soft tactile box-shadows and inset button states |
| **v0.7** | Netlify deployment configuration & GitHub Actions CI pipeline |
| **v0.6** | Fixed Vite 6 + vite-plugin-node-polyfills compatibility |
| **v0.5** | Initial PredictionVaultContract deployed and verified on Stellar Testnet |

---

## 🧰 Frontend Component Reference

| Component | Purpose |
| :--- | :--- |
| `WalletSection` | Dashboard hero: balance, address, network status, XLM price ticker, global stats |
| `Sidebar` | Left Neumorphic dock with 7 navigation views and live Protocol 22 status node |
| `TopBar` | Search bar, network indicator, XLM price ticker, guide button, and disconnect control |
| `PredictionMarketSection` | Active market arena with odds calculator and staking modal |
| `CreateMarketSection` | Market creator interface with category and duration selectors |
| `OracleDeskSection` | Settlement desk for resolving market outcomes on-chain |
| `TransferSection` | Native XLM payment module with on-chain memo |
| `LiveEventsSection` | Real-time Soroban contract event stream via getEvents RPC |
| `PredictionLeaderboard` | Top market creators and stakers ranked by on-chain pool volume |
| `TxHistorySection` | Last 10 Horizon transactions for connected wallet |
| `OnboardingGuide` | 6-step interactive prediction market walkthrough |
| `TxStatusTracker` | Live transaction lifecycle overlay (Building → Confirmed) |
| `NetworkStatus` | Stellar Testnet online/offline/degraded health monitor |
| `XlmPriceBar` | Live XLM/USD price from CoinGecko with 24h change |
| `TxModal` | Wallet connection modal with Freighter + Demo Keypair options and error handling |

---

## 📄 License
MIT License. Built for the Stellar Community.
