import { log, DataSourceTemplate, DataSourceContext } from '@graphprotocol/graph-ts';
import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'

import {
    RewardDistributor,
    RewardDistribution,
    UserReward
} from '../types/schema'

import {
    Claimed as ClaimedEvent,
    NewDistributionPeriod as NewDistributionPeriodEvent,
    RewardLeftRecovered as RewardLeftRecoveredEvent,
    Staked as StakedEvent,
    Unstaked as UnstakedEvent
} from '../types/RewardDistributor/RewardDistributor'

import {
    REWARD_DISTRIBUTOR_ADDRESS, ZERO_BI,
} from './helpers'

export function handleNewDistributionPeriod(event: NewDistributionPeriodEvent): void {
    let rewardDistributor = RewardDistributor.load(REWARD_DISTRIBUTOR_ADDRESS)
    if (rewardDistributor === null) {
        rewardDistributor = new RewardDistributor(REWARD_DISTRIBUTOR_ADDRESS)
        rewardDistributor.distributionsCount = 0
        rewardDistributor.accRewards = ZERO_BI
    }
    rewardDistributor.save()
    // Update
    rewardDistributor.distributionsCount = rewardDistributor.distributionsCount + 1
    rewardDistributor.accRewards = rewardDistributor.accRewards.plus(event.params.amount)
    // Set new distribution
    const newDistribution = new RewardDistribution(event.transaction.hash.toHexString()) as RewardDistribution
    newDistribution.index = event.params.index.toI32();
    newDistribution.distributor = rewardDistributor.id;
    newDistribution.totalAmountRewarded = event.params.amount;
    newDistribution.tokenRewardedWith = event.params.token;
    newDistribution.timestamp = event.block.timestamp;
    // Save
    newDistribution.save();
    rewardDistributor.save()
}

export function handleClaimed(event: ClaimedEvent): void {
    let rewardDistributor = RewardDistributor.load(event.address.toHexString())
    if (rewardDistributor == null) return;
    let user = UserReward.load(event.params.account.toHexString());
    if (user == null) {
        user = new UserReward(event.params.account.toHexString());
        user.accUserRewards = ZERO_BI
        user.rewardedAtPeriods = [];
        user.rewardsPerPeriods = [];
    };

    const rewardedAtPeriods = event.params.index.toI32(); // - 1; // See Event Solidity
    const rewardsPerPeriods = event.params.amount;
    user.rewardedAtPeriods.push(rewardedAtPeriods);
    user.rewardsPerPeriods.push(rewardsPerPeriods);
    user.accUserRewards = user.accUserRewards.plus(event.params.amount);
    user.save();
    rewardDistributor.save()
}

// Theses handlers are not required, for now
// export function handleRewardLeftRecovered(event: RewardLeftRecoveredEvent): void {}
// export function handleStaked(event: StakedEvent): void {}
// export function handleUnstaked(event: UnstakedEvent): void {}
