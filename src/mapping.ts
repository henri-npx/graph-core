import {
  CreateVault as CreateVaultEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SetAccessManager as SetAccessManagerEvent,
  SetFeesManager as SetFeesManagerEvent,
  SetHarvester as SetHarvesterEvent,
  SetSwapContracts as SetSwapContractsEvent
} from "../generated/Factory/Factory"
import {
  CreateVault,
  OwnershipTransferred,
  SetAccessManager,
  SetFeesManager,
  SetHarvester,
  SetSwapContracts
} from "../generated/schema"

export function handleCreateVault(event: CreateVaultEvent): void {
  let entity = new CreateVault(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.vault = event.params.vault
  entity.creator = event.params.creator
  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner
  entity.save()
}

export function handleSetAccessManager(event: SetAccessManagerEvent): void {
  let entity = new SetAccessManager(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newAccessManager = event.params.newAccessManager
  entity.save()
}

export function handleSetFeesManager(event: SetFeesManagerEvent): void {
  let entity = new SetFeesManager(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newFeesManager = event.params.newFeesManager
  entity.save()
}

export function handleSetHarvester(event: SetHarvesterEvent): void {
  let entity = new SetHarvester(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newHarvester = event.params.newHarvester
  entity.save()
}

export function handleSetSwapContracts(event: SetSwapContractsEvent): void {
  let entity = new SetSwapContracts(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.newSwapRouter = event.params.newSwapRouter
  entity.newSwapProxy = event.params.newSwapProxy
  entity.save()
}
