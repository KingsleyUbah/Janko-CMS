const checkGuest = async (req, res, next) => {
    if(req.session && req.session.userID) {
        return res.redirect('home')
    }

    next()
}

module.exports = checkGuest