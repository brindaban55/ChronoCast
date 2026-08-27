import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { sendNativePayment } from '../services/stellar';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TransferSection({ onTxSuccess }) {
  const {
    publicKey,
    secretKey,
    walletType,
    balance,
    refreshBalance,
    setModalOpen,
  } = useWallet();

  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successTx, setSuccessTx] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessTx(null);

    if (!publicKey) {
      setModalOpen(true);
      return;
    }

    if (!destination.trim().startsWith('G') || destination.trim().length !== 56) {
      setErrorMsg('Invalid Stellar public key. Must start with "G" and be 56 characters.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid positive transfer amount.');
      return;
    }

    if (numAmount > parseFloat(balance)) {
      setErrorMsg(`Insufficient funds. Your available balance is ${balance} XLM.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendNativePayment({
        senderSecret: secretKey,
        senderPublicKey: publicKey,
        destination: destination.trim(),
        amount: numAmount,
        memoText: memo,
        signWithFreighter: walletType === 'freighter',
      });

      setSuccessTx(result.hash);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setDestination('');
      setAmount('');
      setMemo('');
      await refreshBalance();
      if (onTxSuccess) onTxSuccess(result.hash);
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMsg(err.message || 'Payment failed. Please check destination address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--neu-bg)', boxShadow: 'var(--shadow-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sky)' }}>
            <Send size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800' }}>
              Fast Native XLM Transfer
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Instant on-chain payments on Stellar Testnet
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="neu-card-inset" style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successTx && (
          <div className="neu-card-inset" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontWeight: '700' }}>
              <CheckCircle2 size={18} />
              <span>Payment Successfully Settled on Testnet!</span>
            </div>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${successTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neu"
              style={{ alignSelf: 'flex-start', fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            >
              <ExternalLink size={13} />
              <span>View On Stellar.Expert</span>
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Recipient Stellar Address (G-Key)
            </label>
            <input
              type="text"
              className="neu-input"
              placeholder="e.g. GAW727V4MUPNUGW4RILTR3B5TX7T3LGYLFXMZXA53A26JOD4WCVJ3L7C"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Transfer Amount (XLM)
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Balance: {balance} XLM
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0.0000001"
              className="neu-input"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              On-Chain Memo (Optional)
            </label>
            <input
              type="text"
              maxLength={28}
              className="neu-input"
              placeholder="e.g. Prediction pool stake"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="neu-card-inset" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Network Base Fee</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-primary)' }}>
              0.00001 XLM (100 stroops)
            </span>
          </div>

          <button
            type="submit"
            className="btn-neu btn-neu-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Signing & Submitting Transaction...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Confirm & Send XLM Payment</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
