// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FoodTraceability {
    struct Batch {
        uint256 id;
        string productName;
        string origin;
        string batchIdentifier;
        string plantingDate;
        string harvestDate;
        string fertilizerUsed;
        address createdBy;
        uint256 createdAt;
    }

    struct SupplyChainEvent {
        uint256 batchId;
        address actor;
        string stage;
        string details;
        uint256 timestamp;
    }

    uint256 private _batchIdCounter;

    mapping(uint256 => Batch) private _batches;
    mapping(uint256 => SupplyChainEvent[]) private _batchHistory;

    event BatchCreated(
        uint256 indexed batchId,
        address indexed actor,
        string productName,
        string origin,
        string batchIdentifier,
        string plantingDate,
        string harvestDate,
        string fertilizerUsed,
        uint256 timestamp
    );

    event StageUpdated(
        uint256 indexed batchId,
        address indexed actor,
        string stage,
        string details,
        uint256 timestamp
    );

    function createBatch(
        string memory productName,
        string memory origin,
        string memory batchIdentifier,
        string memory plantingDate,
        string memory harvestDate,
        string memory fertilizerUsed,
        address actor
    ) public returns (uint256) {
        _batchIdCounter++;
        uint256 newBatchId = _batchIdCounter;

        _batches[newBatchId] = Batch({
            id: newBatchId,
            productName: productName,
            origin: origin,
            batchIdentifier: batchIdentifier,
            plantingDate: plantingDate,
            harvestDate: harvestDate,
            fertilizerUsed: fertilizerUsed,
            createdBy: actor,
            createdAt: block.timestamp
        });

        emit BatchCreated(
            newBatchId,
            actor,
            productName,
            origin,
            batchIdentifier,
            plantingDate,
            harvestDate,
            fertilizerUsed,
            block.timestamp
        );

        // Also add initial stage event
        _batchHistory[newBatchId].push(SupplyChainEvent({
            batchId: newBatchId,
            actor: actor,
            stage: "Harvested",
            details: "",
            timestamp: block.timestamp
        }));

        emit StageUpdated(
            newBatchId,
            actor,
            "Harvested",
            "",
            block.timestamp
        );

        return newBatchId;
    }

    function updateStage(
        uint256 batchId,
        string memory stage,
        string memory details,
        address actor
    ) public {
        require(_batches[batchId].id != 0, "Batch does not exist");
        
        _batchHistory[batchId].push(SupplyChainEvent({
            batchId: batchId,
            actor: actor,
            stage: stage,
            details: details,
            timestamp: block.timestamp
        }));

        emit StageUpdated(
            batchId,
            actor,
            stage,
            details,
            block.timestamp
        );
    }

    function getBatch(uint256 batchId) public view returns (Batch memory) {
        require(_batches[batchId].id != 0, "Batch does not exist");
        return _batches[batchId];
    }

    function getBatchHistory(uint256 batchId) public view returns (SupplyChainEvent[] memory) {
        require(_batches[batchId].id != 0, "Batch does not exist");
        return _batchHistory[batchId];
    }
}
