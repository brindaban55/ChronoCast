/**
 * Automated Live Testnet Deployer for PredictionVaultContract
 * Network: Stellar Testnet (Protocol 22 / Soroban v22)
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
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

const horizon = new Horizon.Server(HORIZON_URL);
const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL);

async function fundAccount(publicKey) {
  console.log(`    Requesting 10,000 Testnet XLM from Friendbot for: ${publicKey}...`);
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    throw new Error(`Friendbot failed with status ${res.status}`);
  }
  await new Promise((r) => setTimeout(r, 2000));
}

async function main() {
  console.log('================================================================');
  console.log('⚡ STELLARPREDICT — TESTNET SOROBAN CONTRACT DEPLOYER');
  console.log('   Target: Stellar Testnet (Protocol 22 / Soroban v22)');
  console.log('================================================================\n');

  // 1. Generate Dedicated Deployer Keypair
  console.log('1️⃣  Generating Deployer Keypair...');
  const deployer = Keypair.random();
  console.log(`    Public Key : ${deployer.publicKey()}`);
  console.log(`    Secret Key : ${deployer.secret()}\n`);

  // 2. Fund Deployer via Friendbot
  console.log('2️⃣  Funding Deployer with Testnet Friendbot...');
  await fundAccount(deployer.publicKey());
  console.log('    ✅ Funded successfully with +10,000 Testnet XLM!\n');

  // 3. Load Compiled WASM
  console.log('3️⃣  Loading Compiled Soroban WASM Bytecode...');
  const wasmPath = path.resolve(
    __dirname,
    '../contracts/prediction_vault/target/wasm32-unknown-unknown/release/prediction_vault.wasm'
  );

  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found at: ${wasmPath}. Run cargo build first.`);
  }

  const wasmBytes = fs.readFileSync(wasmPath);
  console.log(`    WASM Path : ${wasmPath}`);
  console.log(`    Byte Size : ${wasmBytes.length.toLocaleString()} bytes\n`);

  // 4. Upload WASM Bytecode
  console.log('4️⃣  Uploading Contract WASM to Stellar Testnet (uploadContractWasm)...');
  let account = await horizon.loadAccount(deployer.publicKey());

  let uploadTx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBytes }))
    .setTimeout(TimeoutInfinite)
    .build();

  console.log('    Simulating WASM upload transaction via Soroban RPC...');
  const uploadSim = await rpc.simulateTransaction(uploadTx);
  if (SorobanRpc.Api.isSimulationError(uploadSim)) {
    throw new Error(`Upload simulation failed: ${uploadSim.error}`);
  }

  uploadTx = SorobanRpc.assembleTransaction(uploadTx, uploadSim).build();
  uploadTx.sign(deployer);

  console.log('    Submitting signed WASM upload to Stellar Testnet...');
  const uploadSend = await rpc.sendTransaction(uploadTx);
  if (uploadSend.status === 'ERROR') {
    throw new Error(`WASM upload submission error: ${JSON.stringify(uploadSend)}`);
  }
  console.log(`    Transaction Hash: ${uploadSend.hash}`);

  // Wait for WASM upload confirmation
  let uploadStatus = await rpc.getTransaction(uploadSend.hash);
  while (uploadStatus.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1500));
    uploadStatus = await rpc.getTransaction(uploadSend.hash);
  }

  if (uploadStatus.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`WASM upload transaction failed: ${uploadStatus.status}`);
  }

  const wasmHash = scValToNative(uploadStatus.returnValue);
  const wasmHashHex = Buffer.from(wasmHash).toString('hex');
  console.log(`    ✅ WASM Installed On-Chain! WASM Hash: ${wasmHashHex}\n`);

  // 5. Instantiate Contract on Testnet (createCustomContract)
  console.log('5️⃣  Instantiating Contract on Stellar Testnet (createCustomContract)...');
  account = await horizon.loadAccount(deployer.publicKey());

  let createTx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createCustomContract({
        address: new Address(deployer.publicKey()),
        wasmHash: Buffer.from(wasmHashHex, 'hex'),
      })
    )
    .setTimeout(TimeoutInfinite)
    .build();

  console.log('    Simulating contract deployment via Soroban RPC...');
  const createSim = await rpc.simulateTransaction(createTx);
  if (SorobanRpc.Api.isSimulationError(createSim)) {
    throw new Error(`Contract instantiation simulation failed: ${createSim.error}`);
  }

  createTx = SorobanRpc.assembleTransaction(createTx, createSim).build();
  createTx.sign(deployer);

  console.log('    Submitting contract instantiation transaction...');
  const createSend = await rpc.sendTransaction(createTx);
  if (createSend.status === 'ERROR') {
    throw new Error(`Contract creation error: ${JSON.stringify(createSend)}`);
  }
  console.log(`    Transaction Hash: ${createSend.hash}`);

  let createStatus = await rpc.getTransaction(createSend.hash);
  while (createStatus.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1500));
    createStatus = await rpc.getTransaction(createSend.hash);
  }

  if (createStatus.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Contract instantiation failed: ${createStatus.status}`);
  }

  const contractAddressObj = Address.fromScAddress(createStatus.returnValue.address());
  const contractId = contractAddressObj.toString();
  console.log(`    ✅ CONTRACT INSTANTIATED ON TESTNET!\n`);
  console.log(`    🎯 Deployed Contract ID : ${contractId}\n`);

  // 6. Update Frontend service with live Contract ID
  const stellarServicePath = path.resolve(__dirname, '../frontend/src/services/stellar.js');
  if (fs.existsSync(stellarServicePath)) {
    let serviceContent = fs.readFileSync(stellarServicePath, 'utf8');
    serviceContent = serviceContent.replace(
      /export const CONTRACT_ID = '.*?';/,
      `export const CONTRACT_ID = '${contractId}';`
    );
    fs.writeFileSync(stellarServicePath, serviceContent, 'utf8');
    console.log(`6️⃣  Updated frontend/src/services/stellar.js with live Contract ID!\n`);
  }

  console.log('================================================================');
  console.log('🚀 DEPLOYMENT SUMMARY:');
  console.log(`   • Network          : Stellar Testnet (Protocol 22)`);
  console.log(`   • Contract ID      : ${contractId}`);
  console.log(`   • WASM Hash        : ${wasmHashHex}`);
  console.log(`   • Deployment Tx    : ${createSend.hash}`);
  console.log(`   • Deployer Address : ${deployer.publicKey()}`);
  console.log(`   • Explorer URL     : https://stellar.expert/explorer/testnet/contract/${contractId}`);
  console.log('================================================================\n');

  return {
    contractId,
    wasmHashHex,
    deploymentTx: createSend.hash,
    deployerPublicKey: deployer.publicKey(),
    deployerSecretKey: deployer.secret(),
  };
}

main().catch((err) => {
  console.error('❌ Deployment Failed:', err);
  process.exit(1);
});
