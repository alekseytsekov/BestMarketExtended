
const fs = require('fs');
let marketData = fs.readFileSync('./config/bestMarket.json', 'utf8');
let tokenData = fs.readFileSync('./config/marketToken.json', 'utf8');

marketData = JSON.parse(marketData);
tokenData = JSON.parse(tokenData);

module.exports = {
    development :{
        port : process.env.PORT || 5000,

        owner : marketData.owner, //'0x627306090abab3a6e1400e9345bc60c78a8bef57',
        //marketAbi : JSON.stringify(marketData.abi),
        //marketAbi : marketData.abi,
        contractAddress : marketData.address,
        tokenAddress : tokenData.address
    }
    //production : {}
};