import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw, History } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { server } from '../services/stellar';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncate(str, start = 6, end = 4) {
  if (!str) return '';
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

export default function TxHistorySection() {
  const { publicKey } = useWallet();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const result = await server.transactions().forAccount(publicKey).limit(10).order('desc').call();
      const records = result.records || [];
      const enriched = await Promise.all(
        records.map(async (tx) => {
          let ops = [];
          try {
            const opsResult = await server.operations().forTransaction(tx.id).limit(5).call();
            ops = opsResult.records || [];
          } catch (_) {}
          return { ...tx, operations: ops };
        })
      );
      setTxs(enriched);
    } catch (err) {
      setError('Could not load transaction history. Connect and fund your wallet on testnet.');
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  function getOpIcon(op) {
    if (!op) return <ArrowUpRight size={14} color="#94a3b8" />;
    if (op.type === 'payment') {
      const isSend = op.source_account === publicKey || op.from === publicKey;
      return isSend
        ? <ArrowUpRight size={14} color="#f43f5e" />
        : <ArrowDownLeft size={14} color="#10b981" />;
    }
    if (op.type === 'invoke_host_function') return <span style={{ fontSize: '0.75rem' }}>⚙️</span>;
    return <ArrowUpRight size={14} color="#94a3b8" />;
  }

  function getOpLabel(op) {
    if (!op) return 'Transaction';
    if (op.type === 'payment') {
      const isSend = op.source_account === publicKey || op.from === publicKey;
      const amount = parseFloat(op.amount || 0).toFixed(2);
      return isSend
        ? `Sent ${amount} XLM → ${truncate(op.to || op.destination)}`
        : `Received ${amount} XLM ← ${truncate(op.from || op.source_account)}`;
    }
    if (op.type === 'invoke_host_function') return 'Soroban Contract Call (Prediction Vault)';
    if (op.type === 'create_account') return `Create Account: ${truncate(op.account)}`;
    return op.type?.replace(/_/g, ' ') || 'Operation';
  }

  return (
    <div className="neo-card" style={{ padding: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History size={22} color="#00e5ff" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Transaction History
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Verified ledger records for connected account
            </div>
          </div>
        </div>
        <button
          className="neo-btn"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          onClick={fetchHistory}
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Not connected */}
      {!publicKey && (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
          <Clock size={34} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.9rem' }}>Connect your wallet to view on-chain transactions</p>
        </div>
      )}

      {/* Loading */}
      {publicKey && loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="neo-inset" style={{ height: '56px', borderRadius: '10px', opacity: 0.6 }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.88rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Empty */}
      {publicKey && !loading && !error && txs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>No transactions found for this wallet address.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>Stake on a prediction market or send XLM to see history here.</p>
        </div>
      )}

      {/* Transaction List */}
      {!loading && txs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {txs.map((tx) => {
            const op = tx.operations?.[0];
            return (
              <div
                key={tx.id}
                className="neo-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '12px',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: icon + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <div
                    className="neo-inset"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getOpIcon(op)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {getOpLabel(op)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span>{formatDate(tx.created_at)}</span>
                      <span>•</span>
                      <span>{formatTime(tx.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: status + explorer link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                  <span
                    className={`neo-badge ${tx.successful ? 'neo-badge-green' : 'neo-badge-red'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {tx.successful ? '✓ Confirmed' : '✗ Failed'}
                  </span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#94a3b8', display: 'flex' }}
                    title="View in Stellar Explorer"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
