import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  Droplets,
  LogOut,
  Search,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

import NetworkStatus from './NetworkStatus';
import XlmPriceBar from './XlmPriceBar';
import { HelpCircle } from 'lucide-react';

export default function TopBar({ searchQuery, setSearchQuery, onOpenGuide }) {
  const {
    publicKey,
    walletType,
    balance,
    isFunding,
    setModalOpen,
    disconnectWallet,
    requestFaucet,
  } = useWallet();

  const [copied, setCopied] = useState(false);

  const truncateKey = (key) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="neu-topbar">
      {/* Search Input Bar (Neumorphic Inset) */}
      <div style={{ flex: 1, minWidth: '220px', maxWidth: '380px', position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          className="neu-input"
          style={{ paddingLeft: '2.6rem', fontSize: '0.88rem' }}
          placeholder="Search questions, categories, creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Network & Price Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <NetworkStatus />
        <XlmPriceBar />
        {onOpenGuide && (
          <button
            className="btn-neu"
            onClick={onOpenGuide}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Open Getting Started Guide"
          >
            <HelpCircle size={14} color="#00e5ff" />
            <span>Guide</span>
          </button>
        )}
      </div>

      {/* Wallet Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {publicKey ? (
          <>
            {/* 1-Click Faucet (+10,000 XLM) */}
            <button
              className="btn-neu btn-neu-faucet"
              onClick={requestFaucet}
              disabled={isFunding}
              title="Request 10,000 Testnet XLM"
            >
              <Droplets size={15} />
              <span>{isFunding ? 'Funding...' : '+ Faucet (+10k XLM)'}</span>
            </button>

            {/* Balance Pill */}
            <div className="neu-pill" style={{ padding: '0.55rem 1rem' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {balance}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
                XLM
              </span>
            </div>

            {/* Address Pill with Copy */}
            <button
              className="neu-pill"
              onClick={copyAddress}
              style={{
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                padding: '0.55rem 0.95rem',
              }}
              title="Click to copy public key"
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                }}
              />
              <span>{truncateKey(publicKey)}</span>
              {copied ? <Check size={13} color="var(--accent-green)" /> : <Copy size={13} />}
            </button>

            {/* Dedicated Standalone Disconnect Button */}
            <button
              className="btn-neu btn-neu-disconnect"
              onClick={disconnectWallet}
              title="Disconnect active wallet"
            >
              <LogOut size={15} />
              <span>Disconnect</span>
            </button>
          </>
        ) : (
          <button className="btn-neu btn-neu-primary" onClick={() => setModalOpen(true)}>
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
