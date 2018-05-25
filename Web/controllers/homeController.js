
module.exports = {
    browse : async (req, res) => {
        res.render('partials/home');
    },
    withdraw : async (req, res) => {
        res.render('partials/withdraw');
    }
};