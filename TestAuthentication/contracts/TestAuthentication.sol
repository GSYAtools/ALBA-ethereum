// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract TestAuthentication {
    mapping(address => bool) public authorizedUsers;
    
    function addAuthorizedUser(address user) public {
        authorizedUsers[user] = true;
    }
    
    function isAuthorized() public view returns (bool) {
        return authorizedUsers[msg.sender];
    }
}
