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

export function  handleDeposit (event: DepositEvent): void {
    let vault = Vault.load(event.address.toHexString())
    if (vault == null) return; 
    const toMint = event.params.sharesAmount;
    const timestamp = event.params.timestamp;
    const deposit = new Deposit(event.transaction.hash.toHexString()) as Deposit
    deposit.from = event.transaction.from;
    deposit.toMint = event.params.sharesAmount;
    deposit.timestamp = event.params.timestamp;
    deposit.netAmountOut = event.params.sharesAmount;
    deposit.vault = vault.id;
    deposit.save()
    vault.save()
  }
  
  export function  handleRebalance (event: RebalanceEvent): void {
    let vault = Vault.load(event.address.toHexString())
    if (vault == null) return; 
    const signals = event.params.signals;
    const timestamp = event.params.timestamp;
    const trader = event.params.trader;
    const newRebalance = new Rebalance(event.transaction.hash.toHexString()) as Rebalance
    newRebalance.vault = vault.id;
    newRebalance.from = trader;
    newRebalance.signals = event.params.signals;
    newRebalance.timestamp = timestamp;
    newRebalance.save()
    vault.save()
  }
  
  // How to compute exit fees ?

  export function  handleRedeem (event: RedeemEvent): void {
    let vault = Vault.load(event.address.toHexString())
    if (vault == null) return; 
    const user = event.params.user;
    const shareAmount = event.params.shareAmount;
    const timestamp = event.params.timestamp;
    const newRedeem = new Redeem(event.transaction.hash.toHexString()) as Redeem
    newRedeem.vault = vault.id;
    newRedeem.from = user;
    newRedeem.amountIn = shareAmount;
    newRedeem.timestamp = timestamp;
    newRedeem.save()
    vault.save()
  }

  export function  handleHarvestManagementFees (event: HarvestManagementFeesEvent): void {
    let vault = Vault.load(event.address.toHexString())
    if (vault == null) return; 
    const managementFeesHarvest = new HarvestManagementFees(event.transaction.hash.toHexString())
    managementFeesHarvest.fromHarvester = event.params.harvester;
    managementFeesHarvest.feesToDAO = event.params.toDAO;
    managementFeesHarvest.feesToStrategist = event.params.toTrader;
    managementFeesHarvest.vault = vault.id;
    managementFeesHarvest.save()
    vault.save()
  }

  export function  handleHarvestPerformanceFees (event: HarvestPerformanceFeesEvent): void {
    let vault = Vault.load(event.address.toHexString())
    if (vault == null) return; 
    const performanceFeesHarvest = new HarvestPerformanceFees(event.transaction.hash.toHexString())
    performanceFeesHarvest.fromHarvester = event.params.harvester;
    performanceFeesHarvest.feesToDAO = event.params.toDAO;
    performanceFeesHarvest.feesToStrategist = event.params.toTrader;
    performanceFeesHarvest.vault = vault.id;
    performanceFeesHarvest.save()
    vault.save()
  }
