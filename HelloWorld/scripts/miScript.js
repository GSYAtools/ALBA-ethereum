const HelloWorld = artifacts.require("HelloWorld");

module.exports = async function(callback){
	try{
		const instance = await HelloWorld.deployed();
		const result = await instance.getMessage();
		console.log(result);
	} catch(error) {
		console.error(error);
	}
	callback();
};
