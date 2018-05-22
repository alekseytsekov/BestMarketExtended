module.exports = {
    seller : async (req, res) => {
        res.render('partials/sellerRegister');
    },
    buyer : async (req, res) => {

        res.render('partials/buyerRegister');
    },
    // isRegistered : async (req, res) => {

    //     res.render('partials/isDomainRegistered');
    // }

};