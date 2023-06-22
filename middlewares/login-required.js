const loginRequired = async (req, res, next) => {
    if(!req.session || !req.session.userID) {
        return res.redirect('login')
    }

    next()
}

module.exports = loginRequired