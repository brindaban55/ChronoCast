import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  TrendingUp,
  Award,
  Sparkles,
  PieChart,
  Vote,
  ShieldCheck,
  Zap,
  Calculator,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function WalletSection({ setActiveTab, stats }) {
  const { publicKey, balance, setModalOpen } = useWallet();

  // Staking Simulator State
  const [simAmount, setSimAmount] = useState('100');
  const [simOdds, setSimOdds] = useState('35'); // 35% probability of YES

  const simStakeNum = parseFloat(simAmount) || 0;
  const simOddsNum = parseFloat(simOdds) || 50;
  const simMultiplier = simOddsNum > 0 ? (100 / simOddsNum).toFixed(2) : '1.00';
  const simEstimatedPayout = (simStakeNum * parseFloat(simMultiplier)).toFixed(2);
  const simProfit = (parseFloat(simEstimatedPayout) - simStakeNum).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hero Neumorphic Banner */}
      <div
        className="neu-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '620px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <span className="neu-pill pill-indigo">
              <Zap size={13} />
              Soroban Protocol 22
            </span>
            <span className="neu-pill pill-green">
              <ShieldCheck size={13} />
              Binary Oracle Settled
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Decentralized Binary Prediction & Oracle Protocol
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, fontWeight: '500' }}>
            Trade binary prediction shares on real-world outcomes, take positions with dynamic automated odds pools, and settle verified payouts through on-chain Soroban oracles.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: '220px' }}>
          <button
            className="btn-neu btn-neu-primary"
            style={{ width: '100%', padding: '0.9rem 1.4rem' }}
            onClick={() => setActiveTab('create')}
          >
            <Vote size={18} />
            <span>Create New Market</span>
          </button>

          <button
            className="btn-neu"
            style={{ width: '100%', padding: '0.9rem 1.4rem' }}
            onClick={() => setActiveTab('transfer')}
          >
            <Zap size={18} color="var(--accent-sky)" />
            <span>Fast XLM Transfer</span>
          </button>
        </div>
      </div>

      {/* Protocol Metrics Grid */}
      <div className="neu-grid-stats">
        {/* Metric 1 */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Volume Staked
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
              <PieChart size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            {stats?.total_volume ? (Number(stats.total_volume) / 10000000).toLocaleString() : '0'} <span style={{ fontSize: '0.95rem', color: 'var(--accent-green)' }}>XLM</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Locked across active YES/NO liquidity pools
          </div>
        </div>

        {/* Metric 2 */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Markets Created
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
              <Vote size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            {stats?.total_markets || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            On-chain registered prediction questions
          </div>
        </div>

        {/* Metric 3 */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Outcomes Settled
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sky)' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            {stats?.total_resolved || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Oracle-verified outcome resolutions
          </div>
        </div>

        {/* Metric 4 */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Creator Tips Distributed
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            {stats?.total_tips ? (Number(stats.total_tips) / 10000000).toLocaleString() : '0'} <span style={{ fontSize: '0.95rem', color: 'var(--accent-rose)' }}>XLM</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Micro-rewards sent directly to creators
          </div>
        </div>
      </div>

      {/* Interactive Probability & Stake Simulator */}
      <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
            <Calculator size={18} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800' }}>
              Interactive Odds & Potential Payout Simulator
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Simulate stake returns based on automated market odds
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Stake Amount (XLM)
              </label>
              <input
                type="number"
                min="1"
                className="neu-input"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                <span>Market Probability: {simOdds}%</span>
                <span>Multiplier: {simMultiplier}x</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={simOdds}
                onChange={(e) => setSimOdds(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="neu-card-inset" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Estimated Gross Payout:</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-green)' }}>
                {simEstimatedPayout} XLM
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Estimated Net Profit:</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
                +{simProfit} XLM
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              * Calculated proportionally against opposite prediction pool liquidity.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
