// Makes sure the API user is logged in

const authRequired = async (req, res, next) => {
    if(!req.session || !req.session.userID) {
        return res.json({message: "You need to log in to use the API. Use the /login route to sign in"})
    }

    next()
}

module.exports = authRequired