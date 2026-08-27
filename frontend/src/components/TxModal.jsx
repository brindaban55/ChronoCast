import React from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  Key,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function TxModal() {
  const {
    modalOpen,
    setModalOpen,
    connectFreighter,
    connectDemoWallet,
    isConnecting,
    errorNotice,
  } = useWallet();

  if (!modalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30, 41, 59, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
    >
      <div
        className="neu-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          backgroundColor: '#e9eff8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
              <Wallet size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800' }}>
                Connect Wallet
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Select your Stellar Testnet wallet provider
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(false)}
            className="btn-neu"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '12px' }}
          >
            ✕
          </button>
        </div>

        {errorNotice && (
          <div className="neu-card-inset" style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <AlertCircle size={16} />
            <span>{errorNotice}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Freighter */}
          <button
            className="neu-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              border: 'none',
            }}
            onClick={connectFreighter}
            disabled={isConnecting}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff1eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                🦊
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Freighter Wallet
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  Stellar browser extension & hardware signer
                </div>
              </div>
            </div>
            {isConnecting ? <Loader2 size={16} className="spin" /> : <span style={{ fontSize: '1.1rem', color: 'var(--accent-indigo)' }}>➔</span>}
          </button>

          {/* Instant Demo Wallet */}
          <button
            className="neu-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              border: 'none',
            }}
            onClick={connectDemoWallet}
            disabled={isConnecting}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
                <Key size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Instant Demo Keypair
                  </span>
                  <span className="neu-pill pill-green" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                    +10k Faucet
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  1-Click funded testnet account (No setup needed)
                </div>
              </div>
            </div>
            {isConnecting ? <Loader2 size={16} className="spin" /> : <span style={{ fontSize: '1.1rem', color: 'var(--accent-indigo)' }}>➔</span>}
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>
          Running on Stellar Testnet (Protocol 22 / Soroban v22)
        </div>
      </div>
    </div>
  );
}
