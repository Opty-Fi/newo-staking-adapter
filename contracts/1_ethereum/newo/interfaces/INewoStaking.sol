// SPDX-License-Identifier: MIT

pragma solidity =0.8.11;

interface INewoStaking {
    event OwnerChanged(address oldOwner, address newOwner);
    event OwnerNominated(address newOwner);
    event PauseChanged(bool isPaused);
    event Recovered(address token, uint256 amount);
    event RewardAdded(uint256 reward);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function acceptOwnership() external;

    function balanceOf(address account) external view returns (uint256);

    function earned(address account) external view returns (uint256);

    function exit() external;

    function getReward() external;

    function getRewardForDuration() external view returns (uint256);

    function lastPauseTime() external view returns (uint256);

    function lastTimeRewardApplicable() external view returns (uint256);

    function lastUpdateTime() external view returns (uint256);

    function nominateNewOwner(address _owner) external;

    function nominatedOwner() external view returns (address);

    function notifyRewardAmount(uint256 reward) external;

    function owner() external view returns (address);

    function paused() external view returns (bool);

    function periodFinish() external view returns (uint256);

    function recoverERC20(address tokenAddress, uint256 tokenAmount) external;

    function rewardPerToken() external view returns (uint256);

    function rewardPerTokenStored() external view returns (uint256);

    function rewardRate() external view returns (uint256);

    function rewards(address) external view returns (uint256);

    function rewardsDistribution() external view returns (address);

    function rewardsDuration() external view returns (uint256);

    function rewardsToken() external view returns (address);

    function setPaused(bool _paused) external;

    function setRewardsDistribution(address _rewardsDistribution) external;

    function setRewardsDuration(uint256 _rewardsDuration) external;

    function stake(uint256 amount) external;

    function stakingToken() external view returns (address);

    function totalSupply() external view returns (uint256);

    function userRewardPerTokenPaid(address) external view returns (uint256);

    function withdraw(uint256 amount) external;
}
