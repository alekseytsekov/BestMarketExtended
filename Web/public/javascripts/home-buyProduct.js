window.addEventListener('load', function(){
    if(hasMetaMask){

        //$('.btn-buy-product').click(buyProduct);
        setTimeout(setBuyEvent, 500);

        function setBuyEvent() {
            $('.btn-buy-product').click(buyProduct);
        }

        function buyProduct() {

            showLoader();

            let name = $(this).data('productname');

            let option = {
                from: currentUserAddress,
                //value: `${web3.toWei(price, 'ether')}`,
                gas: 4000000
            };

            let approveEvent = tokenContract.Approval();
            let price = '';

            marketContract.getProductPriceSellerAddr(name, option, function(err, res){
                if (err) {
                    msgHandler.showErrorMsg(err);
                    hideLoader();
                    return;
                }

                price = JSON.parse(res[0]);
                
                // confirm
                if(!confirm(`Will you buy a product at this price: ${web3.fromWei(price, 'ether')} tokens(mt)?`)){
                    hideLoader();
                    return; 
                }
                
                marketContract.fee.call(function(err, fee){
                    if (err) {
                        msgHandler.showErrorMsg(err);
                        hideLoader();
                        return;
                    }

                    // approve market
                    tokenContract.approve(contractAddress, price, function(err, res){
                        if (err) {
                            msgHandler.showErrorMsg(err);
                            hideLoader();
                            return;
                        }
                    });

                })
            });

            approveEvent.watch(function(err, res){
                if (err) {
                    msgHandler.showErrorMsg(err);
                    hideLoader();
                    return;
                }

                // check result for needed args
                let isMyEvent =  res.args.owner.toLowerCase() === currentUserAddress.toLowerCase() && 
                                    res.args.spender.toLowerCase() === contractAddress.toLowerCase() && 
                                    JSON.parse(res.args.value) === price;

                if(isMyEvent){
                    
                    marketContract.buyProduct(name, option, function (err, res) {
                        if (err) {
                            msgHandler.showErrorMsg(err);
                            hideLoader();
                            return;
                        }

                        console.log(res);

                        let msg = `Successfully buy a product '${name}'! Transaction hash: <a target="_blank" href="https://ropsten.etherscan.io/tx/${res}">${res}</a>`;
                        msgHandler.showSuccessMsg(msg);
                        hideLoader();
                    });
                }
            });
        }
    
        function showLoader(){
            loader.start();
            $('.home-wrapper').hide();
        }

        function hideLoader(){
            loader.stop();
            $('.home-wrapper').show();
        }
    }
})
