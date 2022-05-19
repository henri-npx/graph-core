import { log, DataSourceTemplate, DataSourceContext } from '@graphprotocol/graph-ts';
import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'

import {
  VaultCreated
} from '../types/Factory/Factory'

import {
  Vault,
  Factory
} from '../types/schema'

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
  for (let x = 0; x < size; x++) {
    vault.tokens.push(event.params.tokens[x]);
  }
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