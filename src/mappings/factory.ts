import { ByteArray, log, DataSourceTemplate, DataSourceContext, ethereum, Bytes } from '@graphprotocol/graph-ts';
import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'

import {
  VaultCreated,
  Factory as FactoryContract,

} from '../types/Factory/Factory'

import {
  Vault,
  Factory
} from '../types/schema'

import {
  Vault as VaultContract,
} from '../types/Factory/Vault'


import { Vault as VaultTemplate } from '../types/templates'

import {
  FACTORY_ADDRESS, ZERO_BI,
} from './helpers'

export function handleCreateVault(event: VaultCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS)
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS)
    factory.vaultCount = 0
  }
  factory.vaultCount = factory.vaultCount + 1
  factory.save()

  let vault = new Vault(event.params.vault.toHexString()) as Vault
  vault.factory = factory.id
  vault.vault = event.params.vault;
  vault.creator = event.transaction.from;
  vault.share = event.params.share;

  const size = event.params.tokens.length;
  const tmp = new Array<Bytes>(size); // https://medium.com/protofire-blog/subgraph-development-part-2-handling-arrays-and-identifying-entities-30d63d4b1dc6
  for (let x = 0; x < size; x++) tmp[x] = event.params.tokens[x];
  vault.tokens = tmp;

  vault.accManagementFeesToDAO = ZERO_BI
  vault.accPerformanceFeesToDAO = ZERO_BI
  vault.accManagementFeesToStrategists = ZERO_BI
  vault.accPerformanceFeesToStrategists = ZERO_BI

  vault.depositsCount = 0
  vault.rebalancesCount = 0
  vault.redemptionsCount = 0

  vault.save();
  VaultTemplate.create(event.params.vault)
  factory.save()
}

import { VaultSnapshot } from '../types/schema';

export function handleNewBlock(block: ethereum.Block): void {

  const blockNumber = block.number;
  if (blockNumber.toI32() % 100 != 0) return; // We snapshot only every 100 blocks (on the BSC due to 3 seconds per blocks)

  const factory = Factory.load(FACTORY_ADDRESS)
  if (factory === null) return;

  const factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS));
  const vaults = factoryContract.getAllVaults();

  for (let x = 0; x < vaults.length; x++) {
    const vault = VaultContract.bind(vaults[x]);
    const entityName = FACTORY_ADDRESS + "-" + vaults[x].toHexString() + "-" + block.number.toString();
    const status = vault.getVaultStatus();

    const snapshot = new VaultSnapshot(entityName);
    snapshot.factory = factory.id;
    snapshot.vault = vaults[x].toHexString();

    snapshot.positions = status.value0;
    snapshot.tvl = status.value1;
    snapshot.sharePrice = status.value2;

    snapshot.pendingPerfFees = vault.getManagementFees().value0;
    snapshot.pendingMngFees = vault.getPerformanceFees().value0;
    snapshot.timestamp = block.timestamp;
    snapshot.save();
  }

}

/// Pro Tips

/// As a side note, the toHex() and toHexString() methods — commonly used to generate IDs out of addresses or hashes —
/// return a lowercase string. This means, when you query a subgraph for entities,
/// the ID string provided should be lowercase as the query is case-sensitive.