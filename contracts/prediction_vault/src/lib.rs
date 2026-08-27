#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PredictionMarket {
    pub id: u64,
    pub creator: Address,
    pub question: String,
    pub category: Symbol,
    pub end_time: u64,
    pub status: u32,  // 0 = Active, 1 = Resolved, 2 = Cancelled
    pub outcome: u32, // 0 = Pending, 1 = YES won, 2 = NO won
    pub total_yes_pool: i128,
    pub total_no_pool: i128,
    pub total_stakers: u64,
    pub tips: i128,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProtocolStats {
    pub total_markets: u64,
    pub total_volume: i128,
    pub total_tips: i128,
    pub total_resolved: u64,
}

#[contracttype]
pub enum DataKey {
    MarketCount,
    Market(u64),
    TotalVolume,
    TotalTips,
    TotalResolved,
}

#[contract]
pub struct PredictionVaultContract;

#[contractimpl]
impl PredictionVaultContract {
    /// Create a new decentralized prediction market
    pub fn create_market(
        env: Env,
        creator: Address,
        question: String,
        category: Symbol,
        end_time: u64,
    ) -> u64 {
        creator.require_auth();

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::MarketCount)
            .unwrap_or(0);

        count += 1;

        let created_at = env.ledger().timestamp();
        let market = PredictionMarket {
            id: count,
            creator: creator.clone(),
            question: question.clone(),
            category: category.clone(),
            end_time,
            status: 0, // Active
            outcome: 0, // Pending
            total_yes_pool: 0,
            total_no_pool: 0,
            total_stakers: 0,
            tips: 0,
            created_at,
        };

        // Store persistently
        env.storage()
            .persistent()
            .set(&DataKey::Market(count), &market);

        // Update total market count
        env.storage()
            .instance()
            .set(&DataKey::MarketCount, &count);

        // Extend TTL
        env.storage().instance().extend_ttl(50000, 100000);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Market(count), 50000, 100000);

        // Emit on-chain creation event
        env.events().publish(
            (symbol_short!("mkt_new"), category),
            (count, creator, question),
        );

        count
    }

    /// Stake YES or NO prediction shares in an active market pool
    pub fn stake_prediction(
        env: Env,
        staker: Address,
        market_id: u64,
        is_yes: bool,
        amount: i128,
    ) -> bool {
        staker.require_auth();

        if amount <= 0 {
            panic!("Stake amount must be greater than zero");
        }

        let mut market: PredictionMarket = env
            .storage()
            .persistent()
            .get(&DataKey::Market(market_id))
            .unwrap_or_else(|| panic!("Market ID not found in vault"));

        if market.status != 0 {
            panic!("Market is closed or already resolved");
        }

        if is_yes {
            market.total_yes_pool += amount;
        } else {
            market.total_no_pool += amount;
        }
        market.total_stakers += 1;

        env.storage()
            .persistent()
            .set(&DataKey::Market(market_id), &market);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Market(market_id), 50000, 100000);

        // Update overall protocol volume
        let mut total_volume: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0);
        total_volume += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalVolume, &total_volume);

        // Emit stake event
        env.events().publish(
            (symbol_short!("mkt_stk"), market_id),
            (staker, is_yes, amount),
        );

        true
    }

    /// Resolve market with verified oracle outcome (1 = YES won, 2 = NO won)
    pub fn resolve_market(
        env: Env,
        resolver: Address,
        market_id: u64,
        outcome: u32,
    ) -> bool {
        resolver.require_auth();

        if outcome != 1 && outcome != 2 {
            panic!("Invalid outcome. Must be 1 (YES) or 2 (NO)");
        }

        let mut market: PredictionMarket = env
            .storage()
            .persistent()
            .get(&DataKey::Market(market_id))
            .unwrap_or_else(|| panic!("Market ID not found in vault"));

        if market.creator != resolver {
            panic!("Only market creator or oracle authority can resolve market");
        }

        if market.status != 0 {
            panic!("Market already resolved or closed");
        }

        market.status = 1; // Resolved
        market.outcome = outcome;

        env.storage()
            .persistent()
            .set(&DataKey::Market(market_id), &market);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Market(market_id), 50000, 100000);

        let mut total_resolved: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalResolved)
            .unwrap_or(0);
        total_resolved += 1;
        env.storage()
            .instance()
            .set(&DataKey::TotalResolved, &total_resolved);

        // Emit resolution event
        env.events().publish(
            (symbol_short!("mkt_res"), market_id),
            (resolver, outcome),
        );

        true
    }

    /// Tip market creator with micro-rewards
    pub fn tip_market(
        env: Env,
        tipper: Address,
        market_id: u64,
        amount: i128,
    ) -> bool {
        tipper.require_auth();

        if amount <= 0 {
            panic!("Tip amount must be positive");
        }

        let mut market: PredictionMarket = env
            .storage()
            .persistent()
            .get(&DataKey::Market(market_id))
            .unwrap_or_else(|| panic!("Market not found"));

        market.tips += amount;

        env.storage()
            .persistent()
            .set(&DataKey::Market(market_id), &market);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Market(market_id), 50000, 100000);

        let mut total_tips: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTips)
            .unwrap_or(0);
        total_tips += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalTips, &total_tips);

        // Emit tip event
        env.events().publish(
            (symbol_short!("mkt_tip"), market_id),
            (tipper, amount),
        );

        true
    }

    /// Fetch details of a single prediction market
    pub fn get_market(env: Env, id: u64) -> PredictionMarket {
        env.storage()
            .persistent()
            .get(&DataKey::Market(id))
            .unwrap_or_else(|| panic!("Market ID not found in vault"))
    }

    /// Get total number of created prediction markets
    pub fn get_market_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::MarketCount)
            .unwrap_or(0)
    }

    /// Get aggregated protocol statistics
    pub fn get_protocol_stats(env: Env) -> ProtocolStats {
        let total_markets: u64 = env
            .storage()
            .instance()
            .get(&DataKey::MarketCount)
            .unwrap_or(0);
        let total_volume: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0);
        let total_tips: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTips)
            .unwrap_or(0);
        let total_resolved: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalResolved)
            .unwrap_or(0);

        ProtocolStats {
            total_markets,
            total_volume,
            total_tips,
            total_resolved,
        }
    }
}

#[cfg(test)]
mod test;
