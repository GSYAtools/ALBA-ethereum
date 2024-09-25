const SharedStructs = artifacts.require("sharedStructs");
const Logger = artifacts.require("Logger");
const Authenticator = artifacts.require("Authenticator");
const RBAC = artifacts.require("RBAC");

module.exports = function (deployer) {
    // Despliega la librería sharedStructs primero
    deployer.deploy(SharedStructs)
        .then(() => {
            // Linkea la librería a los contratos que la usan
            return deployer.link(SharedStructs, [Logger, Authenticator, RBAC]);
        })
        .then(() => {
            // Despliega los demás contratos
            return deployer.deploy(Logger);
        })
        .then(() => {
            return deployer.deploy(Authenticator);
        })
        .then(() => {
            return deployer.deploy(RBAC);
    });
};
