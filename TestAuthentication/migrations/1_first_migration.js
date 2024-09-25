const TestAuthentication = artifacts.require("TestAuthentication");

module.exports = function (deployer) {
  deployer.deploy(TestAuthentication);
};
