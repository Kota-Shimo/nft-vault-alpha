// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AnchorContract {
    address public owner;

    struct AnchorRecord {
        bytes32 merkleRoot;
        uint256 blockNumber;
        uint256 timestamp;
    }

    AnchorRecord[] public anchors;

    event Anchored(bytes32 merkleRoot, uint256 blockNumber, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    function anchorData(bytes32 merkleRoot) external {
        require(msg.sender == owner, "Only owner can anchor");
        AnchorRecord memory record = AnchorRecord(
            merkleRoot,
            block.number,
            block.timestamp
        );
        anchors.push(record);

        emit Anchored(merkleRoot, block.number, block.timestamp);
    }

    function getAnchorCount() external view returns (uint256) {
        return anchors.length;
    }

    function getAnchor(uint256 index) external view returns (AnchorRecord memory) {
        require(index < anchors.length, "Index out of range");
        return anchors[index];
    }
}
