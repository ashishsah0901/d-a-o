const Token = artifacts.require("Token");
const Timelock = artifacts.require("Timelock");
const Governance = artifacts.require("Governance");
const Treasury = artifacts.require("Treasury");

module.exports = async function (deployer) {
  const [executor, proposer, voter1, voter2, voter3, voter4, voter5] = await web3.eth.getAccounts();

  const name = "Token";
  const symbol = "TOKEN";
  const supply = web3.utils.toWei("10000", "ether");

  await deployer.deploy(Token, name, symbol, supply);
  const token = await Token.deployed();

  const amount = web3.utils.toWei("50", "ether");
  await token.transfer(voter1, amount, { from: executor });
  await token.transfer(voter2, amount, { from: executor });
  await token.transfer(voter3, amount, { from: executor });
  await token.transfer(voter4, amount, { from: executor });
  await token.transfer(voter5, amount, { from: executor });

  const minDelay = 1;

  await deployer.deploy(Timelock, minDelay, [proposer], [executor]);
  const timelock = await Timelock.deployed();

  const quorum = 5;
  const votingDelay = 0;
  const votingPeriod = 5;

  await deployer.deploy(Governance, token.address, timelock.address, quorum, votingDelay, votingPeriod);
  const governance = await Governance.deployed();

  const funds = web3.utils.toWei("25", "ether");

  await deployer.deploy(Treasury, executor, { value: funds });
  const treasury = await Treasury.deployed();

  await treasury.transferOwnership(timelock.address, { from: executor });

  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();

  await timelock.grantRole(proposerRole, governance.address, { from: executor });
  await timelock.grantRole(executorRole, governance.address, { from: executor });
};
