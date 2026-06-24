import { expect } from "chai";
import { ethers } from "hardhat";

describe("FoodTraceability", function () {
  it("Should create a batch and update stages", async function () {
    const FoodTraceability = await ethers.getContractFactory("FoodTraceability");
    const contract = await FoodTraceability.deploy();
    await contract.waitForDeployment();

    const [owner, actor1, actor2] = await ethers.getSigners();

    // Create batch
    const tx = await contract.createBatch("Organic Apples", "Farm A, WA", "BATCH-123", actor1.address);
    await tx.wait();

    // Verify batch details
    const batch = await contract.getBatch(1);
    expect(batch.productName).to.equal("Organic Apples");
    expect(batch.origin).to.equal("Farm A, WA");
    expect(batch.batchIdentifier).to.equal("BATCH-123");
    expect(batch.createdBy).to.equal(actor1.address);

    // Verify history (should have initial event "Harvested")
    const history = await contract.getBatchHistory(1);
    expect(history.length).to.equal(1);
    expect(history[0].stage).to.equal("Harvested");
    expect(history[0].actor).to.equal(actor1.address);

    // Update stage
    await contract.updateStage(1, "Processing", actor2.address);
    const historyUpdated = await contract.getBatchHistory(1);
    expect(historyUpdated.length).to.equal(2);
    expect(historyUpdated[1].stage).to.equal("Processing");
    expect(historyUpdated[1].actor).to.equal(actor2.address);
  });
});
