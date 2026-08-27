#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Symbol};

#[test]
fn test_create_and_fetch_market() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PredictionVaultContract, ());
    let client = PredictionVaultContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let question = String::from_str(&env, "Will Stellar XLM reach $0.50 by Q4 2026?");
    let category = Symbol::new(&env, "crypto");
    let end_time: u64 = 1767139200;

    let market_id = client.create_market(&creator, &question, &category, &end_time);
    assert_eq!(market_id, 1);

    let fetched = client.get_market(&1);
    assert_eq!(fetched.id, 1);
    assert_eq!(fetched.creator, creator);
    assert_eq!(fetched.question, question);
    assert_eq!(fetched.status, 0); // Active
    assert_eq!(fetched.outcome, 0); // Pending
    assert_eq!(fetched.total_yes_pool, 0);
    assert_eq!(fetched.total_no_pool, 0);
    assert_eq!(fetched.total_stakers, 0);

    let count = client.get_market_count();
    assert_eq!(count, 1);
}

#[test]
fn test_stake_prediction_and_volume() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PredictionVaultContract, ());
    let client = PredictionVaultContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let staker1 = Address::generate(&env);
    let staker2 = Address::generate(&env);

    let question = String::from_str(&env, "Will Soroban Protocol 23 launch in 2026?");
    let category = Symbol::new(&env, "tech");
    let end_time: u64 = 1767139200;

    let market_id = client.create_market(&creator, &question, &category, &end_time);

    // Staker 1 bets 100 XLM on YES
    let stake1 = client.stake_prediction(&staker1, &market_id, &true, &100_0000000);
    assert!(stake1);

    // Staker 2 bets 50 XLM on NO
    let stake2 = client.stake_prediction(&staker2, &market_id, &false, &50_0000000);
    assert!(stake2);

    let market = client.get_market(&market_id);
    assert_eq!(market.total_yes_pool, 100_0000000);
    assert_eq!(market.total_no_pool, 50_0000000);
    assert_eq!(market.total_stakers, 2);

    let stats = client.get_protocol_stats();
    assert_eq!(stats.total_volume, 150_0000000);
}

#[test]
fn test_resolve_market_and_stats() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PredictionVaultContract, ());
    let client = PredictionVaultContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let tipper = Address::generate(&env);

    let question = String::from_str(&env, "Will ETH Gasless Paymaster succeed?");
    let category = Symbol::new(&env, "defi");
    let end_time: u64 = 1767139200;

    let market_id = client.create_market(&creator, &question, &category, &end_time);

    // Tip market
    let tip_res = client.tip_market(&tipper, &market_id, &20_0000000);
    assert!(tip_res);

    // Resolve market as YES (outcome = 1)
    let res = client.resolve_market(&creator, &market_id, &1);
    assert!(res);

    let market = client.get_market(&market_id);
    assert_eq!(market.status, 1); // Resolved
    assert_eq!(market.outcome, 1); // YES won
    assert_eq!(market.tips, 20_0000000);

    let stats = client.get_protocol_stats();
    assert_eq!(stats.total_markets, 1);
    assert_eq!(stats.total_resolved, 1);
    assert_eq!(stats.total_tips, 20_0000000);
}

#[test]
#[should_panic(expected = "Market ID not found in vault")]
fn test_nonexistent_market_panic() {
    let env = Env::default();
    let contract_id = env.register(PredictionVaultContract, ());
    let client = PredictionVaultContractClient::new(&env, &contract_id);

    client.get_market(&888);
}
