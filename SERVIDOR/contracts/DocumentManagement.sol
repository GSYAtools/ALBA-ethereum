// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentManagement {
    struct Document {
        bytes32 hash;
        address owner;
        uint256 timestamp;
    }

    mapping(bytes32 => Document) public documents;

    event DocumentAdded(bytes32 indexed id, bytes32 hash, address owner);
    event DocumentUpdated(bytes32 indexed id, bytes32 newHash);

    function addDocument(bytes32 id, bytes32 hash) public {
        require(documents[id].hash == bytes32(0), "Document already exists");
        documents[id] = Document(hash, msg.sender, block.timestamp);
        emit DocumentAdded(id, hash, msg.sender);
    }

    function updateDocument(bytes32 id, bytes32 newHash) public {
        require(documents[id].hash != bytes32(0), "Document does not exist");
        require(documents[id].owner == msg.sender, "Only owner can update document");
        documents[id].hash = newHash;
        documents[id].timestamp = block.timestamp;
        emit DocumentUpdated(id, newHash);
    }

    function verifyDocument(bytes32 id, bytes32 hash) public view returns (bool) {
        return documents[id].hash == hash;
    }
}
