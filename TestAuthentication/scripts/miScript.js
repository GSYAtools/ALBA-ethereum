const TestAuthentication = artifacts.require("TestAuthentication");

module.exports = async function(callback){
	try{
		const instance = await TestAuthentication.deployed();
		const accounts = await web3.eth.getAccounts()
		const result = await instance.isAuthorized({ from: accounts[0] })
		console.log(result);
	} catch(error) {
		console.error(error);
	}
	callback();
};
