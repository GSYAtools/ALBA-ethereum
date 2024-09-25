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

    ProofOfIdentity[] private proofs;
    address admin;

    constructor() {
        admin = msg.sender;
    }

    modifier isAdmin() {
        require(msg.sender == admin, "Operation only valid for admin");
        _;
    }
    
    function addToken(sharedStructs.User memory user, string memory token, uint256 expireDate) isAdmin public{
       proofs.push(ProofOfIdentity({user: user, token: token, expireDate: expireDate}));
    }
    
    function getAllTokens() public view returns(ProofOfIdentity[] memory tokens){
        return proofs;
    }
    
    function getTokenByUser(sharedStructs.User memory user) public view returns(ProofOfIdentity memory){
        ProofOfIdentity memory token;
        uint256 counter = 0;
        for (uint256 i = 0; i < proofs.length; i++){
            if(proofs[i].user.id == user.id){
                token = proofs[i];
                counter++;
            }
        }
        return token;
    }
}
