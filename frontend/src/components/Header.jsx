import React from 'react';
import { useWallet } from '../context/WalletContext';
import {
  TrendingUp,
  Wallet,
  Send,
  Radio,
  Vote,
  Droplets,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const {
    publicKey,
    walletType,
    balance,
    isFunding,
    setModalOpen,
    disconnectWallet,
    requestFaucet,
  } = useWallet();

  const truncateKey = (key) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <header className="neo-header">
      {/* Brand & Network Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div
          className="brand-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="logo-badge">
            <TrendingUp size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-title">Chrono<span style={{ color: '#a855f7' }}>Cast</span></span>
              <span className="brand-pill">Testnet v22</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#78716c', fontWeight: '700' }}>
              Decentralized Prediction & Binary Oracle Protocol
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Wallet size={15} />
          <span>Dashboard</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          <Send size={15} />
          <span>Send XLM</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'markets' ? 'active' : ''}`}
          onClick={() => setActiveTab('markets')}
        >
          <Vote size={15} />
          <span>Prediction Hub</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Radio size={15} />
          <span>Live Stream</span>
        </button>
      </nav>

      {/* Wallet Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {publicKey ? (
          <>
            {/* 1-Click Faucet */}
            <button
              className="btn-primary btn-faucet"
              onClick={requestFaucet}
              disabled={isFunding}
              title="Request 10,000 Testnet XLM"
            >
              <Droplets size={14} />
              <span>{isFunding ? 'Funding...' : '+ Faucet (+10k XLM)'}</span>
            </button>

            {/* Balance Pill */}
            <div
              style={{
                background: '#ffffff',
                border: '2.5px solid var(--border-color)',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontWeight: '800', color: '#1c1917', fontSize: '0.92rem' }}>
                {balance}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#78716c', fontWeight: '800' }}>
                XLM
              </span>
            </div>

            {/* Address Pill */}
            <div
              style={{
                background: 'var(--color-yellow)',
                border: '2.5px solid var(--border-color)',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: '800',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '1.5px solid #1c1917',
                }}
              />
              <span>{truncateKey(publicKey)}</span>
            </div>

            {/* Dedicated Standalone Disconnect Button */}
            <button
              className="btn-disconnect"
              onClick={disconnectWallet}
              title="Disconnect active wallet"
            >
              <LogOut size={14} />
              <span>Disconnect</span>
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
