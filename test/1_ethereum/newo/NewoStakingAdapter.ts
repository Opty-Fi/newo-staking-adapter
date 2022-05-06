import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import newoStakingVaults from "../../../helpers/newoStakingVaults.json";
import { NewoStakingAdapter } from "../../../typechain/NewoStakingAdapter";
import { TestDeFiAdapter } from "../../../typechain/TestDeFiAdapter";
import { LiquidityPool, Signers } from "../types";
import { shouldBehaveLikeNewoStakingAdapter } from "./NewoStakingAdapter.behavior";
import { IUniswapV2Router02 } from "../../../typechain";
import { getOverrideOptions } from "../../utils";

const { deployContract } = hre.waffle;

const NewoStakingVaults = newoStakingVaults;

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.owner = signers[1];
    this.signers.deployer = signers[2];
    this.signers.alice = signers[3];
    this.signers.operator = await hre.ethers.getSigner("0x6bd60f089B6E8BA75c409a54CDea34AA511277f6");

    // get the UniswapV2Router contract instance
    this.uniswapV2Router02 = <IUniswapV2Router02>(
      await hre.ethers.getContractAt("IUniswapV2Router02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    );

    // deploy Newo Staking Adapter
    const newoStakingAdapterArtifact: Artifact = await hre.artifacts.readArtifact("NewoStakingAdapter");
    this.newoStakingAdapter = <NewoStakingAdapter>(
      await deployContract(
        this.signers.deployer,
        newoStakingAdapterArtifact,
        ["0x99fa011E33A8c6196869DeC7Bc407E896BA67fE3"],
        getOverrideOptions(),
      )
    );

    // deploy TestDeFiAdapter Contract
    const testDeFiAdapterArtifact: Artifact = await hre.artifacts.readArtifact("TestDeFiAdapter");
    this.testDeFiAdapter = <TestDeFiAdapter>(
      await deployContract(this.signers.deployer, testDeFiAdapterArtifact, [], getOverrideOptions())
    );

    // impersonate operator
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [this.signers.operator.address],
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.operator.address,
      value: hre.ethers.utils.parseEther("10"),
      ...getOverrideOptions(),
    });
  });

  describe("NewoStakingAdapter", function () {
    Object.keys(NewoStakingVaults).map((token: string) => {
      shouldBehaveLikeNewoStakingAdapter(token, (NewoStakingVaults as LiquidityPool)[token]);
    });
  });
});
