
const homeController = require('./../controllers/homeController');
const registerController = require('./../controllers/registerController');
const tokenController = require('./../controllers/tokenController');
const productController = require('./../controllers/productController');

const ipfsController = require('./../controllers/ipfsController');

module.exports = app => {
    
    //home
    app.get('/', homeController.browse);
    app.get('/home', homeController.browse);

    app.get('/token/buy', tokenController.buy);
    app.get('/token/get', tokenController.get);

    app.get('/register/seller', registerController.seller);
    app.get('/register/buyer', registerController.buyer);

    app.get('/product/add', productController.add);
    
    app.get('/withdraw', homeController.withdraw);
    
    app.post('/ipfs/upload', ipfsController.upload);



    // handle all path that missing!
    app.all('*', (req,res) => {
        res.status(404);
        res.send('404 Not Found!');
        res.end();
    });
};