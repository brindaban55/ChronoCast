import React, { createContext, useContext, useState, useEffect } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { getAccountBalances, fundWithFriendbot } from '../services/stellar';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [walletType, setWalletType] = useState(null); // 'freighter' | 'demo'
  const [balance, setBalance] = useState('0.00');
  const [accountExists, setAccountExists] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  // Auto-refresh balances
  const refreshBalance = async (key = publicKey) => {
    if (!key) return;
    try {
      const data = await getAccountBalances(key);
      setBalance(data.xlm);
      setAccountExists(data.exists);
    } catch (err) {
      console.warn('Balance refresh error:', err);
    }
  };

  useEffect(() => {
    if (publicKey) {
      refreshBalance(publicKey);
      const timer = setInterval(() => refreshBalance(publicKey), 8000);
      return () => clearInterval(timer);
    }
  }, [publicKey]);

  // Connect Freighter
  const connectFreighter = async () => {
    setIsConnecting(true);
    setErrorNotice(null);
    try {
      const freighter = await import('@stellar/freighter-api');
      const isAvailable = await freighter.isAllowed();
      let pubKey = '';

      if (isAvailable) {
        const addrRes = await freighter.getAddress();
        if (addrRes && addrRes.address) pubKey = addrRes.address;
        else if (typeof addrRes === 'string' && addrRes.startsWith('G')) pubKey = addrRes;
      }

      if (!pubKey && typeof window !== 'undefined' && window.freighter) {
        if (typeof window.freighter.requestAccess === 'function') {
          const res = await window.freighter.requestAccess();
          if (res && res.address) pubKey = res.address;
          else if (typeof res === 'string') pubKey = res;
        } else if (typeof window.freighter.getPublicKey === 'function') {
          pubKey = await window.freighter.getPublicKey();
        }
      }

      if (!pubKey) {
        throw new Error('Could not retrieve account from Freighter. Please ensure Freighter is unlocked on Testnet.');
      }

      setPublicKey(pubKey);
      setWalletType('freighter');
      setModalOpen(false);
      await refreshBalance(pubKey);
    } catch (err) {
      console.error('Freighter connect error:', err);
      setErrorNotice(err.message || 'Failed to connect Freighter');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect Instant Demo Testnet Keypair
  const connectDemoWallet = async () => {
    setIsConnecting(true);
    setErrorNotice(null);
    try {
      const savedSecret = localStorage.getItem('stellar_predict_demo_secret');
      let keypair;
      if (savedSecret) {
        keypair = StellarSdk.Keypair.fromSecret(savedSecret);
      } else {
        keypair = StellarSdk.Keypair.random();
        localStorage.setItem('stellar_predict_demo_secret', keypair.secret());
      }

      const pubKey = keypair.publicKey();
      setPublicKey(pubKey);
      setSecretKey(keypair.secret());
      setWalletType('demo');
      setModalOpen(false);

      // Check if funded, else auto-fund
      const accData = await getAccountBalances(pubKey);
      if (!accData.exists) {
        setIsFunding(true);
        await fundWithFriendbot(pubKey);
        await refreshBalance(pubKey);
        setIsFunding(false);
      } else {
        setBalance(accData.xlm);
        setAccountExists(true);
      }
    } catch (err) {
      setErrorNotice(`Demo wallet initialization error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Wallet cleanly
  const disconnectWallet = () => {
    setPublicKey('');
    setSecretKey('');
    setBalance('0.00');
    setWalletType(null);
    setAccountExists(false);
    setErrorNotice(null);
  };

  // 1-Click Friendbot Faucet funding
  const requestFaucet = async () => {
    if (!publicKey) return;
    setIsFunding(true);
    setErrorNotice(null);
    try {
      await fundWithFriendbot(publicKey);
      await refreshBalance(publicKey);
    } catch (err) {
      setErrorNotice(`Faucet funding error: ${err.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        secretKey,
        walletType,
        balance,
        accountExists,
        isConnecting,
        isFunding,
        modalOpen,
        setModalOpen,
        errorNotice,
        setErrorNotice,
        connectFreighter,
        connectDemoWallet,
        disconnectWallet,
        requestFaucet,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
