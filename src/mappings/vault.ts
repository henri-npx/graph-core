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

export function handleDeposit(event: DepositEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const deposit = new Deposit(event.transaction.hash.toHexString()) as Deposit
  deposit.vault = vault.id;
  deposit.from = event.transaction.from;
  deposit.sharesMinted = event.params.sharesMinted;
  deposit.baseTokenAmountIn = event.params.baseTokenAmountIn;
  deposit.timestamp = event.block.timestamp;
  deposit.save()
  vault.depositsCount = vault.depositsCount + 1
  vault.save()
}

export function handleRebalance(event: RebalanceEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const newRebalance = new Rebalance(event.transaction.hash.toHexString()) as Rebalance
  newRebalance.vault = vault.id;
  newRebalance.from = event.transaction.from;
  newRebalance.currentSignals = event.params.currentSignals;
  newRebalance.desiredSignals = event.params.desiredSignals;
  newRebalance.timestamp = event.block.timestamp;;
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
  newRedeem.from = event.transaction.from;
  newRedeem.shareBurned = event.params.shareBurned;
  newRedeem.amountReceived = event.params.amountReceived;
  newRedeem.timestamp = event.block.timestamp;
  newRedeem.save()
  vault.redemptionsCount = vault.redemptionsCount + 1
  vault.save()
}

export function handleHarvestManagementFees(event: HarvestManagementFeesEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const newManagementFeesHarvest = new HarvestManagementFees(event.transaction.hash.toHexString())
  const feesToDAO = event.params.amountToDAO
  const feesToStrategist = event.params.amountToStrategist
  newManagementFeesHarvest.from = event.transaction.from;
  newManagementFeesHarvest.amountToDAO = feesToDAO;
  newManagementFeesHarvest.amountToStrategist = feesToStrategist;
  newManagementFeesHarvest.timestamp = event.block.timestamp;
  newManagementFeesHarvest.vault = vault.id;
  vault.accManagementFeesToDAO = vault.accManagementFeesToDAO.plus(feesToDAO)
  vault.accManagementFeesToStrategists = vault.accManagementFeesToStrategists.plus(feesToStrategist)
  newManagementFeesHarvest.save()
  vault.save()
}

export function handleHarvestPerformanceFees(event: HarvestPerformanceFeesEvent): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) return;
  const feesToDAO = event.params.amountToDAO
  const feesToStrategist = event.params.amountToStrategist
  const newPerformanceFeesHarvest = new HarvestPerformanceFees(event.transaction.hash.toHexString())
  newPerformanceFeesHarvest.vault = vault.id;
  newPerformanceFeesHarvest.from = event.transaction.from;
  newPerformanceFeesHarvest.amountToDAO = feesToDAO;
  newPerformanceFeesHarvest.amountToStrategist = feesToStrategist;
  newPerformanceFeesHarvest.timestamp = event.block.timestamp;
  vault.accPerformanceFeesToDAO = vault.accPerformanceFeesToDAO.plus(feesToDAO)
  vault.accPerformanceFeesToStrategists = vault.accPerformanceFeesToStrategists.plus(feesToStrategist)
  newPerformanceFeesHarvest.save()
  vault.save()
}
