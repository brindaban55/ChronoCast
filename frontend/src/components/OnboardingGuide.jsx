import React, { useState } from 'react';
import {
  Rocket, Wallet, Droplets, TrendingUp, CheckCircle2,
  ChevronRight, ChevronLeft, X, HelpCircle, Award, Scale
} from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: <Rocket size={32} color="#00e5ff" />,
    title: 'Welcome to ChronoCast',
    description:
      'ChronoCast is a decentralized binary outcome prediction market protocol built on Stellar Testnet using Soroban WASM smart contracts. Stake XLM on real-world outcomes with trustless on-chain payout distribution.',
    tip: '🌐 Protocol 22 Soroban WASM contract execution with sub-cent fees',
  },
  {
    id: 2,
    icon: <Wallet size={32} color="#a855f7" />,
    title: 'Step 1 — Connect Your Wallet',
    description:
      'Click "Connect Wallet" at the top right. Connect using Freighter Wallet extension or Instant Testnet Keypair (sandbox mode with zero setup required).',
    tip: '💡 Install Freighter from freighter.app or click Instant Keypair for 1-click access.',
  },
  {
    id: 3,
    icon: <Droplets size={32} color="#10b981" />,
    title: 'Step 2 — Fund with Friendbot',
    description:
      'Click the "+ Faucet" button in the top bar to receive 10,000 free Testnet XLM instantly from Stellar Friendbot.',
    tip: '🚰 Free testnet funds allow you to test creating markets and staking immediately.',
  },
  {
    id: 4,
    icon: <TrendingUp size={32} color="#f59e0b" />,
    title: 'Step 3 — Stake on Predictions',
    description:
      'Browse active markets in the Markets tab. Choose YES or NO outcome, enter your XLM stake, and submit. Funds are pooled in the Soroban contract vault.',
    tip: '⚡ Odds and potential return multipliers adjust dynamically as stakers enter the pool.',
  },
  {
    id: 5,
    icon: <Scale size={32} color="#ec4899" />,
    title: 'Step 4 — Oracle Desk & Claim Winnings',
    description:
      'When a market duration expires, the market is resolved on-chain. Winning stakers can claim their proportional share of the entire opposing pool directly to their wallet.',
    tip: '🔐 Fully trustless: payouts are computed and released entirely by smart contract logic.',
  },
  {
    id: 6,
    icon: <Award size={32} color="#22c55e" />,
    title: "Ready to Predict! 🎉",
    description:
      "You are all set to explore decentralized prediction markets. Create custom prediction markets or stake on existing ones to climb the on-chain leaderboard.",
    tip: '📡 Switch to "Live Events" to observe on-chain bets and contract events in real-time.',
  },
];

export default function OnboardingGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 10, 24, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        padding: '1rem',
      }}
    >
      <div
        className="neo-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2rem',
          position: 'relative',
          border: '1px solid rgba(0, 229, 255, 0.25)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{
                height: '4px',
                flex: 1,
                borderRadius: '2px',
                background: i <= step ? '#00e5ff' : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className="neo-inset"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          {current.icon}
        </div>

        {/* Content */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {current.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          {current.description}
        </p>

        {/* Tip */}
        <div
          style={{
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: '#7dd3fc',
            marginBottom: '1.75rem',
          }}
        >
          {current.tip}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="neo-btn"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.4 : 1, padding: '0.5rem 1rem' }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button className="neo-btn-primary" onClick={() => setStep((s) => s + 1)} style={{ padding: '0.5rem 1.2rem' }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="neo-btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.2rem' }}>
              Launch Markets 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
