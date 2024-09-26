// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/**
* @title Authenticator
* @author Ismael Rabanal Martín, Eugenio Romero Ciudad
* @notice Implementation of a RBAC contract. Updates from Solidity 0.6.0 to 0.8.0 by Eugenio Romero Ciudad
*/

import "./Structs.sol";

contract Authenticator {
    
    struct ProofOfIdentity {
        sharedStructs.User user;
        string token;
        uint256 expireDate;
    }

    mapping(address => ProofOfIdentity) public tokens;
    address[] public userAddresses;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier isAdmin() {
        require(msg.sender == admin, "Operation only valid for admin");
        _;
    }
    
    function addToken(sharedStructs.User memory user, string memory token, uint256 expireDate) public {
        require(tokens[user.id].user.id == address(0), "User already registered");
        require(user.id == msg.sender, "Can only register yourself");
        
        tokens[user.id] = ProofOfIdentity({user: user, token: token, expireDate: expireDate});
        userAddresses.push(user.id);
    }
    
    function getAllTokens() public view returns(ProofOfIdentity[] memory) {
        ProofOfIdentity[] memory allTokens = new ProofOfIdentity[](userAddresses.length);
        for (uint i = 0; i < userAddresses.length; i++) {
            allTokens[i] = tokens[userAddresses[i]];
        }
        return allTokens;
    }
    
    function getTokenByUser(sharedStructs.User memory user) public view returns(ProofOfIdentity memory) {
        require(tokens[user.id].user.id != address(0), "User not found");
        return tokens[user.id];
    }
}
