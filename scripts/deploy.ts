import { ethers } from "hardhat";

async function main() {
  const subscriptionId = "6970";
  const lottery = await ethers.deployContract("DLottery", [subscriptionId]);
  await lottery.waitForDeployment();
  const address = await lottery.getAddress();
  console.log(`Deployed at ${address}` );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
