import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { rpcServer, CONTRACT_ID, NETWORK_PASSPHRASE } from '../services/stellar';
import * as StellarSdk from '@stellar/stellar-sdk';

function truncate(key) {
  if (!key) return '';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function getRankIcon(rank) {
  if (rank === 0) return <Trophy size={16} color="#fbbf24" />;
  if (rank === 1) return <Medal size={16} color="#94a3b8" />;
  if (rank === 2) return <Medal size={16} color="#cd7f32" />;
  return <Star size={13} color="#94a3b8" />;
}

export default function PredictionLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOnChainLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dummyKeypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(dummyKeypair.publicKey(), '1');

      const countOp = StellarSdk.Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: 'get_market_count',
        args: [],
      });

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(countOp)
        .setTimeout(30)
        .build();

      const sim = await rpcServer.simulateTransaction(tx);
      let totalCount = 0;
      if (sim && sim.result && sim.result.retval) {
        totalCount = Number(StellarSdk.scValToNative(sim.result.retval)) || 0;
      }

      const creatorMap = {};

      for (let i = 1; i <= totalCount; i++) {
        try {
          const getOp = StellarSdk.Operation.invokeContractFunction({
            contract: CONTRACT_ID,
            function: 'get_market',
            args: [StellarSdk.nativeToScVal(BigInt(i), { type: 'u64' })],
          });

          const getTx = new StellarSdk.TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: NETWORK_PASSPHRASE,
          })
            .addOperation(getOp)
            .setTimeout(30)
            .build();

          const getSim = await rpcServer.simulateTransaction(getTx);
          if (getSim && getSim.result && getSim.result.retval) {
            const rawMarket = StellarSdk.scValToNative(getSim.result.retval);
            const creator = rawMarket.creator?.toString();
            if (creator) {
              const yesPool = Number(rawMarket.total_yes_pool || 0);
              const noPool = Number(rawMarket.total_no_pool || 0);
              const totalPool = yesPool + noPool;

              if (!creatorMap[creator]) {
                creatorMap[creator] = {
                  address: creator,
                  marketsCount: 0,
                  totalVolume: 0,
                  stakersCount: 0,
                  sampleQuestion: rawMarket.question || 'Prediction Market',
                };
              }
              creatorMap[creator].marketsCount += 1;
              creatorMap[creator].totalVolume += totalPool;
              creatorMap[creator].stakersCount += Number(rawMarket.total_stakers || 0);
            }
          }
        } catch (err) {
          console.warn(`Error fetching market #${i} for leaderboard:`, err);
        }
      }

      const sorted = Object.values(creatorMap).sort((a, b) => b.totalVolume - a.totalVolume);
      setLeaderboard(sorted);
    } catch (err) {
      console.error('Error fetching on-chain leaderboard:', err);
      setError('Unable to fetch live prediction market state from Soroban RPC.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnChainLeaderboard();
  }, []);

  return (
    <div className="neo-card" style={{ padding: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Trophy size={22} color="#fbbf24" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              On-Chain Market Creators &amp; Stakers
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Live volume aggregated directly from Soroban smart contract state
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="neo-badge neo-badge-cyan" style={{ fontSize: '0.75rem' }}>
            Soroban Live RPC
          </span>
          <button
            className="neo-btn"
            onClick={fetchOnChainLeaderboard}
            disabled={loading}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Sync Chain
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem 0' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="neo-inset"
              style={{ height: '60px', borderRadius: '12px', opacity: 0.6 }}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.88rem' }}>
          <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {error}
        </div>
      )}

      {/* Real on-chain empty state */}
      {!loading && !error && leaderboard.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
          <Sparkles size={34} color="#00e5ff" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
            No Prediction Markets Created Yet
          </h4>
          <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
            Smart contract <code>{truncate(CONTRACT_ID)}</code> is active on Testnet. Create the first market to lead the protocol rankings!
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="neo-btn"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
          >
            <ExternalLink size={13} /> View Contract on Explorer
          </a>
        </div>
      )}

      {/* Real on-chain data display */}
      {!loading && !error && leaderboard.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.address}
              className="neo-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
              }}
            >
              {/* Rank Icon */}
              <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getRankIcon(idx)}
              </div>

              {/* Address & Meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: '700', color: idx === 0 ? '#fbbf24' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {truncate(entry.address)}
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${entry.address}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#94a3b8' }}
                    title="View Account on Stellar Explorer"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {entry.marketsCount} market(s) • {entry.stakersCount} stakers • {entry.sampleQuestion}
                </div>
              </div>

              {/* Volume */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#00e5ff' }}>
                  {(entry.totalVolume / 10_000_000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} XLM
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>total pool volume</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem', color: '#94a3b8' }}>
        <span>Contract: <code style={{ color: '#cbd5e1' }}>{truncate(CONTRACT_ID)}</code></span>
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#00e5ff', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
        >
          Verify On-Chain <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
