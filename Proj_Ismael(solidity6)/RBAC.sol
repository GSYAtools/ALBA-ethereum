pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
/**
* @title RBAC
* @author Ismael Rabanal Martín
* @notice Implementation of a RBAC contract.
*/

import "./Structs.sol";

contract RBAC {

    event UserCreated(address id, string userName, string roleName);
    event RoleCreated(string name);
    event ProtectedObjectCreated(string name);
    event PermissionCreated(string objectName, string roleName, sharedStructs.permissionTypes permissionName, uint256 expireDate);
    event UserDeleted(address id);
    event RoleDeleted(string name);
    event ProtectedObjectDeleted(string name);
    event PermissionDeleted(string objectName, string roleName, uint256 expireDate);

    struct Role {
        string name;
        uint256 membersNumber;
        mapping(uint256 => sharedStructs.User) members;
        
    }

    struct Permission {
        ProtectedObject object;
        Role role;
        sharedStructs.permissionTypes tipo;
        uint256 expireDate;
    }

    struct ProtectedObject {
        string name;
    }

    sharedStructs.User[] private users;
    Role[] private roles;
    Permission[] private perm;
    ProtectedObject[] private protectedObjects;
    address admin;

    constructor() public {
        admin = msg.sender;
    }

    modifier isAdmin() {
        require(msg.sender == admin, "Operation only valid for admin");
        _;
    }

    function getAllUsers() public view returns (sharedStructs.User[] memory){
        return users;
    }
    
    function getAllRolesDescriptions() public view returns (string[] memory){
        string[] memory names = new string[](roles.length);
        for (uint256 i = 0; i < roles.length; i++){
            names[i] = (roles[i].name);
        }
        return names;
    }
    
    function getAllUsersFromRole(string memory roleName) public view returns (sharedStructs.User[] memory){
        require(roleExists(roleName), "That role doesn't exist");
        uint256 idRole;
        for(uint256 i = 0; i < roles.length; i++){
            if(compareStrings(roles[i].name, roleName)){
                idRole = i;
                i = roles.length;
            }
        }
        sharedStructs.User[] memory roleUsers = new sharedStructs.User[](roles[idRole].membersNumber);
        for(uint i = 0; i < roles[idRole].membersNumber; i++){
            roleUsers[i] = roles[idRole].members[i];
        }
        return roleUsers;
    }
  
    
    function getAllPermissions() public view returns (ProtectedObject[] memory, string[] memory, sharedStructs.permissionTypes[] memory, uint256[] memory){
        ProtectedObject[] memory objectNames = new ProtectedObject[](perm.length);
        string[] memory roleNames = new string[](perm.length);
        sharedStructs.permissionTypes[] memory permissionNames = new sharedStructs.permissionTypes[](perm.length);
        uint256[] memory expireDates = new uint256[](perm.length);
        for (uint256 i = 0; i < perm.length; i++){
            objectNames[i] = perm[i].object;
            roleNames[i] = perm[i].role.name;
            permissionNames[i] = perm[i].tipo;
            expireDates[i] = perm[i].expireDate;
            
        }
        return (objectNames, roleNames, permissionNames, expireDates);
    }
    
    function getAllProtectedObjects() public view returns (ProtectedObject[] memory){
        return protectedObjects;
    }
    
    function getIdUser(address userAddress) private view returns(uint256 idUser){
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].id == userAddress) {
                idUser = i;
                i = users.length;

            }
        }
        return idUser;
    }
    function getIdRole(string memory roleName) private view returns(uint256 idRole){
        for (uint256 i = 0; i < roles.length; i++) {
            if (compareStrings(roles[i].name, roleName)) {
                idRole = i;
                i = roles.length;

            }
        }
        return idRole;
    }
    
    function getIdObject(string memory objectName) private view returns(uint256 idObject){
        for (uint256 i = 0; i < protectedObjects.length; i++) {
            if (compareStrings(protectedObjects[i].name, objectName)) {
                idObject = i;
                i = protectedObjects.length;
            }
        }
        return idObject;
    }
    
    function roleExists(string memory roleName) private view returns(bool exists){
        exists = false;
        for (uint256 i = 0; i < roles.length; i++) {
            if (compareStrings(roles[i].name, roleName)) {
                exists = true;
                i = roles.length;
            }
        }
        return exists;
    }
    
    function objectExists(string memory objectName) private view returns(bool exists){
        exists = false;
        for (uint256 i = 0; i < protectedObjects.length; i++) {
            if (compareStrings(protectedObjects[i].name, objectName)) {
                exists = true;
                i = protectedObjects.length;
            }
        }
        return exists;
    }
    
    function userExists(address userAddress) private view returns(bool exists){
        exists = false;
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].id == userAddress) {
                exists = true;
                i = users.length;
            }
        }
        return exists;
    }
    
    function permissionExists(string memory objectName, string memory roleName, uint256 expireDate) private view returns(bool exists){
        exists = false;
        for (uint256 i = 0; i < perm.length; i++) {
            if (compareStrings(perm[i].object.name, objectName) && compareStrings(perm[i].role.name, roleName) && perm[i].expireDate == expireDate) {
                exists = true;
                i = perm.length;
            }
        }
        return exists;
    }
    
    function addUser(string memory userName, address id, string memory roleName) public isAdmin{
        require(!userExists(id), "That user already exists (address in use)");
        users.push(sharedStructs.User({id: id, name: userName}));
        if(roleExists(roleName)){
            addUserToRole(id, roleName);
        }else{
            addRole(roleName);
            addUserToRole(id, roleName);
        }
        emit UserCreated(id, userName, roleName);
        
        
    }
    
    //If no role is passed the new user is assigned the role defaultUser.
    function addUser(string memory userName, address id) public isAdmin{
        require(!userExists(id), "That user already exists (address in use)");
        users.push(sharedStructs.User({id: id, name: userName}));
        if(roleExists("defaultUser")){
            addUserToRole(id, "defaultUser");
        }else{
            addRole("defaultUser");
            addUserToRole(id, "defaultUser");
        }
        emit UserCreated(id, userName, "defaultUser");
        
        
    }
    function addRole(string memory roleName) public isAdmin{
        require(!roleExists(roleName), "That role already exists");
        roles.push(Role({name: roleName, membersNumber: 0}));
        emit RoleCreated(roleName);
    }
    
    function hasRole(address userAddress) private view returns(bool exists) {
        exists = false;
        for (uint256 i = 0; i < roles.length; i++) {
            for(uint256 j = 0; j < roles[i].membersNumber; j++){
                if(roles[i].members[j].id == userAddress){
                    exists = true;
                    i = roles.length;
                }
            }
        }
        return exists;
    }
    
    function addUserToRole(address userAddress, string memory roleName) private isAdmin{
        require(userExists(userAddress), "User doesn't exist");
        require(roleExists(roleName), "Role doesn't exist");
        require(!hasRole(userAddress), "That user already has a role");
        uint256 idRole = getIdRole(roleName);
        uint256 idUser = getIdUser(userAddress);
        
        roles[idRole].members[roles[idRole].membersNumber] = users[idUser];
        roles[idRole].membersNumber++;
    }

    function changeUserRole(address userAddress, string memory roleName) public isAdmin
    {
        require(userExists(userAddress), "User doesn't exist");
        require(roleExists(roleName), "Role doesn't exist");
        uint256 idRole = getIdRole(roleName);
        uint256 idUser = getIdUser(userAddress);
        
        deleteUserFromRole(userAddress);
        roles[idRole].members[roles[idRole].membersNumber] = users[idUser];
        roles[idRole].membersNumber++;
    }
    
    function addProtectedObject(string memory objectName) public isAdmin {
        require(!objectExists(objectName), "That object already exists");
        protectedObjects.push(ProtectedObject({name: objectName}));
        emit ProtectedObjectCreated(objectName);
    }

    function addPermission(string memory objectName, string memory roleName, uint8 tipo, uint256 expireDate) public isAdmin{
        require(!permissionExists(objectName, roleName, expireDate), "That permission already exists");
        require(objectExists(objectName), "Object doesn't exist");
        require(roleExists(roleName), "Role doesn't exist");
        require(tipo <= 4, "That permission type doesn't exist");
        uint256 idObject = getIdObject(objectName);
        uint256 idRole = getIdRole(roleName);
        perm.push(
            Permission({
                object: protectedObjects[idObject],
                role: roles[idRole],
                tipo: sharedStructs.permissionTypes(tipo),
                expireDate: expireDate
            })
        );
        emit PermissionCreated(objectName, roleName, sharedStructs.permissionTypes(tipo), expireDate);
    }

    function deleteUser(address userAddress) public isAdmin {
        require(userExists(userAddress));
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].id == userAddress) {
                delete users[i];
                i = users.length;
            }
        }
        emit UserDeleted(userAddress);
    }
    function deleteRole(string memory roleName) public isAdmin {
        require(roleExists(roleName), "That role doesn't exist");
        for (uint256 i = 0; i < roles.length; i++) {
            if (compareStrings(roles[i].name, roleName)) {
                delete roles[i];
                i = roles.length;
            }
        }
        emit RoleDeleted(roleName);
    }
    function deletePermission(string memory objectName, string memory roleName, uint256 expireDate) public isAdmin {
        require(permissionExists(objectName, roleName, expireDate), "That permission doesn't exist");
        for (uint256 i = 0; i < perm.length; i++) {
            if (
                (compareStrings(perm[i].object.name, objectName)) &&
                (compareStrings(perm[i].role.name, roleName)) && 
                (perm[i].expireDate == expireDate)
            ) {
                delete perm[i];
                i = perm.length;
            }
        }
        emit PermissionDeleted(objectName, roleName, expireDate);
        
    }

    function deleteUserFromRole(address userAddress) private{
        require(userExists(userAddress), "That user doesn't exist");

        for (uint256 i = 0; i < roles.length; i++) {
            for(uint256 j = 0; j < roles[i].membersNumber; j++){
                if(roles[i].members[j].id == userAddress){
                    roles[i].members[j].id = address(0);
                    roles[i].members[j].name = "";
                }
            }
        }
    }
    
    function deleteProtectedObject(string memory objectName) public isAdmin {
        require(objectExists(objectName), "object doesn't exist");
        for (uint256 i = 0; i < protectedObjects.length; i++) {
            if (compareStrings(protectedObjects[i].name, objectName)) {
                delete protectedObjects[i];
                i = protectedObjects.length;
            }
        }
        emit ProtectedObjectDeleted(objectName);
    }

    function askForPermission(string memory objectName, string memory roleName, uint256 expireDate) public view returns (sharedStructs.permissionTypes){
        require(objectExists(objectName), "object doesn't exist");
        require(roleExists(roleName), "user doesn't exist");
        require(permissionExists(objectName, roleName, expireDate), "permission doesn't exist");
        sharedStructs.permissionTypes tipo;
        for (uint256 i = 0; i < perm.length; i++) {
            if (compareStrings(perm[i].object.name, objectName) && compareStrings(perm[i].role.name, roleName) && perm[i].expireDate == expireDate) {
                tipo = perm[i].tipo;
            }
        }
        return (tipo);
    }
    
    function compareStrings(string memory a, string memory b)
        private
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));

    }
}