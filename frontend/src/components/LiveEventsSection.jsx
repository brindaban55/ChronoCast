import React, { useState, useEffect } from 'react';
import { getContractEvents, CONTRACT_ID } from '../services/stellar';
import {
  Radio,
  RefreshCw,
  ExternalLink,
  Activity,
  Vote,
  Sparkles,
  Award,
  Heart,
} from 'lucide-react';

export default function LiveEventsSection() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getContractEvents(CONTRACT_ID, 25);
      setEvents(data);
    } catch (err) {
      console.warn('Events fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div
        className="neu-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
            <Radio size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: '800' }}>
                Soroban Live Event Feed
              </h2>
              <span className="pulse-node" />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Streaming real-time on-chain events from contract <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>{CONTRACT_ID.slice(0, 6)}...{CONTRACT_ID.slice(-6)}</code>
            </p>
          </div>
        </div>

        <button
          className="btn-neu"
          onClick={fetchEvents}
          disabled={isLoading}
          style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>{isLoading ? 'Polling...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Events Stream */}
      {events.length === 0 ? (
        <div
          className="neu-card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <Radio size={32} color="var(--accent-indigo)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '800' }}>Waiting for Contract Events...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Events are automatically published when markets are created, staked on, or settled.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((ev, idx) => {
            const topic = ev.topic?.[0] || 'mkt_event';
            return (
              <div
                key={ev.id || idx}
                className="neu-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span className="neu-pill pill-indigo" style={{ fontSize: '0.75rem' }}>
                    {topic}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Ledger #{ev.ledger} • Closed At {ev.ledgerClosedAt || 'Confirmed'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Tx Hash: {ev.txHash ? `${ev.txHash.slice(0, 20)}...` : 'Contract Emitted Event'}
                    </div>
                  </div>
                </div>

                {ev.txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${ev.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-neu"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                  >
                    <ExternalLink size={12} />
                    <span>View Tx</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
