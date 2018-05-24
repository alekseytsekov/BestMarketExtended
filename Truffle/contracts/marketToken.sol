pragma solidity ^0.4.19;

import "./mintableToken.sol";

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

    // function withdraw(uint256 amount) public returns(bool) {

    // }

}