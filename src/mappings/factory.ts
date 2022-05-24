import { ByteArray, log, DataSourceTemplate, DataSourceContext, ethereum, Bytes } from "@graphprotocol/graph-ts";
import { BigInt, BigDecimal, store, Address } from "@graphprotocol/graph-ts";

import { VaultCreated, Factory as FactoryContract } from "../types/Factory/Factory";

import { Vault, Factory } from "../types/schema";

import { Vault as VaultContract } from "../types/Factory/Vault";

import { Vault as VaultTemplate } from "../types/templates";

import { FACTORY_ADDRESS, ZERO_BI } from "./helpers";

import { VaultSnapshot } from "../types/schema";

export function handleCreateVault(event: VaultCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.vaultCount = 0;
  }
  factory.vaultCount = factory.vaultCount + 1;
  factory.save();

  let vault = new Vault(event.params.vault.toHexString()) as Vault;
  vault.factory = factory.id;
  vault.vault = event.params.vault;
  vault.creator = event.transaction.from;
  vault.share = event.params.share;

  const size = event.params.tokens.length;
  const tmp = new Array<Bytes>(size); // https://medium.com/protofire-blog/subgraph-development-part-2-handling-arrays-and-identifying-entities-30d63d4b1dc6
  for (let x = 0; x < size; x++) tmp[x] = event.params.tokens[x];
  vault.tokens = tmp;

  vault.accManagementFeesToDAO = ZERO_BI;
  vault.accPerformanceFeesToDAO = ZERO_BI;
  vault.accManagementFeesToStrategists = ZERO_BI;
  vault.accPerformanceFeesToStrategists = ZERO_BI;

  vault.depositsCount = 0;
  vault.rebalancesCount = 0;
  vault.redemptionsCount = 0;

  vault.save();
  VaultTemplate.create(event.params.vault);
  factory.save();
}

export function buildVaultSnapshot(
  factory: Factory,
  vaultAddress: Address,
  block: ethereum.Block,
  triggeredByEvent: boolean,
): void {
  const vault = VaultContract.bind(vaultAddress);
  const entityName = FACTORY_ADDRESS + "-" + vaultAddress.toHexString() + "-" + block.number.toString();
  const status = vault.getVaultStatus();

  /// assetsPrices and assetsBalances
  const tokensLength = vault.tokensLength().toI32();
  const assetsPrices = new Array<BigInt>(tokensLength);
  for (let y = 0; y < tokensLength; y++) {
    const asset = vault.tokens(BigInt.fromI32(y));
    const price = vault.getLatestPrice(asset.value1); // value 0 = address of price feed
    assetsPrices[y] = price;
  }

  const assetsBalances = vault.getVaultBalances();
  const snapshot = new VaultSnapshot(entityName);

  snapshot.factory = factory.id;
  snapshot.vault = vaultAddress.toHexString();

  snapshot.assetsBalances = assetsBalances;
  snapshot.assetsPrices = assetsPrices;

  snapshot.positions = status.value0;
  snapshot.tvl = status.value1;
  snapshot.sharePrice = status.value2;

  snapshot.pendingPerfFees = vault.getManagementFees().value0;
  snapshot.pendingMngFees = vault.getPerformanceFees().value0;
  snapshot.timestamp = block.timestamp;
  snapshot.triggeredByEvent = triggeredByEvent;
  snapshot.save();
}

export function handleNewBlock(block: ethereum.Block): void {
  const blockNumber = block.number;
  if (blockNumber.toI32() % 600 != 0) return;
  // We snapshot only every 600 blocks (on the BSC due to 3 seconds per blocks
  // 3*600 = 1800 seconds = 30 min, and note that we can do 100 max requests without pagination)
  const factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) return;
  const factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS));
  const vaults = factoryContract.getAllVaults();
  for (let x = 0; x < vaults.length; x++) {
    buildVaultSnapshot(factory, vaults[x], block, false);
  }
}

/// Pro Tips

/// As a side note, the toHex() and toHexString() methods — commonly used to generate IDs out of addresses or hashes —
/// return a lowercase string. This means, when you query a subgraph for entities,
/// the ID string provided should be lowercase as the query is case-sensitive.
