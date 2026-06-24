import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying FoodTraceability...");

  const FoodTraceability = await ethers.getContractFactory("FoodTraceability");
  const contract = await FoodTraceability.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`FoodTraceability deployed to: ${contractAddress}`);

  // Save address and ABI in shared folder for Backend & Listener
  const sharedDir = path.join(__dirname, "../../shared");
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  // Get contract artifact for ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/FoodTraceability.sol/FoodTraceability.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found! Run compile first.");
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const deployDetails = {
    address: contractAddress,
    abi: artifact.abi
  };

  fs.writeFileSync(
    path.join(sharedDir, "contract.json"),
    JSON.stringify(deployDetails, null, 2),
    "utf8"
  );
  console.log("Deployed contract details saved to shared/contract.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
