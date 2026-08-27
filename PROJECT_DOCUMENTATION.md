# 🔮 StellarPredict — Comprehensive Project Documentation

## 1. Executive Summary

**StellarPredict** is a decentralized, non-custodial binary prediction and oracle protocol deployed on **Stellar Testnet (Protocol 22 / Soroban v22)**. It provides a trustless on-chain environment for creating real-world prediction markets, staking **YES** or **NO** prediction shares in automated odds pools, and receiving proportional pool payouts upon verified oracle resolution.

The application features a modern **Neumorphic (Soft UI)** design system with a persistent **Left-Sidebar Navigation Dock**, live probability calculation meters, interactive stake payout simulator, native XLM payments, multi-wallet authentication, and real-time Soroban RPC event polling.

---

## 2. Smart Contract & On-Chain Verification

| Parameter | On-Chain Reference |
| :--- | :--- |
| **Network** | Stellar Testnet (Protocol 22 / Soroban v22) |
| **Contract Name** | `PredictionVaultContract` |
| **Deployed Contract ID** | [`CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4`](https://stellar.expert/explorer/testnet/contract/CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4) |
| **Contract Deployment Tx** | [`95e00937dd4f8d0e8443939c21ad973c9f99b0a8e2ead02d7452be6340bae208`](https://stellar.expert/explorer/testnet/tx/95e00937dd4f8d0e8443939c21ad973c9f99b0a8e2ead02d7452be6340bae208) |
| **WASM Bytecode Hash** | `2be4c53b8edc496d66d6cdcf733ac0126e52ab07d49c8214a4be274f39a2a2aa` |
| **Deployer Public Key** | `GBG3UISDEQU5OCRREYVL7I2B3AVORLWU4DESSLK2O35FZOQWDMEPVYBT` |
| **Verified Market #1 Tx** | [`59fe4e4a17fe151876fe6203b4aaa6089d2833045a01529677b5fe6b4ab25909`](https://stellar.expert/explorer/testnet/tx/59fe4e4a17fe151876fe6203b4aaa6089d2833045a01529677b5fe6b4ab25909) |

---

## 3. Technology Stack

- **Smart Contract Layer:** Rust (`soroban-sdk v22.0.11`, `no_std`, WASM target `wasm32-unknown-unknown`).
- **Client & Blockchain SDK:** `@stellar/stellar-sdk v16.2.0`, `@stellar/freighter-api v3.0.4`.
- **Frontend Framework:** React 18 with Vite 6.
- **Styling Architecture:** Pure Neumorphism (Soft UI) with dual-layer soft extruded shadows (`8px 8px 18px #c5d0e0, -8px -8px 18px #ffffff`) and smooth rounded geometry.
- **Typography:** Google Fonts `Outfit` (headings) and `Plus Jakarta Sans` (body & controls).
- **Deployment Platform:** Netlify with automated CI/CD (`netlify.toml`).

---

## 4. Smart Contract Functions & Storage Architecture

### Core Invocations:
1. **`create_market(creator: Address, question: String, category: Symbol, end_time: u64) -> u64`**
   - Authorizes creator and increments instance market counter.
   - Stores `PredictionMarket` struct persistently with automatic TTL extension (`extend_ttl(50000, 100000)`).
   - Emits event `(mkt_new, category) -> (count, creator, question)`.

2. **`stake_prediction(staker: Address, market_id: u64, is_yes: bool, amount: i128) -> bool`**
   - Requires staker authorization.
   - Adds stake amount to `total_yes_pool` or `total_no_pool`.
   - Increments `total_stakers` count and protocol-wide volume.
   - Emits event `(mkt_stk, market_id) -> (staker, is_yes, amount)`.

3. **`resolve_market(resolver: Address, market_id: u64, outcome: u32) -> bool`**
   - Verifies resolver matches market creator or designated oracle authority.
   - Sets market `status` to `1` (Resolved) and records `outcome` (`1` = YES Won, `2` = NO Won).
   - Emits event `(mkt_res, market_id) -> (resolver, outcome)`.

4. **`tip_market(tipper: Address, market_id: u64, amount: i128) -> bool`**
   - Transfers tip amount to market record and updates cumulative protocol tips.
   - Emits event `(mkt_tip, market_id) -> (tipper, amount)`.

5. **`get_market(id: u64) -> PredictionMarket`** & **`get_protocol_stats() -> ProtocolStats`**
   - Read-only simulation queries returning structured market data and aggregate volume.

---

## 5. Automated Rust Unit Tests (4/4 Passing)

The contract suite was tested via `cargo test` in `contracts/prediction_vault`:

```rust
running 4 tests
test test::test_nonexistent_market_panic - should panic ... ok
test test::test_create_and_fetch_market ... ok
test test::test_stake_prediction_and_volume ... ok
test test::test_resolve_market_and_stats ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.03s
```

---

## 6. Frontend Layout & Interactive Modules

1. **Left Neumorphic Sidebar:**
   - Soft embossed brand logo (`🔮 StellarPredict`).
   - Sticky navigation menu (`Market Arena`, `Create Market`, `Fast XLM Pay`, `Oracle Desk`, `Soroban Feed`).
   - Protocol 22 status node and quick contract link.

2. **Top Control Bar:**
   - Real-time search filter input.
   - 1-Click Friendbot Faucet (+10,000 XLM) button.
   - XLM balance and G-address copy pill.
   - **Dedicated Standalone Red/Rose Neumorphic Disconnect Button**.

3. **Market Arena:**
   - Filterable categories (`All`, `Crypto`, `Tech`, `Governance`, `DeFi`).
   - Dual-gradient probability meter (`YES %` vs `NO %`).
   - Instant YES & NO staking buttons with variable chip presets (`10`, `25`, `50`, `100` XLM).
   - Variable micro-tipping (`5`, `10`, `25`, `50` XLM) with celebratory confetti.
   - Reddit-style inline discussion accordion.

4. **Interactive Odds & Profit Simulator:**
   - Real-time calculator showing estimated payout and net profit before staking.

5. **Oracle Resolution Desk:**
   - Standalone portal for creators to review and settle expired predictions.

6. **Fast XLM Transfer Terminal:**
   - Native Stellar payments with memo validation and fee verification.

---

## 7. Setup & Local Execution Guide

```bash
# 1. Clone repository
git clone <repository_url>
cd stellar_predict

# 2. Install dependencies
npm install --legacy-peer-deps
cd frontend
npm install --legacy-peer-deps

# 3. Start local development server
npm run dev

# 4. Open in browser
http://localhost:5176/
```
