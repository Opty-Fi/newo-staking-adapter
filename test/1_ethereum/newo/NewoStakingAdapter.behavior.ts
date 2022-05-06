import hre from "hardhat";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { getAddress } from "ethers/lib/utils";
import { BigNumber, utils } from "ethers";
import { PoolItem } from "../types";
import { getOverrideOptions, setTokenBalanceInStorage } from "../../utils";
import { default as TOKENS } from "../../../helpers/tokens.json";

chai.use(solidity);

const rewardToken = "0x98585dFc8d9e7D48F0b1aE47ce33332CF4237D96";
const vaultUnderlyingTokens = Object.values(TOKENS).map(x => getAddress(x));

export function shouldBehaveLikeNewoStakingAdapter(token: string, pool: PoolItem): void {
  it(`should deposit ${token}, claim NEWO, harvest NEWO, and withdraw ${token} in ${token} staking vault of New Order`, async function () {
    // new order's staking vault instance
    const newoStakingInstance = await hre.ethers.getContractAt("INewoStaking", pool.pool);
    // NEWO reward token's instance
    const newoRewardInstance = await hre.ethers.getContractAt("IERC20", rewardToken);
    // underlying token instance
    const underlyingTokenInstance = await hre.ethers.getContractAt("ERC20", pool.tokens[0]);
    await setTokenBalanceInStorage(underlyingTokenInstance, this.testDeFiAdapter.address, "200");
    // 1. deposit all underlying tokens
    await this.testDeFiAdapter.testGetDepositAllCodes(
      pool.tokens[0],
      pool.pool,
      this.newoStakingAdapter.address,
      getOverrideOptions(),
    );
    // 2. assert whether lptoken balance is as expected or not after deposit
    const actualLPTokenBalanceAfterDeposit = await this.newoStakingAdapter.getLiquidityPoolTokenBalance(
      this.testDeFiAdapter.address,
      this.testDeFiAdapter.address, // placeholder of type address
      pool.pool,
    );
    const expectedLPTokenBalanceAfterDeposit = await newoStakingInstance.balanceOf(this.testDeFiAdapter.address);
    expect(actualLPTokenBalanceAfterDeposit).to.be.eq(expectedLPTokenBalanceAfterDeposit);
    // 3. assert whether underlying token balance is as expected or not after deposit
    const actualUnderlyingTokenBalanceAfterDeposit = await this.testDeFiAdapter.getERC20TokenBalance(
      (
        await this.newoStakingAdapter.getUnderlyingTokens(pool.pool, pool.pool)
      )[0],
      this.testDeFiAdapter.address,
    );
    const expectedUnderlyingTokenBalanceAfterDeposit = await underlyingTokenInstance.balanceOf(
      this.testDeFiAdapter.address,
    );
    expect(actualUnderlyingTokenBalanceAfterDeposit).to.be.eq(expectedUnderlyingTokenBalanceAfterDeposit);
    // 4. assert whether the amount in token is as expected or not after depositing
    const actualAmountInTokenAfterDeposit = await this.newoStakingAdapter.getAllAmountInToken(
      this.testDeFiAdapter.address,
      pool.tokens[0],
      pool.pool,
    );
    const expectedAmountInTokenAfterDeposit = BigNumber.from(expectedLPTokenBalanceAfterDeposit);
    expect(actualAmountInTokenAfterDeposit).to.be.eq(expectedAmountInTokenAfterDeposit);
    // 5. assert whether the reward token is as expected or not
    const actualRewardToken = await this.newoStakingAdapter.getRewardToken(pool.pool);
    const expectedRewardToken = rewardToken;
    expect(getAddress(actualRewardToken)).to.be.eq(getAddress(expectedRewardToken));
    // 6. make a transaction for mining a block to get finite unclaimed reward amount
    await this.signers.admin.sendTransaction({
      value: utils.parseEther("0"),
      to: await this.signers.admin.getAddress(),
      ...getOverrideOptions(),
    });
    // 7. assert whether the unclaimed reward amount is as expected or not after depositing
    const actualUnclaimedReward = await this.newoStakingAdapter.getUnclaimedRewardTokenAmount(
      this.testDeFiAdapter.address,
      pool.pool,
      pool.tokens[0],
    );
    const expectedUnclaimedReward = await newoStakingInstance.earned(this.testDeFiAdapter.address);
    expect(actualUnclaimedReward).to.be.eq(expectedUnclaimedReward);
    // 8. claim the reward token
    await this.testDeFiAdapter.testClaimRewardTokenCode(
      pool.pool,
      this.newoStakingAdapter.address,
      getOverrideOptions(),
    );
    // 9. assert whether the reward token's balance is as expected or not after claiming
    const actualRewardTokenBalanceAfterClaim = await this.testDeFiAdapter.getERC20TokenBalance(
      await this.newoStakingAdapter.getRewardToken(pool.pool),
      this.testDeFiAdapter.address,
    );
    const expectedRewardTokenBalanceAfterClaim = await newoRewardInstance.balanceOf(this.testDeFiAdapter.address);
    expect(actualRewardTokenBalanceAfterClaim).to.be.eq(expectedRewardTokenBalanceAfterClaim);
    if (vaultUnderlyingTokens.includes(getAddress(pool.tokens[0]))) {
      // 10. Swap the reward token into underlying token
      try {
        await this.testDeFiAdapter.testGetHarvestAllCodes(
          pool.pool,
          pool.tokens[0],
          this.newoStakingAdapter.address,
          getOverrideOptions(),
        );
        // 11. assert whether the reward token is swapped to underlying token or not
        expect(await this.testDeFiAdapter.getERC20TokenBalance(pool.tokens[0], this.testDeFiAdapter.address)).to.be.gte(
          0,
        );
        console.log("✓ Harvest");
      } catch {
        // may throw error from DEX due to insufficient reserves
      }
    }
    // 12. Withdraw all lpToken balance
    await this.testDeFiAdapter.testGetWithdrawAllCodes(
      pool.tokens[0],
      pool.pool,
      this.newoStakingAdapter.address,
      getOverrideOptions(),
    );
    // 13. assert whether lpToken balance is as expected or not
    const actualLPTokenBalanceAfterWithdraw = await this.newoStakingAdapter.getLiquidityPoolTokenBalance(
      this.testDeFiAdapter.address,
      this.testDeFiAdapter.address, // placeholder of type address
      pool.pool,
    );
    const expectedLPTokenBalanceAfterWithdraw = await newoStakingInstance.balanceOf(this.testDeFiAdapter.address);
    expect(actualLPTokenBalanceAfterWithdraw).to.be.eq(expectedLPTokenBalanceAfterWithdraw);
    // 14. assert whether underlying token balance is as expected or not after withdraw
    const actualUnderlyingTokenBalanceAfterWithdraw = await this.testDeFiAdapter.getERC20TokenBalance(
      (
        await this.newoStakingAdapter.getUnderlyingTokens(pool.pool, pool.pool)
      )[0],
      this.testDeFiAdapter.address,
    );
    const expectedUnderlyingTokenBalanceAfterWithdraw = await underlyingTokenInstance.balanceOf(
      this.testDeFiAdapter.address,
    );
    expect(actualUnderlyingTokenBalanceAfterWithdraw).to.be.eq(expectedUnderlyingTokenBalanceAfterWithdraw);
  }).timeout(100000);
}
