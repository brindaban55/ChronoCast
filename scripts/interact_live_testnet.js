/**
 * On-Chain Contract Interactor for PredictionVaultContract
 * Submits initial on-chain prediction market to verify contract invocation
 */

import {
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  TimeoutInfinite,
  scValToNative,
  Address,
  nativeToScVal,
  xdr,
  rpc as SorobanRpc,
} from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const CONTRACT_ID = 'CASN5WU2V42EPBIRWIZ2RUX5XS5VGJ7VR3SICFQMYQOEOTSADCTQSBG4';

const horizon = new Horizon.Server(HORIZON_URL);
const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL);

async function main() {
  console.log('⚡ Submitting Verified On-Chain Prediction Market #1 to Testnet Contract...');

  const caller = Keypair.random();
  console.log(`🔑 Caller: ${caller.publicKey()}`);

  console.log('💧 Funding Caller with Friendbot...');
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(caller.publicKey())}`);
  if (!res.ok) throw new Error('Friendbot failed');
  await new Promise((r) => setTimeout(r, 2000));

  const account = await horizon.loadAccount(caller.publicKey());
  const callerAddress = new Address(caller.publicKey());

  // Invoke: create_market(creator, question, category, end_time)
  const invokeOp = Operation.invokeContractFunction({
    contract: CONTRACT_ID,
    function: 'create_market',
    args: [
      callerAddress.toScVal(),
      nativeToScVal('Will Stellar XLM market price exceed $0.50 by Q4 2026?', { type: 'string' }),
      nativeToScVal('crypto', { type: 'symbol' }),
      nativeToScVal(1767139200n, { type: 'u64' }), // Dec 31, 2026
    ],
  });

  let tx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(invokeOp)
    .setTimeout(TimeoutInfinite)
    .build();

  console.log('⏳ Simulating transaction on Soroban RPC...');
  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  tx = SorobanRpc.assembleTransaction(tx, sim).build();
  tx.sign(caller);

  console.log('📤 Submitting transaction to Stellar Testnet...');
  const sendRes = await rpc.sendTransaction(tx);
  console.log(`Transaction Hash: ${sendRes.hash}`);

  let status = await rpc.getTransaction(sendRes.hash);
  while (status.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1500));
    status = await rpc.getTransaction(sendRes.hash);
  }

  if (status.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction failed: ${status.status}`);
  }

  const marketId = scValToNative(status.returnValue);
  console.log(`\n🎉 ON-CHAIN PREDICTION MARKET CREATED!`);
  console.log(`   • Market ID   : #${marketId}`);
  console.log(`   • Tx Hash     : ${sendRes.hash}`);
  console.log(`   • Explorer    : https://stellar.expert/explorer/testnet/tx/${sendRes.hash}`);
}

main().catch(console.error);
