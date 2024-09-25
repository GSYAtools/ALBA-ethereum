// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/**
* @title Structs
* @author Ismael Rabanal Martín, Eugenio Romero Ciudad
* @notice Implementation of a RBAC contract. Updates from Solidity 0.6.0 to 0.8.0 by Eugenio Romero Ciudad
*/

library sharedStructs{
    struct User {
        address id;
        string name;
    }
    
    enum permissionTypes {r, w, x, d}
}