pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

library sharedStructs{
    struct User {
        address id;
        string name;
    }
    
    enum permissionTypes {r, w, x, d}
}
