import * as StellarSdk from '@stellar/stellar-sdk';

// Stellar Testnet Configurations
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Contract ID (will be updated on deployment)
export const CONTRACT_ID = 'CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4'; // Placeholder until deployed

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);
export const rpcServer = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

/**
 * Fetch native XLM balance and account existence
 */
export async function getAccountBalances(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBal = account.balances.find((b) => b.asset_type === 'native');
    return {
      exists: true,
      xlm: nativeBal ? parseFloat(nativeBal.balance).toFixed(2) : '0.00',
      sequence: account.sequence,
      rawBalances: account.balances,
      subentry_count: account.subentry_count,
    };
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { exists: false, xlm: '0.00', sequence: null, rawBalances: [] };
    }
    throw err;
  }
}

/**
 * Fund account via Friendbot Faucet (+10,000 Testnet XLM)
 */
export async function fundWithFriendbot(publicKey) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    throw new Error('Friendbot funding request failed. Please try again.');
  }
  return await res.json();
}

/**
 * Send Native XLM Transfer on Stellar Testnet
 */
export async function sendNativePayment({
  senderSecret,
  senderPublicKey,
  destination,
  amount,
  memoText = '',
  signWithFreighter = false,
}) {
  const sourceAccount = await server.loadAccount(senderPublicKey);
  const baseFee = await server.fetchBaseFee();

  let txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: baseFee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount: amount.toString(),
    })
  );

  if (memoText.trim()) {
    txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memoText.trim()));
  }

  txBuilder = txBuilder.setTimeout(60);
  const transaction = txBuilder.build();

  if (signWithFreighter) {
    const freighter = await import('@stellar/freighter-api');
    const signedXdr = await freighter.signTransaction(
      transaction.toXDR(),
      { networkPassphrase: NETWORK_PASSPHRASE }
    );
    if (!signedXdr || signedXdr.error) {
      throw new Error(signedXdr?.error || 'User cancelled signing with Freighter');
    }
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    return await server.submitTransaction(signedTx);
  } else {
    const keypair = StellarSdk.Keypair.fromSecret(senderSecret);
    transaction.sign(keypair);
    return await server.submitTransaction(transaction);
  }
}

/**
 * Fetch real-time Soroban events for Prediction Vault contract
 */
export async function getContractEvents(contractId = CONTRACT_ID, limit = 25) {
  try {
    const latestLedger = await rpcServer.getLatestLedger();
    const startLedger = Math.max(1, latestLedger.sequence - 10000);

    const response = await rpcServer.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit,
    });

    return response.events || [];
  } catch (err) {
    console.warn('Soroban prediction event polling error:', err);
    return [];
  }
}
