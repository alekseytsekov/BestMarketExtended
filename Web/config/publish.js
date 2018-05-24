(async () => {
	const solc = require('solc');
	const fs = require('fs');

	var Web3 = require("web3");
	var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
	//const web3 = new Web3('http://127.0.0.1:8545');

	const ownerAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
	//let accs = await web3.eth.getAccounts();

	const code = fs.readFileSync('./../../Truffle/contracts/bestMarket-extended.sol').toString();
	const compiledCode = solc.compile(code);

	// best market extended
	const abiDefinition = JSON.parse(compiledCode.contracts[':BestMarket'].interface);
	const byteCode = compiledCode.contracts[':BestMarket'].bytecode;
	const marketExtendedContract = new web3.eth.Contract(abiDefinition);

	// market token
	const mtAbi = JSON.parse(compiledCode.contracts[':MarketToken'].interface);
	const mtByteCode = compiledCode.contracts[':MarketToken'].bytecode;
	const mtContract = new web3.eth.Contract(mtAbi);

	const mtInstance = await mtContract
			.deploy({
				data: mtByteCode,
				arguments : [ web3.utils.toWei('1000', 'ether') ]
			})
			.send({
				from: ownerAddress,
				gas: 4000000
			});

	let data = {};

	data.owner = ownerAddress;
	data.address = mtInstance.options.address;
	data.abi = mtAbi;

	fs.writeFile('./marketToken.json', JSON.stringify(data), 'utf8', function (e) {
		if (e) {
			console.log('Has error! File does not been saved!');
		}

		//console.log('File saved successfully!');
		//console.log('address: ' + data.address);
	});

	//console.log("Contract's instance");
	//console.log(mtInstance);
	const mtAddress = mtInstance.options.address;
	console.log('token addr: ' + mtAddress)

	const marketInstance = await marketExtendedContract.deploy({
			data: byteCode,
		})
		.send({
			from: ownerAddress,
			gas: 4000000,
			//gasPrice: '3000',
		});

	data.owner = ownerAddress;
	data.address = marketInstance.options.address;
	data.abi = abiDefinition;

	console.log('BestMarket address: ' + data.address);

	fs.writeFile('./bestMarket.json', JSON.stringify(data), 'utf8', function (e) {
		if (e) {
			console.log('Has error! File does not been saved!');
		}

		//console.log('File saved successfully!');
		//console.log('address: ' + data.address);
	});

	let res = await marketInstance.methods.init(mtAddress).send({ from : ownerAddress, gas : 100000 });

	//console.log(res);// https://ethereum.stackexchange.com/questions/12051/transaction-receipt-has-contractaddress-as-null 

})()