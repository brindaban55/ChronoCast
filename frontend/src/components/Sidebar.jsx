import React from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  PlusCircle,
  Send,
  Radio,
  Award,
  ShieldCheck,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { CONTRACT_ID } from '../services/stellar';

export default function Sidebar({ activeTab, setActiveTab }) {
  const truncateKey = (key) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <aside className="neu-sidebar">
      <div>
        {/* Brand Logo with Neumorphic Icon Box */}
        <div
          className="brand-box"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="brand-icon-neu">
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="brand-name">
              Chrono<span style={{ color: 'var(--accent-indigo)' }}>Cast</span>
            </div>
            <div className="brand-subtitle">
              Decentralized Oracle Protocol
            </div>
          </div>
        </div>

        {/* Vertical Navigation Bar */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item-neu ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Market Arena</span>
          </button>

          <button
            className={`nav-item-neu ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={18} />
            <span>Create Market</span>
          </button>

          <button
            className={`nav-item-neu ${activeTab === 'transfer' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            <Send size={18} />
            <span>Fast XLM Pay</span>
          </button>

          <button
            className={`nav-item-neu ${activeTab === 'oracle' ? 'active' : ''}`}
            onClick={() => setActiveTab('oracle')}
          >
            <Award size={18} />
            <span>Oracle Desk</span>
          </button>

          <button
            className={`nav-item-neu ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Radio size={18} />
            <span>Soroban Feed</span>
          </button>

          <button
            className={`nav-item-neu ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <ShieldCheck size={18} />
            <span>History</span>
          </button>

          <button
            className={`nav-item-neu ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Zap size={18} />
            <span>Leaderboard</span>
          </button>
        </nav>
      </div>

      {/* Bottom Network & Contract Widget */}
      <div className="neu-card-inset" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className="pulse-node" />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-green)' }}>
              Protocol 22 Active
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            Testnet
          </span>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Contract ID:
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--accent-indigo)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>{truncateKey(CONTRACT_ID)}</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </aside>
  );
}
