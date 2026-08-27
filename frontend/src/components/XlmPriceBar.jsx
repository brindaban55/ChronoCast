import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';

export default function XlmPriceBar() {
  const [price, setPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd&include_24hr_change=true'
        );
        if (res.ok) {
          const data = await res.json();
          setPrice(data?.stellar?.usd);
          setChange24h(data?.stellar?.usd_24h_change);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !price) return null;

  const isPositive = change24h > 0;
  const isNeutral = Math.abs(change24h || 0) < 0.01;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? '#94a3b8' : isPositive ? '#10b981' : '#f43f5e';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.4rem 0.85rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '700',
      }}
    >
      <BarChart2 size={13} color="#00e5ff" />
      <span style={{ color: '#e2e8f0' }}>XLM</span>
      <span style={{ color: '#00e5ff', fontFamily: 'monospace' }}>${price?.toFixed(4)}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: trendColor }}>
        <TrendIcon size={12} />
        {Math.abs(change24h || 0).toFixed(2)}%
      </span>
    </div>
  );
}
