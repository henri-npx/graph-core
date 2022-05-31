import { log, DataSourceTemplate, DataSourceContext } from "@graphprotocol/graph-ts";
import { BigInt, BigDecimal, store, Address } from "@graphprotocol/graph-ts";

import { RewardDistributor, RewardDistribution, UserReward } from "../types/schema";

import {
	Claimed as ClaimedEvent,
	NewDistributionPeriod as NewDistributionPeriodEvent,
	RewardLeftRecovered as RewardLeftRecoveredEvent,
	Staked as StakedEvent,
	Unstaked as UnstakedEvent,
} from "../types/RewardDistributor/RewardDistributor";

import { REWARD_DISTRIBUTOR_ADDRESS, ZERO_BI } from "./helpers";

export function handleNewDistributionPeriod(event: NewDistributionPeriodEvent): void {
	let rewardDistributor = RewardDistributor.load(REWARD_DISTRIBUTOR_ADDRESS);
	if (rewardDistributor === null) {
		rewardDistributor = new RewardDistributor(REWARD_DISTRIBUTOR_ADDRESS);
		rewardDistributor.distributionsCount = 0;
		rewardDistributor.accRewards = ZERO_BI;
	}
	rewardDistributor.save();
	// Update
	rewardDistributor.distributionsCount = rewardDistributor.distributionsCount + 1;
	rewardDistributor.accRewards = rewardDistributor.accRewards.plus(event.params.amount);
	// Set new distribution
	const newDistribution = new RewardDistribution(event.transaction.hash.toHexString()) as RewardDistribution;
	newDistribution.index = event.params.index.toI32();
	newDistribution.distributor = rewardDistributor.id;
	newDistribution.totalAmountRewarded = event.params.amount;
	newDistribution.tokenRewardedWith = event.params.token;
	newDistribution.timestamp = event.block.timestamp;
	newDistribution.rewardRecovered = ZERO_BI;
	// Save
	newDistribution.save();
	rewardDistributor.save();
}

export function handleClaimed(event: ClaimedEvent): void {
	let rewardDistributor = RewardDistributor.load(event.address.toHexString());
	if (rewardDistributor == null) return;
	const entityName = rewardDistributor.id + "-" + event.params.account.toHexString();
	let userReward = UserReward.load(entityName);
	if (userReward == null) {
		userReward = new UserReward(entityName);
		userReward.accUserRewards = ZERO_BI;
		userReward.rewardedAtPeriods = [];
		userReward.rewardsPerPeriods = [];
		userReward.user = event.params.account;
	}
	/// Important to give default value to every field, else the sync will fail at the first save
	userReward.save();

	/// Array Complications in TG ...
	const size = userReward.rewardedAtPeriods.length;
	/// Array<i32> instead of Array<number> due to : ERROR TS2322: Type '~lib/array/Array<f64>' is not assignable to type '~lib/array/Array<i32>'.
	const updatedRewardedAtPeriods = new Array<i32>(size + 1);
	const updatedRewardsPerPeriods = new Array<BigInt>(size + 1);
	for (let x = 0; x < size; x++) {
		/// Might cause scaling limits ...
		updatedRewardedAtPeriods[x] = userReward.rewardedAtPeriods[x];
		updatedRewardsPerPeriods[x] = userReward.rewardsPerPeriods[x];
	}
	updatedRewardedAtPeriods[size] = event.params.index.toI32(); // - 1; // See Event Solidity
	updatedRewardsPerPeriods[size] = event.params.amount;

	userReward.rewardsPerPeriods = updatedRewardsPerPeriods;
	userReward.rewardedAtPeriods = updatedRewardedAtPeriods;

	userReward.user = event.params.account;
	userReward.accUserRewards = userReward.accUserRewards.plus(event.params.amount);
	userReward.save();
	rewardDistributor.save();
}

export function handleRewardLeftRecovered(event: RewardLeftRecoveredEvent): void {
	let rewardDistributor = RewardDistributor.load(event.address.toHexString());
	if (rewardDistributor == null) return;
	const index = event.params.index.toI32()
	const distributionsCount = rewardDistributor.distributionsCount;
	for (let x = 0; x < distributionsCount; x++) {
		const distribution = RewardDistribution.load(rewardDistributor.distributions[x]);
		if (distribution == null) return;
		if (index == distribution.index) {
			// Reward Recovered at the end of the epoch, aka. not claimed rewards
			distribution.rewardRecovered = event.params.amount;
			distribution.save()
			break;
		}
	}
}

// Theses handlers are not required, for now
// export function handleStaked(event: StakedEvent): void {}
// export function handleUnstaked(event: UnstakedEvent): void {}

