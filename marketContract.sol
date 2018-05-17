pragma solidity ^ 0.4 .20;


//import "https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol"; // does not work

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
	function allowance(address owner, address spender)
	public view returns(uint256);

	function transferFrom(address from, address to, uint256 value)
	public returns(bool);

	function approve(address spender, uint256 value) public returns(bool);
	event Approval(
		address indexed owner,
		address indexed spender,
		uint256 value
	);
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
	function transferFrom(
		address _from,
		address _to,
		uint256 _value
	)
	public
	returns(bool) {
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
	function allowance(
		address _owner,
		address _spender
	)
	public
	view
	returns(uint256) {
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
	function increaseApproval(
		address _spender,
		uint _addedValue
	)
	public
	returns(bool) {
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
	function decreaseApproval(
		address _spender,
		uint _subtractedValue
	)
	public
	returns(bool) {
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
	uint256 public exchangeRate = 10;
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

			uint256 amount = msg.value * exchangeRate;
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

}


contract BestMarket {

	using SafeMath
	for uint256;

	address public owner;

	MarketToken public mt;

	uint public registerTax;
	uint private fee;

	uint private numOfSellers;
	uint private numOfBuyers;

	event RegisterEvent(address addr, uint _registerTax, uint currentTime);
	event BuyProduct(address addr, uint currentTime, uint price, string productName);

	mapping(address => bool) private sellers;
	mapping(address => bool) private buyers;

	//mapping(address => uint) private balanceOf;

	mapping(string => address) private productSeller;

	Product[] private allProducts;
	mapping(string => Product) private productByName;
	mapping(string => bool) private isProductExist;

	struct Product {
		uint price;
		string name;
		string description;
		string ipfsPath;
	}

	modifier isOwner {
		require(owner == msg.sender);
		_;
	}

	function BestMarket(MarketToken _token) public {
		owner = msg.sender;
		mt = _token;

		registerTax = mt.exchangeRate() * 10 ** 9; //10 ether;// 1eth * mt.exchangeRate
		fee = 5; //percent
	}

	function () public payable {}

	modifier isSeller {
		require(sellers[msg.sender] == true || owner == msg.sender);
		_;
	}

	modifier isProductNameFree(string productName) {
		require(isProductExist[productName] != true);
		_;
	}

	// info funcs
	function getOwner() public view returns(address) {
		return owner;
	}

	function getNumOfSellers() public view returns(uint) {
		return numOfSellers;
	}

	function getNumOfBuyers() public view returns(uint) {
		return numOfBuyers;
	}


	//seller section
	function registerAsSeller() public returns(bool) {

		require(sellers[msg.sender] != true);

		mt.transferFrom(msg.sender, address(this), mt.allowance(msg.sender, address(this)));

		sellers[msg.sender] = true;

		numOfSellers = numOfSellers.add(1);

		RegisterEvent(msg.sender, registerTax, now);

		return true;
	}

	function addProduct(uint price, string productName, string _decription, string ipfsPath) public isSeller isProductNameFree(productName) {

		Product memory newProduct;
		newProduct.price = price;
		newProduct.name = productName;
		newProduct.description = _decription;
		newProduct.ipfsPath = ipfsPath;

		//sellerProducts[msg.sender]++;
		isProductExist[productName] = true;
		allProducts.push(newProduct);
		productSeller[productName] = msg.sender;
		productByName[productName] = newProduct;
	}


	// BUYER section
	function registerAsBuyer() public {

		//TODO
		require(mt.balanceOf(msg.sender) >= registerTax);
		//require(msg.value >= registerTax);

		require(buyers[msg.sender] != true);

		buyers[msg.sender] = true;

		// uint difference = msg.value.sub(registerTax);
		// if (difference > 0) {
		//     mt.transfer(msg.sender, difference);
		//     //msg.sender.transfer(difference);
		// }
		require(mt.approve(msg.sender, registerTax));
		mt.transferFrom(msg.sender, owner, registerTax);

		numOfBuyers = numOfBuyers.add(1);
		RegisterEvent(msg.sender, registerTax, now);
	}

	function buyProduct(string productName) public returns(uint, string, string, string) {

		require(isProductExist[productName] == true);

		//TODO
		require(mt.balanceOf(msg.sender) >= productByName[productName].price);
		//require(msg.value >= productByName[productName].price);

		//uint dealFee = (productByName[productName].price / 100) * fee;
		uint dealFee = productByName[productName].price.div(100).mul(fee);
		uint sellerRemainder = productByName[productName].price.sub(dealFee);

		//assert(mt.balanceOf(owner) + dealFee >= mt.balanceOf(owner));
		//require(balanceOf[productSeller[productName]] + sellerRemainder >= balanceOf[productSeller[productName]]);

		// uint difference = msg.value.sub(productByName[productName].price);
		// if(difference > 0) {
		//     msg.sender.transfer(difference);
		// }

		//balanceOf[owner] += dealFee;
		require(mt.approve(msg.sender, dealFee));
		mt.transferFrom(msg.sender, owner, dealFee);

		//balanceOf[productSeller[productName]] += sellerRemainder;
		require(mt.approve(msg.sender, sellerRemainder));
		mt.transferFrom(msg.sender, productSeller[productName], sellerRemainder);

		//require(totalSellerBalance + amountForSeller >= totalSellerBalance);
		//totalSellerBalance += amountForSeller;

		BuyProduct(msg.sender, now, productByName[productName].price, productByName[productName].name);

		return (productByName[productName].price, productByName[productName].name, productByName[productName].description, productByName[productName].ipfsPath);
	}

	// Withdraw
	function withdraw(uint256 amountTkns) public isSeller {

		//TODO

		require(amountTkns > 0 && mt.balanceOf(msg.sender) >= amountTkns);

		//balanceOf[msg.sender] -= amountTkns;
		require(mt.approve(msg.sender, amountTkns));

		uint tempTkns = amountTkns;
		amountTkns = 0;
		mt.transferFrom(msg.sender, owner, tempTkns);

		uint256 tempEth = tempTkns.div(mt.exchangeRate());

		msg.sender.transfer(tempEth);
	}

	// view section
	function getProductPrice(string productName) public view returns(uint) {
		require(isProductExist[productName]);

		return productByName[productName].price;
	}

	function getBalance() public view isSeller returns(uint) {

		//TODO
		return mt.balanceOf(msg.sender);
	}

	function getNumberOfProducts() public view returns(uint) {
		return allProducts.length;
	}

	function getProduct(uint index) public view returns(uint, string, string, string) {
		require(index >= 0 && index < allProducts.length);
		return (allProducts[index].price, allProducts[index].name, allProducts[index].description, allProducts[index].ipfsPath);
	}
}