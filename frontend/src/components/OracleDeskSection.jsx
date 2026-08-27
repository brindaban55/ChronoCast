import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Check,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OracleDeskSection({ markets = [], onResolveMarket }) {
  const { publicKey, setModalOpen } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const truncateKey = (key) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const handleResolve = async (marketId, outcome) => {
    if (!publicKey) {
      setModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setResolvingId(marketId);
    try {
      await onResolveMarket(marketId, outcome);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.message || 'Failed to resolve market');
    } finally {
      setIsSubmitting(false);
      setResolvingId(null);
    }
  };

  // Filter markets where user is creator or any active market
  const creatorMarkets = markets.filter(
    (m) => publicKey && m.creator?.toLowerCase() === publicKey.toLowerCase()
  );

  const activeMarketsToResolve = creatorMarkets.length > 0 ? creatorMarkets : markets;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
            <Award size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800' }}>
              Oracle Resolution & Settlement Desk
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Declare verified real-world outcomes and unlock proportional reward payouts on Soroban
            </p>
          </div>
        </div>

        <div className="neu-card-inset" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={18} color="var(--accent-green)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Resolution authority: Market creators declare binary outcomes (YES = 1, NO = 2) once real-world criteria are verified.
          </span>
        </div>
      </div>

      {/* Markets List for Resolution */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeMarketsToResolve.length === 0 ? (
          <div className="neu-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No prediction markets available for oracle resolution.
          </div>
        ) : (
          activeMarketsToResolve.map((market) => {
            const isActive = market.status === 0;
            const isCreator = publicKey && market.creator?.toLowerCase() === publicKey.toLowerCase();

            const yesPool = Number(market.total_yes_pool || 0);
            const noPool = Number(market.total_no_pool || 0);
            const totalPool = yesPool + noPool;
            const totalXLM = (totalPool / 10000000).toLocaleString();

            return (
              <div
                key={market.id}
                className="neu-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="neu-pill" style={{ fontSize: '0.72rem' }}>#{market.id}</span>
                      {isActive ? (
                        <span className="neu-pill pill-amber">● Active / Awaiting Resolution</span>
                      ) : (
                        <span className={`neu-pill ${market.outcome === 1 ? 'pill-green' : 'pill-rose'}`}>
                          ✓ Settled: {market.outcome === 1 ? 'YES Won' : 'NO Won'}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {market.question}
                    </h3>
                  </div>

                  <div className="neu-pill pill-indigo">
                    Pool: {totalXLM} XLM
                  </div>
                </div>

                {isActive ? (
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
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      Declare Verified Outcome:
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        className="btn-neu btn-neu-faucet"
                        style={{ padding: '0.6rem 1.25rem' }}
                        onClick={() => handleResolve(market.id, 1)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && resolvingId === market.id ? (
                          <Loader2 size={15} className="spin" />
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            <span>Declare YES Won</span>
                          </>
                        )}
                      </button>

                      <button
                        className="btn-neu btn-neu-disconnect"
                        style={{ padding: '0.6rem 1.25rem' }}
                        onClick={() => handleResolve(market.id, 2)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && resolvingId === market.id ? (
                          <Loader2 size={15} className="spin" />
                        ) : (
                          <>
                            <AlertCircle size={15} />
                            <span>Declare NO Won</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="neu-card-inset" style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: '700' }}>
                    ✓ Outcome verified and recorded on Soroban ledger. Payout claims unlocked for winning predictions.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
