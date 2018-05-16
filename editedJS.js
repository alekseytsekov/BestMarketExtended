let web3 = {};
let userAddress = '0x0';

let tokenContractAbi = [];
let tokenContractAddress = '0x0'; // some address

let marketContractAbi = [];
let marketContractAddress = '0x0'; // some address

let tokenContract = web3.eth.contract(tokenContractAbi).at(tokenContractAddress);
let marketContract = web3.eth.contract(marketContractAbi).at(marketContractAddress);


let options = {
    from: userAddress,
    value: web3.toWei(1, 'ether'),
    gas: 1000000
};


// on 'buy tokens' btn click
//buy tokens
tokenContract.buyTokens(options, function(err, res){
    if (err) {
        //process error
        return;
    }

    // show bought tokens (res)
});

// get price on register buyer/seller

let approveEvent = tokenContract.Approval();

marketContract.registerTax.call(function(err, price){
    if (err) {
        //process error
        return;
    }

    // show price
    // confirm

    // if(!confirm){
    //     return;
    // } 

    tokenContract.approve(marketContractAddress, price , function(err, res){
        if (err) {
            //process error
            return;
        }
    });
});

approveEvent.watch(function(err, result){
    if (err) {
        //process error
        return;
    }

    let tempOpts = {
        from: userAddress,
        gas: 1000000
    };

    marketContract.registerAsSeller(tempOpts, function(err, res){
        if (err) {
            //process error
            return;
        }

        // show result
    });
});
