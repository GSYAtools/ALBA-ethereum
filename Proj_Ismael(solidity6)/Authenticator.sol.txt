pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
/**
* @title RBAC
* @author Ismael Rabanal Martín
* @notice Implementation of a RBAC contract.
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

    constructor() public {
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

