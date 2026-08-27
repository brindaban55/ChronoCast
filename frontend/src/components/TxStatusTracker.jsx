import React, { useState } from 'react';
import {
  Clock, CheckCircle2, XCircle, Loader2, ExternalLink, ChevronDown, ChevronUp, Activity
} from 'lucide-react';

const STATUS_CONFIG = {
  idle: { label: 'Ready', color: '#94a3b8', icon: <Activity size={14} /> },
  building: { label: 'Building Transaction...', color: '#f59e0b', icon: <Loader2 size={14} className="spin" /> },
  simulating: { label: 'Simulating on Soroban RPC...', color: '#f59e0b', icon: <Loader2 size={14} className="spin" /> },
  signing: { label: 'Waiting for Wallet Signature...', color: '#a855f7', icon: <Loader2 size={14} className="spin" /> },
  submitting: { label: 'Submitting to Network...', color: '#00e5ff', icon: <Loader2 size={14} className="spin" /> },
  confirming: { label: 'Awaiting Ledger Confirmation...', color: '#00e5ff', icon: <Loader2 size={14} className="spin" /> },
  success: { label: 'Transaction Confirmed ✓', color: '#10b981', icon: <CheckCircle2 size={14} /> },
  error: { label: 'Transaction Failed', color: '#f43f5e', icon: <XCircle size={14} /> },
};

let _listeners = [];
let _state = { status: 'idle', hash: null, error: null, ledger: null };

export function updateTxStatus(status, extras = {}) {
  _state = { status, ...extras };
  _listeners.forEach((fn) => fn({ ..._state }));
}

export function useTxStatus() {
  const [state, setState] = useState({ ..._state });

  React.useEffect(() => {
    _listeners.push(setState);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== setState);
    };
  }, []);

  return state;
}

export default function TxStatusTracker() {
  const { status, hash, error, ledger } = useTxStatus();
  const [expanded, setExpanded] = useState(false);

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const isActive = status !== 'idle';

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 9998,
        maxWidth: '360px',
        width: '100%',
      }}
    >
      <div
        className="neo-card"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${cfg.color}50`,
          borderRadius: '14px',
          padding: '1rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: cfg.color }}>{cfg.icon}</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        <div style={{ marginTop: '0.75rem', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: cfg.color,
              borderRadius: '2px',
              width: status === 'success' || status === 'error' ? '100%' : status === 'idle' ? '0%' : '65%',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {expanded && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {hash && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                <Clock size={12} color="#94a3b8" />
                <span style={{ color: '#94a3b8' }}>Tx Hash:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#00e5ff', fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {hash.slice(0, 8)}...{hash.slice(-6)}
                  <ExternalLink size={10} />
                </a>
              </div>
            )}
            {ledger && (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Ledger: <span style={{ color: '#f1f5f9' }}>#{ledger}</span>
              </div>
            )}
            {error && (
              <div style={{ fontSize: '0.8rem', color: '#fca5a5', background: 'rgba(244,63,94,0.1)', borderRadius: '6px', padding: '0.5rem 0.7rem' }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
