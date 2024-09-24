// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract HelloWorld {
    string private message;

    constructor() {
        message = string("Hello, World!");
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
