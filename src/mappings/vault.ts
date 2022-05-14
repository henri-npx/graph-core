import { log } from '@graphprotocol/graph-ts'

import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'

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
  HarvestManagementFees as HarvestManagementFeesEvent,
  HarvestPerformanceFees as HarvestManaPerformanceFeesEvent
} from '../types/Factory/Vault'


import {
  FACTORY_ADDRESS,
} from './helpers'

import { 
  Vault as VaultTemplate
} from '../types/templates'

export function  handleDeposit (event: DepositEvent): void {
    log.error("handleDeposit", [event.transaction.hash.toHexString()])
    let factory = Factory.load(FACTORY_ADDRESS)
    let vault = Vault.load(event.address.toHexString())
    if (factory == null || vault == null) {
      log.error("handleDeposit exit: factory or vault null", [event.transaction.hash.toHexString()])
      return; // ...
    }

    const toMint = event.params.sharesAmount;
    const timestamp = event.params.timestamp;
    let deposit = new Deposit(event.transaction.hash.toHexString()) as Deposit
    // deposit.from = event.params.user;
    deposit.from = event.transaction.from; // tx.origin right ?
    deposit.toMint = event.params.sharesAmount;
    deposit.timestamp = event.params.timestamp;
    deposit.netAmountOut = event.params.sharesAmount;
    deposit.vault = vault.id;
    
    // vault.deposits.push(deposit.id)

    deposit.save()
    vault.save()
    factory.save()

    // event.params.user, event.params.baseTokenAmount, event.params.sharesAmount, event.params.timestamp
  }
  
  export function  handleRebalance (event: RebalanceEvent): void {
    log.error("handleRebalance",  [event.transaction.hash.toHexString()])
    let factory = Factory.load(FACTORY_ADDRESS)
    let vault = Vault.load(event.address.toHexString())
    if (factory == null || vault == null) {
      log.error("handleDeposit exit: factory or vault null", [event.transaction.hash.toHexString()])
      return; // ...
    }

    const signals = event.params.signals;
    const timestamp = event.params.timestamp;
    const trader = event.params.trader;

    let newRebalance = new Rebalance(event.transaction.hash.toHexString()) as Rebalance
    newRebalance.vault = vault.id;
    newRebalance.from = event.transaction.from; // tx.origin right ?
    newRebalance.signals = event.params.signals;
    newRebalance.timestamp = event.params.timestamp;
    // vault.rebalances.push(newRebalance.id)
    
    vault.save()
    factory.save()
    newRebalance.save()
  }
  
  export function  handleRedeem (event: RedeemEvent): void {
    log.error("handleRedeem",  [event.transaction.hash.toHexString()])
    let factory = Factory.load(FACTORY_ADDRESS)
    let vault = Vault.load(event.address.toHexString())
    if (factory == null || vault == null) {
      log.error("handleRedeem exit: factory or vault null", [event.transaction.hash.toHexString()])
      return; // ...
    }

    const user = event.params.user;
    const shareAmount = event.params.shareAmount;
    const timestamp = event.params.timestamp;
    
    let newRedeem = new Redeem(event.transaction.hash.toHexString()) as Redeem
    newRedeem.vault = vault.id;
    newRedeem.from = event.transaction.from; // tx.origin right ?
    newRedeem.amountIn = event.params.shareAmount;
    newRedeem.timestamp = event.params.timestamp;
    // vault.redemptions.push(newRedeem.id)
    
    vault.save()
    factory.save()
    newRedeem.save()

  }
  
  // export function  handleHarvestManagementFees (event: VaultCreated): void {
  //   log.error("handleHarvestManagementFees",  [event.transaction.hash.toHexString()])
  // }
  
  // export function  handleHarvestPerformanceFees (event: VaultCreated): void {
  //   log.error("handleHarvestPerformanceFees",  [event.transaction.hash.toHexString()])
  // }