const hre = require("hardhat");

async function main() {

  const Kingex = await hre.ethers.getContractFactory("Kingex");
  const kingex = await Kingex.deploy("KINGEX", "KGX", 100000000, 0);

  await kingex.deployed();

  // const Swapper = await hre.ethers.getContractFactory("Swapper");
  // const swapper = await Swapper.deploy();
  // await swapper.deployed();
  
  //await kingex.transfer("0x5FbDB2315678afecb367f032d93F642f64180aa3", 1000);

  console.log("Kingex token deployed to:", kingex.address);
  console.log("Contract has eth bal: ", (await hre.ethers.provider.getBalance(kingex.address)).toNumber())
  console.log("Contract contains:", (await kingex.balanceOf(kingex.address)).toNumber(), "tokens");
  console.log("Bought tokens: ", await kingex.buyToken({value: hre.ethers.BigNumber.from(1)}));
  console.log("Contract has eth bal: ", (await hre.ethers.provider.getBalance(kingex.address)).toNumber())
  console.log("Contract contains:", (await kingex.balanceOf(kingex.address)).toNumber(), "tokens");
  console.log("Wihdraw: ", await kingex.withdraw());
  console.log("Contract has eth bal: ", (await hre.ethers.provider.getBalance(kingex.address)).toNumber())
  //console.log("Swapper token deployed to:", swapper.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });