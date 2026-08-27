# 🔮 ChronoCast — Comprehensive Project Documentation

## 1. Executive Summary

**ChronoCast** is a decentralized, non-custodial binary prediction and oracle protocol deployed on **Stellar Testnet (Protocol 22 / Soroban v22)**. It provides a trustless on-chain environment for creating real-world prediction markets, staking **YES** or **NO** prediction shares in automated odds pools, and receiving proportional pool payouts upon verified oracle resolution.

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

## 5. Frontend Architecture & Zero-Mock Compliance

All state queries are directly linked to live endpoints:
- **Zero Placeholder Data:** If the smart contract has no markets, authentic empty states are rendered with deep links to Stellar.Expert.
- **Dynamic Odds Pool Calculation:** Live probabilities computed as `YES_odds = YES_pool / (YES_pool + NO_pool) * 100%`.
- **3-Tier Wallet Recovery:** Distinct error handlers for missing extension, rejected signatures, and insufficient gas.
- **On-Chain Leaderboard:** Real-time map-reduce aggregation over Soroban RPC market storage.

---

## 6. Verification & Automated Testing

Automated Rust unit tests verify the protocol under standard and edge cases:
- `test_create_and_fetch_market`: Verifies on-chain market initialization and persistence.
- `test_stake_prediction_and_volume`: Verifies liquidity pool balance increments and staker counts.
- `test_resolve_market_and_stats`: Verifies oracle resolution states and protocol volume tracking.
- `test_nonexistent_market_panic`: Ensures boundary validation on invalid market IDs.

```text
running 4 tests
test test::test_nonexistent_market_panic - should panic ... ok
test test::test_create_and_fetch_market ... ok
test test::test_stake_prediction_and_volume ... ok
test test::test_resolve_market_and_stats ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; finished in 0.03s
```
