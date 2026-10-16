// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WathiqProof
/// @notice Public timestamped record of a SHA-256 file digest, per wallet.
/// @dev This is NOT proof of file ownership, authorship, truth or legal title.
contract WathiqProof {
    // wallet => SHA-256(file bytes) => first registration timestamp
    mapping(address => mapping(bytes32 => uint256)) public recordedAt;

    event ProofRecorded(
        address indexed recorder,
        bytes32 indexed fileHash,
        uint256 timestamp
    );

    error EmptyHash();
    error AlreadyRecorded();

    /// @notice Publish only the file digest, never the original file.
    /// @param fileHash SHA-256 of exact file bytes, computed on the device.
    function record(bytes32 fileHash) external {
        if (fileHash == bytes32(0)) revert EmptyHash();
        if (recordedAt[msg.sender][fileHash] != 0) revert AlreadyRecorded();

        uint256 timestamp = block.timestamp;
        recordedAt[msg.sender][fileHash] = timestamp;
        emit ProofRecorded(msg.sender, fileHash, timestamp);
    }
}
