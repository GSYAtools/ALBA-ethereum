// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/**
* @title Logger
* @author Ismael Rabanal Martín, Eugenio Romero Ciudad
* @notice Implementation of a RBAC contract. Updates from Solidity 0.6.0 to 0.8.0 by Eugenio Romero Ciudad
*/

import "./Structs.sol";

contract Logger {
    
    event LogCreated(string tipo);
    event EntryCreated(string tipo, string time, string action);
    
    struct LogEntry{
        uint256 time;
        sharedStructs.User user;
    }
    
    struct Log {
        mapping (uint256 => LogEntry) entries;
        uint256 entriesNumber;
        sharedStructs.permissionTypes tipo;
    }

    Log[] public logs;
    address admin;

    constructor() {}
    
    modifier uniqueType(sharedStructs.permissionTypes tipo){
        bool exists = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].tipo == tipo) {
                exists = true;
                i = logs.length;
            }
        }
        require(exists == false, "That log already exists");
        _;
    }
    
      
    function addLog(sharedStructs.permissionTypes tipo) public uniqueType(tipo) {
        // Añade un nuevo elemento al array de logs en el almacenamiento
        logs.push();

        // Obtén una referencia al nuevo log en el almacenamiento
        Log storage newLog = logs[logs.length - 1];

        // Asigna los valores a los campos de la estructura
        newLog.entriesNumber = 0;
        newLog.tipo = tipo;
    }

    
    function addEntryByType(sharedStructs.permissionTypes tipo, uint256 time, sharedStructs.User memory user) public{
       uint256 idLog = getIdLogByType(tipo);
       logs[idLog].entries[logs[idLog].entriesNumber] = LogEntry({time: time, user: user});
       logs[idLog].entriesNumber++;
    }
    
    
    function getIdLogByType(sharedStructs.permissionTypes tipo) private view returns (uint256 id){
        bool found = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].tipo == tipo) {
                id = i;
                i = logs.length;
                found = true;
            }
        }
        require(found, "Log not found");
        return id;
    }
    
    function getEntriesByType(sharedStructs.permissionTypes tipo)public view returns (LogEntry[] memory){
        uint256 idLog = getIdLogByType(tipo);
        LogEntry[] memory logEntries = new LogEntry[](logs[idLog].entriesNumber);
        for (uint256 i = 0; i < logs[idLog].entriesNumber; i++){
            logEntries[i] = logs[idLog].entries[i];
        }
        return logEntries;
    }
    
}
