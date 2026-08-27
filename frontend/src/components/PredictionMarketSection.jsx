import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Vote,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Heart,
  User,
  MessageSquare,
  TrendingUp,
  Check,
  Coins,
  Percent,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'all', label: 'All Predictions' },
  { id: 'crypto', label: 'Crypto & Assets' },
  { id: 'tech', label: 'Tech & Soroban' },
  { id: 'governance', label: 'DAO Governance' },
  { id: 'defi', label: 'DeFi & Protocols' },
];

export default function PredictionMarketSection({
  markets = [],
  isLoading,
  searchQuery = '',
  setActiveTab,
  onStakePrediction,
  onTipMarket,
}) {
  const { publicKey, setModalOpen } = useWallet();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterMyMarkets, setFilterMyMarkets] = useState(false);

  // Staking State
  const [activeStakeId, setActiveStakeId] = useState(null);
  const [stakeSide, setStakeSide] = useState('yes'); // 'yes' | 'no'
  const [stakeAmount, setStakeAmount] = useState('25');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tipping State
  const [activeTipId, setActiveTipId] = useState(null);
  const [tipAmount, setTipAmount] = useState('10');

  // Thread comments state
  const [commentsMap, setCommentsMap] = useState({});
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const truncateKey = (key) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const handleStakeSubmit = async (marketId) => {
    if (!publicKey) {
      setModalOpen(true);
      return;
    }

    const numAmount = parseFloat(stakeAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid stake amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onStakePrediction(marketId, stakeSide === 'yes', numAmount);
      setActiveStakeId(null);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.message || 'Failed to stake prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTipSubmit = async (marketId) => {
    if (!publicKey) {
      setModalOpen(true);
      return;
    }
    const num = parseFloat(tipAmount);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    try {
      await onTipMarket(marketId, num);
      setActiveTipId(null);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.message || 'Failed to send tip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = (marketId) => {
    if (!newCommentText.trim()) return;
    const author = publicKey ? truncateKey(publicKey) : 'Market Trader';
    const newComment = {
      id: Date.now(),
      author,
      text: newCommentText.trim(),
      timestamp: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [marketId]: [...(prev[marketId] || []), newComment],
    }));
    setNewCommentText('');
  };

  // Filter markets
  const filteredMarkets = markets.filter((m) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      m.category?.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.question?.toLowerCase().includes(query) ||
      m.creator?.toLowerCase().includes(query) ||
      m.id?.toString() === query;

    const matchesMy =
      !filterMyMarkets || (publicKey && m.creator === publicKey);

    return matchesCategory && matchesSearch && matchesMy;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Category Pills & Filters */}
      <div
        className="neu-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`neu-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{ cursor: 'pointer', border: 'none', padding: '0.6rem 1.1rem' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            className={`neu-pill ${filterMyMarkets ? 'active' : ''}`}
            style={{ cursor: 'pointer', border: 'none', padding: '0.6rem 1.1rem' }}
            onClick={() => setFilterMyMarkets(!filterMyMarkets)}
          >
            <User size={14} />
            <span>My Markets</span>
          </button>

          <button
            className="btn-neu btn-neu-primary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('create')}
          >
            <Plus size={15} />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* Markets Feed */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <Loader2 size={36} className="spin" color="var(--accent-indigo)" />
          <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Querying Soroban Prediction State...
          </div>
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div
          className="neu-card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
            <Vote size={26} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800' }}>No Prediction Markets Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.25rem' }}>
              Create the first decentralized prediction event on Stellar Testnet!
            </p>
          </div>
          <button className="btn-neu btn-neu-primary" onClick={() => setActiveTab('create')}>
            <Plus size={16} />
            <span>Create First Market</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredMarkets.map((market) => {
            const isActive = market.status === 0;
            const isResolved = market.status === 1;

            const yesPool = Number(market.total_yes_pool || 0);
            const noPool = Number(market.total_no_pool || 0);
            const totalPool = yesPool + noPool;

            const yesPercent = totalPool === 0 ? 50 : Math.round((yesPool / totalPool) * 100);
            const noPercent = 100 - yesPercent;

            const totalXLM = (totalPool / 10000000).toLocaleString();
            const tipsFormatted = market.tips ? (Number(market.tips) / 10000000).toLocaleString() : '0';
            const comments = commentsMap[market.id] || [];

            return (
              <div
                key={market.id}
                className="neu-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Market Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="neu-pill" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
                        #{market.id}
                      </span>
                      {isActive ? (
                        <span className="neu-pill pill-amber">
                          ● Active
                        </span>
                      ) : (
                        <span className={`neu-pill ${market.outcome === 1 ? 'pill-green' : 'pill-rose'}`}>
                          ✓ Settled: {market.outcome === 1 ? 'YES Won' : 'NO Won'}
                        </span>
                      )}
                      <span className="neu-pill pill-indigo" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                        {market.category || 'Crypto'}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {market.question}
                    </h3>
                  </div>

                  {/* Staked Pool Badge */}
                  <div className="neu-card-inset" style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Total Staked Pool
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                      {totalXLM} <span style={{ fontSize: '0.85rem', color: 'var(--accent-indigo)' }}>XLM</span>
                    </div>
                  </div>
                </div>

                {/* Neumorphic Dual Odds Probability Meter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800' }}>
                    <span style={{ color: 'var(--accent-green)' }}>YES Probability: {yesPercent}%</span>
                    <span style={{ color: 'var(--accent-rose)' }}>NO Probability: {noPercent}%</span>
                  </div>
                  <div className="neu-odds-track">
                    <div className="neu-odds-yes" style={{ width: `${yesPercent}%` }} />
                    <div className="neu-odds-no" style={{ width: `${noPercent}%` }} />
                  </div>
                </div>

                {/* Staking Action Buttons */}
                {isActive && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                      className="btn-neu-yes"
                      onClick={() => {
                        setActiveStakeId(activeStakeId === market.id && stakeSide === 'yes' ? null : market.id);
                        setStakeSide('yes');
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Stake YES ({yesPercent}%)</span>
                    </button>

                    <button
                      className="btn-neu-no"
                      onClick={() => {
                        setActiveStakeId(activeStakeId === market.id && stakeSide === 'no' ? null : market.id);
                        setStakeSide('no');
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>Stake NO ({noPercent}%)</span>
                    </button>
                  </div>
                )}

                {/* Inline Soft Staking Panel */}
                {activeStakeId === market.id && (
                  <div
                    className="neu-card-inset"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: stakeSide === 'yes' ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                      Stake on outcome: <strong>{stakeSide.toUpperCase()}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {['10', '25', '50', '100'].map((amt) => (
                        <button
                          key={amt}
                          className={`neu-pill ${stakeAmount === amt ? 'active' : ''}`}
                          style={{ cursor: 'pointer', border: 'none', padding: '0.45rem 0.85rem' }}
                          onClick={() => setStakeAmount(amt)}
                        >
                          {amt} XLM
                        </button>
                      ))}

                      <input
                        type="number"
                        min="1"
                        className="neu-input"
                        style={{ width: '130px', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />

                      <button
                        className={stakeSide === 'yes' ? 'btn-neu btn-neu-faucet' : 'btn-neu btn-neu-disconnect'}
                        style={{ padding: '0.55rem 1.15rem', fontSize: '0.88rem' }}
                        onClick={() => handleStakeSubmit(market.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 size={15} className="spin" /> : 'Confirm Stake'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Meta row & actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Oracle:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${market.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-indigo)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                      >
                        {truncateKey(market.creator)}
                      </a>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Heart size={14} color="var(--accent-rose)" fill="var(--accent-rose)" />
                      <span>{tipsFormatted} XLM Tips</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      className="btn-neu"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
                      onClick={() => setActiveTipId(activeTipId === market.id ? null : market.id)}
                    >
                      <Heart size={14} color="var(--accent-rose)" />
                      <span>Tip Creator</span>
                    </button>

                    <button
                      className="btn-neu"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
                      onClick={() => setActiveThreadId(activeThreadId === market.id ? null : market.id)}
                    >
                      <MessageSquare size={14} />
                      <span>Discussion ({comments.length})</span>
                    </button>
                  </div>
                </div>

                {/* Inline Soft Tip Chips */}
                {activeTipId === market.id && (
                  <div className="neu-card-inset" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-rose)' }}>Tip Amount:</span>
                      {['5', '10', '25', '50'].map((amt) => (
                        <button
                          key={amt}
                          className={`neu-pill ${tipAmount === amt ? 'active' : ''}`}
                          style={{ cursor: 'pointer', border: 'none', padding: '0.35rem 0.75rem' }}
                          onClick={() => setTipAmount(amt)}
                        >
                          {amt} XLM
                        </button>
                      ))}
                    </div>

                    <button
                      className="btn-neu btn-neu-disconnect"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                      onClick={() => handleTipSubmit(market.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 size={14} className="spin" /> : `Send ${tipAmount} XLM Tip`}
                    </button>
                  </div>
                )}

                {/* Reddit-Style Compact Discussion Threads */}
                {activeThreadId === market.id && (
                  <div className="neu-card-inset" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      💬 Market Analysis & Trader Insights
                    </div>

                    {comments.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No analysis posted yet. Share your market thesis below!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {comments.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              borderLeft: '3px solid var(--accent-indigo)',
                              paddingLeft: '0.75rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
                              <span style={{ color: 'var(--accent-indigo)' }}>{c.author}</span>
                              <span>•</span>
                              <span>{c.timestamp}</span>
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginTop: '0.2rem' }}>
                              {c.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Comment Input */}
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.35rem' }}>
                      <input
                        type="text"
                        className="neu-input"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                        placeholder="Share your odds rationale or technical analysis..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(market.id);
                        }}
                      />
                      <button
                        className="btn-neu btn-neu-primary"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => handleAddComment(market.id)}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
