
module.exports = {
    buy : async (req, res) => {
        res.render('partials/tokens');
    },
    get : async (req, res) => {
        res.render('partials/getTokenBalance');
    }
};