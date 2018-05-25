pragma solidity ^0.4.19;

//import "./ownable.sol";
//import "./safeMath.sol";
import "./marketToken.sol";

contract BestMarket is Ownable {
    
    using SafeMath for uint256;
    
    struct Product {
        uint price;
        string name;
        string description;
        string ipfsPath;
        address seller;
    }
    
    //address public owner;
    bool public isContractInit;
    
    MarketToken public mt;
    
    uint public registerTax;
    uint public fee;
    
    uint public numOfSellers;
    uint public numOfBuyers;
    
    Product[] public allProducts;
    mapping(bytes32 => uint256) public productByName; // uint256 is index from allProducts
    mapping(bytes32 => bool) public isProductExist;
    
    mapping(address => bool) public sellers;
    mapping(address => bool) public buyers;
    
    event RegisterEvent(address indexed addr, uint _registerTax, uint currentTime);
    event BuyProduct(address indexed addr, uint currentTime, uint price, string productName);
    
    function BestMarket() public {
        
    }
    
    modifier isContractInitialized {
        require(isContractInit);
        _;
    }
    
    modifier isSeller {
        require(sellers[msg.sender] == true || owner == msg.sender);
        _;
    }
    
    modifier isProductNameFree(string productName) {
        require(isProductExist[keccak256(productName)] != true);
        _;
    }
    
    function () public payable {
    }
    
    function init(MarketToken _token) public onlyOwner {
        require(!isContractInit);
        
        isContractInit = true;
        
        mt = _token;
        registerTax = 10 ** 18;
        fee = 5; //percent
    }
    
    //seller section
    function userIsSeller() public view returns (bool){
        return sellers[msg.sender];
    }
    
    function registerAsSeller() public isContractInitialized returns(bool) {
        
        require(sellers[msg.sender] != true);
        require(mt.allowance(msg.sender, address(this)) == registerTax);
        
        mt.transferFrom(msg.sender, address(this), mt.allowance(msg.sender, address(this)));
        
        sellers[msg.sender] = true;
        
        numOfSellers = numOfSellers.add(1);
        
        RegisterEvent(msg.sender, registerTax, now);
        
        return true;
    }
    
    function addProduct(uint _price, string _productName, string _decription, string _ipfsPath) public isContractInitialized isSeller isProductNameFree(_productName) {
        
        isProductExist[keccak256(_productName)] = true;
        allProducts.push(Product({price: _price, name : _productName, description : _decription, ipfsPath : _ipfsPath, seller : msg.sender}));
        productByName[keccak256(_productName)] = allProducts.length - 1;
    }
    
    
    // BUYER section
    function userIsBuyer() public view returns (bool){
        return buyers[msg.sender];
    }
    
    function registerAsBuyer() public isContractInitialized {
        
        require(buyers[msg.sender] != true);
        require(mt.allowance(msg.sender, address(this)) == registerTax);
        
        mt.transferFrom(msg.sender, address(this), mt.allowance(msg.sender, address(this)));
        
        buyers[msg.sender] = true;
        
        numOfBuyers = numOfBuyers.add(1);
        
        RegisterEvent(msg.sender, registerTax, now);
        
    }

    function buyProduct(string _productName) public isContractInitialized returns (uint price, string name, string desc, string ipfs) { 
        
        bytes32 hashedName = keccak256(_productName);
        
        require(isProductExist[hashedName]);
        require(buyers[msg.sender]);
        
        uint256 dealFee = allProducts[productByName[hashedName]].price.div(100).mul(fee);
        uint256 sellerRemainder = allProducts[productByName[hashedName]].price.sub(dealFee);
        
        // check fee/price
        require(mt.allowance(msg.sender, address(this)) == allProducts[productByName[hashedName]].price);
        
        // transfer all to this contract
        mt.transferFrom(msg.sender, address(this), allProducts[productByName[hashedName]].price);
        mt.transfer(allProducts[productByName[hashedName]].seller, sellerRemainder);
        
        BuyProduct(msg.sender, now, allProducts[productByName[hashedName]].price, allProducts[productByName[hashedName]].name);
        
        return (allProducts[productByName[hashedName]].price, 
                allProducts[productByName[hashedName]].name, 
                allProducts[productByName[hashedName]].description, 
                allProducts[productByName[hashedName]].ipfsPath);
    } 
    
    // view section
    function getProductPriceSellerAddr(string _productName) public view returns (uint, address) {
        require(isProductExist[keccak256(_productName)]);
        
        return (allProducts[productByName[keccak256(_productName)]].price, allProducts[productByName[keccak256(_productName)]].seller);
    }
    
    function getNumberOfProducts() public view returns (uint) {
        return allProducts.length;
    }
    
    function getProduct(uint index) public view returns (uint, string, string, string) {
        require(index >= 0 && index < allProducts.length);
        return (allProducts[index].price, allProducts[index].name, allProducts[index].description  , allProducts[index].ipfsPath);
    }
}