window.addEventListener('load', function(){
    if(hasMetaMask){

        getProducts();
        function getProducts() {

            let option = {
                from: currentUserAddress,
                gas: 1000000
            };

            marketContract.getNumberOfProducts(option, function (err, result) {
                if (err) {
                    showErrorMsg(err);
                    return;
                }

                //console.log(result);
                let numberOfProducts = JSON.parse(result);
                

                for (let i = 0; i < numberOfProducts; i++) {
                    marketContract.getProduct(i, option, function (e, r) {
                        if (e) {
                            showErrorMsg(r);
                            return;
                        }

                        //console.log(r);

                        let name = r[1];
                        let price = web3.fromWei(JSON.parse(r[0]), 'ether');
                        let description = r[2];
                        let ipfsLink = r[3];

                        addProductToView({
                            name,
                            price,
                            description,
                            link: ipfsLink
                        });
                    });
                }
            });
        }

        // add product to view
        function addProductToView(product) {
            let productView =
                ` <div class="col-xs-4">
                    <br>
                    <br>

                    <fieldset class="wrapper-product-view">
                        <div class="col-xs-12">
                            Name:
                            <b>${product.name}</b>
                        </div>

                        <div class="col-xs-12">
                            Price:
                            <b>${product.price}</b> * 10 ** 18 tokens(mt)
                        </div>

                        <div class="col-xs-12">
                            Description:
                            <textarea class="form-control" readonly>${product.description}</textarea>
                        </div>

                        <div class="col-xs-12">
                            <br>
                            <img class="product-img" src="https://ipfs.io/ipfs/${product.link}">
                        </div>

                        <div class="col-xs-12">
                            <br>
                            <button class="btn btn-primary btn-buy-product" type="button" data-price="${product.price}" data-productname="${product.name}">Purchase</button>
                        </div>
                    </fieldset>
                </div>`;

            $('#product-wrapper').append(productView);
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
