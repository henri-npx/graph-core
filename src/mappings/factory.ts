import { log, DataSourceTemplate, DataSourceContext } from '@graphprotocol/graph-ts';
import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'

import {
  CreateVault as VaultCreated
} from '../types/Factory/Factory'

import {
  Vault,
  Share,
  Factory,
  Deposit,
  Rebalance,
  Redeem
} from '../types/schema'

import {
  Deposit as DepositEvent,
  Rebalance as RebalanceEvent,
  Redeem as RedeemEvent,
  // HarvestManagementFees as HarvestManagementFeesEvent,
  // HarvestPerformanceFees as HarvestManaPerformanceFeesEvent
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
  vault.creator = event.params.creator;
  vault.vault = event.params.vault;
  vault.factory = factory.id

  vault.accManagementFeesToDAO = ZERO_BI
  vault.accPerformanceFeesToDAO = ZERO_BI

  vault.accManagementFeesToStrategists = ZERO_BI
  vault.accPerformanceFeesToStrategists = ZERO_BI
  vault.accManagementFees = ZERO_BI
  vault.accPerformanceFees = ZERO_BI

  vault.depositsCount = 0
  vault.rebalancesCount = 0
  vault.redemptionsCount = 0

  // let context = new DataSourceTemplate();
  // let context2 = new DataSourceContext();

  vault.save();
  VaultTemplate.create(event.params.vault)
  factory.save()
  // To Add: Tokens via the AddTokensAndPriceFeeds event (next version)
  // To Add: Share Entity sync via event.params.share
}