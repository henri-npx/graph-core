import {
  Vault,
  Deposit,
  Rebalance,
  Redeem,
  HarvestPerformanceFees,
  HarvestManagementFees
} from '../types/schema'

import {
  Deposit as DepositEvent,
  Rebalance as RebalanceEvent,
  Redeem as RedeemEvent,
  HarvestManagementFees as HarvestManagementFeesEvent,
  HarvestPerformanceFees as HarvestPerformanceFeesEvent
} from '../types/Factory/Vault'

import { ONE_BI } from './helpers';

export function handleDeposit(event: DepositEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const deposit = new Deposit(event.transaction.hash.toHexString()) as Deposit
  deposit.from = event.transaction.from;
  deposit.toMint = event.params.sharesAmount;
  deposit.timestamp = event.params.timestamp;
  deposit.netAmountOut = event.params.baseTokenAmount; // Incoherent
  deposit.vault = vault.id;
  deposit.save()
  vault.depositsCount = vault.depositsCount + 1
  vault.save()
}

export function handleRebalance(event: RebalanceEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const newRebalance = new Rebalance(event.transaction.hash.toHexString()) as Rebalance
  newRebalance.vault = vault.id;
  newRebalance.from = event.params.trader;
  newRebalance.signals = event.params.signals;
  newRebalance.timestamp = event.params.timestamp;
  newRebalance.save()
  vault.rebalancesCount = vault.rebalancesCount + 1
  vault.save()
}

// How to compute exit fees ?

export function handleRedeem(event: RedeemEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const newRedeem = new Redeem(event.transaction.hash.toHexString()) as Redeem
  newRedeem.vault = vault.id;
  newRedeem.from = event.params.user;
  newRedeem.amountIn = event.params.shareAmount;
  newRedeem.timestamp = event.params.timestamp;
  newRedeem.save()
  vault.redemptionsCount = vault.redemptionsCount + 1
  vault.save()
}

export function handleHarvestManagementFees(event: HarvestManagementFeesEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const newManagementFeesHarvest = new HarvestManagementFees(event.transaction.hash.toHexString())

  const feesToDAO = event.params.toDAO
  const feesToStrategist = event.params.toTrader

  newManagementFeesHarvest.fromHarvester = event.params.harvester;
  newManagementFeesHarvest.feesToDAO = feesToDAO;
  newManagementFeesHarvest.feesToStrategist = feesToStrategist;
  newManagementFeesHarvest.timestamp = event.block.timestamp;
  newManagementFeesHarvest.vault = vault.id;

  vault.accManagementFeesToDAO = vault.accManagementFeesToDAO.plus(feesToDAO)
  vault.accManagementFeesToStrategists = vault.accManagementFeesToStrategists.plus(feesToStrategist)
  const totalFeesHarvested = feesToStrategist.plus(feesToDAO)
  vault.accManagementFees = vault.accManagementFees.plus(totalFeesHarvested)

  newManagementFeesHarvest.save()
  vault.save()
}

export function handleHarvestPerformanceFees(event: HarvestPerformanceFeesEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;

  const feesToDAO = event.params.toDAO
  const feesToStrategist = event.params.toTrader

  const newPerformanceFeesHarvest = new HarvestPerformanceFees(event.transaction.hash.toHexString())
  newPerformanceFeesHarvest.fromHarvester = event.params.harvester;
  newPerformanceFeesHarvest.feesToDAO = feesToDAO;
  newPerformanceFeesHarvest.feesToStrategist = feesToStrategist;
  newPerformanceFeesHarvest.timestamp = event.block.timestamp;
  newPerformanceFeesHarvest.vault = vault.id;

  vault.accPerformanceFeesToDAO = vault.accPerformanceFeesToDAO.plus(feesToDAO)
  vault.accPerformanceFeesToStrategists = vault.accPerformanceFeesToStrategists.plus(feesToStrategist)
  const totalFeesHarvested = feesToStrategist.plus(feesToDAO)
  vault.accPerformanceFees = vault.accPerformanceFees.plus(totalFeesHarvested)

  newPerformanceFeesHarvest.save()
  vault.save()
}
