var TicketSystem = artifacts.require("./TicketSystem.sol");

module.exports = function(deployer) {
  deployer.deploy(TicketSystem)
};