const marketContract = artifacts.require("./../contracts/bestMarket.sol");
const tokenContract = artifacts.require("./../contracts/marketToken.sol");
const utils = require('./utils');

contract('BestMarket', function (accounts) {

    const day = 60 * 60 * 24;
    const year = day * 365;
    const fee = 5;
    const ether = '1000000000000000000';
    const halfEther = '500000000000000000';
    const registerTax = ether;


    let marketInstance;
    let tokenInstance;

    const owner = accounts[0];
    const seller = accounts[1];
    const buyer = accounts[2];

    const product1 = {
        price : ether,
        productName : "product 1",
        description : "some description 1",
        ipfsPath :  "somePath"
    }

    const product2 = {
        price : halfEther,
        productName : "product 2",
        description : "some description 2",
        ipfsPath :  "somePath"
    }


    let ownerOptions = {
        from: owner,
        //value: '1000000000000000000', 
        //gas: 100000
    };

    let sellerOptions = {
        from: seller,
    };

    let sellerPayableOptions = {
        from: seller,
        value: ether
    };


    let buyerOptions = {
        from: buyer,
    };

    let buyerPayableOptions = {
        from: buyer,
        value: ether
    };

    // run tests => 
    let deployBestMarketContract = true;
    let initBestMarketContract = true;
    let afterInitMarketContract = true;
    let deployTokenContract = true;
    let withdraw = true;

    if (deployBestMarketContract) {

        describe('Deploy pure market contract', () => {
            beforeEach(async function () {
                marketInstance = await marketContract.new(ownerOptions);

                tokenInstance = await tokenContract.new(1000000000000000000000, ownerOptions);
            });

            it("Should set owner correctly.", async function () {
                let _owner = await marketInstance.owner.call();

                assert.strictEqual(owner, _owner, "The expected owner is not set.");
            });

            it("Owner should be incorrect.", async function () {
                let _owner = await marketInstance.owner.call();

                assert.notEqual(buyer, _owner, "The expected owner should not be correct.");
            });

            it("Contract should be not initialized.", async function() {

                let result = await marketInstance.isContractInit.call();
    
                assert.equal(JSON.parse(result), false, "Contract is initialized!");
            });

            it("Market token address should be not set.", async function() {

                let result = await marketInstance.mt.call();
                
                assert.equal(result, '0x0000000000000000000000000000000000000000', "Market token address is set!");
            });

            it("Buyer and seller count should be 0.", async function() {

                let sellers = await marketInstance.numOfSellers.call();
                let buyers = await marketInstance.numOfBuyers.call();
                
                assert.equal(JSON.parse(sellers), 0, "There are some sellers!");
                assert.equal(JSON.parse(buyers), 0, "There are some buyers!");
            });

            it("Should not have registered sellers", async function() {

                let result = await marketInstance.userIsSeller(sellerOptions);
                let result1 = await marketInstance.userIsSeller(buyerOptions);
                let result2 = await marketInstance.userIsSeller(ownerOptions);
    
                assert.equal(JSON.parse(result), false, "User should be not a seller!");
                assert.equal(JSON.parse(result1), false, "User should be not a seller!");
                assert.equal(JSON.parse(result2), false, "User should be not a seller!");
            });
    
            it("Should not have registered buyers", async function() {
    
                let result = await marketInstance.userIsBuyer(buyerOptions);
                let result1 = await marketInstance.userIsBuyer(sellerOptions);
                let result2 = await marketInstance.userIsBuyer(ownerOptions);
    
                assert.equal(JSON.parse(result), false, "User should be not a buyer!");
                assert.equal(JSON.parse(result1), false, "User should be not a buyer!");
                assert.equal(JSON.parse(result2), false, "User should be not a buyer!");
            });
    
            it("Should not have inserted products", async function() {
    
                let result = await marketInstance.getNumberOfProducts();
    
                assert.equal(JSON.parse(result), 0, "The expected products count are not equal!");
            });

            it("Should throw exception when call a func(registerAsSeller) before initialize.", async function() {
    
                try {
                    await marketInstance.registerAsSeller(sellerPayableOptions);
                    assert.isTrue(false, 'Register as seller pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when call a func(registerAsBuyer) before initialize.", async function() {
    
                try {
                    await marketInstance.registerAsBuyer(buyerPayableOptions);
                    assert.isTrue(false, 'Register as buyer pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when call a func(addProduct) before initialize.", async function() {
    
                try {
                    await marketInstance.addProduct(product1.price, 
                                                    product1.productName, 
                                                    product1.description, 
                                                    product1.ipfsPath, 
                                                    sellerOptions);

                    assert.isTrue(false, 'addProduct pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when call a func(buyProduct) before initialize.", async function() {
    
                try {
                    await marketInstance.buyProduct(product1.productName,
                                                    buyerOptions);
                                                    
                    assert.isTrue(false, 'buyProduct pass, exception not thrown!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });
        });

    }

    if(initBestMarketContract){
        describe('Init contract', () => {
            beforeEach(async function () {
                marketInstance = await marketContract.new(ownerOptions);
                tokenInstance = await tokenContract.new(1000000000000000000000, ownerOptions);

                await marketInstance.init(tokenInstance.address, ownerOptions);
            });


            it("Contract should be initialized.", async function() {
                
                let result = await marketInstance.isContractInit.call();

                assert.equal(JSON.parse(result), true, "Contract is not initialized!");
            });

            it("Market token address should be correct.", async function() {

                let result = await marketInstance.mt.call();
                
                assert.equal(result, tokenInstance.address, "Market token address is incorrect!");
            });

            it(`Register tax should be ${registerTax}.`, async function() {

                let result = await marketInstance.registerTax.call();
                
                assert.equal(result, registerTax, "Register tax is incorrect!");
            });

            it(`Contract fee should be ${fee}.`, async function() {

                let result = await marketInstance.fee.call();
                
                assert.equal(JSON.parse(result), fee, "Contract fee is incorrect!");
            });
        });
    }

    if(afterInitMarketContract){
        describe('After init Best Market contract', () => {
            beforeEach(async function () {
                marketInstance = await marketContract.new(ownerOptions);
                tokenInstance = await tokenContract.new(10000000000000000000000, ownerOptions);

                await marketInstance.init(tokenInstance.address, ownerOptions);
            });

            it("Register seller correct.", async function () {

                await tokenInstance.buyTokens(sellerPayableOptions);
                let approveData = await tokenInstance.approve(marketInstance.address, ether, sellerOptions);

                let isSeller = await marketInstance.userIsSeller(sellerOptions);
                if(isSeller){
                    assert.isTrue(false, "Register as seller is incorrect.");
                }

                let regData = await marketInstance.registerAsSeller(sellerOptions);
                isSeller = await marketInstance.userIsSeller(sellerOptions);

                // we dont validate OpenZeppelin contracts because those contracts have their own tests

                //let eventName = approveData.logs[0].event === 'Approval';
                //let eventFrom = approveData.logs[0].args.owner === sellerOptions.from;
                //let eventTo = approveData.logs[0].args.spender === marketInstance.address;
                //let eventValue = JSON.parse(approveData.logs[0].args.value) === ether;

                assert.equal(true, isSeller, "Register as seller is incorrect.");
            });

            it("Register buyer correct.", async function () {

                await tokenInstance.buyTokens(buyerPayableOptions);
                let approveData = await tokenInstance.approve(marketInstance.address, ether, buyerOptions);

                let isBuyer = await marketInstance.userIsBuyer(buyerOptions);
                if(isBuyer){
                    assert.isTrue(false, "Register as buyer is incorrect.");
                }

                let regData = await marketInstance.registerAsBuyer(buyerOptions);
                isBuyer = await marketInstance.userIsBuyer(buyerOptions);

                assert.equal(true, isBuyer, "Register as buyer is incorrect.");
            });

            it("Add product correct.", async function () {

                await tokenInstance.buyTokens(sellerPayableOptions);
                let approveData = await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                let regData = await marketInstance.registerAsSeller(sellerOptions);
                let numOfProducts = await marketInstance.getNumberOfProducts(sellerOptions);
                //console.log(JSON.parse(numOfProducts));
                if(parseInt(JSON.parse(numOfProducts)) > 0){
                    assert.isTrue(false, "There are products!");
                }
                
                await marketInstance.addProduct(product1.price, product1.productName, product1.description, product1.ipfsPath, sellerOptions);
                
                let prod = await marketInstance.getProduct(0, sellerOptions);

                assert.equal(product1.productName, prod[1], "Cannot add product.");
            });

            it("Buy product correct.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                let regData = await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product2.price, product2.productName, product2.description, product2.ipfsPath, sellerOptions);
                let sellerBalance = await tokenInstance.balanceOf(sellerOptions.from);
                //console.log('seller balance before');
                if(parseInt(JSON.parse(sellerBalance)) > 0) {
                    assert.isTrue(false, 'Seller balance is not 0!');
                }

                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                await tokenInstance.approve(marketInstance.address, product2.price, buyerOptions);
                let allowance = await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                let buyData = await marketInstance.buyProduct(product2.productName, buyerOptions);
                //console.log(buyData.logs[0].args);
                let boughtProductName = buyData.logs[0].args.productName;
                let boughtOwner = buyData.logs[0].args.addr;

                assert.equal(true, product2.productName === boughtProductName && boughtOwner === buyerOptions.from, "Cannot add product.");
            });

            it("Seller balance should be updated correctly.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product2.price, product2.productName, product2.description, product2.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product2.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product2.productName, buyerOptions);
                

                let sellerBalance = await tokenInstance.balanceOf(sellerOptions.from);
                //console.log('seller balance after'); // 475000000000000000
                //console.log(JSON.parse(sellerBalance));

                assert.equal('475000000000000000', JSON.parse(sellerBalance), "Seller balance is not updated correctly!");
            });

            it("Buyer balance should be updated correctly.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product2.price, product2.productName, product2.description, product2.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product2.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product2.productName, buyerOptions);
                

                let buyerBalance = await tokenInstance.balanceOf(buyerOptions.from);

                assert.equal('3500000000000000000', JSON.parse(buyerBalance), "Buyer balance is not updated correctly!");
            });
        });
    }

    if(deployTokenContract){
        describe('Deploy Market token contract', () => {
            beforeEach(async function () {
                tokenInstance = await tokenContract.new(1000000000000000000000, ownerOptions);
            });

            it("Should set owner correctly.", async function () {
                let tokenName = await tokenInstance.name.call();
                let tokenSymbol = await tokenInstance.symbol.call();
                let tokenDecimals = await tokenInstance.decimals.call();


                assert.strictEqual(tokenName, "Market Token", "The expected owner is not set.");
                assert.strictEqual(tokenSymbol, "MT", "The expected owner is not set.");
                assert.strictEqual(JSON.parse(tokenDecimals), 18, "The expected owner is not set.");
            });

            it("Client can buy tokens.", async function () {

                let data = await tokenInstance.buyTokens(sellerPayableOptions);

                //console.log(data.logs[0].args.value);

                assert.equal(JSON.parse(data.logs[0].args.value), sellerPayableOptions.value, "Client cannot buy tokens.");
            });

            it("Client can not buy tokens more than total supply.", async function () {

                 try {
                    sellerPayableOptions.value = '1000000000000000000001';
                    let boughtTokens = await tokenInstance.buyTokens(sellerPayableOptions);
                    sellerPayableOptions.value = ether;
                    assert.isTrue(false, 'Client bought tokens.')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Client can not buy tokens after closing time.", async function () {

                await utils.timeTravel(web3, year);

                sellerPayableOptions.value = ether;

                try {
                    let data = await tokenInstance.buyTokens(sellerPayableOptions);
                    assert.isTrue(false, 'Client can buy tokens.')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Client buy tokens. Balance should be the same!", async function () {

                //sellerPayableOptions.value = ether;
                let data = await tokenInstance.buyTokens(sellerPayableOptions);
                let balance = await tokenInstance.balanceOf(sellerPayableOptions.from);

                let boughtTokens = JSON.parse(data.logs[0].args.value);
                
                assert.equal(boughtTokens, JSON.parse(balance), "Different amount of balance.");
            });

            it("Clients balance should be empty(0)!", async function () {

                let sellerBalance = await tokenInstance.balanceOf(sellerOptions.from);
                let buyerBalance = await tokenInstance.balanceOf(buyerOptions.from);

                assert.equal(0, JSON.parse(sellerBalance), "Balance is not empty!");
                assert.equal(0, JSON.parse(buyerBalance), "Balance is not empty!");
            });
        });
    }

    if(withdraw){

        describe('Withdraw/payment tests', () => {
            beforeEach(async function () {
                marketInstance = await marketContract.new(ownerOptions);
                tokenInstance = await tokenContract.new(10000000000000000000000, ownerOptions);

                await marketInstance.init(tokenInstance.address, ownerOptions);
            });

            it("Token Contract should receive 1 ether.", async function() {

                buyerPayableOptions.value = ether;
                await tokenInstance.buyTokens(buyerPayableOptions);
                let balance = web3.eth.getBalance(tokenInstance.address);
                
                assert.equal(toEthers(1), JSON.parse(balance), "Mismatch token contract ethers!");
            });

            it("Token Contract should have 0 ether.", async function() {

                let balance = web3.eth.getBalance(tokenInstance.address);
                
                assert.equal(0, JSON.parse(balance), "Mismatch token contract ethers!");
            });

            it("User should withdraw his ethers.", async function() {

                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.withdraw(buyerPayableOptions.value, buyerOptions);

                let afterWithdraw = web3.eth.getBalance(tokenInstance.address);

                assert.equal(0, afterWithdraw, "Withdraw does not work correct!");
            });

            it("Should throw exception when withdraw value is more than have.", async function() {
                try{
                    await tokenInstance.buyTokens(buyerPayableOptions);
                    await tokenInstance.withdraw(toEthers(2), buyerOptions);
                    assert.isTrue(false, 'User withdraw more than have!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Should throw exception when owner try withdraw before bought product.", async function() {
                try{
                    await tokenInstance.buyTokens(buyerPayableOptions);
                    await tokenInstance.withdraw(toEthers(1), buyerOptions);
                    assert.isTrue(false, 'Owner successfully withdrawn!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Seller withdraw his part.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product1.price, product1.productName, product1.description, product1.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product1.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product1.productName, buyerOptions);
                
                try{
                    await tokenInstance.withdraw(toEthers(0.05), sellerOptions);
                    assert.isTrue(true);
                } catch (e) {
                    assert.isTrue(false, 'Seller cannot withdrawn his funds!');
                }
            });

            it("Seller withdraw some of his funds.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product1.price, product1.productName, product1.description, product1.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product1.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product1.productName, buyerOptions);
                
                try{
                    await tokenInstance.withdraw(toEthers(0.02), sellerOptions);
                    assert.isTrue(true);
                } catch (e) {
                    assert.isTrue(false, 'Seller cannot withdrawn his funds!');
                }
            });

            it("Throw exception. Seller try withdraw more than have.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product1.price, product1.productName, product1.description, product1.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product1.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product1.productName, buyerOptions);
                
                try{
                    await tokenInstance.withdraw(toEthers(0.06), sellerOptions);
                    assert.isTrue(false, 'Seller withdrawn more!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Owner withdraw all his funds.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product1.price, product1.productName, product1.description, product1.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product1.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product1.productName, buyerOptions);
                
                try{
                    await tokenInstance.withdraw(toEthers(1 + 5 - 0.05), ownerOptions);
                    assert.isTrue(true);
                } catch (e) {
                    assert.isTrue(false, 'Seller cannot withdraw!');
                }
            });

            it("Throw exception. Owner try withdraw more funds.", async function () {

                // seller
                await tokenInstance.buyTokens(sellerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, sellerOptions);
                await marketInstance.registerAsSeller(sellerOptions);
                await marketInstance.addProduct(product1.price, product1.productName, product1.description, product1.ipfsPath, sellerOptions);
                
                //buyer
                buyerPayableOptions.value = '5000000000000000000';
                await tokenInstance.buyTokens(buyerPayableOptions);
                await tokenInstance.approve(marketInstance.address, ether, buyerOptions);
                await marketInstance.registerAsBuyer(buyerOptions);

                //bye
                await tokenInstance.approve(marketInstance.address, product1.price, buyerOptions);
                await tokenInstance.allowance(buyerOptions.from, marketInstance.address);
                await marketInstance.buyProduct(product1.productName, buyerOptions);
                
                try{
                    await tokenInstance.withdraw(toEthers(1 + 5), ownerOptions);
                    assert.isTrue(false, 'Owner withdrawn more!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });
        });

    }
});

function toEthers(amount) {
    return web3._extend.utils.toWei(amount, 'ether');
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
