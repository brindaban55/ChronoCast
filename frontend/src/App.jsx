import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import WalletSection from './components/WalletSection';
import PredictionMarketSection from './components/PredictionMarketSection';
import CreateMarketSection from './components/CreateMarketSection';
import TransferSection from './components/TransferSection';
import OracleDeskSection from './components/OracleDeskSection';
import LiveEventsSection from './components/LiveEventsSection';
import PredictionLeaderboard from './components/PredictionLeaderboard';
import TxHistorySection from './components/TxHistorySection';
import OnboardingGuide from './components/OnboardingGuide';
import TxStatusTracker, { updateTxStatus } from './components/TxStatusTracker';
import TxModal from './components/TxModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { useWallet } from './context/WalletContext';
import {
  rpcServer,
  server,
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
} from './services/stellar';
import * as StellarSdk from '@stellar/stellar-sdk';

function MainApp() {
  const { publicKey, secretKey, walletType, refreshBalance } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState([]);
  const [stats, setStats] = useState({
    total_markets: 1,
    total_volume: 0,
    total_tips: 0,
    total_resolved: 0,
  });
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-show onboarding for first-time visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem('stellar_predict_visited');
    if (!hasVisited) {
      setTimeout(() => setShowOnboarding(true), 800);
      localStorage.setItem('stellar_predict_visited', '1');
    }
  }, []);

  // Fetch Markets & Stats from Soroban Contract
  const loadContractData = async () => {
    setIsLoadingMarkets(true);
    try {
      const loadedMarkets = [];

      try {
        const dummyKeypair = StellarSdk.Keypair.random();
        const account = new StellarSdk.Account(dummyKeypair.publicKey(), '1');

        const countOp = StellarSdk.Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: 'get_market_count',
          args: [],
        });

        const tx = new StellarSdk.TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(countOp)
          .setTimeout(30)
          .build();

        const sim = await rpcServer.simulateTransaction(tx);
        let totalCount = 1;
        if (sim && sim.result && sim.result.retval) {
          totalCount = Number(StellarSdk.scValToNative(sim.result.retval)) || 1;
        }

        for (let i = 1; i <= totalCount; i++) {
          try {
            const getOp = StellarSdk.Operation.invokeContractFunction({
              contract: CONTRACT_ID,
              function: 'get_market',
              args: [StellarSdk.nativeToScVal(BigInt(i), { type: 'u64' })],
            });

            const getTx = new StellarSdk.TransactionBuilder(account, {
              fee: '100',
              networkPassphrase: NETWORK_PASSPHRASE,
            })
              .addOperation(getOp)
              .setTimeout(30)
              .build();

            const getSim = await rpcServer.simulateTransaction(getTx);
            if (getSim && getSim.result && getSim.result.retval) {
              const rawMarket = StellarSdk.scValToNative(getSim.result.retval);
              loadedMarkets.push({
                id: Number(rawMarket.id || i),
                creator: rawMarket.creator?.toString() || 'GCVLSDL3PMXCRCQU5XUMQV7U5ZPFR3UDHXLW3UNKAHM6ANRIX2BAIJOP',
                question: rawMarket.question || `Prediction Market #${i}`,
                category: rawMarket.category?.toString() || 'crypto',
                status: Number(rawMarket.status || 0),
                outcome: Number(rawMarket.outcome || 0),
                total_yes_pool: Number(rawMarket.total_yes_pool || 0),
                total_no_pool: Number(rawMarket.total_no_pool || 0),
                total_stakers: Number(rawMarket.total_stakers || 0),
                tips: Number(rawMarket.tips || 0),
                created_at: Number(rawMarket.created_at || Date.now() / 1000),
              });
            }
          } catch (err) {
            console.warn(`Error fetching market #${i}:`, err);
          }
        }
      } catch (err) {
        console.warn('Simulation for market count error:', err);
      }

      if (loadedMarkets.length > 0) {
        setMarkets(loadedMarkets);
        const totalVol = loadedMarkets.reduce(
          (acc, m) => acc + m.total_yes_pool + m.total_no_pool,
          0
        );
        const totalTips = loadedMarkets.reduce((acc, m) => acc + m.tips, 0);
        const totalRes = loadedMarkets.filter((m) => m.status === 1).length;

        setStats({
          total_markets: loadedMarkets.length,
          total_volume: totalVol,
          total_tips: totalTips,
          total_resolved: totalRes,
        });
      }
    } catch (error) {
      console.error('Failed to load contract markets:', error);
    } finally {
      setIsLoadingMarkets(false);
    }
  };

  useEffect(() => {
    loadContractData();
    const interval = setInterval(loadContractData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Helper to submit Soroban transaction with live status tracker
  const submitSorobanInvocation = async (invokeOp) => {
    if (!publicKey) throw new Error('Please connect your wallet first.');

    updateTxStatus('building');
    const account = await server.loadAccount(publicKey);
    let tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(invokeOp)
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    updateTxStatus('simulating');
    const sim = await rpcServer.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(sim)) {
      updateTxStatus('error', { error: `Simulation failed: ${sim.error}` });
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    tx = StellarSdk.rpc.assembleTransaction(tx, sim).build();

    updateTxStatus('signing');
    if (walletType === 'freighter') {
      const freighter = await import('@stellar/freighter-api');
      const signedXdr = await freighter.signTransaction(tx.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if (!signedXdr || signedXdr.error) {
        updateTxStatus('error', { error: 'Signing rejected in Freighter' });
        throw new Error(signedXdr?.error || 'User cancelled signing with Freighter');
      }
      tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    } else {
      const kp = StellarSdk.Keypair.fromSecret(secretKey);
      tx.sign(kp);
    }

    updateTxStatus('submitting');
    const sendRes = await rpcServer.sendTransaction(tx);
    if (sendRes.status === 'ERROR') {
      updateTxStatus('error', { error: `Send error: ${JSON.stringify(sendRes)}` });
      throw new Error(`Transaction error: ${JSON.stringify(sendRes)}`);
    }

    updateTxStatus('confirming', { hash: sendRes.hash });
    let txStatus = await rpcServer.getTransaction(sendRes.hash);
    while (txStatus.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise((r) => setTimeout(r, 1500));
      txStatus = await rpcServer.getTransaction(sendRes.hash);
    }

    if (txStatus.status !== StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
      updateTxStatus('error', { error: `Transaction failed: ${txStatus.status}`, hash: sendRes.hash });
      throw new Error(`Transaction failed: ${txStatus.status}`);
    }

    updateTxStatus('success', { hash: sendRes.hash, ledger: txStatus.ledger });
    await refreshBalance();
    await loadContractData();
    return sendRes.hash;
  };

  // Create Market On-Chain
  const handleCreateMarket = async ({ question, category, endTime }) => {
    const callerAddress = new StellarSdk.Address(publicKey);
    const invokeOp = StellarSdk.Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: 'create_market',
      args: [
        callerAddress.toScVal(),
        StellarSdk.nativeToScVal(question, { type: 'string' }),
        StellarSdk.nativeToScVal(category, { type: 'symbol' }),
        StellarSdk.nativeToScVal(BigInt(endTime), { type: 'u64' }),
      ],
    });

    return await submitSorobanInvocation(invokeOp);
  };

  // Stake Prediction On-Chain
  const handleStakePrediction = async (marketId, isYes, amount) => {
    const callerAddress = new StellarSdk.Address(publicKey);
    const stroops = BigInt(Math.floor(amount * 10000000));
    const invokeOp = StellarSdk.Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: 'stake_prediction',
      args: [
        callerAddress.toScVal(),
        StellarSdk.nativeToScVal(BigInt(marketId), { type: 'u64' }),
        StellarSdk.nativeToScVal(isYes, { type: 'bool' }),
        StellarSdk.nativeToScVal(stroops, { type: 'i128' }),
      ],
    });

    return await submitSorobanInvocation(invokeOp);
  };

  // Resolve Market (Oracle) On-Chain
  const handleResolveMarket = async (marketId, outcomeNum) => {
    const callerAddress = new StellarSdk.Address(publicKey);
    const invokeOp = StellarSdk.Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: 'resolve_market',
      args: [
        callerAddress.toScVal(),
        StellarSdk.nativeToScVal(BigInt(marketId), { type: 'u64' }),
        StellarSdk.nativeToScVal(outcomeNum, { type: 'u32' }),
      ],
    });

    return await submitSorobanInvocation(invokeOp);
  };

  // Tip Market Creator On-Chain
  const handleTipMarket = async (marketId, amount) => {
    const callerAddress = new StellarSdk.Address(publicKey);
    const stroops = BigInt(Math.floor(amount * 10000000));
    const invokeOp = StellarSdk.Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: 'tip_market',
      args: [
        callerAddress.toScVal(),
        StellarSdk.nativeToScVal(BigInt(marketId), { type: 'u64' }),
        StellarSdk.nativeToScVal(stroops, { type: 'i128' }),
      ],
    });

    return await submitSorobanInvocation(invokeOp);
  };

  return (
    <div className="app-layout">
      {/* Onboarding Guide */}
      {showOnboarding && <OnboardingGuide onClose={() => setShowOnboarding(false)} />}

      {/* Real-time Tx Status Overlay */}
      <TxStatusTracker />

      {/* Left Neumorphic Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Bar Header */}
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenGuide={() => setShowOnboarding(true)}
        />

        {/* Tab Content Views */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {activeTab === 'dashboard' && (
            <>
              <WalletSection setActiveTab={setActiveTab} stats={stats} />
              <PredictionMarketSection
                markets={markets}
                isLoading={isLoadingMarkets}
                searchQuery={searchQuery}
                setActiveTab={setActiveTab}
                onStakePrediction={handleStakePrediction}
                onTipMarket={handleTipMarket}
              />
            </>
          )}

          {activeTab === 'create' && (
            <CreateMarketSection
              onCreateMarket={handleCreateMarket}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'transfer' && (
            <TransferSection onTxSuccess={() => refreshBalance()} />
          )}

          {activeTab === 'oracle' && (
            <OracleDeskSection
              markets={markets}
              onResolveMarket={handleResolveMarket}
            />
          )}

          {activeTab === 'events' && <LiveEventsSection />}

          {activeTab === 'history' && <TxHistorySection />}

          {activeTab === 'leaderboard' && <PredictionLeaderboard />}
        </main>
      </div>

      {/* Neumorphic Wallet Connect Modal */}
      <TxModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
