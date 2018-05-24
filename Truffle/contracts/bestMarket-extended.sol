pragma solidity ^0.4.19;

library SafeMath {

    /**
     * @dev Multiplies two numbers, throws on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns(uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
     * @dev Integer division of two numbers, truncating the quotient.
     */
    function div(uint256 a, uint256 b) internal pure returns(uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
     * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns(uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
     * @dev Adds two numbers, throws on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns(uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

contract Ownable {
    address public owner;

    event OwnershipRenounced(address indexed previousOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function Ownable() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function renounceOwnership() public onlyOwner {
        OwnershipRenounced(owner);
        owner = address(0);
    }
}

contract ERC20Basic {
    function totalSupply() public view returns(uint256);

    function balanceOf(address who) public view returns(uint256);

    function transfer(address to, uint256 value) public returns(bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public view returns(uint256);

    function transferFrom(address from, address to, uint256 value) public returns(bool);

    function approve(address spender, uint256 value) public returns(bool);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract BasicToken is ERC20Basic {
    using SafeMath
    for uint256;

    mapping(address => uint256) balances;

    uint256 totalSupply_;

    /**
     * @dev total number of tokens in existence
     */
    function totalSupply() public view returns(uint256) {
        return totalSupply_;
    }

    /**
     * @dev transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public returns(bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param _owner The address to query the the balance of.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public view returns(uint256) {
        return balances[_owner];
    }

}

contract StandardToken is ERC20, BasicToken {

    mapping(address => mapping(address => uint256)) internal allowed;


    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom( address _from, address _to, uint256 _value ) public returns(bool) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public returns(bool) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance( address _owner, address _spender) public view returns(uint256) {
        return allowed[_owner][_spender];
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval( address _spender, uint _addedValue ) public returns(bool) {
        allowed[msg.sender][_spender] = (
            allowed[msg.sender][_spender].add(_addedValue));
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval( address _spender, uint _subtractedValue) public returns(bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

}

contract MintableToken is StandardToken, Ownable {
    event Mint(address indexed to, uint256 amount);
    event MintFinished();

    bool public mintingFinished = false;


    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    modifier hasMintPermission() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _amount) hasMintPermission canMint public returns(bool) {
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }

    /**
     * @dev Function to stop minting new tokens.
     * @return True if the operation was successful.
     */
    function finishMinting() onlyOwner canMint public returns(bool) {
        mintingFinished = true;
        MintFinished();
        return true;
    }
}

contract MarketToken is MintableToken {

    string public name = "Market Token";
    string public symbol = "MT";
    uint256 public decimals = 18;
    //uint256 public exchangeRate = 1 * 10 ** 17;
    uint256 public closingTime;

    function MarketToken(uint256 _amount) public {
        mint(msg.sender, _amount);
        closingTime = now + 4 weeks;
    }

    function buyTokens() public payable returns(uint256) {

        if (now > closingTime) {
            finishMinting();

            return 0;
        } else {
            require(owner.balance + msg.value > owner.balance);

            //uint256 amount = msg.value * exchangeRate;
            uint256 amount = msg.value;
            require(balances[owner] >= amount);

            balances[owner] = balances[owner].sub(amount);
            balances[msg.sender] = balances[msg.sender].add(amount);

            // Broadcast a message to the blockchain
            Transfer(owner, msg.sender, amount);

            //Transfer ether to owner
            owner.transfer(msg.value);

            return amount;
        }
    }

    function withdraw(uint256 amount) public returns(bool) {

    }

}

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
        require(mt.allowance(msg.sender, address(this)) ==  allProducts[productByName[hashedName]].price);
        
        // transfer all to this contract
        mt.transferFrom(msg.sender, address(this), allProducts[productByName[hashedName]].price);

        mt.transfer(allProducts[productByName[hashedName]].seller, sellerRemainder);
        
        BuyProduct(msg.sender, now, allProducts[productByName[hashedName]].price, allProducts[productByName[hashedName]].name);
        
        return (allProducts[productByName[hashedName]].price, 
                allProducts[productByName[hashedName]].name, 
                allProducts[productByName[hashedName]].description, 
                allProducts[productByName[hashedName]].ipfsPath);
    } 
    
    ////Withdraw ?!?!?!?! 
    // function withdraw(uint256 amountTkns) public isSeller {
        
    //     require(amountTkns > 0 && mt.balanceOf(msg.sender) >= amountTkns);
    //     require(mt.approve(msg.sender, amountTkns));
        
    //     uint tempTkns = amountTkns;
    //     amountTkns = 0;
    //     mt.transferFrom(msg.sender, owner, tempTkns);
        
    //     uint256 tempEth = tempTkns.div(1); // mt.exchangeRate()
        
    //     msg.sender.transfer(tempEth);
    // }
    
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