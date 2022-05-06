import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { NewoStakingAdapter, NewoStakingAdapter__factory } from "../../typechain";

const registryContractAddress = "0x99fa011E33A8c6196869DeC7Bc407E896BA67fE3";

task("deploy-newo-staking-adapter").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const newoStakingAdapterFactory: NewoStakingAdapter__factory = await ethers.getContractFactory("NewoStakingAdapter");
  const newoStakingAdapter: NewoStakingAdapter = <NewoStakingAdapter>(
    await newoStakingAdapterFactory.deploy(registryContractAddress)
  );
  await newoStakingAdapter.deployed();
  console.log("NewoStakingAdapter deployed to: ", newoStakingAdapter.address);
});
