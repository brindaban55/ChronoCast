import React, { useState, useEffect } from 'react';
import { server } from '../services/stellar';

export default function NetworkStatus() {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);
  const [ledger, setLedger] = useState(null);

  const checkNetwork = async () => {
    setStatus('checking');
    const start = Date.now();
    try {
      const ledgerPage = await server.ledgers().limit(1).order('desc').call();
      const elapsed = Date.now() - start;
      setLatency(elapsed);
      setLedger(ledgerPage.records?.[0]?.sequence);
      setStatus(elapsed < 2000 ? 'online' : 'degraded');
    } catch {
      setStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, 30000);
    return () => clearInterval(interval);
  }, []);

  const dot = {
    online: { color: '#10b981', label: 'Stellar Testnet', bg: 'rgba(16,185,129,0.1)' },
    degraded: { color: '#f59e0b', label: 'Network Slow', bg: 'rgba(245,158,11,0.1)' },
    offline: { color: '#f43f5e', label: 'Testnet Offline', bg: 'rgba(244,63,94,0.1)' },
    checking: { color: '#94a3b8', label: 'Checking...', bg: 'rgba(148,163,184,0.08)' },
  }[status];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.4rem 0.85rem',
        background: dot.bg,
        border: `1px solid ${dot.color}35`,
        borderRadius: '20px',
        fontSize: '0.78rem',
        fontWeight: '700',
        cursor: 'pointer',
      }}
      onClick={checkNetwork}
      title="Click to refresh network health"
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: dot.color,
          boxShadow: `0 0 8px ${dot.color}`,
          display: 'inline-block',
        }}
      />
      <span style={{ color: dot.color }}>{dot.label}</span>
      {latency && status !== 'offline' && (
        <span style={{ color: '#94a3b8' }}>{latency}ms</span>
      )}
      {ledger && (
        <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem' }}>
          #{ledger}
        </span>
      )}
    </div>
  );
}
