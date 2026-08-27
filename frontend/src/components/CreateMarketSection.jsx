import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  PlusCircle,
  Vote,
  Sparkles,
  Check,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreateMarketSection({ onCreateMarket, setActiveTab }) {
  const { publicKey, setModalOpen } = useWallet();

  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('crypto');
  const [days, setDays] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setModalOpen(true);
      return;
    }

    if (!question.trim()) {
      alert('Please enter a prediction question.');
      return;
    }

    setIsSubmitting(true);
    try {
      const daysNum = parseInt(days, 10) || 30;
      const endTime = Math.floor(Date.now() / 1000) + daysNum * 86400;

      await onCreateMarket({
        question: question.trim(),
        category,
        endTime,
      });

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setQuestion('');
      setActiveTab('dashboard');
    } catch (err) {
      alert(err.message || 'Failed to create market');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800' }}>
              Create Decentralized Prediction Market
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Deploy an on-chain binary prediction contract on Stellar Testnet
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Question Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Prediction Question / Real-World Event
            </label>
            <textarea
              className="neu-input"
              rows={3}
              placeholder="e.g. Will Stellar Protocol 23 launch before Q4 2026?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          {/* Category & Resolution Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Category
              </label>
              <select
                className="neu-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="crypto">Crypto & Assets</option>
                <option value="tech">Tech & Soroban</option>
                <option value="governance">DAO Governance</option>
                <option value="defi">DeFi & Protocols</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Resolution Window
              </label>
              <select
                className="neu-input"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
              </select>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="neu-card-inset" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Live Market Preview
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {question.trim() || 'Your prediction question will appear here...'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="neu-pill pill-indigo" style={{ fontSize: '0.72rem' }}>
                Category: {category}
              </span>
              <span className="neu-pill pill-amber" style={{ fontSize: '0.72rem' }}>
                Duration: {days} Days
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-neu btn-neu-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Deploying Market to Soroban Vault...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Deploy Prediction Market On-Chain</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
