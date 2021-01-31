const ChainBNB = artifacts.require ('ChainBNB');

module.exports = function (deployer) {
  deployer.deploy (ChainBNB);
};
